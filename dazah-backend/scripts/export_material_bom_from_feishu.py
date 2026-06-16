"""Export Material BOM data from Feishu Bitable to JSON and text files.

Usage:
    uv run python scripts/export_material_bom_from_feishu.py

This script reads all records from the Feishu Bitable table configured
for material BOM, and saves them as:
- material_bom_records.json  (raw Feishu API response format)
- material_bom_records.txt   (tab-separated plain text summary)

Run this first to inspect field names and data before importing to DB.
"""

import asyncio
import json
import os
import sys
from datetime import datetime

# Add app to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.platform.integrations.feishu.client import FeishuClient


APP_TOKEN = "VYl4bgGllaTlfVsUdcdcYohMng9"
TABLE_ID = "tblzMSKp1iyXwUab"


async def main():
    client = FeishuClient()

    # Get table fields first
    print("Fetching table fields...")
    fields_data = await client.request(
        "GET",
        f"/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/fields",
        params={"page_size": 500},
    )
    field_items = fields_data.get("items", [])
    print(f"Found {len(field_items)} fields:")
    for item in field_items:
        print(f"  - {item.get('field_name')} (type: {item.get('type')})")

    # Fetch all records
    print("\nFetching all records...")
    raw_records = []
    page_token = None
    while True:
        payload = {"page_size": 500}
        if page_token:
            payload["page_token"] = page_token

        records_data = await client.request(
            "POST",
            f"/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/search",
            json=payload,
        )

        items = records_data.get("items", [])
        raw_records.extend(items)
        print(f"  Fetched {len(items)} records, total so far: {len(raw_records)}")

        page_token = records_data.get("page_token")
        has_more = records_data.get("has_more", False)
        if not has_more or not page_token:
            break

    print(f"\nTotal records: {len(raw_records)}")

    # Save raw JSON
    json_path = "material_bom_records.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(raw_records, f, ensure_ascii=False, indent=2)
    print(f"Saved raw records to {json_path}")

    # Save plain text summary
    txt_path = "material_bom_records.txt"
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write("物料清单数据导出\n")
        f.write(f"导出时间: {datetime.now().isoformat()}\n")
        f.write(f"总记录数: {len(raw_records)}\n")
        f.write("=" * 80 + "\n\n")

        # Header
        headers = ["record_id", "物料名称", "物料代号", "生产商", "物料级别", "文件名称", "质量标准", "工艺名称"]
        f.write("\t".join(headers) + "\n")
        f.write("-" * 80 + "\n")

        for rec in raw_records:
            rid = rec.get("record_id", "")
            fields = rec.get("fields", {})
            row = [
                rid,
                str(fields.get("物料名称", "")).replace("\t", " ").replace("\n", " "),
                str(fields.get("物料代号", "")).replace("\t", " ").replace("\n", " "),
                str(fields.get("生产商", "")).replace("\t", " ").replace("\n", " "),
                str(fields.get("物料级别", "")).replace("\t", " ").replace("\n", " "),
                str(fields.get("文件名称", "")).replace("\t", " ").replace("\n", " "),
                str(fields.get("质量标准", "")).replace("\t", " ").replace("\n", " "),
                str(fields.get("工艺名称", "")).replace("\t", " ").replace("\n", " "),
            ]
            f.write("\t".join(row) + "\n")

    print(f"Saved text summary to {txt_path}")
    print("\nDone. You can now review the exported files before importing to database.")


if __name__ == "__main__":
    asyncio.run(main())
