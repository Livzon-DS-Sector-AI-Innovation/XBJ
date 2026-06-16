"""Test script: send a Feishu IM message to a specific mobile number."""

import asyncio
import sys

sys.path.insert(0, "d:/LivzonAI/dazah-backend")

from app.platform.integrations.feishu.im import FeishuIM


async def main():
    im = FeishuIM()
    domain = "huangliyun01"
    candidates = [
        f"{domain}@livzon.com",
        f"{domain}@livzon.com.cn",
        f"{domain}@livo.com",
        f"{domain}@livo.com.cn",
        domain,
    ]

    for email in candidates:
        print(f"1. Querying Feishu user_id for: {email}")
        try:
            mapping = await im.batch_get_open_ids_by_email([email])
            print(f"   Result: {mapping}")
            if mapping:
                open_id = list(mapping.values())[0]
                print(f"2. Sending text message to open_id: {open_id}")
                import json
                content = "【测试消息】\n这是一条来自 LivzonAI 系统的测试消息，验证飞书 IM 消息发送功能是否正常。"
                await im.send_text_message(open_id, content)
                print("   Message sent successfully!")
                return
        except Exception as e:
            print(f"   Error: {e}")

    print("   User not found with any candidate.")


if __name__ == "__main__":
    asyncio.run(main())
