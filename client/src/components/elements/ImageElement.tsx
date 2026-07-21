import React from 'react'
import type { ImageElement as ImageElementType } from '../../types'

interface Props {
  element: ImageElementType
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onClick: (e: React.MouseEvent) => void
}

const ImageElement: React.FC<Props> = ({ element, isSelected, onMouseDown, onClick }) => {
  const aspectRatio = element.originalWidth / element.originalHeight

  const style: React.CSSProperties = {
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    aspectRatio,
    borderRadius: `${element.radius}px`,
    border: element.border > 0 ? `${element.border}px solid ${element.borderColor}` : 'none',
    boxShadow: element.shadow ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
    filter: element.filter,
    transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
    opacity: element.opacity,
    zIndex: isSelected ? 100 : 1,
  }

  return (
    <img
      src={element.src}
      alt=""
      className={`absolute object-contain cursor-move ${
        isSelected ? 'ring-2 ring-primary ring-offset-1 rounded' : ''
      }`}
      style={style}
      onMouseDown={onMouseDown}
      onClick={onClick}
      draggable={false}
    />
  )
}

export default ImageElement
