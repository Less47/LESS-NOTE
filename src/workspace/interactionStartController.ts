import type {
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
} from 'react'

import type {
  BoardCard,
  BoardState,
  CanvasPoint,
  ImageCard,
  ImageCropPreview,
  InteractionState,
  SelectionRect,
  TableCellSelection,
  WorkspaceMutationOptions,
} from './core'
import {
  getBoardCardLayouts,
  getRectFromPoints,
  getRenderedImageFrameHeight,
  getTopmostCardIdFromSelection,
  isColumnChildCard,
} from './core'

type CreateInteractionStartControllerArgs = {
  interactionRef: MutableRefObject<InteractionState | null>
  selectedCardIdsRef: MutableRefObject<string[]>
  getCurrentBoardState: () => BoardState
  getCurrentViewportState: () => {
    x: number
    y: number
    zoom: number
  }
  getCurrentBoardLayouts: (
    currentBoard?: BoardState,
  ) => ReturnType<typeof getBoardCardLayouts>
  getCanvasLocalPoint: (clientX: number, clientY: number) => CanvasPoint
  getCropPreviewRect: (
    interaction: Extract<InteractionState, { mode: 'crop-image' }>,
  ) => Omit<ImageCropPreview, 'cardId'>
  getCardLayout: (cardId: string, currentBoard?: BoardState) => {
    x: number
    y: number
    width: number
    height: number
  } | null
  screenToWorld: (clientX: number, clientY: number) => CanvasPoint
  prepareCardsForDrag: (cardIds: string[]) => BoardState
  rememberWorkspaceForUndo: (options?: WorkspaceMutationOptions) => void
  setSelection: (cardIds: string[], activeId?: string | null) => void
  clearSelection: () => void
  setSelectionRect: (rect: SelectionRect | null) => void
  setDragColumnTargetId: (columnId: string | null) => void
  setActiveTableCell: (selection: TableCellSelection | null) => void
  setImageCropPreview: (preview: ImageCropPreview | null) => void
  focusCanvas: () => void
  focusCard: (cardId: string, preserveExistingSelection?: boolean) => void
  setActiveCardId: (cardId: string | null) => void
  handleConnectorCardPress: (cardId: string) => void
  isConnectorMode: boolean
  cropArmedImageId: string | null
  setIsPanning: (value: boolean) => void
}

function createInteractionStartController(args: CreateInteractionStartControllerArgs) {
  const areCardSelectionsEqual = (left: string[], right: string[]) =>
    left.length === right.length && left.every((cardId, index) => cardId === right[index])

  const getEffectiveDragSelection = (anchorCardId: string, selectionIds: string[]) => {
    const currentBoard = args.getCurrentBoardState()
    const selectedIdSet = new Set(selectionIds)
    const cardById = new Map(currentBoard.cards.map((card) => [card.id, card] as const))
    const selectedColumnIds = new Set(
      currentBoard.cards
        .filter((card) => selectedIdSet.has(card.id) && card.kind === 'column')
        .map((card) => card.id),
    )

    if (!selectedColumnIds.size) {
      return {
        anchorCardId,
        selectionIds,
      }
    }

    const nextSelectionIds = selectionIds.filter((cardId) => {
      const card = cardById.get(cardId)
      return !(
        card &&
        isColumnChildCard(card) &&
        card.columnId &&
        selectedColumnIds.has(card.columnId)
      )
    })

    if (!nextSelectionIds.length) {
      return {
        anchorCardId,
        selectionIds,
      }
    }

    if (nextSelectionIds.includes(anchorCardId)) {
      return {
        anchorCardId,
        selectionIds: nextSelectionIds,
      }
    }

    const anchorCard = cardById.get(anchorCardId)
    const nextAnchorCardId =
      anchorCard &&
      isColumnChildCard(anchorCard) &&
      anchorCard.columnId &&
      selectedColumnIds.has(anchorCard.columnId)
        ? anchorCard.columnId
        : nextSelectionIds.at(-1) ?? anchorCardId

    return {
      anchorCardId: nextAnchorCardId,
      selectionIds: nextSelectionIds,
    }
  }

  const getMarqueeSelectedIds = (rect: SelectionRect) => {
    const currentViewport = args.getCurrentViewportState()
    const currentBoard = args.getCurrentBoardState()
    const currentLayouts = args.getCurrentBoardLayouts(currentBoard)

    return currentBoard.cards
      .filter((card) => {
        const layout = currentLayouts.layouts.get(card.id)
        if (!layout) {
          return false
        }

        const cardRect = {
          left: currentViewport.x + layout.x * currentViewport.zoom,
          top: currentViewport.y + layout.y * currentViewport.zoom,
          width: layout.width * currentViewport.zoom,
          height: layout.height * currentViewport.zoom,
        }

        const horizontalHit =
          rect.left <= cardRect.left + cardRect.width &&
          rect.left + rect.width >= cardRect.left
        const verticalHit =
          rect.top <= cardRect.top + cardRect.height &&
          rect.top + rect.height >= cardRect.top

        return horizontalHit && verticalHit
      })
      .map((card) => card.id)
  }

  const updateMarqueeSelection = (
    interaction: Extract<InteractionState, { mode: 'marquee-select' }>,
    options?: { isFinal?: boolean },
  ) => {
    const rect = getRectFromPoints(
      interaction.startCanvasX,
      interaction.startCanvasY,
      interaction.currentCanvasX,
      interaction.currentCanvasY,
    )

    if (rect.width < 4 && rect.height < 4) {
      if (options?.isFinal) {
        args.clearSelection()
      }
      return
    }

    const currentBoard = args.getCurrentBoardState()
    const selectedIds = getMarqueeSelectedIds(rect)

    if (areCardSelectionsEqual(args.selectedCardIdsRef.current, selectedIds)) {
      return
    }

    args.selectedCardIdsRef.current = selectedIds
    args.setSelection(
      selectedIds,
      getTopmostCardIdFromSelection(currentBoard.cards, selectedIds),
    )
  }

  const beginPan = (clientX: number, clientY: number) => {
    args.focusCanvas()
    args.rememberWorkspaceForUndo({ recordUndo: true })
    args.setIsPanning(true)
    args.interactionRef.current = {
      mode: 'pan',
      startClientX: clientX,
      startClientY: clientY,
      originViewportX: args.getCurrentViewportState().x,
      originViewportY: args.getCurrentViewportState().y,
    }
    document.body.style.userSelect = 'none'
  }

  const beginMarqueeSelection = (clientX: number, clientY: number) => {
    args.focusCanvas()
    const canvasPoint = args.getCanvasLocalPoint(clientX, clientY)
    args.setSelectionRect({
      left: canvasPoint.x,
      top: canvasPoint.y,
      width: 0,
      height: 0,
    })
    args.interactionRef.current = {
      mode: 'marquee-select',
      startCanvasX: canvasPoint.x,
      startCanvasY: canvasPoint.y,
      currentCanvasX: canvasPoint.x,
      currentCanvasY: canvasPoint.y,
    }
    document.body.style.userSelect = 'none'
  }

  const finishMarqueeSelection = (
    interaction: Extract<InteractionState, { mode: 'marquee-select' }>,
  ) => {
    args.setSelectionRect(null)
    updateMarqueeSelection(interaction, { isFinal: true })
  }

  const createCardDragInteraction = (
    cardId: string,
    selectionIds: string[],
    startClientX: number,
    startClientY: number,
  ): Extract<InteractionState, { mode: 'drag-card' }> => {
    const {
      anchorCardId,
      selectionIds: effectiveSelectionIds,
    } = getEffectiveDragSelection(cardId, selectionIds)
    args.rememberWorkspaceForUndo({ recordUndo: true })
    const preparedBoard = args.prepareCardsForDrag(effectiveSelectionIds)
    const preparedLayouts = args.getCurrentBoardLayouts(preparedBoard)

    args.setSelection(effectiveSelectionIds, anchorCardId)
    args.setDragColumnTargetId(null)
    document.body.style.userSelect = 'none'

    return {
      mode: 'drag-card',
      startClientX,
      startClientY,
      currentClientX: startClientX,
      currentClientY: startClientY,
      anchorCardId,
      cardOrigins: preparedBoard.cards
        .filter((currentCard) => effectiveSelectionIds.includes(currentCard.id))
        .map((currentCard) => ({
          cardId: currentCard.id,
          x: preparedLayouts.layouts.get(currentCard.id)?.x ?? currentCard.x,
          y: preparedLayouts.layouts.get(currentCard.id)?.y ?? currentCard.y,
        })),
    }
  }

  const beginCardDrag = (event: ReactPointerEvent<HTMLElement>, card: BoardCard) => {
    if (event.button !== 0) {
      return
    }

    if (args.isConnectorMode) {
      event.preventDefault()
      event.stopPropagation()
      args.handleConnectorCardPress(card.id)
      return
    }

    event.preventDefault()
    event.stopPropagation()
    args.focusCanvas()
    if (card.kind === 'table') {
      args.setActiveTableCell(null)
    }
    args.interactionRef.current = createCardDragInteraction(
      card.id,
      args.selectedCardIdsRef.current.includes(card.id) &&
        args.selectedCardIdsRef.current.length > 0
        ? args.selectedCardIdsRef.current
        : [card.id],
      event.clientX,
      event.clientY,
    )
  }

  const beginCardSurfacePointerDown = (
    event: ReactPointerEvent<HTMLElement>,
    card: BoardCard,
  ) => {
    if (event.button !== 0) {
      return
    }

    if (args.isConnectorMode) {
      event.preventDefault()
      event.stopPropagation()
      args.handleConnectorCardPress(card.id)
      return
    }

    event.preventDefault()
    event.stopPropagation()
    args.focusCanvas()
    if (card.kind === 'table') {
      args.setActiveTableCell(null)
    }

    const nextSelection =
      args.selectedCardIdsRef.current.includes(card.id) &&
      args.selectedCardIdsRef.current.length > 0
        ? args.selectedCardIdsRef.current
        : [card.id]

    if (
      args.selectedCardIdsRef.current.includes(card.id) &&
      args.selectedCardIdsRef.current.length > 0
    ) {
      args.focusCard(card.id, true)
    } else {
      args.focusCard(card.id)
    }

    args.interactionRef.current = {
      mode: 'press-card',
      startClientX: event.clientX,
      startClientY: event.clientY,
      anchorCardId: card.id,
      selectionIds: nextSelection,
    }
  }

  const beginImageCrop = (event: ReactPointerEvent<HTMLElement>, card: ImageCard) => {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    args.focusCanvas()
    args.rememberWorkspaceForUndo({ recordUndo: true })

    const layout = args.getCardLayout(card.id)
    const renderedCardWidth = layout?.width ?? card.width
    const startPoint = args.screenToWorld(event.clientX, event.clientY)
    const interaction: Extract<InteractionState, { mode: 'crop-image' }> = {
      mode: 'crop-image',
      cardId: card.id,
      startWorldX: startPoint.x,
      startWorldY: startPoint.y,
      currentWorldX: startPoint.x,
      currentWorldY: startPoint.y,
      originCardX: layout?.x ?? card.x,
      originCardY: layout?.y ?? card.y,
      originCardWidth: renderedCardWidth,
      originCardHeight: getRenderedImageFrameHeight(card, renderedCardWidth),
      originCrop: card.crop,
    }

    args.interactionRef.current = interaction
    args.setImageCropPreview({
      cardId: card.id,
      ...args.getCropPreviewRect(interaction),
    })
    document.body.style.userSelect = 'none'
  }

  const beginCardResize = (event: ReactPointerEvent<HTMLElement>, card: BoardCard) => {
    if (event.button !== 0) {
      return
    }

    if (args.isConnectorMode) {
      event.preventDefault()
      event.stopPropagation()
      args.handleConnectorCardPress(card.id)
      return
    }

    event.preventDefault()
    event.stopPropagation()
    args.focusCanvas()
    args.rememberWorkspaceForUndo({ recordUndo: true })
    args.focusCard(card.id)
    const layout = args.getCardLayout(card.id)
    const renderedCardWidth = layout?.width ?? card.width
    args.interactionRef.current = {
      mode: 'resize-card',
      cardId: card.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originCardWidth: renderedCardWidth,
      originCardHeight:
        card.kind === 'image'
          ? getRenderedImageFrameHeight(card, renderedCardWidth)
          : layout?.height ?? card.height,
      preserveAspectRatio: card.kind === 'image',
      originTableColumnCount: card.kind === 'table' ? card.columnCount : null,
      originTableRowCount: card.kind === 'table' ? card.rowCount : null,
    }
    document.body.style.userSelect = 'none'
  }

  const handleImagePointerDown = (event: ReactPointerEvent<HTMLElement>, card: ImageCard) => {
    if (args.isConnectorMode) {
      event.preventDefault()
      event.stopPropagation()
      args.handleConnectorCardPress(card.id)
      return
    }

    if (args.cropArmedImageId === card.id) {
      args.focusCard(card.id)
      beginImageCrop(event, card)
      return
    }

    beginCardDrag(event, card)
  }

  return {
    beginCardDrag,
    beginCardResize,
    beginCardSurfacePointerDown,
    beginImageCrop,
    beginMarqueeSelection,
    beginPan,
    createCardDragInteraction,
    finishMarqueeSelection,
    handleImagePointerDown,
    updateMarqueeSelection,
  }
}

export { createInteractionStartController }
