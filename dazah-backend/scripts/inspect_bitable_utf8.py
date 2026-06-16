"""Inspect Feishu Bitable with proper UTF-8 output."""

import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.platform.integrations.feishu.client import FeishuClient

APP_TOKEN = "RfEmb1WyzasCg4sn6tsc4LbWnjf"

FIELD_TYPE_MAP = {
    1: "text", 2: "number", 3: "single_select", 4: "multi_select",
    5: "date", 7: "checkbox", 11: "phone", 13: "phone_v2",
    15: "url", 17: "attachment", 18: "link", 20: "formula",
    21: "lookup", 22: "rollup", 23: "duplex_link",
    1001: "barcode", 1002: "progress", 1003: "currency",
    1004: "rating", 1005: "auto_number",
}


def ft(t):
    return FIELD_TYPE_MAP.get(t, f"type_{t}")


async def inspect_table(table_id: str, table_name: str):
    client = FeishuClient()
    lines = []

    def out(s=""):
        lines.append(s)

    out(f"{'='*60}")
    out(f"Table: {table_name} | {table_id}")
    out(f"{'='*60}")

    # Fields
    try:
        fields_data = await client.request(
            "GET",
            f"/bitable/v1/apps/{APP_TOKEN}/tables/{table_id}/fields",
            params={"page_size": 100},
        )
        fields = fields_data.get("items", [])
    except Exception as e:
        out(f"  [!] Failed to get fields: {e}")
        return "\n".join(lines)

    out(f"\nFields ({len(fields)}):")
    for f in fields:
        name = f.get("field_name", "")
        out(f"  - {name:30s} | type={ft(f.get('type')):15s} | id={f.get('field_id')}")

    # Sample records
    out(f"\nSample Records (first 2):")
    try:
        records_data = await client.request(
            "POST",
            f"/bitable/v1/apps/{APP_TOKEN}/tables/{table_id}/records/search",
            json={"page_size": 2},
        )
        items = records_data.get("items", [])
        total = records_data.get("total", len(items))
    except Exception as e:
        out(f"  [!] Failed to get records: {e}")
        items = []
        total = 0

    out(f"  total_records: {total}\n")
    for i, rec in enumerate(items, 1):
        out(f"  [{i}] record_id={rec.get('record_id')}")
        for k, v in rec.get("fields", {}).items():
            preview = str(v)[:100] + ("..." if len(str(v)) > 100 else "")
            out(f"      {k}: {preview}")
        out("")

    return "\n".join(lines)


async def main():
    client = FeishuClient()

    # List tables
    tables_data = await client.request(
        "GET", f"/bitable/v1/apps/{APP_TOKEN}/tables", params={"page_size": 100}
    )
    tables = tables_data.get("items", [])

    all_lines = []
    all_lines.append(f"Base: {APP_TOKEN}")
    all_lines.append(f"Total tables: {len(tables)}\n")

    for t in tables:
        tid = t.get("table_id", "")
        name = t.get("name", "")
        all_lines.append(f"  {name:20s} | {tid}")

    all_lines.append("")

    # Inspect key tables
    for t in tables:
        tid = t.get("table_id", "")
        name = t.get("name", "")
        result = await inspect_table(tid, name)
        all_lines.append(result)
        all_lines.append("")

    output = "\n".join(all_lines)

    outfile = os.path.join(os.path.dirname(__file__), "inspect_bitable_utf8.txt")
    with open(outfile, "w", encoding="utf-8") as f:
        f.write(output)
    print(f"[Saved to {outfile}]")


if __name__ == "__main__":
    asyncio.run(main())
