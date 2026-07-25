#!/bin/bash
set -euo pipefail

# CoverForge 一键构建 DMG
# 用法: zsh scripts/build-release.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CLIENT_DIR="$ROOT_DIR/client"
RELEASE_DIR="$CLIENT_DIR/release"

echo "=== 1/3 构建前端 ==="
cd "$CLIENT_DIR"
npm run build

echo ""
echo "=== 2/3 构建 .app ==="
npx --package=electron-builder@26.15.3 electron-builder --dir --mac --publish never 2>&1

echo ""
echo "=== 3/3 打包 DMG ==="
app_path=$(find "$RELEASE_DIR" -maxdepth 2 -name "*.app" -type d | head -1)
if [ -z "$app_path" ]; then
  echo "❌ 未找到 .app，构建失败"
  exit 1
fi
npx --package=electron-builder@26.15.3 electron-builder --prepackaged "$app_path" --mac dmg --publish never 2>&1

dmg_path=$(find "$RELEASE_DIR" -maxdepth 1 -name "*.dmg" -type f | head -1)
if [ -n "$dmg_path" ]; then
  echo ""
  echo "✅ DMG 构建完成: $dmg_path"
  ls -lh "$dmg_path"
else
  echo "❌ DMG 未生成"
  exit 1
fi
