import type { CSSProperties, PointerEventHandler, ReactNode } from 'react'

import type { CardLayout, ImageCard, ImageCropPreview } from '../../../workspace/core'
import {
  getCardMinWidth,
  getImageCropImageStyle,
  getRenderedImageFrameHeight,
} from '../../../workspace/core'
import { CaptionIcon, CropIcon } from '../ToolbarIcon'

type WorkspaceImageCardProps = {
  card: ImageCard
  layout: CardLayout | null
  isNested: boolean
  isSelected: boolean
  isConnectorHovered: boolean
  isConnectorSource: boolean
  isCropReady: boolean
  isCaptionEditing: boolean
  showActionBubbles: boolean
  cropPreview: ImageCropPreview | null
  captionContent: ReactNode
  registerMeasuredCard: (cardId: string) => (node: HTMLElement | null) => void
  onPointerDown: PointerEventHandler<HTMLElement>
  onToggleCaption: (cardId: string) => void
  onToggleCrop: (cardId: string) => void
  onResizePointerDown: PointerEventHandler<HTMLButtonElement>
}

function WorkspaceImageCard({
  card,
  layout,
  isNested,
  isSelected,
  isConnectorHovered,
  isConnectorSource,
  isCropReady,
  isCaptionEditing,
  showActionBubbles,
  cropPreview,
  captionContent,
  registerMeasuredCard,
  onPointerDown,
  onToggleCaption,
  onToggleCrop,
  onResizePointerDown,
}: WorkspaceImageCardProps) {
  const cardWidth = layout?.width ?? card.width
  const baseStyle: CSSProperties & Record<string, string | number> = {
    width: cardWidth,
    minWidth: getCardMinWidth(card),
    '--image-frame-height': `${getRenderedImageFrameHeight(card, cardWidth)}px`,
  }

  if (!isNested) {
    baseStyle.left = layout?.x ?? card.x
    baseStyle.top = layout?.y ?? card.y
    baseStyle.zIndex = card.zIndex
  }

  return (
    <article
      key={card.id}
      className={`board-card image-card ${isSelected ? 'is-selected' : ''} ${
        isCropReady ? 'is-crop-ready' : ''
      } ${cropPreview ? 'is-cropping' : ''} ${isNested ? 'is-column-child' : ''} ${
        isConnectorHovered ? 'is-connector-hovered' : ''
      } ${isConnectorSource ? 'is-connector-source' : ''}`}
      style={baseStyle}
      ref={registerMeasuredCard(card.id)}
      onPointerDown={onPointerDown}
      aria-label={card.title}
    >
      <div className="image-frame">
        <img
          className="card-image"
          style={getImageCropImageStyle(card.crop)}
          src={card.src}
          alt={card.title}
          draggable={false}
        />
        {cropPreview ? (
          <div
            className="image-crop-selection"
            style={{
              left: cropPreview.left,
              top: cropPreview.top,
              width: cropPreview.width,
              height: cropPreview.height,
            }}
          />
        ) : null}
        {showActionBubbles ? (
          <button
            type="button"
            className={`image-action-bubble is-caption ${isCaptionEditing ? 'is-active' : ''}`}
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
            onClick={() => onToggleCaption(card.id)}
            aria-label={
              isCaptionEditing ? `Hide note for ${card.title}` : `Add a note to ${card.title}`
            }
          >
            <CaptionIcon />
          </button>
        ) : null}
        {showActionBubbles ? (
          <button
            type="button"
            className={`image-action-bubble ${isCropReady ? 'is-active' : ''}`}
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
            onClick={() => onToggleCrop(card.id)}
            aria-label={isCropReady ? `Cancel crop for ${card.title}` : `Crop ${card.title}`}
          >
            <CropIcon />
          </button>
        ) : null}
        {!isNested ? (
          <button
            type="button"
            className="card-resize-handle is-image-handle"
            onPointerDown={onResizePointerDown}
            aria-label={`Resize ${card.title || 'image'} proportionally`}
          />
        ) : null}
      </div>
      {captionContent}
    </article>
  )
}

export default WorkspaceImageCard
