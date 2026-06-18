import type { CSSProperties, PointerEventHandler, ReactNode } from 'react'

import type { CardLayout, LinkCard, NoteCard, TableCard, TodoCard } from '../../../workspace/core'
import { getCardMinWidth, getCardVisualTheme } from '../../../workspace/core'

type StandardCard = NoteCard | TodoCard | LinkCard | TableCard

type WorkspaceCardShellProps = {
  card: StandardCard
  layout: CardLayout | null
  isNested: boolean
  isSelected: boolean
  isConnectorHovered: boolean
  isConnectorSource: boolean
  usesDarkItems: boolean
  registerMeasuredCard: (cardId: string) => (node: HTMLElement | null) => void
  onPointerDown: PointerEventHandler<HTMLElement>
  onDragPointerDown: PointerEventHandler<HTMLDivElement>
  onResizePointerDown: PointerEventHandler<HTMLButtonElement>
  children: ReactNode
}

function WorkspaceCardShell({
  card,
  layout,
  isNested,
  isSelected,
  isConnectorHovered,
  isConnectorSource,
  usesDarkItems,
  registerMeasuredCard,
  onPointerDown,
  onDragPointerDown,
  onResizePointerDown,
  children,
}: WorkspaceCardShellProps) {
  const isMinimalTextCard =
    card.kind === 'note' || card.kind === 'todo' || card.kind === 'link'
  const isTableCard = card.kind === 'table'
  const baseStyle: CSSProperties & Record<string, string | number> = {
    width: layout?.width ?? card.width,
    minWidth: isNested ? 0 : getCardMinWidth(card),
  }

  if (!isNested) {
    baseStyle.left = layout?.x ?? card.x
    baseStyle.top = layout?.y ?? card.y
    baseStyle.zIndex = card.zIndex
  }

  if (isTableCard) {
    baseStyle['--card-accent' as const] = 'var(--workspace-range-fill, #194f47)'
    baseStyle['--card-top-accent' as const] = card.accentColor ?? 'transparent'
  } else {
    const palette = getCardVisualTheme(card.palette, usesDarkItems)
    baseStyle['--card-accent' as const] = palette.accent
    baseStyle['--card-top-accent' as const] = card.accentColor ?? 'transparent'
    baseStyle['--card-bg' as const] = palette.background
    baseStyle['--card-border' as const] = palette.border
    baseStyle['--card-shadow' as const] = palette.shadow
    baseStyle['--card-text' as const] = palette.text
    baseStyle['--card-heading' as const] = palette.heading
    baseStyle['--card-body-text' as const] = palette.body
    baseStyle['--card-muted-text' as const] = palette.muted
    baseStyle['--card-placeholder' as const] = palette.placeholder
    baseStyle['--card-chip-bg' as const] = palette.chipBg
    baseStyle['--card-chip-text' as const] = palette.chipText
    baseStyle['--card-button-bg' as const] = palette.buttonBg
    baseStyle['--card-button-text' as const] = palette.buttonText
    baseStyle['--card-input-bg' as const] = palette.inputBg
    baseStyle['--card-input-border' as const] = palette.inputBorder
    baseStyle['--card-done-text' as const] = palette.doneText
    baseStyle['--card-handle-soft' as const] = palette.handleSoft
    baseStyle['--card-handle-strong' as const] = palette.handleStrong
  }

  return (
    <article
      key={card.id}
      className={`board-card ${card.kind}-card ${isSelected ? 'is-selected' : ''} ${
        isNested ? 'is-column-child' : ''
      } ${isMinimalTextCard ? 'is-minimal-card' : ''} ${
        isConnectorHovered ? 'is-connector-hovered' : ''
      } ${
        isConnectorSource ? 'is-connector-source' : ''
      }`}
      style={baseStyle}
      ref={registerMeasuredCard(card.id)}
      onPointerDown={onPointerDown}
    >
      {!isMinimalTextCard && !isTableCard ? (
        <div className="card-dragbar" onPointerDown={onDragPointerDown}>
          <div className="drag-handle" aria-hidden="true">
            <span className="drag-dot" />
            <span className="drag-dot" />
            <span className="drag-dot" />
          </div>
        </div>
      ) : null}

      <div
        className={`card-body ${isMinimalTextCard ? 'is-minimal-card-body' : ''} ${
          isTableCard ? 'is-table-card-body' : ''
        }`}
      >
        {children}
        {!isNested ? (
          <button
            type="button"
            className="card-resize-handle"
            onPointerDown={onResizePointerDown}
            aria-label={
              card.kind === 'table'
                ? `Resize ${card.title || 'table'} width`
                : `Resize ${card.title || 'card'} width`
            }
          />
        ) : null}
      </div>
    </article>
  )
}

export default WorkspaceCardShell
