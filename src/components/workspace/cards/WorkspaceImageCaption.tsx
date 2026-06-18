import type { PointerEvent } from 'react'

import type { ImageCard } from '../../../workspace/core'

type WorkspaceImageCaptionProps = {
  card: ImageCard
  isEditing: boolean
  isConnectorMode: boolean
  isSelected: boolean
  isCropArmed: boolean
  registerInput: (cardId: string) => (node: HTMLTextAreaElement | null) => void
  autoResizeTextarea: (element: HTMLTextAreaElement) => void
  onCaptionChange: (caption: string) => void
  onStopEditing: () => void
  onCancelCrop: () => void
  onFocusCard: () => void
  onActivateCard: () => void
  onStartEditing: () => void
  onFocusCanvas: () => void
  onStatusText: (text: string) => void
}

function WorkspaceImageCaption({
  card,
  isEditing,
  isConnectorMode,
  isSelected,
  isCropArmed,
  registerInput,
  autoResizeTextarea,
  onCaptionChange,
  onStopEditing,
  onCancelCrop,
  onFocusCard,
  onActivateCard,
  onStartEditing,
  onFocusCanvas,
  onStatusText,
}: WorkspaceImageCaptionProps) {
  if (isEditing) {
    return (
      <textarea
        className="card-caption-input card-image-caption-input"
        value={card.caption}
        readOnly={isConnectorMode}
        tabIndex={isConnectorMode ? -1 : undefined}
        onChange={(event) => {
          autoResizeTextarea(event.currentTarget)
          onCaptionChange(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            onStopEditing()
            onFocusCanvas()
            onStatusText('Image note hidden.')
          }
        }}
        onPointerDown={(event) => event.stopPropagation()}
        ref={registerInput(card.id)}
        data-autoresize="true"
        rows={1}
        placeholder="Add a small note under this image..."
      />
    )
  }

  if (!card.caption.trim().length) {
    return null
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation()

    if (!isSelected) {
      onFocusCard()
      return
    }

    onActivateCard()
  }

  return (
    <div
      className="card-image-caption"
      onPointerDown={handlePointerDown}
      onDoubleClick={(event) => {
        event.preventDefault()
        event.stopPropagation()

        if (isCropArmed) {
          onCancelCrop()
        }

        if (!isSelected) {
          onFocusCard()
        } else {
          onActivateCard()
        }

        onStartEditing()
        onStatusText('Image note ready. Type underneath the image.')
      }}
    >
      {card.caption}
    </div>
  )
}

export default WorkspaceImageCaption
