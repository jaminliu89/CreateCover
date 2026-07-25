/**
 * 画布常量（2026-07-25 集中管理）
 * 之前 RATIO_SIZES 在 Canvas.tsx 和 Toolbar.tsx 各定义一份，现在统一在这里
 * 任何需要知道"某种比例对应多少 px"的代码都从这里读
 */

export type Ratio = '1:1' | '3:4' | '9:16' | '16:9'

export const RATIO_SIZES: Record<Ratio, { width: number; height: number }> = {
  '1:1': { width: 540, height: 540 },
  '3:4': { width: 480, height: 640 },
  '9:16': { width: 405, height: 720 },
  '16:9': { width: 720, height: 405 },
}

/** 取短边（用于字号自适应等"按比例"逻辑） */
export function getShortSide(ratio: Ratio): number {
  const sz = RATIO_SIZES[ratio]
  return Math.min(sz.width, sz.height)
}
