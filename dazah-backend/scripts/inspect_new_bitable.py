"""Inspect the new Feishu Bitable table."""

import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.platform.integrations.feishu.client import FeishuClient

APP_TOKEN = "RfEmb1WyzasCg4sn6tsc4LbWnjf"
TABLE_ID = "tblc0PEd0V1lhIq5"

FIELD_TYPE_MAP = {
    1: "text",
    2: "number",
    3: "single_select",
    4: "multi_select",
    5: "date",
    7: "checkbox",
    11: "phone",
    13: "phone_v2",
    15: "url",
    17: "attachment",
    18: "link",
    20: "formula",
    21: "lookup",
    22: "rollup",
    23: "duplex_link",
    1001: "barcode",
    1002: "progress",
    1003: "currency",
    1004: "rating",
    1005: "auto_number",
}


def ft(t):
    return FIELD_TYPE_MAP.get(t, f"type_{t}")


async def inspect():
    client = FeishuClient()

    # List all tables in the base
    print("=" * 70)
    print("Base Info")
    print("=" * 70)
    tables_data = await client.request(
        "GET",
        f"/bitable/v1/apps/{APP_TOKEN}/tables",
        params={"page_size": 100},
    )
    tables = tables_data.get("items", [])
    print(f"  app_token: {APP_TOKEN}")
    print(f"  total_tables: {len(tables)}")
    for t in tables:
        tid = t.get("table_id", "")
        marker = " <-- TARGET" if tid == TABLE_ID else ""
        print(f"    - {t.get('name'):20s} | id={tid}{marker}")

    # Fields
    print("")
    print("=" * 70)
    print("Fields")
    print("=" * 70)
    fields_data = await client.request(
        "GET",
        f"/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/fields",
        params={"page_size": 100},
    )
    fields = fields_data.get("items", [])
    for f in fields:
        name = f.get("field_name", "")
        print(f"  - {name:30s} | type={ft(f.get('type')):15s} | id={f.get('field_id')}")

    # Sample records
    print("")
    print("=" * 70)
    print("Sample Records (first 3)")
    print("=" * 70)
    records_data = await client.request(
        "POST",
        f"/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/search",
        json={"page_size": 3},
    )
    items = records_data.get("items", [])
    total = records_data.get("total", len(items))
    print(f"  total_records: {total}\n")
    for i, rec in enumerate(items, 1):
        print(f"  [{i}] record_id={rec.get('record_id')}")
        for k, v in rec.get("fields", {}).items():
            preview = str(v)[:120] + ("..." if len(str(v)) > 120 else "")
            print(f"      {k}: {preview}")
        print("")


if __name__ == "__main__":
    asyncio.run(inspect())
