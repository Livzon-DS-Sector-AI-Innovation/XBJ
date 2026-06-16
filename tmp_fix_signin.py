with open('D:/LivzonAI/dazah-backend/app/modules/hr/signin_document_generator.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = '"""Generate training sign-in sheet documents from templates."""'

new = '"""Generate training sign-in sheet documents from templates."""\n\nfrom io import BytesIO\nfrom pathlib import Path\n\nimport openpyxl\nfrom openpyxl.styles import Alignment\nimport xlrd\nfrom xlutils.copy import copy as xlutils_copy\n\nfrom app.modules.hr.schemas import TrainingSignInSheetInput\n\nOLD_TEMPLATE_NAME = "7.5培训签到表.xlsx"\nNEW_TEMPLATE_NAME = "R-GN-2002 K 培训签到表.xls"\n\n\ndef _find_old_template() -> Path:\n    """Locate the old factory xlsx template."""\n    candidates = [\n        Path("员工培训教育管理规程") / OLD_TEMPLATE_NAME,\n        Path("../员工培训教育管理规程") / OLD_TEMPLATE_NAME,\n        Path(__file__).resolve().parent.parent.parent.parent\n        / "员工培训教育管理规程"\n        / OLD_TEMPLATE_NAME,\n    ]\n    for p in candidates:\n        if p.exists():\n            return p\n    raise FileNotFoundError(f"模板文件未找到: {OLD_TEMPLATE_NAME}")\n\n\ndef _find_new_template() -> Path:\n    """Locate the new factory xls template."""\n    candidates = [\n        Path("新厂人员培训管理规程") / NEW_TEMPLATE_NAME,\n        Path("../新厂人员培训管理规程") / NEW_TEMPLATE_NAME,\n        Path(__file__).resolve().parent.parent.parent.parent\n        / "新厂人员培训管理规程"\n        / NEW_TEMPLATE_NAME,\n    ]\n    for p in candidates:\n        if p.exists():\n            return p\n    raise FileNotFoundError(f"模板文件未找到: {NEW_TEMPLATE_NAME}")\n\n\ndef _generate_old(data: TrainingSignInSheetInput, page: int = 0) -> BytesIO:\n    """Fill the old factory training sign-in sheet xlsx template."""\n    template_path = _find_old_template()\n    wb = openpyxl.load_workbook(str(template_path))\n    ws = wb.active\n\n    # Training date: D4=year, F4=month, H4=day\n    if data.training_date:\n        date_parts = str(data.training_date).split("-")'

content = content.replace(old, new)

# Replace the old _find_template and generate_training_sign_in_sheet function
old2 = '''def _find_template() -> Path:
    """Locate the xlsx template, trying several path candidates."""
    candidates = [
        Path("员工培训教育管理规程/7.5培训签到表.xlsx"),
        Path("../员工培训教育管理规程/7.5培训签到表.xlsx"),
        Path(__file__).resolve().parent.parent.parent.parent
        / "员工培训教育管理规程"
        / "7.5培训签到表.xlsx",
    ]
    for p in candidates:
        if p.exists():
            return p
    raise FileNotFoundError("模板文件未找到: 7.5培训签到表.xlsx")


def generate_training_sign_in_sheet(data: TrainingSignInSheetInput, page: int = 0) -> BytesIO:
    """Fill the training sign-in sheet template with form data.

    Each page holds up to 30 employees.  Returns a BytesIO buffer
    containing the generated xlsx for the requested page.
    """
    template_path = _find_template()
    wb = openpyxl.load_workbook(str(template_path))
    ws = wb.active'''

content = content.replace(old2, '')

old3 = '''    # Employee names list (max 30 per page)
    page_size = 30
    start = page * page_size
    page_names = data.employee_names[start : start + page_size]

    # Clear existing numeric placeholders first
    for row in range(15, 30):
        for col in ["A", "K"]:
            cell = ws[f"{col}{row}"]
            if cell and cell.value and str(cell.value).strip().isdigit():
                cell.value = ""

    for i, name in enumerate(page_names):
        if i < 15:
            row = 15 + i
            cell = ws[f"A{row}"]
            if cell:
                cell.value = name
                cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            row = 15 + (i - 15)
            cell = ws[f"K{row}"]
            if cell:
                cell.value = name
                cell.alignment = Alignment(horizontal="center", vertical="center")

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer'''

new3 = '''    # Employee names list (max 30 per page)
    page_size = 30
    start = page * page_size
    page_names = data.employee_names[start : start + page_size]

    # Clear existing numeric placeholders first
    for row in range(15, 30):
        for col in ["A", "K"]:
            cell = ws[f"{col}{row}"]
            if cell and cell.value and str(cell.value).strip().isdigit():
                cell.value = ""

    for i, name in enumerate(page_names):
        if i < 15:
            row = 15 + i
            cell = ws[f"A{row}"]
            if cell:
                cell.value = name
                cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            row = 15 + (i - 15)
            cell = ws[f"K{row}"]
            if cell:
                cell.value = name
                cell.alignment = Alignment(horizontal="center", vertical="center")

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def _generate_new(data: TrainingSignInSheetInput, page: int = 0) -> BytesIO:
    """Fill the new factory training sign-in sheet xls template."""
    template_path = _find_new_template()
    rb = xlrd.open_workbook(str(template_path), formatting_info=True)
    wb = xlutils_copy(rb)
    ws = wb.get_sheet(0)

    # Row 4: 培训日期
    if data.training_date:
        ws.write(4, 1, str(data.training_date))

    # Row 5: 培训方式
    if data.training_method:
        method_map = {
            "面授": "☑ 面授",
            "函授": "☑ 函授",
            "远程教育": "☑ 远程教育",
            "自学": "☑ 自学",
            "其他": "☑其他",
        }
        placeholder = method_map.get(data.training_method, data.training_method)
        ws.write(5, 1, f"培训方式：{placeholder} □ 面授 □ 函授 □ 远程教育 □ 自学 □其他：")

    # Row 6: 受训部门/班组
    if data.department:
        ws.write(6, 1, data.department)

    # Row 7: 应受训人数 / 实际受训人数
    total = len(data.employee_names)
    ws.write(7, 1, f"应受训人数：{total} 人           实际受训人数合计：      人")

    # Row 8: 培训时间 / 培训题目或内容概要 / 授课人
    if data.training_time_start and data.training_time_end:
        ws.write(9, 0, f"{data.training_time_start} ~ {data.training_time_end}")
    if data.topic:
        ws.write(9, 1, data.topic)
    if data.instructor:
        ws.write(9, 4, data.instructor)

    # Employee names list (max 30 per page)
    page_size = 30
    start = page * page_size
    page_names = data.employee_names[start : start + page_size]

    for i, name in enumerate(page_names):
        if i < 15:
            row = 10 + i
            ws.write(row, 0, name)
        else:
            row = 10 + (i - 15)
            ws.write(row, 3, name)

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def generate_training_sign_in_sheet(data: TrainingSignInSheetInput, factory: str = "old", page: int = 0) -> BytesIO:
    """Fill the training sign-in sheet template with form data.

    Each page holds up to 30 employees. Returns a BytesIO buffer
    containing the generated document for the requested page.
    """
    if factory == "new":
        return _generate_new(data, page)
    return _generate_old(data, page)'''

content = content.replace(old3, new3)

with open('D:/LivzonAI/dazah-backend/app/modules/hr/signin_document_generator.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
