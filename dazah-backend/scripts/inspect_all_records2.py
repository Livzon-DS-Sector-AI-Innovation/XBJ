"""Inspect all Feishu records — write to file to avoid console encoding issues."""

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

    # Write all records to file
    with open("all_records.json", "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(items)} records to all_records.json")

    # Collect all unique field names
    all_fields = set()
    for item in items:
        all_fields.update(item.get("fields", {}).keys())

    print(f"\nAll field names ({len(all_fields)}):")
    for f in sorted(all_fields):
        print(f"  - {f}")


if __name__ == "__main__":
    asyncio.run(main())
