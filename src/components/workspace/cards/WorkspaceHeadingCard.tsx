import type { CSSProperties, PointerEventHandler } from 'react'

import type { CardLayout, HeadingCard } from '../../../workspace/core'
import { DEFAULT_CARD_PALETTE, getCardMinWidth, getCardVisualTheme } from '../../../workspace/core'
import RichNoteEditor from '../RichNoteEditor'

type WorkspaceHeadingCardProps = {
  card: HeadingCard
  layout: CardLayout | null
  isNested: boolean
  isSelected: boolean
  isConnectorHovered: boolean
  isConnectorSource: boolean
  isConnectorMode: boolean
  usesDarkItems: boolean
  registerMeasuredCard: (cardId: string) => (node: HTMLElement | null) => void
  registerEditor: (cardId: string) => (node: HTMLDivElement | null) => void
  normalizeRichNoteHtml: (html: string) => string
  configureRichTextCommands: () => void
  onPointerDown: PointerEventHandler<HTMLElement>
  onDragPointerDown: PointerEventHandler<HTMLDivElement>
  onResizePointerDown: PointerEventHandler<HTMLButtonElement>
  onFocusCard: (cardId: string) => void
  onActivateEditor: (cardId: string) => void
  onSelectionChange: (cardId: string) => void
  onContentChange: (cardId: string, html: string) => void
}

function WorkspaceHeadingCard({
  card,
  layout,
  isNested,
  isSelected,
  isConnectorHovered,
  isConnectorSource,
  isConnectorMode,
  usesDarkItems,
  registerMeasuredCard,
  registerEditor,
  normalizeRichNoteHtml,
  configureRichTextCommands,
  onPointerDown,
  onDragPointerDown,
  onResizePointerDown,
  onFocusCard,
  onActivateEditor,
  onSelectionChange,
  onContentChange,
}: WorkspaceHeadingCardProps) {
  const headingTheme = getCardVisualTheme(DEFAULT_CARD_PALETTE, usesDarkItems)
  const baseStyle: CSSProperties & Record<string, string | number> = {
    width: layout?.width ?? card.width,
    minWidth: isNested ? 0 : getCardMinWidth(card),
  }
  baseStyle['--heading-accent' as const] = card.accentColor ?? 'transparent'
  baseStyle['--heading-text' as const] = headingTheme.heading
  baseStyle['--heading-muted-text' as const] = headingTheme.muted
  baseStyle['--heading-placeholder' as const] = headingTheme.placeholder
  baseStyle['--heading-handle' as const] = headingTheme.handleStrong

  if (!isNested) {
    baseStyle.left = layout?.x ?? card.x
    baseStyle.top = layout?.y ?? card.y
    baseStyle.zIndex = card.zIndex
  }

  return (
    <article
      className={`board-card heading-card ${isSelected ? 'is-selected' : ''} ${
        isNested ? 'is-column-child' : ''
      } ${isConnectorHovered ? 'is-connector-hovered' : ''} ${
        isConnectorSource ? 'is-connector-source' : ''
      }`}
      style={baseStyle}
      ref={registerMeasuredCard(card.id)}
      onPointerDown={onPointerDown}
    >
      <div className="heading-shell">
        <div className="card-dragbar heading-dragbar" onPointerDown={onDragPointerDown}>
          <div className="drag-handle" aria-hidden="true">
            <span className="drag-dot" />
            <span className="drag-dot" />
            <span className="drag-dot" />
          </div>
        </div>

        <RichNoteEditor
          cardId={card.id}
          value={card.content}
          placeholder="Add a heading..."
          ariaLabel="Heading text"
          style={{ textAlign: card.textAlign }}
          isSelected={isSelected}
          isReadOnly={isConnectorMode}
          registerEditor={registerEditor}
          normalizeHtml={normalizeRichNoteHtml}
          configureRichTextCommands={configureRichTextCommands}
          onFocusCard={onFocusCard}
          onActivateEditor={onActivateEditor}
          onSelectionChange={onSelectionChange}
          onContentChange={onContentChange}
        />
      </div>

      {!isNested ? (
        <button
          type="button"
          className="card-resize-handle"
          onPointerDown={onResizePointerDown}
          aria-label={`Resize ${card.title || 'heading'} width`}
        />
      ) : null}
    </article>
  )
}

export default WorkspaceHeadingCard
