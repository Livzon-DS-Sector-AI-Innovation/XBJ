"""Production database queries live here."""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.production.models import MaterialBom


class MaterialBomRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, bom_id: UUID) -> MaterialBom | None:
        result = await self.session.execute(
            select(MaterialBom).where(
                MaterialBom.id == bom_id,
                MaterialBom.is_deleted.is_(False),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_feishu_record_id(self, record_id: str) -> MaterialBom | None:
        result = await self.session.execute(
            select(MaterialBom).where(
                MaterialBom.feishu_record_id == record_id,
                MaterialBom.is_deleted.is_(False),
            )
        )
        return result.scalar_one_or_none()

    async def create(self, bom: MaterialBom) -> MaterialBom:
        self.session.add(bom)
        await self.session.commit()
        await self.session.refresh(bom)
        return bom

    async def update(self, bom: MaterialBom) -> MaterialBom:
        await self.session.commit()
        await self.session.refresh(bom)
        return bom

    async def soft_delete(self, bom: MaterialBom) -> None:
        bom.is_deleted = True
        await self.session.commit()

    async def list_material_boms(
        self,
        *,
        keyword: str | None = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[list[MaterialBom], int]:
        base_query = select(MaterialBom).where(MaterialBom.is_deleted.is_(False))
        count_query = select(func.count(MaterialBom.id)).where(
            MaterialBom.is_deleted.is_(False)
        )

        if keyword:
            like_pattern = f"%{keyword}%"
            base_query = base_query.where(
                (MaterialBom.name.ilike(like_pattern))
                | (MaterialBom.code.ilike(like_pattern))
                | (MaterialBom.manufacturer.ilike(like_pattern))
                | (MaterialBom.process_name.ilike(like_pattern))
            )
            count_query = count_query.where(
                (MaterialBom.name.ilike(like_pattern))
                | (MaterialBom.code.ilike(like_pattern))
                | (MaterialBom.manufacturer.ilike(like_pattern))
                | (MaterialBom.process_name.ilike(like_pattern))
            )

        total_result = await self.session.execute(count_query)
        total = total_result.scalar() or 0

        if sort_order.lower() == "desc":
            base_query = base_query.order_by(getattr(MaterialBom, sort_by).desc())
        else:
            base_query = base_query.order_by(getattr(MaterialBom, sort_by).asc())

        base_query = base_query.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(base_query)
        return list(result.scalars().all()), total

    async def upsert_by_feishu_record(self, data: dict) -> None:
        """Upsert a material bom by feishu_record_id."""
        record_id = data.get("feishu_record_id")
        if not record_id:
            return

        existing = await self.get_by_feishu_record_id(record_id)
        if existing:
            for key, value in data.items():
                if key != "id" and value is not None:
                    setattr(existing, key, value)
            await self.update(existing)
        else:
            bom = MaterialBom(**data)
            await self.create(bom)

    async def count_total(self) -> int:
        result = await self.session.execute(
            select(func.count(MaterialBom.id)).where(MaterialBom.is_deleted.is_(False))
        )
        return result.scalar() or 0

    async def count_synced(self) -> int:
        result = await self.session.execute(
            select(func.count(MaterialBom.id)).where(
                MaterialBom.is_deleted.is_(False),
                MaterialBom.feishu_record_id.isnot(None),
            )
        )
        return result.scalar() or 0
