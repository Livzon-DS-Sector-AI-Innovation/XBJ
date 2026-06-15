"""Production business workflows live here."""

import logging
from datetime import date, datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.modules.production.models import MaterialBom
from app.modules.production.repository import MaterialBomRepository
from app.modules.production.schemas import (
    MaterialBomCreate,
    MaterialBomUpdate,
    SyncStatusResponse,
)
from app.platform.integrations.feishu.datasource import BitableDataSource

logger = logging.getLogger(__name__)


# ─── Feishu field mapping helpers ───


def _extract_text(value) -> str | None:
    """Extract text from Feishu array format or plain string."""
    if isinstance(value, list):
        texts = []
        for v in value:
            if isinstance(v, dict):
                t = v.get("text", "")
                if t:
                    texts.append(t)
            else:
                texts.append(str(v))
        return ", ".join(texts) if texts else None
    if isinstance(value, dict):
        if "text" in value:
            text = value["text"]
            return text if text else None
        if "value" in value and isinstance(value["value"], list):
            inner = value["value"]
            if len(inner) > 0 and isinstance(inner[0], dict):
                text = inner[0].get("text", "")
                return text if text else None
    if value is None:
        return None
    text = str(value)
    return text if text else None


def _parse_feishu_record(record: dict) -> dict:
    """Convert a raw Feishu record into MaterialBom constructor kwargs."""
    fields = record.get("fields", {})
    rid = record.get("record_id", "")
    updated_time = record.get("updated_time", "")

    def gt(key: str):
        return fields.get(key)

    data = {
        "feishu_record_id": rid,
        "name": _extract_text(gt("物料名称")),
        "code": _extract_text(gt("物料代号")),
        "manufacturer": _extract_text(gt("生产商")),
        "material_level": _extract_text(gt("物料级别")),
        "document_name": _extract_text(gt("文件名称")),
        "quality_standard": _extract_text(gt("质量标准")),
        "process_name": _extract_text(gt("工艺名称")),
    }

    # Parse updated_time for sync tracking
    if updated_time:
        try:
            dt = datetime.fromisoformat(updated_time.replace("Z", "+00:00"))
            data["feishu_synced_at"] = dt.date()
        except Exception:
            data["feishu_synced_at"] = date.today()
    else:
        data["feishu_synced_at"] = date.today()

    # Remove empty strings for optional text fields to avoid overwriting
    cleaned = {
        k: v for k, v in data.items()
        if v is not None or k in ("feishu_record_id",)
    }
    return cleaned


# ─── Services ───


class MaterialBomService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = MaterialBomRepository(session)
        from app.core.config import get_settings

        settings = get_settings()
        self.bitable = BitableDataSource(
            app_token=settings.FEISHU_BITABLE_MATERIAL_BOM_APP_TOKEN,
            table_id=settings.FEISHU_BITABLE_MATERIAL_BOM_TABLE_ID,
        )

    async def get_material_bom(self, bom_id: UUID) -> MaterialBom:
        bom = await self.repo.get_by_id(bom_id)
        if not bom:
            raise NotFoundException("物料清单", str(bom_id))
        return bom

    async def create_material_bom(self, data: MaterialBomCreate) -> MaterialBom:
        bom = MaterialBom(**data.model_dump())
        result = await self.repo.create(bom)

        # Sync to Feishu
        try:
            rid = await self._sync_to_feishu(result)
            if rid:
                result.feishu_record_id = rid
                result.feishu_synced_at = date.today()
                await self.repo.update(result)
        except Exception as e:
            logger.warning("Feishu sync failed for material bom created: %s", e)

        return result

    async def update_material_bom(
        self, bom_id: UUID, data: MaterialBomUpdate
    ) -> MaterialBom:
        bom = await self.get_material_bom(bom_id)
        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(bom, field, value)

        result = await self.repo.update(bom)

        try:
            await self._sync_to_feishu(result)
        except Exception as e:
            logger.warning("Feishu sync failed for material bom updated: %s", e)

        return result

    async def delete_material_bom(self, bom_id: UUID) -> None:
        bom = await self.get_material_bom(bom_id)
        await self.repo.soft_delete(bom)

        # Delete from Feishu if linked
        try:
            if bom.feishu_record_id:
                await self.bitable.delete(bom.feishu_record_id)
        except Exception as e:
            logger.warning("Feishu sync failed for material bom deleted: %s", e)

    async def list_material_boms(
        self,
        *,
        keyword: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[MaterialBom], int]:
        return await self.repo.list_material_boms(
            keyword=keyword,
            page=page,
            page_size=page_size,
        )

    # ─── Feishu sync ───

    async def sync_from_feishu(self) -> dict:
        """Pull all records from Feishu Bitable and upsert into local PG."""
        raw_records = await self.bitable.query(page_size=500)
        stats = {"created": 0, "updated": 0, "failed": 0, "total": len(raw_records)}

        for rec in raw_records:
            try:
                parsed = _parse_feishu_record(rec)
                if not parsed.get("name"):
                    stats["failed"] += 1
                    continue

                await self.repo.upsert_by_feishu_record(parsed)
                existing = await self.repo.get_by_feishu_record_id(
                    parsed["feishu_record_id"]
                )
                if existing and existing.created_at and (
                    datetime.utcnow() - existing.created_at.replace(tzinfo=None)
                ).total_seconds() < 60:
                    stats["created"] += 1
                else:
                    stats["updated"] += 1
            except Exception as e:
                import traceback
                logger.error(
                    "Failed to sync Feishu record %s: %s\n%s",
                    rec.get("record_id"),
                    e,
                    traceback.format_exc(),
                )
                stats["failed"] += 1

        return stats

    async def sync_to_feishu(self, bom_id: UUID) -> str:
        """Force-sync a single material bom to Feishu."""
        bom = await self.get_material_bom(bom_id)
        return await self._sync_to_feishu(bom)

    async def get_sync_status(self) -> SyncStatusResponse:
        local_total = await self.repo.count_total()
        synced_count = await self.repo.count_synced()
        unsynced_count = local_total - synced_count

        try:
            feishu_items = await self.bitable.query(page_size=500)
            feishu_total = len(feishu_items)
        except Exception:
            feishu_total = 0

        return SyncStatusResponse(
            local_total=local_total,
            feishu_total=feishu_total,
            synced_count=synced_count,
            unsynced_count=unsynced_count,
            last_sync_at=None,
        )

    # ─── Internal helpers ───

    async def _sync_to_feishu(self, bom: MaterialBom) -> str:
        """Sync one material bom to Feishu, creating or updating as needed."""
        fields: dict = {}
        if bom.name:
            fields["物料名称"] = bom.name
        if bom.code:
            fields["物料代号"] = bom.code
        if bom.manufacturer:
            fields["生产商"] = bom.manufacturer
        if bom.material_level:
            fields["物料级别"] = bom.material_level
        if bom.document_name:
            fields["文件名称"] = bom.document_name
        if bom.quality_standard:
            fields["质量标准"] = bom.quality_standard
        if bom.process_name:
            fields["工艺名称"] = bom.process_name

        if bom.feishu_record_id:
            await self.bitable.update(bom.feishu_record_id, fields)
            return bom.feishu_record_id
        else:
            rid = await self.bitable.create(fields)
            bom.feishu_record_id = rid
            bom.feishu_synced_at = date.today()
            await self.repo.update(bom)
            return rid
