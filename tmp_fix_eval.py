with open('D:/LivzonAI/dazah-backend/app/modules/hr/evaluation_document_generator.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = '"""培训效果评估表 Excel 文档生成器."""'

new = '"""培训效果评估表 文档生成器."""\n\nfrom io import BytesIO\nfrom pathlib import Path\n\nfrom openpyxl import Workbook\nfrom openpyxl.styles import Alignment, Border, Side, Font\nfrom pydantic import BaseModel, Field\nfrom docx import Document\n\nNEW_TEMPLATE_NAME = "R-GN-2002 H 培训效果评估表.docx"\n\n\ndef _find_new_template() -> Path:\n    """Locate the new factory docx template."""\n    candidates = [\n        Path("新厂人员培训管理规程") / NEW_TEMPLATE_NAME,\n        Path("../新厂人员培训管理规程") / NEW_TEMPLATE_NAME,\n        Path(__file__).resolve().parent.parent.parent.parent\n        / "新厂人员培训管理规程"\n        / NEW_TEMPLATE_NAME,\n    ]\n    for p in candidates:\n        if p.exists():\n            return p\n    raise FileNotFoundError(f"模板文件未找到: {NEW_TEMPLATE_NAME}")\n\n'

content = content.replace(old, new)

# Replace generate_training_evaluation function signature
old2 = '''def generate_training_evaluation(data: TrainingEvaluationInput) -> BytesIO:
    """根据填写的培训信息生成培训效果评估表 Excel 文档."""
    wb = Workbook()'''

new2 = '''def _generate_old(data: TrainingEvaluationInput) -> BytesIO:
    """根据填写的培训信息生成培训效果评估表 Excel 文档."""
    wb = Workbook()'''

content = content.replace(old2, new2)

# Add _generate_new and modify generate_training_evaluation at the end
old3 = '''    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer'''

new3 = '''    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def _generate_new(data: TrainingEvaluationInput) -> BytesIO:
    """Fill the new factory training evaluation docx template."""
    template_path = _find_new_template()
    doc = Document(str(template_path))

    if not doc.tables:
        raise ValueError("模板中未找到表格")

    table = doc.tables[0]

    # Row 0: 培训内容 (merged)
    topic = data.subject or ""
    if data.textbook:
        topic += f" / {data.textbook}"
    table.rows[0].cells[0].text = f"培训内容：{topic}"

    # Row 1: 培训日期 | value | 课时 | value
    date_str = str(data.training_date) if data.training_date else ""
    table.rows[1].cells[1].text = date_str
    hours_str = str(data.duration_hours) if data.duration_hours is not None else ""
    table.rows[1].cells[3].text = hours_str

    # Row 2: 培训方式 | value | 授课人 | value
    method_str = data.training_method or ""
    table.rows[2].cells[1].text = method_str
    trainer_str = data.trainer or ""
    table.rows[2].cells[3].text = trainer_str

    # Row 3: 培训教材 (merged)
    textbook_str = data.textbook or ""
    table.rows[3].cells[0].text = f"培训教材：{textbook_str}"

    # Row 4: 培训对象 (merged)
    dept_str = data.department_personnel or ""
    table.rows[4].cells[0].text = f"培训对象：{dept_str}"

    # Row 5: 应到/实到/缺席 (merged)
    expected = data.expected_count if data.expected_count is not None else ""
    actual = data.actual_count if data.actual_count is not None else ""
    absent = data.absent_count if data.absent_count is not None else ""
    table.rows[5].cells[1].text = f"应到：{expected} 人， 实到：{actual} 人， 缺席：{absent} 人。"

    # Row 7: 考核方式 (merged)
    am = data.assessment_method or ""
    table.rows[7].cells[1].text = am

    # Row 8: 考核结果 (merged)
    p_cnt = data.pass_count if data.pass_count is not None else ""
    f_cnt = data.fail_count if data.fail_count is not None else ""
    ae_cnt = data.absent_exam_count if data.absent_exam_count is not None else ""
    table.rows[8].cells[1].text = f"合格：{p_cnt} 人；不合格：{f_cnt} 人；缺考：{ae_cnt} 人。"

    # Row 12: 培训效果评估 (merged)
    conclusion = data.evaluation_conclusion or ""
    organizer = data.organizer or ""
    org_date = ""
    if data.organizer_date:
        org_date = str(data.organizer_date)
    table.rows[12].cells[0].text = f"培训效果评估及其他：\\n{conclusion}\\n\\n培训考核人/日期：{organizer} / {org_date}"

    buffer = BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer


def generate_training_evaluation(data: TrainingEvaluationInput, factory: str = "old") -> BytesIO:
    """根据填写的培训信息生成培训效果评估表文档."""
    if factory == "new":
        return _generate_new(data)
    return _generate_old(data)'''

content = content.replace(old3, new3)

with open('D:/LivzonAI/dazah-backend/app/modules/hr/evaluation_document_generator.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
