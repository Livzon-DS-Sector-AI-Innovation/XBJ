"""Import Material BOM data from JSON file into PostgreSQL database.

Usage:
    uv run python scripts/import_material_bom_from_json.py [path_to_json]

Defaults to reading 'material_bom_records.json' in the current directory.
This script is idempotent: re-running will update existing records by
feishu_record_id instead of creating duplicates.
"""

import asyncio
import json
import os
import sys
from datetime import date, datetime

# Add app to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.platform.identity.models import User  # noqa: F401 - ensures identity.users table exists in metadata
from app.modules.production.models import MaterialBom
from app.modules.production.repository import MaterialBomRepository


JSON_PATH = sys.argv[1] if len(sys.argv) > 1 else "material_bom_records.json"


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

    if updated_time:
        try:
            dt = datetime.fromisoformat(updated_time.replace("Z", "+00:00"))
            data["feishu_synced_at"] = dt.date()
        except Exception:
            data["feishu_synced_at"] = date.today()
    else:
        data["feishu_synced_at"] = date.today()

    cleaned = {
        k: v for k, v in data.items()
        if v is not None or k in ("feishu_record_id",)
    }
    return cleaned


async def main():
    if not os.path.exists(JSON_PATH):
        print(f"Error: File not found: {JSON_PATH}")
        print("Run export_material_bom_from_feishu.py first to generate the JSON file.")
        sys.exit(1)

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        raw_records = json.load(f)

    print(f"Loaded {len(raw_records)} records from {JSON_PATH}")

    stats = {"created": 0, "updated": 0, "failed": 0, "skipped": 0}

    async with async_session_factory() as session:
        repo = MaterialBomRepository(session)

        for rec in raw_records:
            try:
                parsed = _parse_feishu_record(rec)
                if not parsed.get("name"):
                    print(f"  Skipping record {rec.get('record_id')} - no name")
                    stats["skipped"] += 1
                    continue

                record_id = parsed.get("feishu_record_id")
                existing = await repo.get_by_feishu_record_id(record_id) if record_id else None

                if existing:
                    for key, value in parsed.items():
                        if key != "id" and value is not None:
                            setattr(existing, key, value)
                    await repo.update(existing)
                    stats["updated"] += 1
                    print(f"  Updated: {parsed['name']}")
                else:
                    bom = MaterialBom(**parsed)
                    await repo.create(bom)
                    stats["created"] += 1
                    print(f"  Created: {parsed['name']}")
            except Exception as e:
                print(f"  Failed for record {rec.get('record_id')}: {e}")
                stats["failed"] += 1

    print(f"\nImport complete:")
    print(f"  Created: {stats['created']}")
    print(f"  Updated: {stats['updated']}")
    print(f"  Skipped: {stats['skipped']}")
    print(f"  Failed:  {stats['failed']}")


if __name__ == "__main__":
    asyncio.run(main())
