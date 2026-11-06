"""通しテスト：10本パーフェクト完走と、全部見逃しての途中退場を自動で確かめる。

使い方：リポジトリ直下で  python tools/playtest.py
必要なもの：Python 3 と Playwright（pip install playwright && playwright install chromium）
Chromeが入っていれば、環境変数 CHROME にその場所を入れると、それを使う。
"""
import asyncio, functools, http.server, os, shutil, sys, threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8765


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=ROOT)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


FAST = "CONFIG.SPEED_BASE=900;CONFIG.SPEED_STEP=0;CONFIG.SPEED_MAX=900"
TAP_VISIBLE_JP = """()=>{const sr=document.getElementById('stage').getBoundingClientRect();
  for(const s of slots){if(s.jp&&s.state==='idle'){const r=s.el.getBoundingClientRect();
    if(r.top>sr.top+10&&r.bottom<sr.bottom-10)s.el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));}}
  return !document.getElementById('ovRound').hidden||!document.getElementById('ovOver').hidden;}"""


async def run():
    from playwright.async_api import async_playwright
    failures = []
    async with async_playwright() as p:
        exe = os.environ.get("CHROME") or shutil.which("google-chrome") or None
        browser = await p.chromium.launch(executable_path=exe) if exe else await p.chromium.launch()

        async def new_page():
            pg = await browser.new_page(viewport={"width": 390, "height": 780})
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(f"http://127.0.0.1:{PORT}/")
            await pg.wait_for_timeout(500)
            return pg, errs

        # 1. 10本パーフェクト完走
        pg, errs = await new_page()
        await pg.evaluate(FAST)
        await pg.click("#btnStart")
        for film in range(10):
            for _ in range(600):
                if await pg.evaluate(TAP_VISIBLE_JP):
                    break
                await pg.wait_for_timeout(30)
            perfect = await pg.evaluate("filmLog.length && filmLog.at(-1).perfect")
            if not perfect:
                failures.append(f"完走テスト：第{film+1}作がパーフェクトにならなかった")
            await pg.click("#btnNext")
            await pg.wait_for_timeout(300)
        share = await pg.inner_text("#shareBox") if await pg.evaluate("!document.getElementById('ovOver').hidden") else ""
        if "全10本を完走" not in share or "評価S" not in share:
            failures.append("完走テスト：結果画面またはシェア文がおかしい\n" + share)
        failures += ["完走テスト：ページのエラー " + e for e in errs]
        print("完走テストのシェア文:\n" + share + "\n")

        # 2. 全部見逃して途中退場
        pg, errs = await new_page()
        await pg.evaluate(FAST.replace("900", "1500"))
        await pg.click("#btnStart")
        for _ in range(100):
            await pg.wait_for_timeout(300)
            if await pg.evaluate("!document.getElementById('ovOver').hidden"):
                break
            if await pg.evaluate("!document.getElementById('ovRound').hidden"):
                await pg.click("#btnNext")
        lives = await pg.evaluate("lives")
        share = await pg.inner_text("#shareBox") if await pg.evaluate("!document.getElementById('ovOver').hidden") else ""
        if lives != 0 or "途中退場" not in share:
            failures.append(f"途中退場テスト：結果がおかしい（フィルム残り {lives}）")
        failures += ["途中退場テスト：ページのエラー " + e for e in errs]
        await browser.close()
    return failures


if __name__ == "__main__":
    srv = serve()
    fails = asyncio.run(run())
    srv.shutdown()
    if fails:
        print("不合格:\n- " + "\n- ".join(fails))
        sys.exit(1)
    print("合格：10本完走と途中退場の両方を確認しました")
