"""2026 calendar data — Chinese statutory holidays and compensatory workdays.

Format:
- holidays: list of (name, start_date_str, end_date_str) — inclusive range
- compensatory_workdays: list of date_str — weekends that are workdays (调休上班)

Based on estimation; **must be updated when the State Council officially publishes the 2026 schedule.**
"""

from datetime import date

# 法定节假日: (名称, 起始日, 结束日) —— 包含首尾
HOLIDAYS_2026: list[tuple[str, str, str]] = [
    # 元旦: 1月1日-3日
    ("元旦", "2026-01-01", "2026-01-03"),
    # 春节: 除夕2月16日, 放假2月14日-23日 (2/14-15周末, 2/16除夕, 2/17-20春节假, 2/21-22周末)
    ("春节", "2026-02-14", "2026-02-23"),
    # 清明节: 4月5日-7日 (4/5周日+4/6周一+4/7周二调休)
    ("清明节", "2026-04-05", "2026-04-07"),
    # 劳动节: 5月1日-5日
    ("劳动节", "2026-05-01", "2026-05-05"),
    # 端午节: 6月19日-21日 (6/19周五+周六日)
    ("端午节", "2026-06-19", "2026-06-21"),
    # 国庆+中秋: 9月25日-10月8日 (中秋10月3日)
    ("中秋节、国庆节", "2026-09-25", "2026-10-08"),
]

# 调休上班周末
COMPENSATORY_WORKDAYS_2026: list[str] = [
    # 春节前调休
    "2026-02-14",  # 周六上班
    "2026-02-21",  # 周六上班
    # 劳动节调休
    "2026-04-26",  # 周日上班
    "2026-05-09",  # 周六上班
    # 国庆调休
    "2026-09-20",  # 周日上班
    "2026-10-10",  # 周六上班
]


def generate_year_calendar(year: int = 2026) -> list[dict]:
    """Generate full-year calendar data.

    Returns list of dicts suitable for bulk insert into attendance_calendars.
    """
    from datetime import timedelta

    holiday_set: set[date] = set()
    holiday_name_map: dict[date, str] = {}

    for name, start_str, end_str in HOLIDAYS_2026:
        start = date.fromisoformat(start_str)
        end = date.fromisoformat(end_str)
        current = start
        while current <= end:
            holiday_set.add(current)
            holiday_name_map[current] = name
            current += timedelta(days=1)

    compensatory_set = {date.fromisoformat(d) for d in COMPENSATORY_WORKDAYS_2026}

    start_date = date(year, 1, 1)
    end_date = date(year, 12, 31)

    rows: list[dict] = []
    current = start_date
    while current <= end_date:
        day_of_week = current.weekday()  # 0=Mon ... 6=Sun
        is_weekend = day_of_week >= 5  # Sat/Sun

        if current in holiday_set:
            day_type = "holiday"
            holiday_name = holiday_name_map.get(current)
            is_workday = False
        elif current in compensatory_set:
            day_type = "weekend"  # 本质是周末，但调休上班
            holiday_name = "调休上班"
            is_workday = True
        elif is_weekend:
            day_type = "weekend"
            holiday_name = None
            is_workday = False
        else:
            day_type = "workday"
            holiday_name = None
            is_workday = True

        rows.append({
            "date": current,
            "year": current.year,
            "month": current.month,
            "day": current.day,
            "day_of_week": day_of_week,
            "day_type": day_type,
            "holiday_name": holiday_name,
            "is_workday": is_workday,
        })
        current += timedelta(days=1)

    return rows
