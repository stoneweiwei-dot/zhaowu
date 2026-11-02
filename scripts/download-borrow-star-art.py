import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(accept_downloads=True, locale="ja-JP")
        await page.goto("https://firestorage.ai/ja/f/maRUfjgvATN_", wait_until="networkidle")
        async with page.expect_download(timeout=90000) as pending:
            await page.get_by_text("ダウンロード", exact=True).last.click()
        await (await pending.value).save_as("/tmp/borrow-star.zip")
        await browser.close()

asyncio.run(main())
