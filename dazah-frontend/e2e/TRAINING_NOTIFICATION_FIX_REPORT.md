# 培训通知导出与通知培训人员功能修复报告

## 问题概述

用户报告培训通知模块的两个功能失败：
1. **导出培训通知** — 生成培训通知 Word 文档
2. **通知培训人员** — 发送培训通知到飞书

## 根因分析

### 原因 1：导出培训通知失败 — 模板文件缺失

**问题定位**：
- 后端 `notification_document_generator.py` 中的 `_find_template()` 函数需要 `SOP-GN-2002 Q 培训通知.docx` 模板文件
- 主项目 `XBJ/dazah-backend/` 下不存在 `员工培训教育管理规程/` 目录
- 导致生成 Word 文档时抛出 `FileNotFoundError`

**修复操作**（已执行）：
```bash
mkdir -p XBJ/dazah-backend/员工培训教育管理规程
cp "人事培训模块-只读-仅参考/dazah-backend/员工培训教育管理规程/SOP-GN-2002 Q 培训通知.docx" \
   XBJ/dazah-backend/员工培训教育管理规程/
```

**验证**：
- 模板文件已存在于 `XBJ/dazah-backend/员工培训教育管理规程/SOP-GN-2002 Q 培训通知.docx`
- `_find_template()` 函数现在可以正确找到模板

---

### 原因 2：通知培训人员失败 — `feishu_open_id` 缺失

**问题定位**：
- `notify_training` 方法（`service.py:332`）需要 `feishu_open_id` 来发送飞书单聊消息
- 数据库中 `feishu_open_id` 全部为 0（没有数据）
- 同步脚本 `sync_feishu_to_clone_tables.py` 未同步 `feishu_open_id` 字段
- 前端调用通知 API 时，后端返回 `数据库中缺少 feishu_open_id，请先同步`

**修复操作**（已执行）：

1. **复制并修改 `sync_feishu_open_ids.py`**：
   - 从只读副本复制到主项目 `XBJ/dazah-backend/scripts/`
   - 修改脚本以支持 `employees_old` 和 `employees_new` 克隆表
   - 使用正确的环境变量加载方式

2. **运行同步脚本**：
```bash
cd XBJ/dazah-backend
export FEISHU_APP_ID=cli_a965af5f70525cb5
export FEISHU_APP_SECRET=dW90FQW5h1SKDL6cOLdRUhcEcPkoCG0z
uv run python scripts/sync_feishu_open_ids.py
```

**同步结果**：
- Total employees: 559 (old: 379, new: 180)
- Success: 533
- Failed: 26（手机号在飞书中未找到对应用户）

**验证**：
```bash
# 数据库查询结果
employees_old with open_id: 361
employees_new with open_id: 172
```

---

## 修复后的文件变更

### 新增文件
1. `XBJ/dazah-backend/员工培训教育管理规程/SOP-GN-2002 Q 培训通知.docx`
   - 培训通知 Word 文档模板

2. `XBJ/dazah-backend/scripts/sync_feishu_open_ids.py`
   - 同步员工 `feishu_open_id` 的脚本（支持 old/new 克隆表）

### 修改文件
1. `XBJ/dazah-backend/scripts/sync_feishu_to_clone_tables.py`
   - 从只读副本复制（已存在）

---

## 后续维护建议

1. **定期同步 feishu_open_id**：
   - 当有新员工入职或员工手机号变更时，需要重新运行 `sync_feishu_open_ids.py`
   - 建议将脚本加入定时任务或 CI/CD 流程

2. **模板文件管理**：
   - 模板文件应纳入版本控制
   - 如果模板更新（如公司 Logo 变更、格式调整），需要同步更新 docx 文件

3. **失败处理**：
   - 26 个员工的手机号在飞书中未找到对应用户，可能是：
     - 手机号未注册飞书
     - 手机号与飞书账号不匹配
   - 建议检查这些员工的手机号是否正确，或手动在飞书后台添加

4. **导出功能增强**：
   - 当前导出功能依赖本地模板文件，建议增加错误提示：
     - 如果模板文件缺失，前端应显示友好的错误信息（而非后端 500 错误）

---

## 验证方式

1. **浏览器实际测试**：
   - 访问 `http://localhost:3000/hr/training/notification`
   - 填写培训信息，点击"导出培训通知"，应成功下载 Word 文档
   - 选择受训人员，点击"通知受训人员"，应显示发送成功消息

2. **API 直接测试**：
```bash
# 导出培训通知
curl -X POST http://localhost:8000/api/v1/hr/training-notification \
  -H "Content-Type: application/json" \
  -d '{"department":"人事行政部","training_date":"2026-06-16","subject":"安全生产培训","location":"会议室","trainer":"张三","trainee_names":["李四","王五"]}'

# 通知培训人员（需要有效的 employee_number）
curl -X POST http://localhost:8000/api/v1/hr/training-notifications/send \
  -H "Content-Type: application/json" \
  -d '{"employee_numbers":["110000021"],"department":"人事行政部","subject":"安全生产培训","training_date":"2026-06-16","location":"会议室"}'
```

---

**修复完成时间**: 2026/06/16
**修复人**: Claude Code
