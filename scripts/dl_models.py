"""下载抠图模型 — curl 下载 + Python 组装（绕过 CDN anti-bot）"""
import json, os, subprocess, sys

CDN  = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist'
OUT  = 'client/public'
FILES = [
    '/onnxruntime-web/ort-wasm-simd-threaded.mjs',
    '/onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs',
    '/onnxruntime-web/ort-wasm-simd-threaded.wasm',
    '/onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm',
    '/models/isnet_fp16',
]

man = json.load(open(f'{OUT}/resources.json'))

for path in FILES:
    meta = man.get(path)
    if not meta:
        print(f'SKIP {path}')
        continue
    chunks = sorted(meta['chunks'], key=lambda c: c['offsets'][0])
    mb = meta['size'] / (1024*1024)
    print(f'\n{path}  ({mb:.1f}MB, {len(chunks)} chunks)')

    data = b''
    for i, ch in enumerate(chunks):
        url = f'{CDN}/{ch["name"]}'
        # 使用 curl 绕过 anti-bot（Python urllib 回 403）
        result = subprocess.run(
            ['curl', '-sL', '--connect-timeout', '15', '-o', '/tmp/chunk.bin', url],
            capture_output=True, timeout=30
        )
        with open('/tmp/chunk.bin', 'rb') as f:
            data += f.read()
        pct = (i+1)/len(chunks)*100
        sys.stdout.write(f'\r  {pct:5.1f}%  [{i+1}/{len(chunks)}]')
        sys.stdout.flush()

    dest = f'{OUT}{path}'
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'wb') as f:
        f.write(data)
    print(f'\r  ✅  {len(data)/(1024*1024):.1f}MB  {dest}')

# 汇总
total = sum(os.path.getsize(f'{OUT}{p}') for p in FILES if os.path.exists(f'{OUT}{p}'))
print(f'\n✅ 完成！共 {total/(1024*1024):.0f}MB')
