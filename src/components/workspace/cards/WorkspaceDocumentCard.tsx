import type { CSSProperties, MouseEvent, PointerEventHandler } from 'react'

import type { CardLayout, DocumentCard } from '../../../workspace/core'
import { getCardMinWidth } from '../../../workspace/core'
import { formatFileSize } from '../../../workspace/documentFiles'

type WorkspaceDocumentCardProps = {
  card: DocumentCard
  layout: CardLayout | null
  isNested: boolean
  isSelected: boolean
  isConnectorHovered: boolean
  isConnectorSource: boolean
  registerMeasuredCard: (cardId: string) => (node: HTMLElement | null) => void
  onPointerDown: PointerEventHandler<HTMLElement>
  onOpenPreview: (cardId: string) => void
}

function getDocumentAccent(extension: string) {
  switch (extension) {
    case 'pdf':
      return '#d05345'
    case 'docx':
      return '#2d78d2'
    case 'txt':
      return '#7a8a96'
    default:
      return '#4a5953'
  }
}

function WorkspaceDocumentCard({
  card,
  layout,
  isNested,
  isSelected,
  isConnectorHovered,
  isConnectorSource,
  registerMeasuredCard,
  onPointerDown,
  onOpenPreview,
}: WorkspaceDocumentCardProps) {
  const extensionLabel = card.extension || 'file'
  const baseStyle: CSSProperties & Record<string, string | number> = {
    width: layout?.width ?? card.width,
    minWidth: isNested ? 0 : getCardMinWidth(card),
    '--document-accent': getDocumentAccent(extensionLabel),
  }

  if (!isNested) {
    baseStyle.left = layout?.x ?? card.x
    baseStyle.top = layout?.y ?? card.y
    baseStyle.zIndex = card.zIndex
  }

  const handleDoubleClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onOpenPreview(card.id)
  }

  return (
    <article
      className={`board-card document-card ${isSelected ? 'is-selected' : ''} ${
        isNested ? 'is-column-child' : ''
      } ${isConnectorHovered ? 'is-connector-hovered' : ''} ${
        isConnectorSource ? 'is-connector-source' : ''
      }`}
      style={baseStyle}
      ref={registerMeasuredCard(card.id)}
      onPointerDown={onPointerDown}
      onDoubleClick={handleDoubleClick}
      aria-label={`Preview ${card.fileName}`}
    >
      <div className="document-shell">
        <div className="document-icon" aria-hidden="true">
          <span className="document-icon-extension">{extensionLabel}</span>
        </div>
        <div className="document-meta">
          <div className="document-name" title={card.fileName}>
            {card.fileName}
          </div>
          <div className="document-size">{formatFileSize(card.fileSize)}</div>
        </div>
      </div>
    </article>
  )
}

export default WorkspaceDocumentCard
