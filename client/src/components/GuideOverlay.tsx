import React from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { Eye, EyeOff } from 'lucide-react'

type GuideType = 'thirds' | 'golden' | 'center' | 'all'

// 构图参考线定义（百分比坐标，配合 SVG viewBox 0 0 100 100，preserveAspectRatio=none）
const GUIDE_SETS: Record<Exclude<GuideType, 'all'>, { v: number[]; h: number[] }> = {
  thirds: { v: [33.333, 66.667], h: [33.333, 66.667] }, // 九宫格（三分法）
  golden: { v: [38.2, 61.8], h: [38.2, 61.8] },         // 黄金分割 1/φ 与 φ-1
  center: { v: [50], h: [50] },                          // 中心对称十字
}

const TYPE_LABELS: Record<GuideType, string> = {
  thirds: '三分', golden: '黄金', center: '中心', all: '全部',
}

const STROKE = 'rgba(59,130,246,0.5)'      // 蓝色虚线，与拖拽吸附粉色 #FF00B8 区分
const STROKE_DIM = 'rgba(59,130,246,0.35)' // 对角线更淡

/**
 * 构图参考线叠加层（D-2 2026-07-25）
 * - 纯视觉：不参与导出（data-html2canvas-ignore 跳过 PNG/WebP；SVG 导出只序列化 elements）
 * - 不参与拖拽命中：容器 pointer-events:none，仅右上角控制条可点击
 * - 不进 zustand elements / 不进历史记录
 * 提供 4 种经典构图网格：三分法 / 黄金分割 / 中心对称 / 全部叠加
 */
export const GuideOverlay: React.FC = () => {
  const showGuides = useEditorStore(s => s.showGuides)
  const guideType = useEditorStore(s => s.guideType)
  const toggleGuides = useEditorStore(s => s.toggleGuides)
  const setGuideType = useEditorStore(s => s.setGuideType)

  // 收集要绘制的竖线 / 横线（去重，避免 all 模式下重复）
  const vLines: number[] = []
  const hLines: number[] = []
  const types: Exclude<GuideType, 'all'>[] =
    guideType === 'all' ? ['thirds', 'golden', 'center'] : [guideType]
  types.forEach(t => {
    GUIDE_SETS[t].v.forEach(v => { if (!vLines.includes(v)) vLines.push(v) })
    GUIDE_SETS[t].h.forEach(h => { if (!hLines.includes(h)) hLines.push(h) })
  })

  const withDiagonal = guideType === 'center' || guideType === 'all'

  return (
    <div
      // 关键：导出 PNG/WebP 时 html2canvas 会跳过此层（SVG 导出本就不含 guides）
      data-html2canvas-ignore="true"
      style={{ position: 'absolute', inset: 0, zIndex: 55, pointerEvents: 'none' }}
    >
      {/* 参考线（仅在开启时绘制） */}
      {showGuides && (
        <svg
          width="100%" height="100%"
          viewBox="0 0 100 100" preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0 }}
        >
          {vLines.map((v, i) => (
            <line key={`v-${i}`} x1={v} y1={0} x2={v} y2={100}
              stroke={STROKE} strokeWidth={1} strokeDasharray="1 1"
              vectorEffect="non-scaling-stroke" />
          ))}
          {hLines.map((h, i) => (
            <line key={`h-${i}`} x1={0} y1={h} x2={100} y2={h}
              stroke={STROKE} strokeWidth={1} strokeDasharray="1 1"
              vectorEffect="non-scaling-stroke" />
          ))}
          {/* 中心对称对角线（center / all） */}
          {withDiagonal && (
            <>
              <line x1={0} y1={0} x2={100} y2={100}
                stroke={STROKE_DIM} strokeWidth={1} strokeDasharray="1 1"
                vectorEffect="non-scaling-stroke" />
              <line x1={0} y1={100} x2={100} y2={0}
                stroke={STROKE_DIM} strokeWidth={1} strokeDasharray="1 1"
                vectorEffect="non-scaling-stroke" />
            </>
          )}
        </svg>
      )}

      {/* 控制条：右上角（可点击，stopPropagation 避免触发画布取消选中） */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 80,
          pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)',
          borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <button
          onClick={toggleGuides}
          title="构图参考线开关"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 8,
            color: showGuides ? '#60a5fa' : '#cbd5e1',
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          {showGuides ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        {showGuides && (
          <div style={{ display: 'flex', gap: 2 }}>
            {(['thirds', 'golden', 'center', 'all'] as GuideType[]).map(t => (
              <button
                key={t}
                onClick={() => setGuideType(t)}
                style={{
                  fontSize: 11, padding: '4px 6px', borderRadius: 6, cursor: 'pointer',
                  border: 'none',
                  color: guideType === t ? '#fff' : '#94a3b8',
                  background: guideType === t ? 'rgba(59,130,246,0.6)' : 'transparent',
                  fontWeight: guideType === t ? 600 : 400,
                }}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
