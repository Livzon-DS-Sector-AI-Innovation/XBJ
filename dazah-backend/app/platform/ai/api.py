"""AI platform API routes."""

import json
import logging
import uuid
from collections.abc import AsyncGenerator

import openai
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.response import success_response
from app.modules.hr.public_api import (
    count_employees,
    query_employees,
    search_employees_by_name,
    search_employees_fuzzy,
)
from app.platform.ai.deps import get_ai_chat_service
from app.platform.ai.executor import execute_plan, format_step_results
from app.platform.ai.feishu_context import build_feishu_context
from app.platform.ai.planner import generate_plan
from app.platform.ai.query_parser import describe_filters, parse_employee_query
from app.platform.ai.query_parser_llm import parse_with_llm
from app.platform.ai.schemas import ChatRequest
from app.platform.ai.service import AiChatService

router = APIRouter()
logger = logging.getLogger(__name__)


def _extract_names(text: str) -> list[str]:
    """Extract possible Chinese person names from text (2-4 chars)."""
    import re

    matches = re.findall(r"[一-龥]{2,4}", text)
    exclude = {
        "员工",
        "人员",
        "人事",
        "工厂",
        "公司",
        "部门",
        "车间",
        "科室",
        "班组",
        "团队",
        "职位",
        "岗位",
        "状态",
        "性别",
        "学历",
        "年龄",
        "工龄",
        "司龄",
        "厂龄",
        "入职",
        "离职",
        "试用",
        "合同",
        "统计",
        "查询",
        "查找",
        "搜索",
        "有多少",
        "共多少",
        "多少个",
        "工程师",
        "经理",
        "主管",
        "专员",
        "操作员",
        "操作工",
        "文员",
        "会计",
        "出纳",
        "司机",
        "保安",
        "厨师",
        "保洁",
        "电工",
        "焊工",
        "钳工",
        "车工",
        "铣工",
        "磨工",
        "叉车工",
        "搬运工",
        "包装工",
        "技术员",
        "质检员",
        "安全员",
        "消防员",
        "仓管员",
        "物料员",
        "统计员",
        "计划员",
        "调度员",
        "采购员",
        "销售员",
        "业务员",
        "客服",
        "前台",
        "班长",
        "组长",
        "厂长",
        "总监",
        "助理",
        "秘书",
        "顾问",
        "研究员",
    }
    return [m for m in matches if m not in exclude]


async def _build_db_context(
    session: AsyncSession,
    client: openai.AsyncOpenAI | None,
    text: str,
) -> str:
    """Query HR database based on natural language and return formatted context.

    Execution flow:
        1. Planner: analyse user intent and generate an execution plan
        2. Executor: execute exact queries against the database
        3. If exact queries return empty -> fuzzy search (name / keyword)
        4. If Planner fails entirely -> legacy parsing as fallback
        5. Feishu Bitable context as supplementary data
    """
    parts: list[str] = []
    found_employees = False
    plan_executed = False

    # ── Phase 1: Planner + Executor (exact queries) ──
    if client is not None:
        try:
            plan = await generate_plan(client, text)
            if plan and plan.needs_data and plan.steps:
                plan_executed = True
                logger.info(
                    "Planner generated %d-step plan for: %s",
                    len(plan.steps),
                    text,
                )
                step_results = await execute_plan(
                    session, plan, text, client
                )
                formatted = format_step_results(step_results)
                if formatted:
                    parts.append("【数据库查询结果】")
                    parts.append(formatted)
                    # Determine whether any concrete employee records were found
                    for sr in step_results:
                        for res in sr.results:
                            if "error" in res:
                                continue
                            action = res.get("action")
                            if action == "query" and res.get("total", 0) > 0:
                                found_employees = True
                            elif action == "count" and res.get("count", 0) > 0:
                                found_employees = True
                            elif action == "group_count" and res.get("groups"):
                                found_employees = True
                            elif action == "get_distinct" and res.get("values"):
                                found_employees = True
            elif plan and not plan.needs_data:
                logger.info("Planner decided no data needed for: %s", text)
                return ""
        except Exception as exc:
            logger.warning("Planner/Executor failed: %s", exc)

    # ── Phase 2: Exact queries returned empty -> fuzzy search ──
    if plan_executed and not found_employees:
        names = _extract_names(text)
        if names:
            seen: set[str] = set()
            fuzzy_hit = False
            for name in names[:3]:
                if name in seen:
                    continue
                seen.add(name)

                employees = await search_employees_by_name(session, name)
                if employees:
                    fuzzy_hit = True
                    parts.append(
                        f"【模糊查询结果】未找到精确匹配'{name}'的员工，"
                        f"但找到姓名包含'{name}'的员工："
                    )
                    for emp in employees:
                        parts.append(
                            f"- {emp['name']}（工号:{emp['employee_number']}）"
                            f"，部门:{emp['department']}"
                            f"，职位:{emp['position']}"
                            f"，状态:{emp['status']}"
                        )
                    break

                fuzzy = await search_employees_fuzzy(session, name)
                if fuzzy:
                    fuzzy_hit = True
                    parts.append(
                        f"【模糊查询结果】未找到姓名包含'{name}'的员工。"
                        f"以下是名字中包含'{name}'中某个字的员工（可能为相似姓名）："
                    )
                    for emp in fuzzy[:10]:
                        parts.append(
                            f"- {emp['name']}（工号:{emp['employee_number']}）"
                            f"，部门:{emp['department']}"
                            f"，职位:{emp['position']}"
                            f"，状态:{emp['status']}"
                        )
                    break

            if not fuzzy_hit:
                parts.append(
                    f"【数据库查询结果】未找到姓名包含'{names[0]}'或相关字的员工。"
                )
        else:
            parts.append("【数据库查询结果】未找到符合条件的记录。")

    # ── Phase 3: Planner failed -> legacy parsing fallback ──
    if not plan_executed:
        logger.info("Falling back to legacy parsing for: %s", text)

        criteria = None
        if client is not None:
            try:
                criteria = await parse_with_llm(client, text)
                logger.info(
                    "LLM intent parsed: filters=%s type=%s",
                    criteria.filters if criteria else None,
                    criteria.query_type if criteria else None,
                )
            except Exception as exc:
                logger.warning("LLM intent parsing failed: %s", exc)
                criteria = None

        if criteria is None:
            criteria = parse_employee_query(text)
            logger.info(
                "Fallback regex parsed: filters=%s",
                criteria.filters if criteria else None,
            )

        if criteria and criteria.filters:
            desc = describe_filters(criteria.filters)
            if criteria.query_type == "count":
                total = await count_employees(session, filters=criteria.filters)
                parts.append(f"【数据库查询结果】{desc}共有{total}名员工。")
                found_employees = total > 0
            else:
                employees, total = await query_employees(
                    session, filters=criteria.filters, page=1, page_size=200
                )
                if employees:
                    found_employees = True
                    parts.append(
                        f"【数据库查询结果】{desc}共有{total}名员工，以下是部分信息："
                    )
                    for emp in employees[:50]:
                        info_parts = [
                            f"- {emp['name']}（工号:{emp['employee_number']}）",
                            f"部门:{emp['department']}",
                            f"职位:{emp['position']}",
                            f"状态:{emp['status']}",
                        ]
                        if emp.get("team"):
                            info_parts.append(f"班组:{emp['team']}")
                        if emp.get("gender"):
                            info_parts.append(f"性别:{emp['gender']}")
                        if emp.get("education"):
                            info_parts.append(f"学历:{emp['education']}")
                        if emp.get("age"):
                            info_parts.append(f"年龄:{emp['age']}")
                        if emp.get("hire_date"):
                            info_parts.append(f"入职日期:{emp['hire_date']}")
                        parts.append("，".join(info_parts))
                else:
                    parts.append(f"【数据库查询结果】未找到{desc}的员工记录。")

        # Legacy parsing also returned empty -> fuzzy search
        if not found_employees:
            names = _extract_names(text)
            if names:
                seen: set[str] = set()
                fuzzy_hit = False
                for name in names[:3]:
                    if name in seen:
                        continue
                    seen.add(name)

                    employees = await search_employees_by_name(session, name)
                    if employees:
                        fuzzy_hit = True
                        parts.append(
                            f"【模糊查询结果】姓名包含'{name}'的员工："
                        )
                        for emp in employees:
                            parts.append(
                                f"- {emp['name']}（工号:{emp['employee_number']}）"
                                f"，部门:{emp['department']}"
                                f"，职位:{emp['position']}"
                                f"，状态:{emp['status']}"
                            )
                        break

                    fuzzy = await search_employees_fuzzy(session, name)
                    if fuzzy:
                        fuzzy_hit = True
                        parts.append(
                            f"【模糊查询结果】未找到姓名完全匹配'{name}'的员工。"
                            f"以下是名字中包含'{name}'中某个字的员工（可能为相似姓名）："
                        )
                        for emp in fuzzy[:10]:
                            parts.append(
                                f"- {emp['name']}（工号:{emp['employee_number']}）"
                                f"，部门:{emp['department']}"
                                f"，职位:{emp['position']}"
                                f"，状态:{emp['status']}"
                            )
                        break

                if not fuzzy_hit:
                    parts.append(
                        f"【数据库查询结果】未找到姓名包含'{names[0]}'或相关字的员工。"
                    )

    # ── Phase 4: Feishu Bitable supplementary context ──
    feishu_context = await build_feishu_context(text)
    if feishu_context:
        parts.append(feishu_context)

    return "\n".join(parts)


@router.post("/chat/stream", summary="AI 流式对话")
async def chat_stream(
    request: ChatRequest,
    service: AiChatService = Depends(get_ai_chat_service),
    session: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Receive a chat request and stream the AI response via SSE."""

    # 1. Build base system prompt
    system_prompt = AiChatService.build_system_prompt(
        page=request.page_context.page if request.page_context else None
    )

    # 2. Query database based on user intent
    db_context = ""
    if request.messages and request.messages[-1].role == "user":
        user_text = request.messages[-1].content
        db_context = await _build_db_context(
            session, service.client, user_text
        )

    # 3. Build messages list
    messages = [m.model_dump() for m in request.messages]

    # Inject DB context directly into the last user message
    if db_context and messages and messages[-1]["role"] == "user":
        original = messages[-1]["content"]
        messages[-1]["content"] = (
            f"{db_context}\n\n"
            f"用户问题：{original}"
        )

    # 4. Append page context as the last user message hint if provided
    if request.page_context and request.page_context.data_summary:
        summary_text = json.dumps(
            request.page_context.data_summary, ensure_ascii=False
        )
        if messages and messages[-1]["role"] == "user":
            original = messages[-1]["content"]
            messages[-1]["content"] = (
                f"[当前页面数据概览]\n{summary_text}\n\n"
                f"[用户问题]\n{original}"
            )

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            async for chunk in service.stream_chat(messages, system_prompt):
                if chunk["type"] == "reasoning":
                    payload = json.dumps(
                        {"reasoning_content": chunk["text"]}, ensure_ascii=False
                    )
                else:
                    payload = json.dumps({"content": chunk["text"]}, ensure_ascii=False)
                yield f"data: {payload}\n\n"
            done_payload = json.dumps({"done": True}, ensure_ascii=False)
            yield f"data: {done_payload}\n\n"
        except Exception:
            import logging

            logger = logging.getLogger(__name__)
            logger.exception("AI stream chat failed")
            error_payload = json.dumps(
                {"error": True, "message": "AI 服务暂时不可用，请稍后重试"},
                ensure_ascii=False,
            )
            yield f"data: {error_payload}\n\n"
            done_payload = json.dumps({"done": True}, ensure_ascii=False)
            yield f"data: {done_payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )


# ─── AI 出题相关接口 ───

import re
from io import BytesIO
from urllib.parse import quote

from docx import Document as DocxDocument
from fastapi import File, UploadFile
from fastapi.responses import StreamingResponse

from app.platform.ai.exam_generator import (
    build_generate_prompt,
    generate_exam_docx,
)
from app.platform.ai.schemas import (
    ChoiceOption,
    ChoiceQuestion,
    ExamExportRequest,
    ExamGenerateResponse,
    TrueFalseQuestion,
)


_SUPPORTED_MIME_TYPES = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
}


def _extract_text_from_file(file_bytes: bytes, file_type: str) -> str:
    """从上传文件中提取纯文本内容."""
    if file_type == "docx":
        buffer = BytesIO(file_bytes)
        doc = DocxDocument(buffer)
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)
    if file_type == "txt":
        # 尝试多种编码
        for encoding in ("utf-8", "utf-8-sig", "gbk", "gb2312", "gb18030"):
            try:
                return file_bytes.decode(encoding)
            except UnicodeDecodeError:
                continue
        raise ValueError("无法识别文本文件编码")
    raise ValueError(f"不支持的文件类型: {file_type}")


async def _call_moonshot_for_exam(
    client: openai.AsyncOpenAI,
    file_content: str,
) -> ExamGenerateResponse:
    """调用 Moonshot API 根据文件内容生成题目."""
    prompt = build_generate_prompt(file_content)

    response = await client.chat.completions.create(
        model="kimi-k2.5",
        messages=[
            {"role": "system", "content": "你是一个专业的培训考核出题专家，只输出JSON格式内容。"},
            {"role": "user", "content": prompt},
        ],
        temperature=1,
        max_tokens=4096,
    )

    content = response.choices[0].message.content or ""
    logger.info("Moonshot raw response length: %d", len(content))

    # 尝试从响应中提取 JSON
    json_str = ""

    # 1. 尝试提取 markdown json 代码块
    json_match = re.search(r"```json\s*(.*?)\s*```", content, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        # 2. 尝试提取普通代码块
        json_match = re.search(r"```\s*(.*?)\s*```", content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # 3. 尝试找第一个 { 到最后一个 }
            start = content.find("{")
            end = content.rfind("}")
            if start != -1 and end != -1 and end > start:
                json_str = content[start : end + 1]
            else:
                json_str = content

    # 清理可能的 BOM 和非法字符
    json_str = json_str.strip().lstrip("﻿")

    logger.info("Extracted JSON string length: %d", len(json_str))

    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as exc:
        logger.error("JSON parse failed: %s", exc)
        logger.error("Raw content preview: %s", content[:500])
        logger.error("Extracted JSON preview: %s", json_str[:500])
        raise

    choice_questions = [
        ChoiceQuestion(
            number=q["number"],
            question=q["question"],
            options=[
                ChoiceOption(label=o["label"], text=o["text"])
                for o in q.get("options", [])
            ],
            answer=q.get("answer"),
        )
        for q in data.get("choice_questions", [])
    ]

    true_false_questions = [
        TrueFalseQuestion(
            number=q["number"],
            question=q["question"],
            answer=q.get("answer"),
        )
        for q in data.get("true_false_questions", [])
    ]

    return ExamGenerateResponse(
        choice_questions=choice_questions,
        true_false_questions=true_false_questions,
    )


@router.post("/exam/generate", summary="AI 出题：上传文件生成试卷题目")
async def generate_exam_questions(
    file: UploadFile = File(..., description="上传的文件（支持 .docx, .txt）"),
    service: AiChatService = Depends(get_ai_chat_service),
):
    """上传培训文件，AI 自动识别内容并生成选择题和判断题."""
    if not file.content_type or file.content_type not in _SUPPORTED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型: {file.content_type}，仅支持 docx 和 txt",
        )

    file_type = _SUPPORTED_MIME_TYPES[file.content_type]
    file_bytes = await file.read()

    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="文件大小不能超过 10MB")

    try:
        file_content = _extract_text_from_file(file_bytes, file_type)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"文件解析失败: {exc}") from exc

    if len(file_content.strip()) < 50:
        raise HTTPException(status_code=400, detail="文件内容过短，无法生成题目")

    try:
        result = await _call_moonshot_for_exam(service.client, file_content)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500, detail=f"AI 返回格式解析失败: {exc}"
        ) from exc
    except Exception as exc:
        logger.exception("AI 出题失败")
        raise HTTPException(status_code=500, detail=f"AI 出题失败: {exc}") from exc

    return success_response(
        data=result.model_dump(mode="json"),
        message="试卷题目生成成功",
    )


@router.post("/exam/export", summary="导出试卷 Word 文档")
async def export_exam(
    request: ExamExportRequest,
):
    """根据试卷数据生成并下载 Word 文档."""
    try:
        buffer = generate_exam_docx(request)
    except Exception as exc:
        logger.exception("试卷导出失败")
        raise HTTPException(status_code=500, detail=f"试卷导出失败: {exc}") from exc

    def _iterfile():
        buffer.seek(0)
        yield buffer.read()

    safe_title = re.sub(r'[\\/:*?"<>|]', "_", request.title) or "试卷"
    filename = f"{safe_title}.docx"
    # RFC 5987 encoding for non-ASCII filenames in Content-Disposition
    encoded_filename = quote(filename, safe="")

    return StreamingResponse(
        _iterfile(),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename*=utf-8''{encoded_filename}"
        },
    )


