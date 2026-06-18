import type {
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  WheelEvent,
} from 'react'

import type {
  BoardCard,
  BoardState,
  CanvasPoint,
  CanvasViewport,
  DrawStroke,
  ImageCropPreview,
  InteractionState,
  SelectionRect,
  TrackpadGestureEvent,
  WorkspaceMutationOptions,
} from './core'
import {
  CARD_DRAG_START_DISTANCE,
  NOTE_MIN_WIDTH,
  getCanvasClientCenter,
  getCardMinWidth,
  getEventTargetCardId,
  getRectFromPoints,
  isColumnChildCard,
  isEditingEventTarget,
  isEmptyCanvasDoubleClickTarget,
  snapCoordinateToGrid,
} from './core'

type GestureZoomState = {
  originClientX: number
  originClientY: number
  startZoom: number
} | null

type ColumnDropTarget = {
  columnId: string
  insertionIndex: number
} | null

type CropPreviewRect = {
  left: number
  top: number
  width: number
  height: number
}

type CreateWorkspaceInteractionControllerArgs = {
  canvasRef: MutableRefObject<HTMLDivElement | null>
  interactionRef: MutableRefObject<InteractionState | null>
  gestureZoomRef: MutableRefObject<GestureZoomState>
  draftStrokeRef: MutableRefObject<DrawStroke | null>
  isSpacePressedRef: MutableRefObject<boolean>
  selectedCardIdsRef: MutableRefObject<string[]>
  selectedStrokeIdRef: MutableRefObject<string | null>
  selectedConnectorIdRef: MutableRefObject<string | null>
  isSnapToGridRef: MutableRefObject<boolean>
  canvasDoubleClickEligibleRef: MutableRefObject<boolean>
  isSpacePressed: boolean
  isBoardViewActive: boolean
  isSettingsOpen: boolean
  captionEditingImageId: string | null
  cropArmedImageId: string | null
  isConnectorMode: boolean
  connectorSourceCardId: string | null
  isDrawMode: boolean
  getCurrentViewportState: () => CanvasViewport
  getCurrentBoardState: () => BoardState
  updateViewport: (
    recipe: (currentViewport: CanvasViewport) => CanvasViewport,
    options?: WorkspaceMutationOptions,
  ) => void
  updateBoard: (
    recipe: (currentBoard: BoardState) => BoardState,
    options?: WorkspaceMutationOptions,
  ) => void
  updateCard: (cardId: string, recipe: (card: BoardCard) => BoardCard) => void
  getCanvasLocalPoint: (clientX: number, clientY: number) => CanvasPoint
  getCropPreviewRect: (
    interaction: Extract<InteractionState, { mode: 'crop-image' }>,
  ) => CropPreviewRect
  screenToWorld: (clientX: number, clientY: number) => CanvasPoint
  getResizedCardWidth: (
    cardX: number,
    rawWidth: number,
    minWidth: number,
    maxWidth: number,
  ) => number
  getColumnDropTarget: (
    clientX: number,
    clientY: number,
    ignoredCardIds: string[],
  ) => ColumnDropTarget
  dockCardsIntoColumn: (
    cardIds: string[],
    columnId: string,
    insertionIndex: number,
  ) => void
  finishMarqueeSelection: (
    interaction: Extract<InteractionState, { mode: 'marquee-select' }>,
  ) => void
  updateMarqueeSelection: (
    interaction: Extract<InteractionState, { mode: 'marquee-select' }>,
  ) => void
  commitImageCrop: (
    interaction: Extract<InteractionState, { mode: 'crop-image' }>,
  ) => boolean
  commitDrawStroke: (
    interaction: Extract<InteractionState, { mode: 'draw-stroke' }>,
  ) => void
  createCardDragInteraction: (
    cardId: string,
    selectionIds: string[],
    startClientX: number,
    startClientY: number,
  ) => Extract<InteractionState, { mode: 'drag-card' }>
  releaseDrawPointerCapture: () => void
  redrawDrawCanvas: () => void
  setSelectionRect: (value: SelectionRect | null) => void
  setImageCropPreview: (value: ImageCropPreview | null) => void
  setDragColumnTargetId: (columnId: string | null) => void
  setIsPanning: (value: boolean) => void
  setIsDrawingStroke: (value: boolean) => void
  setCropArmedImageId: (cardId: string | null) => void
  setIsSpacePressed: (value: boolean) => void
  setConnectorPreviewPoint: (point: CanvasPoint | null) => void
  setConnectorHoverCardId: (cardId: string | null) => void
  setCaptionEditingImageId: (cardId: string | null) => void
  setConnectorSourceCardId: (cardId: string | null) => void
  setIsConnectorMode: (value: boolean) => void
  setIsDrawMode: (value: boolean) => void
  setStatusText: (text: string) => void
  clearSelection: () => void
  closeSettings: () => void
  focusCanvas: () => void
  undoWorkspace: () => void
  cancelCropMode: (statusMessage?: string) => void
  cancelActiveDrawStroke: () => void
  addHeading: () => void
  addNote: () => void
  addTodo: () => void
  addLink: () => void
  addNoteAt: (point: CanvasPoint) => void
  fitBoard: () => void
  resetZoom: () => void
  duplicateSelectedCards: () => void
  removeStrokes: (strokeIds: string[]) => void
  removeConnectors: (connectorIds: string[]) => void
  removeCards: (cardIds: string[]) => void
  zoomAroundClientPoint: (
    targetZoom: number,
    clientX: number,
    clientY: number,
    options?: WorkspaceMutationOptions,
  ) => void
  beginPan: (clientX: number, clientY: number) => void
  beginMarqueeSelection: (clientX: number, clientY: number) => void
}

function createWorkspaceInteractionController(args: CreateWorkspaceInteractionControllerArgs) {
  const extendDrawStroke = (clientX: number, clientY: number) => {
    const interaction = args.interactionRef.current
    if (!interaction || interaction.mode !== 'draw-stroke') {
      return
    }

    const point = args.screenToWorld(clientX, clientY)
    const lastPoint = interaction.points.at(-1)
    const minimumWorldDistance = 1.2 / Math.max(args.getCurrentViewportState().zoom, 0.001)

    if (
      lastPoint &&
      Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) < minimumWorldDistance
    ) {
      return
    }

    interaction.points.push(point)
    args.draftStrokeRef.current = {
      id: interaction.strokeId,
      tool: interaction.tool,
      color: interaction.color,
      size: interaction.size,
      points: interaction.points,
    }
    args.redrawDrawCanvas()
  }

  const clearInteraction = () => {
    const interaction = args.interactionRef.current
    if (!interaction) {
      return
    }

    let shouldExitCropMode = false

    if (interaction.mode === 'drag-card') {
      const draggedCardIds = interaction.cardOrigins.map((origin) => origin.cardId)
      const draggedCards = args.getCurrentBoardState().cards.filter((card) =>
        draggedCardIds.includes(card.id),
      )
      const dragIsDockable =
        draggedCards.length > 0 && draggedCards.every((draggedCard) => isColumnChildCard(draggedCard))
      const dropTarget = dragIsDockable
        ? args.getColumnDropTarget(
            interaction.currentClientX,
            interaction.currentClientY,
            draggedCardIds,
          )
        : null

      if (dropTarget) {
        args.dockCardsIntoColumn(
          draggedCardIds,
          dropTarget.columnId,
          dropTarget.insertionIndex,
        )
      }
    }

    if (interaction.mode === 'marquee-select') {
      args.finishMarqueeSelection(interaction)
    }

    if (interaction.mode === 'crop-image') {
      shouldExitCropMode = args.commitImageCrop(interaction)
    }

    if (interaction.mode === 'draw-stroke') {
      args.commitDrawStroke(interaction)
    }

    args.interactionRef.current = null
    args.releaseDrawPointerCapture()
    args.setIsPanning(false)
    args.setDragColumnTargetId(null)
    args.setSelectionRect(null)
    args.setImageCropPreview(null)
    args.draftStrokeRef.current = null
    args.setIsDrawingStroke(false)
    if (shouldExitCropMode) {
      args.setCropArmedImageId(null)
    }
    document.body.style.userSelect = ''
    args.redrawDrawCanvas()
  }

  const handleGlobalPointerMove = (event: PointerEvent) => {
    let interaction = args.interactionRef.current
    if (!interaction) {
      return
    }

    if (interaction.mode === 'press-card') {
      const distance = Math.hypot(
        event.clientX - interaction.startClientX,
        event.clientY - interaction.startClientY,
      )

      if (distance < CARD_DRAG_START_DISTANCE) {
        return
      }

      interaction = args.createCardDragInteraction(
        interaction.anchorCardId,
        interaction.selectionIds,
        interaction.startClientX,
        interaction.startClientY,
      )
      args.interactionRef.current = interaction
    }

    if (interaction.mode === 'pan') {
      args.updateViewport(() => ({
        zoom: args.getCurrentViewportState().zoom,
        x: interaction.originViewportX + (event.clientX - interaction.startClientX),
        y: interaction.originViewportY + (event.clientY - interaction.startClientY),
      }))
      return
    }

    if (interaction.mode === 'marquee-select') {
      const canvasPoint = args.getCanvasLocalPoint(event.clientX, event.clientY)
      interaction.currentCanvasX = canvasPoint.x
      interaction.currentCanvasY = canvasPoint.y
      args.setSelectionRect(
        getRectFromPoints(
          interaction.startCanvasX,
          interaction.startCanvasY,
          canvasPoint.x,
          canvasPoint.y,
        ),
      )
      args.updateMarqueeSelection(interaction)
      return
    }

    if (interaction.mode === 'crop-image') {
      const worldPoint = args.screenToWorld(event.clientX, event.clientY)
      interaction.currentWorldX = worldPoint.x
      interaction.currentWorldY = worldPoint.y
      args.setImageCropPreview({
        cardId: interaction.cardId,
        ...args.getCropPreviewRect(interaction),
      })
      return
    }

    if (interaction.mode === 'draw-stroke') {
      extendDrawStroke(event.clientX, event.clientY)
      return
    }

    if (interaction.mode === 'resize-card') {
      const zoom = args.getCurrentViewportState().zoom
      const deltaX = (event.clientX - interaction.startClientX) / zoom
      const deltaY = (event.clientY - interaction.startClientY) / zoom
      const activeCard = args.getCurrentBoardState().cards.find(
        (card) => card.id === interaction.cardId,
      )
      const minWidth = activeCard ? getCardMinWidth(activeCard) : NOTE_MIN_WIDTH
      const cardX = activeCard?.x ?? 0

      args.updateCard(interaction.cardId, (card) => {
        if (card.kind === 'table') {
          return {
            ...card,
            width: args.getResizedCardWidth(
              cardX,
              interaction.originCardWidth + deltaX,
              minWidth,
              Math.max(interaction.originCardWidth, 3200),
            ),
          }
        }

        if (interaction.preserveAspectRatio) {
          const aspectRatio =
            interaction.originCardWidth / Math.max(interaction.originCardHeight, 1)
          const verticalWidthDelta = deltaY * aspectRatio
          const widthDelta =
            Math.abs(deltaX) >= Math.abs(verticalWidthDelta) ? deltaX : verticalWidthDelta
          const nextWidth = args.getResizedCardWidth(
            cardX,
            interaction.originCardWidth + widthDelta,
            minWidth,
            1600,
          )

          return {
            ...card,
            width: nextWidth,
            height: Math.round(nextWidth / aspectRatio),
          }
        }

        return {
          ...card,
          width: args.getResizedCardWidth(
            cardX,
            interaction.originCardWidth + deltaX,
            minWidth,
            960,
          ),
        }
      })
      return
    }

    if (interaction.mode === 'drag-card') {
      interaction.currentClientX = event.clientX
      interaction.currentClientY = event.clientY
      const zoom = args.getCurrentViewportState().zoom
      const deltaX = (event.clientX - interaction.startClientX) / zoom
      const deltaY = (event.clientY - interaction.startClientY) / zoom

      const originMap = new Map(
        interaction.cardOrigins.map((origin) => [origin.cardId, origin]),
      )
      let nextDeltaX = deltaX
      let nextDeltaY = deltaY

      if (args.isSnapToGridRef.current) {
        const anchorOrigin = originMap.get(interaction.anchorCardId)

        if (anchorOrigin) {
          nextDeltaX = snapCoordinateToGrid(anchorOrigin.x + deltaX) - anchorOrigin.x
          nextDeltaY = snapCoordinateToGrid(anchorOrigin.y + deltaY) - anchorOrigin.y
        }
      }

      args.updateBoard((currentBoard) => ({
        ...currentBoard,
        cards: currentBoard.cards.map((card) => {
          const origin = originMap.get(card.id)
          if (!origin) {
            return card
          }

          return {
            ...card,
            x: origin.x + nextDeltaX,
            y: origin.y + nextDeltaY,
          }
        }),
      }))

      const draggedCards = args.getCurrentBoardState().cards.filter((card) =>
        interaction.cardOrigins.some((origin) => origin.cardId === card.id),
      )
      const dragIsDockable =
        draggedCards.length > 0 && draggedCards.every((draggedCard) => isColumnChildCard(draggedCard))

      args.setDragColumnTargetId(
        dragIsDockable
          ? args.getColumnDropTarget(
              interaction.currentClientX,
              interaction.currentClientY,
              interaction.cardOrigins.map((origin) => origin.cardId),
            )?.columnId ?? null
          : null,
      )
    }
  }

  const handleGlobalKeyDown = (event: KeyboardEvent) => {
    const target = event.target
    const isEditingTarget = isEditingEventTarget(target)
    const key = event.key.toLowerCase()

    if (event.key === 'Escape' && args.isSettingsOpen) {
      event.preventDefault()
      args.closeSettings()
      return
    }

    if (args.isSettingsOpen) {
      return
    }

    if (!args.isBoardViewActive) {
      return
    }

    if (event.code === 'Space' && !isEditingTarget) {
      event.preventDefault()
      args.isSpacePressedRef.current = true
      args.setIsSpacePressed(true)
      return
    }

    if (event.key === 'Escape' && args.captionEditingImageId) {
      event.preventDefault()
      args.setCaptionEditingImageId(null)
      args.focusCanvas()
      args.setStatusText('Image note hidden.')
      return
    }

    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && key === 'z') {
      event.preventDefault()
      args.undoWorkspace()
      return
    }

    if (isEditingTarget) {
      return
    }

    if (event.key === 'Escape' && args.cropArmedImageId) {
      event.preventDefault()
      args.cancelCropMode('Crop cancelled.')
      return
    }

    if (event.key === 'Escape' && args.isConnectorMode) {
      event.preventDefault()

      if (args.connectorSourceCardId) {
        args.setConnectorSourceCardId(null)
        args.setConnectorPreviewPoint(null)
        args.setStatusText('Connector start cleared.')
      } else {
        args.setIsConnectorMode(false)
        args.setStatusText('Connector mode off.')
      }
      return
    }

    if (event.key === 'Escape' && args.isDrawMode) {
      event.preventDefault()
      args.cancelActiveDrawStroke()
      args.setIsDrawMode(false)
      args.setStatusText('Draw mode off.')
      return
    }

    if (key === 'n') {
      event.preventDefault()
      args.addNote()
      return
    }

    if (key === 'h') {
      event.preventDefault()
      args.addHeading()
      return
    }

    if (key === 't') {
      event.preventDefault()
      args.addTodo()
      return
    }

    if (key === 'l') {
      event.preventDefault()
      args.addLink()
      return
    }

    if (key === 'f') {
      event.preventDefault()
      args.fitBoard()
      return
    }

    if (key === '0') {
      event.preventDefault()
      args.resetZoom()
      return
    }

    if ((event.ctrlKey || event.metaKey) && key === 'd') {
      event.preventDefault()
      args.duplicateSelectedCards()
      return
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (args.selectedStrokeIdRef.current) {
        event.preventDefault()
        args.removeStrokes([args.selectedStrokeIdRef.current])
        return
      }

      if (args.selectedConnectorIdRef.current) {
        event.preventDefault()
        args.removeConnectors([args.selectedConnectorIdRef.current])
        return
      }

      if (args.selectedCardIdsRef.current.length) {
        event.preventDefault()
        args.removeCards(args.selectedCardIdsRef.current)
      }
    }
  }

  const handleGlobalKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      args.isSpacePressedRef.current = false
      args.setIsSpacePressed(false)
    }
  }

  const handleWindowBlur = () => {
    args.isSpacePressedRef.current = false
    args.setIsSpacePressed(false)
    args.cancelCropMode()
    args.setConnectorPreviewPoint(null)
    clearInteraction()
  }

  const handleGestureStart = (event: Event) => {
    const canvas = args.canvasRef.current
    if (!canvas) {
      return
    }

    const gestureEvent = event as TrackpadGestureEvent
    const center = getCanvasClientCenter(canvas)

    event.preventDefault()
    args.interactionRef.current = null
    document.body.style.userSelect = ''
    args.gestureZoomRef.current = {
      originClientX: gestureEvent.clientX ?? center.x,
      originClientY: gestureEvent.clientY ?? center.y,
      startZoom: args.getCurrentViewportState().zoom,
    }
  }

  const handleGestureChange = (event: Event) => {
    const gestureEvent = event as TrackpadGestureEvent
    const activeGesture = args.gestureZoomRef.current

    if (!activeGesture) {
      return
    }

    event.preventDefault()
    args.zoomAroundClientPoint(
      activeGesture.startZoom * gestureEvent.scale,
      gestureEvent.clientX ?? activeGesture.originClientX,
      gestureEvent.clientY ?? activeGesture.originClientY,
      {
        recordUndo: true,
        historyGroupKey: 'gesture-zoom',
      },
    )
  }

  const handleGestureEnd = (event: Event) => {
    event.preventDefault()
    args.gestureZoomRef.current = null
  }

  const handleCanvasWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (event.ctrlKey || event.metaKey) {
      const zoomFactor = Math.exp(-event.deltaY * 0.0015)
      args.zoomAroundClientPoint(
        args.getCurrentViewportState().zoom * zoomFactor,
        event.clientX,
        event.clientY,
        {
          recordUndo: true,
          historyGroupKey: 'wheel-zoom',
        },
      )
      return
    }

    args.updateViewport(
      (currentViewport) => ({
        ...currentViewport,
        x: currentViewport.x - event.deltaX,
        y: currentViewport.y - event.deltaY,
      }),
      {
        recordUndo: true,
        historyGroupKey: 'wheel-pan',
      },
    )
  }

  const handleCanvasDoubleClick = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hasSelection =
      args.selectedCardIdsRef.current.length > 0 ||
      args.selectedStrokeIdRef.current !== null ||
      args.selectedConnectorIdRef.current !== null
    const isEditing =
      isEditingEventTarget(event.target) || isEditingEventTarget(document.activeElement)

    if (
      args.isSpacePressed ||
      args.isDrawMode ||
      args.isConnectorMode ||
      hasSelection ||
      isEditing ||
      !args.canvasDoubleClickEligibleRef.current ||
      !isEmptyCanvasDoubleClickTarget(event.target)
    ) {
      return
    }

    args.addNoteAt(args.screenToWorld(event.clientX, event.clientY))
  }

  const handleCanvasPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!args.isConnectorMode) {
      return
    }

    args.setConnectorHoverCardId(getEventTargetCardId(event.target))

    if (!args.connectorSourceCardId) {
      return
    }

    args.setConnectorPreviewPoint(args.getCanvasLocalPoint(event.clientX, event.clientY))
  }

  const handleCanvasPointerLeave = () => {
    if (!args.isConnectorMode) {
      return
    }

    args.setConnectorHoverCardId(null)
  }

  const handleCanvasPointerDownCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button === 1 || (event.button === 0 && args.isSpacePressedRef.current)) {
      args.canvasDoubleClickEligibleRef.current = false
      event.preventDefault()
      event.stopPropagation()
      args.beginPan(event.clientX, event.clientY)
    }
  }

  const handleCanvasPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || args.isSpacePressedRef.current || args.isDrawMode) {
      args.canvasDoubleClickEligibleRef.current = false
      return
    }

    if (args.isConnectorMode) {
      args.canvasDoubleClickEligibleRef.current = false

      if (!isEmptyCanvasDoubleClickTarget(event.target)) {
        return
      }

      event.preventDefault()
      args.focusCanvas()

      if (args.connectorSourceCardId) {
        args.setConnectorSourceCardId(null)
        args.setConnectorPreviewPoint(null)
        args.setStatusText('Connector start cleared.')
      } else if (args.selectedConnectorIdRef.current) {
        args.clearSelection()
        args.setStatusText('Selection cleared.')
      }
      return
    }

    const isEligibleCanvasClick =
      isEmptyCanvasDoubleClickTarget(event.target) &&
      !isEditingEventTarget(event.target) &&
      !isEditingEventTarget(document.activeElement) &&
      args.selectedCardIdsRef.current.length === 0 &&
      args.selectedStrokeIdRef.current === null &&
      args.selectedConnectorIdRef.current === null

    args.canvasDoubleClickEligibleRef.current =
      event.detail <= 1
        ? isEligibleCanvasClick
        : args.canvasDoubleClickEligibleRef.current && isEligibleCanvasClick

    if (args.cropArmedImageId) {
      args.cancelCropMode()
    }

    args.beginMarqueeSelection(event.clientX, event.clientY)
  }

  return {
    clearInteraction,
    handleCanvasDoubleClick,
    handleCanvasPointerDown,
    handleCanvasPointerDownCapture,
    handleCanvasPointerLeave,
    handleCanvasPointerMove,
    handleCanvasWheel,
    handleGestureChange,
    handleGestureEnd,
    handleGestureStart,
    handleGlobalKeyDown,
    handleGlobalKeyUp,
    handleGlobalPointerMove,
    handleWindowBlur,
  }
}

export { createWorkspaceInteractionController }
