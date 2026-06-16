"""Inspect all Feishu records to see which fields have values."""

import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.platform.integrations.feishu.client import FeishuClient


async def main():
    client = FeishuClient()
    app_token = "VYl4bgGllaTlfVsUdcdcYohMng9"
    table_id = "tblYdEIjTOH7eTPm"

    records_data = await client.request(
        "POST",
        f"/bitable/v1/apps/{app_token}/tables/{table_id}/records/search",
        json={"page_size": 500},
    )

    items = records_data.get("items", [])
    print(f"Total records: {len(items)}")
    print()

    # Collect all unique field names
    all_fields = set()
    for item in items:
        all_fields.update(item.get("fields", {}).keys())

    print("All field names in table:")
    for f in sorted(all_fields):
        print(f"  - {f}")
    print()

    # For each record, show non-empty fields
    for item in items[:5]:
        rid = item.get("record_id", "")
        fields = item.get("fields", {})
        print(f"Record {rid}:")
        for k, v in fields.items():
            if v is not None and v != [] and v != {} and v != "":
                if isinstance(v, dict):
                    print(f"  {k}: {json.dumps(v, ensure_ascii=False)[:100]}")
                elif isinstance(v, list):
                    print(f"  {k}: {json.dumps(v, ensure_ascii=False)[:100]}")
                else:
                    print(f"  {k}: {v}")
        print()


if __name__ == "__main__":
    asyncio.run(main())
