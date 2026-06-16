"""Inspect Feishu Bitable fields for product info table."""

import asyncio
import json
import os
import sys

# Add app to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.platform.integrations.feishu.client import FeishuClient


async def main():
    client = FeishuClient()
    app_token = "VYl4bgGllaTlfVsUdcdcYohMng9"
    table_id = "tblYdEIjTOH7eTPm"

    # Get table fields
    fields_data = await client.request(
        "GET",
        f"/bitable/v1/apps/{app_token}/tables/{table_id}/fields",
        params={"page_size": 500},
    )

    print("=== Table Fields ===")
    items = fields_data.get("items", [])
    for item in items:
        print(json.dumps(item, ensure_ascii=False, indent=2))

    # Also get a few records to understand data format
    print("\n=== Sample Records ===")
    records_data = await client.request(
        "POST",
        f"/bitable/v1/apps/{app_token}/tables/{table_id}/records/search",
        json={"page_size": 3},
    )

    items = records_data.get("items", [])
    for item in items:
        print(json.dumps(item, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
