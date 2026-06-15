"""Production ORM models live here."""

from datetime import date

from sqlalchemy import Date, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.base_model import BaseModel


class MaterialBom(BaseModel):
    __tablename__ = "material_boms"
    __table_args__ = (
        Index("ix_material_boms_name", "name"),
        Index("ix_material_boms_code", "code"),
        Index("ix_material_boms_feishu_record_id", "feishu_record_id"),
        {"schema": "production"},
    )

    # 物料名称
    name: Mapped[str] = mapped_column(
        String(128), nullable=False, comment="物料名称"
    )
    # 物料代号
    code: Mapped[str | None] = mapped_column(
        String(64), nullable=True, comment="物料代号"
    )
    # 生产商
    manufacturer: Mapped[str | None] = mapped_column(
        String(128), nullable=True, comment="生产商"
    )
    # 物料级别
    material_level: Mapped[str | None] = mapped_column(
        String(64), nullable=True, comment="物料级别"
    )
    # 文件名称
    document_name: Mapped[str | None] = mapped_column(
        String(256), nullable=True, comment="文件名称"
    )
    # 质量标准
    quality_standard: Mapped[str | None] = mapped_column(
        String(256), nullable=True, comment="质量标准"
    )
    # 工艺名称
    process_name: Mapped[str | None] = mapped_column(
        String(128), nullable=True, comment="工艺名称"
    )

    # ─── Feishu sync metadata ───
    feishu_record_id: Mapped[str | None] = mapped_column(
        String(32), nullable=True, comment="飞书多维表格 record_id"
    )
    feishu_synced_at: Mapped[date | None] = mapped_column(
        Date, nullable=True, comment="上次飞书同步时间"
    )
