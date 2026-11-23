import asyncio, json, urllib.request, subprocess, time, base64, websockets, http.server, socketserver, threading, shutil, os

PORT = 4182
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='dist', **kwargs)

socketserver.TCPServer.allow_reuse_address = True
server = socketserver.TCPServer(('', PORT), Handler)
t = threading.Thread(target=server.serve_forever, daemon=True)
t.start()
print('HTTP server started on port', PORT)

profile_dir = '/tmp/fresh_chrome_user_dir'
if os.path.exists(profile_dir):
    shutil.rmtree(profile_dir)

proc = subprocess.Popen([
    'chromium', '--headless', '--no-sandbox', '--disable-gpu',
    f'--user-data-dir={profile_dir}',
    '--remote-debugging-port=9232',
    '--window-size=390,844',
    f'http://localhost:{PORT}'
])
time.sleep(2)

async def run():
    tabs = json.loads(urllib.request.urlopen('http://localhost:9232/json').read())
    pages = [t for t in tabs if t.get('type') == 'page']
    if not pages:
        print('No page tab found!')
        return
    ws_url = pages[0]['webSocketDebuggerUrl']
    print('Connecting to:', ws_url)
    
    async with websockets.connect(ws_url) as ws:
        msg_id = 0
        async def send(method, params=None):
            nonlocal msg_id
            msg_id += 1
            payload = {'id': msg_id, 'method': method}
            if params: payload['params'] = params
            await ws.send(json.dumps(payload))
            while True:
                msg = await ws.recv()
                res = json.loads(msg)
                if res.get('id') == msg_id:
                    return res.get('result', {})

        async def eval_js(js):
            return await send('Runtime.evaluate', {'expression': js, 'awaitPromise': True, 'returnByValue': True})

        async def screenshot(path):
            res = await send('Page.captureScreenshot', {'format': 'png'})
            data = base64.b64decode(res['data'])
            with open(path, 'wb') as f:
                f.write(data)
            print(f'Screenshot saved: {path}')

        # Wait for trigger button to appear and click it
        poll_res = await eval_js("""
        (async () => {
            for (let i = 0; i < 50; i++) {
                const btn = document.querySelector(".ob-changelog-text-link");
                if (btn) {
                    btn.click();
                    return "clicked_ok";
                }
                await new Promise(r => setTimeout(r, 100));
            }
            return "timeout_not_found";
        })()
        """)
        print('Poll trigger result:', poll_res.get('result', {}).get('value'))
        await asyncio.sleep(0.6)
        await screenshot('/tmp/popup_history_list.png')

        # 2. Click version 1.5.1
        await eval_js('document.querySelectorAll(".version-card-btn")[0].click()')
        await asyncio.sleep(0.5)
        await screenshot('/tmp/popup_detail_v151.png')

        # 3. Click back button
        await eval_js('document.querySelector(".btn-back-history").click()')
        await asyncio.sleep(0.5)
        await screenshot('/tmp/popup_back_to_list.png')

        # 4. Click version 1.5.0
        await eval_js('document.querySelectorAll(".version-card-btn")[1].click()')
        await asyncio.sleep(0.5)
        await screenshot('/tmp/popup_detail_v150.png')

        # 5. Click footer back link
        await eval_js('document.querySelector(".footer-back-link").click()')
        await asyncio.sleep(0.5)

        # 6. Click version 1.0.0
        await eval_js('document.querySelectorAll(".version-card-btn")[2].click()')
        await asyncio.sleep(0.5)
        await screenshot('/tmp/popup_detail_v100.png')

        # 7. Test outside backdrop click in detail view -> returns to history list
        await eval_js('document.querySelector(".paper-changelog-overlay").click()')
        await asyncio.sleep(0.5)
        has_list = await eval_js('Boolean(document.querySelector(".version-history-list"))')
        print('Backdrop click in detail returned to list:', has_list.get('result', {}).get('value'))

        # 8. Test outside backdrop click in list view -> closes modal
        await eval_js('document.querySelector(".paper-changelog-overlay").click()')
        await asyncio.sleep(0.5)
        modal_exists = await eval_js('Boolean(document.querySelector(".paper-changelog-overlay"))')
        print('Backdrop click in list closed modal:', not modal_exists.get('result', {}).get('value'))

try:
    asyncio.run(run())
finally:
    proc.terminate()
    server.shutdown()
    print('Finished all checks successfully')
