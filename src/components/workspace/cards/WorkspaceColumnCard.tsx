import { useEffect, useRef, useState, type PointerEventHandler, type ReactNode } from 'react'

import type { CardLayout, ColumnCard, ColumnChildCard } from '../../../workspace/core'
import { getCardMinWidth, getCardVisualTheme } from '../../../workspace/core'

type WorkspaceColumnCardProps = {
  card: ColumnCard
  layout: CardLayout | null
  childrenCards: ColumnChildCard[]
  usesDarkItems: boolean
  isSelected: boolean
  isDropTarget: boolean
  isConnectorHovered: boolean
  isConnectorSource: boolean
  isConnectorMode: boolean
  registerMeasuredCard: (cardId: string) => (node: HTMLElement | null) => void
  renderChildCard: (card: ColumnChildCard) => ReactNode
  onPointerDown: PointerEventHandler<HTMLElement>
  onTitleFocus: () => void
  onTitleChange: (title: string) => void
  onResizePointerDown: PointerEventHandler<HTMLButtonElement>
}

function WorkspaceColumnCard({
  card,
  layout,
  childrenCards,
  usesDarkItems,
  isSelected,
  isDropTarget,
  isConnectorHovered,
  isConnectorSource,
  isConnectorMode,
  registerMeasuredCard,
  renderChildCard,
  onPointerDown,
  onTitleFocus,
  onTitleChange,
  onResizePointerDown,
}: WorkspaceColumnCardProps) {
  const palette = getCardVisualTheme(card.palette, usesDarkItems)
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const pointerDownWasSelectedRef = useRef(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const baseStyle = {
    width: layout?.width ?? card.width,
    minWidth: getCardMinWidth(card),
    left: layout?.x ?? card.x,
    top: layout?.y ?? card.y,
    zIndex: card.zIndex,
    '--card-accent': palette.accent,
    '--card-top-accent': card.accentColor ?? 'transparent',
    '--card-bg': palette.background,
    '--card-border': palette.border,
    '--card-shadow': palette.shadow,
    '--card-text': palette.text,
    '--card-heading': palette.heading,
    '--card-body-text': palette.body,
    '--card-muted-text': palette.muted,
    '--card-placeholder': palette.placeholder,
    '--card-chip-bg': palette.chipBg,
    '--card-chip-text': palette.chipText,
    '--card-button-bg': palette.buttonBg,
    '--card-button-text': palette.buttonText,
    '--card-input-bg': palette.inputBg,
    '--card-input-border': palette.inputBorder,
    '--card-done-text': palette.doneText,
    '--card-handle-soft': palette.handleSoft,
    '--card-handle-strong': palette.handleStrong,
  }

  useEffect(() => {
    if (isSelected && !isConnectorMode) {
      return
    }

    setIsEditingTitle(false)
  }, [isConnectorMode, isSelected])

  useEffect(() => {
    if (!isEditingTitle) {
      return
    }

    window.requestAnimationFrame(() => {
      const input = titleInputRef.current
      if (!input) {
        return
      }

      input.focus()
      const cursorPosition = input.value.length
      input.setSelectionRange(cursorPosition, cursorPosition)
    })
  }, [isEditingTitle])

  return (
    <article
      key={card.id}
      className={`board-card column-card ${isSelected ? 'is-selected' : ''} ${
        isDropTarget ? 'is-drop-target' : ''
      } ${isConnectorHovered ? 'is-connector-hovered' : ''} ${
        isConnectorSource ? 'is-connector-source' : ''
      }`}
      style={baseStyle}
      ref={registerMeasuredCard(card.id)}
      onPointerDown={onPointerDown}
    >
      <div className="card-dragbar">
        <div
          className="column-title-surface"
          onPointerDownCapture={() => {
            pointerDownWasSelectedRef.current = isSelected
          }}
          onClick={(event) => {
            if (isConnectorMode || isEditingTitle || !pointerDownWasSelectedRef.current) {
              return
            }

            event.preventDefault()
            event.stopPropagation()
            setIsEditingTitle(true)
          }}
        >
          <input
            ref={titleInputRef}
            className={`card-title-input column-title-input ${
              isEditingTitle ? 'is-editing' : 'is-preview-mode'
            }`}
            value={card.title}
            readOnly={isConnectorMode || !isEditingTitle}
            tabIndex={isConnectorMode ? -1 : isEditingTitle ? 0 : -1}
            onFocus={() => {
              if (!isEditingTitle) {
                return
              }

              onTitleFocus()
            }}
            onBlur={() => {
              setIsEditingTitle(false)
            }}
            onChange={(event) => onTitleChange(event.target.value)}
            onPointerDown={(event) => {
              if (!isEditingTitle) {
                return
              }

              event.stopPropagation()
            }}
            placeholder="new column"
          />
        </div>
      </div>

      <div className="column-body">
        <div className={`column-stack ${isDropTarget ? 'is-drop-target' : ''}`}>
          {childrenCards.length ? (
            childrenCards.map((child) => renderChildCard(child))
          ) : (
            <div className={`column-empty ${isDropTarget ? 'is-active' : ''}`}>Drag cards here</div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="card-resize-handle"
        onPointerDown={onResizePointerDown}
        aria-label={`Resize ${card.title || 'column'} width`}
      />
    </article>
  )
}

export default WorkspaceColumnCard
