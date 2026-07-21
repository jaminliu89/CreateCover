#!/bin/bash
# =============================================================
# 下载 ONNX 抠图模型到本地（一次运行，之后完全离线）
# 用法：bash scripts/download-cutout-models.sh
#
# 下载内容（共 ~120MB）：
#   - isnet_fp16 模型（84MB）— 推荐精度/速度平衡
#   - ONNX Runtime WASM（33MB）— WebAssembly 推理引擎
#   - resources.json（分块清单）
#
# 模型来源：https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/
# 保存位置：client/public/models/
# =============================================================
set -euo pipefail

CDN="https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist"
OUT_DIR="client/public"
MODEL="isnet_fp16"

echo "📦 抠图模型离线下载器"
echo "   模型：$MODEL"
echo "   来源：$CDN"
echo "   目标：$OUT_DIR/"
echo ""

# 创建目录结构
mkdir -p "$OUT_DIR/models"
mkdir -p "$OUT_DIR/onnxruntime-web"

# ----------------------------------------
# 1. 下载 resources.json（分块清单）
# ----------------------------------------
echo "⬇ 下载 resources.json ..."
curl -#Lo "$OUT_DIR/resources.json" "$CDN/resources.json"

# ----------------------------------------
# 2. 下载模型 + ONNX Runtime 的所有分块并组装
# ----------------------------------------
assemble_file() {
  local remote_path="$1"
  local local_path="$OUT_DIR$remote_path"

  echo ""
  echo "🔧 组装 $remote_path ..."

  # 解析该文件的分块列表
  local chunks=$(python3 -c "
import json,sys
with open('$OUT_DIR/resources.json') as f:
    data=json.load(f)
meta=data.get('$remote_path')
if not meta:
    print('NOT_FOUND')
    sys.exit(0)
for chunk in meta['chunks']:
    print(f\"{chunk['name']}|{chunk['offsets'][0]}\")
" 2>/dev/null)

  if [ "$chunks" = "NOT_FOUND" ] || [ -z "$chunks" ]; then
    echo "   ⚠ 资源清单中无此文件，跳过"
    return
  fi

  # 下载每个分块到临时目录
  local tmp_dir=$(mktemp -d)
  trap "rm -rf $tmp_dir" RETURN

  local chunk_files=()
  while IFS='|' read -r hash offset; do
    local chunk_file="$tmp_dir/$hash"
    if [ ! -f "$chunk_file" ]; then
      curl -#Lo "$chunk_file" "$CDN/$hash"
    fi
    chunk_files+=("$chunk_file")
  done <<< "$chunks"

  # 拼接分块
  local out_dir=$(dirname "$local_path")
  mkdir -p "$out_dir"
  cat "${chunk_files[@]}" > "$local_path"
  local size=$(du -h "$local_path" | cut -f1)
  echo "   ✅ 完成 ($size)"
}

# 模型
assemble_file "/models/$MODEL"

# ONNX Runtime WASM（Simd 线程版，WebGPU 需要）
assemble_file "/onnxruntime-web/ort-wasm-simd-threaded.wasm"
assemble_file "/onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm"
assemble_file "/onnxruntime-web/ort-wasm-simd-threaded.mjs"
assemble_file "/onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs"

# ----------------------------------------
# 3. 验证
# ----------------------------------------
echo ""
echo "📋 验证文件："
du -sh "$OUT_DIR/models/$MODEL" 2>/dev/null || echo "   ⚠ 模型文件缺失"
du -sh "$OUT_DIR/onnxruntime-web/" 2>/dev/null || echo "   ⚠ WASM 文件缺失"
echo ""
echo "✅ 下载完成！抠图功能已可完全离线运行。"
echo "   模型位置：$OUT_DIR/models/$MODEL"
hmod +x "$0"
