import React from 'react'
import type { ShapeElement as ShapeElementType } from '../../types'

interface Props {
  element: ShapeElementType
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onClick: (e: React.MouseEvent) => void
}

const ShapeElement: React.FC<Props> = ({ element, isSelected, onMouseDown, onClick }) => {
  const borderRadius = element.shape === 'circle' ? '50%' : element.shape === 'tag' ? '999px' : 0

  const style: React.CSSProperties = {
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
    backgroundColor: element.color,
    borderRadius,
    transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
    opacity: element.opacity,
    zIndex: isSelected ? 100 : -1,
  }

  return (
    <div
      className={`absolute cursor-move ${
        isSelected ? 'ring-2 ring-primary ring-offset-1' : ''
      }`}
      style={style}
      onMouseDown={onMouseDown}
      onClick={onClick}
    />
  )
}

export default ShapeElement
