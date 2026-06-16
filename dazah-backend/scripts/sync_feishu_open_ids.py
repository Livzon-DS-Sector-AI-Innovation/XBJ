"""Batch sync Feishu open_id for all employees with mobile numbers."""

import asyncio
import sys

sys.path.insert(0, "d:/LivzonAI/dazah-backend")

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, update

from app.modules.hr.models import Employee
from app.platform.integrations.feishu.im import FeishuIM


async def main():
    engine = create_async_engine(
        "postgresql+asyncpg://postgres:postgres@localhost:5432/dazah"
    )
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 1. 查询所有有手机号的员工
        stmt = select(Employee).where(
            Employee.phone.isnot(None),
            Employee.is_deleted == False,
        )
        result = await session.execute(stmt)
        employees = result.scalars().all()

        print(f"Total employees: {len(employees)}")

        # 2. 分批获取 open_id（每批 50 个）
        im = FeishuIM()
        batch_size = 50
        updated = 0
        failed = 0

        for i in range(0, len(employees), batch_size):
            batch = employees[i : i + batch_size]
            mobiles = [e.phone for e in batch if e.phone]

            print(f"\nBatch {i+1}-{min(i+batch_size, len(employees))}...")
            try:
                mapping = await im.batch_get_open_ids_by_mobile(mobiles)
            except Exception as e:
                print(f"  Query failed: {e}")
                failed += len(batch)
                continue

            # 3. 更新数据库（逐条 UPDATE）
            for emp in batch:
                open_id = mapping.get(emp.phone) if emp.phone else None
                if open_id:
                    await session.execute(
                        update(Employee)
                        .where(Employee.id == emp.id)
                        .values(feishu_open_id=open_id)
                    )
                    updated += 1
                    print(f"  [OK] {emp.employee_number} ({emp.phone}) -> {open_id}")
                else:
                    failed += 1
                    print(f"  [FAIL] {emp.employee_number} ({emp.phone}): not found")

            # 每批提交一次
            await session.commit()

        print(f"\n=== Done ===")
        print(f"Success: {updated}")
        print(f"Failed: {failed}")


if __name__ == "__main__":
    asyncio.run(main())
