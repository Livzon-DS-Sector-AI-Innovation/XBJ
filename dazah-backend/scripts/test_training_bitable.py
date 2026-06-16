"""Test script: write one training notification record with multiple people."""

import asyncio
import sys
from datetime import date

sys.path.insert(0, "d:/LivzonAI/dazah-backend")

from app.modules.hr.schemas import TrainingNotifyInput
from app.modules.hr.service import EmployeeService
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker


async def main():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/dazah')
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        service = EmployeeService(session)

        # 人事行政部12人
        emp_numbers = [
            '110000003', '110000007', '110000673', '110001004',
            '110001372', '110000006', '110001075', '110000589',
            '110001144', '110001108', '110001148', '110000432'
        ]

        payload = TrainingNotifyInput(
            employee_numbers=emp_numbers,
            department='人事行政部',
            subject='安全生产规范培训',
            training_date=date(2026, 6, 15),
            training_time_start='08:00',
            training_time_end='12:00',
            location='三楼会议室',
            trainer='张三',
            content='安全生产规范讲解',
            training_method='面授',
            issuer_department='人事行政部',
            issue_date=date(2026, 6, 15),
        )

        print(f'开始写入 {len(emp_numbers)} 人到飞书表格（一条记录）...')
        result = await service.notify_training(payload)
        print(f'结果: {result}')


if __name__ == "__main__":
    asyncio.run(main())
