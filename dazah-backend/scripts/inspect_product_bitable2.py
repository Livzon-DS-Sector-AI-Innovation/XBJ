"""Inspect Feishu Bitable fields for product info table — UTF-8 safe output."""

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

    # Get a sample record
    records_data = await client.request(
        "POST",
        f"/bitable/v1/apps/{app_token}/tables/{table_id}/records/search",
        json={"page_size": 2},
    )

    items = records_data.get("items", [])
    for item in items:
        # Write to file to avoid console encoding issues
        with open("product_sample.json", "w", encoding="utf-8") as f:
            json.dump(item, f, ensure_ascii=False, indent=2)
        print(f"Saved record {item.get('record_id')} to product_sample.json")
        break


if __name__ == "__main__":
    asyncio.run(main())
