import React, { useState } from 'react'
import { useEditorStore } from '../../store/useEditorStore'

interface Props {
  element: any
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onClick: (e: React.MouseEvent) => void
}

const TextElement: React.FC<Props> = ({ element, isSelected, onMouseDown, onClick }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(element.content)
  const updateElement = useEditorStore(state => state.updateElement)

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editContent !== element.content) {
      updateElement(element.id, { content: editContent })
      useEditorStore.getState().saveHistory()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleBlur()
    }
    e.stopPropagation()
  }

  const baseStyle: React.CSSProperties = {
    left: `${element.x}%`,
    top: `${element.y}%`,
    fontSize: `${element.fontSize}px`,
    fontWeight: element.fontWeight,
    fontFamily: element.fontFamily,
    color: element.color,
    textAlign: element.textAlign,
    fontStyle: element.italic ? 'italic' : 'normal',
    textDecoration: element.underline ? 'underline' : 'none',
    WebkitTextStroke: element.stroke ? `${element.strokeWidth}px ${element.strokeColor}` : 'none',
    textShadow: element.shadow ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
    backgroundColor: element.bg ? element.bgColor : 'transparent',
    padding: element.bg ? `${element.bgPadding}px ${element.bgPadding * 2}px` : 0,
    transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
    opacity: element.opacity,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    zIndex: isSelected ? 100 : 1,
    borderRadius: element.bg ? '8px' : 0,
  }

  if (isEditing) {
    return (
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="absolute resize-none outline-none bg-white border-2 border-orange-400 rounded-xl shadow-lg px-3 py-2"
        style={baseStyle}
        rows={1}
        autoFocus
      />
    )
  }

  return (
    <div
      className={`absolute cursor-move transition-shadow duration-200 ${
        isSelected ? 'ring-2 ring-orange-400 ring-offset-4 rounded-lg shadow-xl' : ''
      }`}
      style={baseStyle}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      {element.content}
    </div>
  )
}

export default TextElement
