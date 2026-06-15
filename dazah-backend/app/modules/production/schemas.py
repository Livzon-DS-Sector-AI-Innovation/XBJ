"""Production request and response schemas live here."""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MaterialBomBase(BaseModel):
    name: str = Field(..., max_length=128, description="物料名称")
    code: str | None = Field(None, max_length=64, description="物料代号")
    manufacturer: str | None = Field(None, max_length=128, description="生产商")
    material_level: str | None = Field(None, max_length=64, description="物料级别")
    document_name: str | None = Field(None, max_length=256, description="文件名称")
    quality_standard: str | None = Field(None, max_length=256, description="质量标准")
    process_name: str | None = Field(None, max_length=128, description="工艺名称")


class MaterialBomCreate(MaterialBomBase):
    pass


class MaterialBomUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str | None = Field(None, max_length=128)
    code: str | None = Field(None, max_length=64)
    manufacturer: str | None = Field(None, max_length=128)
    material_level: str | None = Field(None, max_length=64)
    document_name: str | None = Field(None, max_length=256)
    quality_standard: str | None = Field(None, max_length=256)
    process_name: str | None = Field(None, max_length=128)


class MaterialBomResponse(MaterialBomBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    feishu_record_id: str | None = None
    feishu_synced_at: date | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class SyncStatusResponse(BaseModel):
    local_total: int
    feishu_total: int
    synced_count: int
    unsynced_count: int
    last_sync_at: datetime | None = None
