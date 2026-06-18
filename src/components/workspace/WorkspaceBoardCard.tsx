import type { PointerEvent } from 'react'

import type {
  BoardCard,
  CardLayout,
  ColumnChildCard,
  DocumentCard,
  HeadingCard,
  ImageCard,
  ImageCropPreview,
  TableCard,
  TableCellSelection,
  TableCellSelectionRange,
} from '../../workspace/core'
import { isColumnCard, isColumnChildCard } from '../../workspace/core'
import RichNoteEditor from './RichNoteEditor'
import WorkspaceCardShell from './cards/WorkspaceCardShell'
import WorkspaceColumnCard from './cards/WorkspaceColumnCard'
import WorkspaceDocumentCard from './cards/WorkspaceDocumentCard'
import WorkspaceHeadingCard from './cards/WorkspaceHeadingCard'
import WorkspaceImageCaption from './cards/WorkspaceImageCaption'
import WorkspaceImageCard from './cards/WorkspaceImageCard'
import WorkspaceLinkCardBody from './cards/WorkspaceLinkCardBody'
import WorkspaceTableCard from './cards/WorkspaceTableCard'
import WorkspaceTodoCardBody from './cards/WorkspaceTodoCardBody'

type WorkspaceBoardCardProps = {
  card: BoardCard
  isNested?: boolean
  layouts: Map<string, CardLayout>
  columnChildren: Map<string, ColumnChildCard[]>
  selectedCardIdsSet: Set<string>
  selectedCount: number
  isConnectorMode: boolean
  connectorSourceCardId: string | null
  connectorHoverCardId: string | null
  dragColumnTargetId: string | null
  draggedTodoItemId: string | null
  todoDropTargetCardId: string | null
  todoDropInsertionIndex: number | null
  captionEditingImageId: string | null
  cropArmedImageId: string | null
  selectedImageCropReady: boolean
  imageCropPreview: ImageCropPreview | null
  activeSelectedTableCell: TableCellSelection | null
  activeSelectedTableCellRange: TableCellSelectionRange | null
  usesDarkItems: boolean
  registerMeasuredCard: (cardId: string) => (node: HTMLElement | null) => void
  registerImageCaptionInput: (cardId: string) => (node: HTMLTextAreaElement | null) => void
  registerTodoItemInput: (itemId: string) => (node: HTMLTextAreaElement | null) => void
  registerNoteEditor: (cardId: string) => (node: HTMLDivElement | null) => void
  autoResizeTextarea: (element: HTMLTextAreaElement) => void
  normalizeRichNoteHtml: (html: string) => string
  configureRichTextCommands: () => void
  onImagePointerDown: (event: PointerEvent<HTMLElement>, card: ImageCard) => void
  onCardSurfacePointerDown: (event: PointerEvent<HTMLElement>, card: BoardCard) => void
  onCardDragPointerDown: (event: PointerEvent<HTMLElement>, card: BoardCard) => void
  onCardResizePointerDown: (event: PointerEvent<HTMLElement>, card: BoardCard) => void
  onOpenDocumentPreview: (cardId: string) => void
  onToggleImageCaption: (cardId: string) => void
  onToggleImageCrop: (cardId: string) => void
  onUpdateImageCaption: (cardId: string, caption: string) => void
  onStopImageCaptionEditing: () => void
  onCancelCropMode: () => void
  onFocusCard: (cardId: string) => void
  onActivateCard: (cardId: string) => void
  onStartImageCaptionEditing: (cardId: string) => void
  onFocusCanvas: () => void
  onStatusText: (text: string) => void
  onRevealCardSettingsForEditing: (cardId: string) => void
  onActivateNoteEditor: (cardId: string) => void
  onNoteSelectionChange: (cardId: string) => void
  onNoteContentChange: (cardId: string, html: string) => void
  onToggleTodo: (cardId: string, itemId: string) => void
  onTodoTextChange: (cardId: string, itemId: string, text: string) => void
  onInsertTodoAfter: (cardId: string, itemId: string) => void
  onRemoveTodo: (cardId: string, itemId: string, fallbackItemId: string | null) => void
  onTodoDragHandlePointerDown: (
    event: PointerEvent<HTMLButtonElement>,
    payload: {
      sourceCardId: string
      itemId: string
      text: string
      done: boolean
    },
  ) => void
  onOpenLink: (url: string) => void
  onLinkUrlChange: (cardId: string, url: string) => void
  onTableTitleFocus: (cardId: string) => void
  onTableTitleChange: (cardId: string, title: string) => void
  onTableTitlePointerDown: (event: PointerEvent<HTMLInputElement>, card: TableCard) => void
  onTableCellFocus: (card: TableCard, rowIndex: number, columnIndex: number) => void
  onTableCellChange: (
    cardId: string,
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) => void
  onTableCellPointerDown: (
    event: PointerEvent<HTMLInputElement>,
    card: TableCard,
    rowIndex: number,
    columnIndex: number,
  ) => void
  onColumnTitleChange: (cardId: string, title: string) => void
}

function WorkspaceBoardCard({
  card,
  isNested = false,
  layouts,
  columnChildren,
  selectedCardIdsSet,
  selectedCount,
  isConnectorMode,
  connectorSourceCardId,
  connectorHoverCardId,
  dragColumnTargetId,
  draggedTodoItemId,
  todoDropTargetCardId,
  todoDropInsertionIndex,
  captionEditingImageId,
  cropArmedImageId,
  selectedImageCropReady,
  imageCropPreview,
  activeSelectedTableCell,
  activeSelectedTableCellRange,
  usesDarkItems,
  registerMeasuredCard,
  registerImageCaptionInput,
  registerTodoItemInput,
  registerNoteEditor,
  autoResizeTextarea,
  normalizeRichNoteHtml,
  configureRichTextCommands,
  onImagePointerDown,
  onCardSurfacePointerDown,
  onCardDragPointerDown,
  onCardResizePointerDown,
  onOpenDocumentPreview,
  onToggleImageCaption,
  onToggleImageCrop,
  onUpdateImageCaption,
  onStopImageCaptionEditing,
  onCancelCropMode,
  onFocusCard,
  onActivateCard,
  onStartImageCaptionEditing,
  onFocusCanvas,
  onStatusText,
  onRevealCardSettingsForEditing,
  onActivateNoteEditor,
  onNoteSelectionChange,
  onNoteContentChange,
  onToggleTodo,
  onTodoTextChange,
  onInsertTodoAfter,
  onRemoveTodo,
  onTodoDragHandlePointerDown,
  onOpenLink,
  onLinkUrlChange,
  onTableTitleFocus,
  onTableTitleChange,
  onTableTitlePointerDown,
  onTableCellFocus,
  onTableCellChange,
  onTableCellPointerDown,
  onColumnTitleChange,
}: WorkspaceBoardCardProps) {
  if (!isNested && isColumnChildCard(card) && card.columnId) {
    return null
  }

  if (isColumnCard(card)) {
    return (
      <WorkspaceColumnCard
        key={card.id}
        card={card}
        layout={layouts.get(card.id) ?? null}
        childrenCards={columnChildren.get(card.id) ?? []}
        usesDarkItems={usesDarkItems}
        isSelected={selectedCardIdsSet.has(card.id)}
        isDropTarget={dragColumnTargetId === card.id}
        isConnectorHovered={isConnectorMode && connectorHoverCardId === card.id}
        isConnectorSource={isConnectorMode && connectorSourceCardId === card.id}
        isConnectorMode={isConnectorMode}
        registerMeasuredCard={registerMeasuredCard}
        renderChildCard={(child) => (
          <WorkspaceBoardCard
            key={child.id}
            card={child}
            isNested
            layouts={layouts}
            columnChildren={columnChildren}
            selectedCardIdsSet={selectedCardIdsSet}
            selectedCount={selectedCount}
            isConnectorMode={isConnectorMode}
            connectorSourceCardId={connectorSourceCardId}
            connectorHoverCardId={connectorHoverCardId}
            dragColumnTargetId={dragColumnTargetId}
            draggedTodoItemId={draggedTodoItemId}
            todoDropTargetCardId={todoDropTargetCardId}
            todoDropInsertionIndex={todoDropInsertionIndex}
            captionEditingImageId={captionEditingImageId}
            cropArmedImageId={cropArmedImageId}
            selectedImageCropReady={selectedImageCropReady}
            imageCropPreview={imageCropPreview}
            activeSelectedTableCell={activeSelectedTableCell}
            activeSelectedTableCellRange={activeSelectedTableCellRange}
            usesDarkItems={usesDarkItems}
            registerMeasuredCard={registerMeasuredCard}
            registerImageCaptionInput={registerImageCaptionInput}
            registerTodoItemInput={registerTodoItemInput}
            registerNoteEditor={registerNoteEditor}
            autoResizeTextarea={autoResizeTextarea}
            normalizeRichNoteHtml={normalizeRichNoteHtml}
            configureRichTextCommands={configureRichTextCommands}
            onImagePointerDown={onImagePointerDown}
            onCardSurfacePointerDown={onCardSurfacePointerDown}
            onCardDragPointerDown={onCardDragPointerDown}
            onCardResizePointerDown={onCardResizePointerDown}
            onOpenDocumentPreview={onOpenDocumentPreview}
            onToggleImageCaption={onToggleImageCaption}
            onToggleImageCrop={onToggleImageCrop}
            onUpdateImageCaption={onUpdateImageCaption}
            onStopImageCaptionEditing={onStopImageCaptionEditing}
            onCancelCropMode={onCancelCropMode}
            onFocusCard={onFocusCard}
            onActivateCard={onActivateCard}
            onStartImageCaptionEditing={onStartImageCaptionEditing}
            onFocusCanvas={onFocusCanvas}
            onStatusText={onStatusText}
            onRevealCardSettingsForEditing={onRevealCardSettingsForEditing}
            onActivateNoteEditor={onActivateNoteEditor}
            onNoteSelectionChange={onNoteSelectionChange}
            onNoteContentChange={onNoteContentChange}
            onToggleTodo={onToggleTodo}
            onTodoTextChange={onTodoTextChange}
            onInsertTodoAfter={onInsertTodoAfter}
            onRemoveTodo={onRemoveTodo}
            onTodoDragHandlePointerDown={onTodoDragHandlePointerDown}
            onOpenLink={onOpenLink}
            onLinkUrlChange={onLinkUrlChange}
            onTableTitleFocus={onTableTitleFocus}
            onTableTitleChange={onTableTitleChange}
            onTableTitlePointerDown={onTableTitlePointerDown}
            onTableCellFocus={onTableCellFocus}
            onTableCellChange={onTableCellChange}
            onTableCellPointerDown={onTableCellPointerDown}
            onColumnTitleChange={onColumnTitleChange}
          />
        )}
        onPointerDown={(event) => onCardSurfacePointerDown(event, card)}
        onTitleFocus={() => onRevealCardSettingsForEditing(card.id)}
        onTitleChange={(title) => onColumnTitleChange(card.id, title)}
        onResizePointerDown={(event) => onCardResizePointerDown(event, card)}
      />
    )
  }

  const isSelected = selectedCardIdsSet.has(card.id)
  const isConnectorSource = isConnectorMode && connectorSourceCardId === card.id
  const isConnectorHovered = isConnectorMode && connectorHoverCardId === card.id
  const layout = layouts.get(card.id) ?? null

  if (card.kind === 'image') {
    const isCaptionEditing = captionEditingImageId === card.id && isSelected

    return (
      <WorkspaceImageCard
        key={card.id}
        card={card}
        layout={layout}
        isNested={isNested}
        isSelected={isSelected}
        isConnectorHovered={isConnectorHovered}
        isConnectorSource={isConnectorSource}
        isCropReady={selectedImageCropReady && isSelected}
        isCaptionEditing={isCaptionEditing}
        showActionBubbles={isSelected && selectedCount === 1}
        cropPreview={imageCropPreview?.cardId === card.id ? imageCropPreview : null}
        captionContent={
          <WorkspaceImageCaption
            card={card}
            isEditing={isCaptionEditing}
            isConnectorMode={isConnectorMode}
            isSelected={isSelected}
            isCropArmed={cropArmedImageId === card.id}
            registerInput={registerImageCaptionInput}
            autoResizeTextarea={autoResizeTextarea}
            onCaptionChange={(caption) => onUpdateImageCaption(card.id, caption)}
            onStopEditing={onStopImageCaptionEditing}
            onCancelCrop={onCancelCropMode}
            onFocusCard={() => onFocusCard(card.id)}
            onActivateCard={() => onActivateCard(card.id)}
            onStartEditing={() => onStartImageCaptionEditing(card.id)}
            onFocusCanvas={onFocusCanvas}
            onStatusText={onStatusText}
          />
        }
        registerMeasuredCard={registerMeasuredCard}
        onPointerDown={(event) => onImagePointerDown(event, card)}
        onToggleCaption={onToggleImageCaption}
        onToggleCrop={onToggleImageCrop}
        onResizePointerDown={(event) => onCardResizePointerDown(event, card)}
      />
    )
  }

  if (card.kind === 'heading') {
    return (
      <WorkspaceHeadingCard
        key={card.id}
        card={card as HeadingCard}
        layout={layout}
        isNested={isNested}
        isSelected={isSelected}
        isConnectorHovered={isConnectorHovered}
        isConnectorSource={isConnectorSource}
        isConnectorMode={isConnectorMode}
        usesDarkItems={usesDarkItems}
        registerMeasuredCard={registerMeasuredCard}
        registerEditor={registerNoteEditor}
        normalizeRichNoteHtml={normalizeRichNoteHtml}
        configureRichTextCommands={configureRichTextCommands}
        onPointerDown={(event) => onCardSurfacePointerDown(event, card)}
        onDragPointerDown={(event) => onCardDragPointerDown(event, card)}
        onResizePointerDown={(event) => onCardResizePointerDown(event, card)}
        onFocusCard={onRevealCardSettingsForEditing}
        onActivateEditor={onActivateNoteEditor}
        onSelectionChange={onNoteSelectionChange}
        onContentChange={onNoteContentChange}
      />
    )
  }

  if (card.kind === 'document') {
    return (
      <WorkspaceDocumentCard
        key={card.id}
        card={card as DocumentCard}
        layout={layout}
        isNested={isNested}
        isSelected={isSelected}
        isConnectorHovered={isConnectorHovered}
        isConnectorSource={isConnectorSource}
        registerMeasuredCard={registerMeasuredCard}
        onPointerDown={(event) => onCardSurfacePointerDown(event, card)}
        onOpenPreview={onOpenDocumentPreview}
      />
    )
  }

  return (
    <WorkspaceCardShell
      key={card.id}
      card={card}
      layout={layout}
      isNested={isNested}
      isSelected={isSelected}
      isConnectorHovered={isConnectorHovered}
      isConnectorSource={isConnectorSource}
      usesDarkItems={usesDarkItems}
      registerMeasuredCard={registerMeasuredCard}
      onPointerDown={(event) => onCardSurfacePointerDown(event, card)}
      onDragPointerDown={(event) => onCardDragPointerDown(event, card)}
      onResizePointerDown={(event) => onCardResizePointerDown(event, card)}
    >
      {card.kind === 'note' ? (
        <RichNoteEditor
          cardId={card.id}
          value={card.content}
          placeholder="Start typing..."
          isSelected={isSelected}
          isReadOnly={isConnectorMode}
          registerEditor={registerNoteEditor}
          normalizeHtml={normalizeRichNoteHtml}
          configureRichTextCommands={configureRichTextCommands}
          onFocusCard={onRevealCardSettingsForEditing}
          onActivateEditor={onActivateNoteEditor}
          onSelectionChange={onNoteSelectionChange}
          onContentChange={onNoteContentChange}
        />
      ) : null}

      {card.kind === 'todo' ? (
        <WorkspaceTodoCardBody
          card={card}
          isSelected={isSelected}
          isConnectorMode={isConnectorMode}
          draggedItemId={draggedTodoItemId}
          dropInsertionIndex={
            todoDropTargetCardId === card.id ? todoDropInsertionIndex : null
          }
          autoResizeTextarea={autoResizeTextarea}
          registerInput={registerTodoItemInput}
          onFocusCard={onRevealCardSettingsForEditing}
          onToggle={onToggleTodo}
          onTextChange={onTodoTextChange}
          onInsertAfter={onInsertTodoAfter}
          onRemove={onRemoveTodo}
          onDragHandlePointerDown={onTodoDragHandlePointerDown}
        />
      ) : null}

      {card.kind === 'link' ? (
        <WorkspaceLinkCardBody
          card={card}
          isSelected={isSelected}
          isConnectorMode={isConnectorMode}
          onFocusCard={onRevealCardSettingsForEditing}
          onOpenLink={onOpenLink}
          onUrlChange={onLinkUrlChange}
        />
      ) : null}

      {card.kind === 'table' ? (
        <WorkspaceTableCard
          card={card}
          isSelected={isSelected}
          isConnectorMode={isConnectorMode}
          activeCell={activeSelectedTableCell}
          activeRange={activeSelectedTableCellRange}
          onTitleFocus={() => onTableTitleFocus(card.id)}
          onTitleChange={(title) => onTableTitleChange(card.id, title)}
          onTitlePointerDown={(event) => onTableTitlePointerDown(event, card)}
          onCellFocus={(rowIndex, columnIndex) => onTableCellFocus(card, rowIndex, columnIndex)}
          onCellChange={(rowIndex, columnIndex, value) =>
            onTableCellChange(card.id, rowIndex, columnIndex, value)
          }
          onCellPointerDown={(event, rowIndex, columnIndex) =>
            onTableCellPointerDown(event, card, rowIndex, columnIndex)
          }
        />
      ) : null}
    </WorkspaceCardShell>
  )
}

export default WorkspaceBoardCard
