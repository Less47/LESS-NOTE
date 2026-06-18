import {
  useCallback,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react'
import './App.css'
import './todoDrag.css'
import './cardAccent.css'
import './calendar.css'
import './heading.css'
import './sidebar.css'
import './table.css'
import './textSidebar.css'
import './themeScopes.css'
import './textInteraction.css'
import './workspaceCornerTools.css'
import './boardVisualTweaks.css'
import './contextMenu.css'
import './document.css'
import BoardTabs from './components/workspace/BoardTabs'
import DocumentPreviewModal from './components/workspace/DocumentPreviewModal'
import FileUploadWarningModal from './components/workspace/FileUploadWarningModal'
import WorkspaceBoardCard from './components/workspace/WorkspaceBoardCard'
import WorkspaceCalendarView from './components/workspace/WorkspaceCalendarView'
import CanvasConnectorLayer from './components/workspace/CanvasConnectorLayer'
import CanvasStrokeSelectionOverlay from './components/workspace/CanvasStrokeSelectionOverlay'
import CanvasViewportComponent from './components/workspace/CanvasViewport'
import DeleteBoardModal from './components/workspace/DeleteBoardModal'
import WorkspaceSidebarPanel from './components/workspace/WorkspaceSidebarPanel'
import WorkspaceToolButton from './components/workspace/WorkspaceToolButton'
import SettingsModal from './components/workspace/SettingsModal'
import WorkspaceCornerTools from './components/workspace/WorkspaceCornerTools'
import type {
  AppSettings,
  AppThemePreset,
  BoardCard,
  BoardConnector,
  BoardState,
  CanvasPoint,
  CanvasViewport,
  CardLayout,
  ColumnCard,
  ColumnChildCard,
  DocumentCard,
  DrawStroke,
  DrawTool,
  ImageCropPreview,
  InteractionState,
  MeasuredCardSize,
  NotePaletteId,
  NoteTextToolbarState,
  RichTextCard,
  SelectionRect,
  SelectionSidebarView,
  SidebarCreateToolKind,
  TodoCard,
  TableCellSelection,
  ToolbarTool,
  WorkspaceMutationOptions,
  WorkspaceSnapshot,
} from './workspace/core'
import { createAssetImportController } from './workspace/assetImportController'
import { createCardCreationController } from './workspace/cardCreationController'
import { createCardMutationController } from './workspace/cardMutationController'
import { createWorkspaceInteractionController } from './workspace/interactionController'
import { createInteractionStartController } from './workspace/interactionStartController'
import { createNoteFormattingController } from './workspace/noteFormattingController'
import { createTableCellController } from './workspace/tableCellController'
import { createWorkspaceBoardController } from './workspace/workspaceBoardController'
import { createWorkspaceCardActionsController } from './workspace/workspaceCardActionsController'
import {
  buildConnectorSelectionTools,
  buildDrawModeColorTools,
  buildDrawModePrimaryTools,
  buildDrawModeSizeTools,
  buildDrawModeUtilityTools,
  buildPrimaryTools,
  buildStrokeSelectionTools,
  buildUtilityTools,
} from './workspace/toolbarToolBuilders'
import { syncCalendarAutoMentions } from './workspace/calendarAutoSync'
import type { UnsupportedUploadWarning } from './workspace/documentFiles'
import * as WorkspaceCore from './workspace/core'

const {
  APP_SETTINGS_STORAGE_KEY,
  APP_THEME_PRESETS,
  CALENDAR_TAB_ID,
  CUSTOM_THEME_PRESET,
  DEFAULT_CARD_PALETTE,
  DEFAULT_NOTE_TEXT_TOOLBAR_STATE,
  DRAW_DARK_DEFAULT_COLOR_HEX,
  DRAW_LIGHT_DEFAULT_COLOR_HEX,
  DRAW_RED_COLOR_HEX,
  DRAW_STROKE_COLOR,
  DRAW_STROKE_SIZE,
  HISTORY_GROUP_WINDOW_MS,
  IMAGE_MIN_WIDTH,
  MAX_ZOOM,
  MIDNIGHT_THEME_PRESET,
  MIN_ZOOM,
  SNAP_TO_GRID_STORAGE_KEY,
  STORAGE_KEY,
  UNDO_HISTORY_LIMIT,
  WORKSPACE_PERSIST_DELAY_MS,
  autoResizeTextarea,
  buildAppThemeStyle,
  clamp,
  colorToHex,
  configureNoteRichTextCommands,
  createTodoItem,
  createDefaultTableCellFormat,
  drawStrokeOnCanvas,
  getActiveAppThemePreset,
  getActiveBoardTab,
  getAppThemeState,
  getBoardCardLayouts,
  getClampedSelectionRect,
  getConnectorKey,
  getDrawStrokeColor,
  getEventTargetCardId,
  getNextZIndex,
  getNotePaletteMap,
  getNotePalettes,
  getNoteTextBlockStyle,
  isCalendarEntryMeaningful,
  isEditingEventTarget,
  getSelectionInlineFormattingState,
  getSidebarCreateToolFromDataTransfer,
  getSidebarCreateToolLabel,
  getSidebarCreateToolSize,
  createTableCellSelection,
  getTableCellSelectionRange,
  getTableCellSelectionSize,
  isColumnCard,
  isColumnChildCard,
  isPaletteCard,
  isSelectionInsideEditor,
  isTableCellSelectionView,
  loadAppSettings,
  loadSnapToGridPreference,
  loadWorkspace,
  normalizeAppSettings,
  normalizeCard,
  normalizeColumnCards,
  normalizeImageCrop,
  normalizeMeasuredCardSize,
  normalizeRichNoteHtml,
  queryRichTextCommandState,
  remapWorkspaceRichTextColorsForTheme,
  resizeTableCard,
  snapCoordinateToGrid,
  TABLE_MAX_COLUMNS,
  TABLE_MAX_ROWS,
  touchBoard,
  updateActiveBoardTab,
} = WorkspaceCore

function getCalendarDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCalendarMonthKey(date = new Date()) {
  return getCalendarDateKey(date).slice(0, 7)
}

function shiftCalendarMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split('-').map((part) => Number.parseInt(part, 10))
  return getCalendarMonthKey(new Date(year, month - 1 + delta, 1))
}

function parseClipboardTableText(text: string) {
  if (!text.trim()) {
    return null
  }

  const rows = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  while (rows.length > 0 && rows.at(-1) === '') {
    rows.pop()
  }

  if (!rows.length) {
    return null
  }

  const matrix = rows.map((row) => row.split('\t'))
  return matrix.length > 1 || matrix.some((row) => row.length > 1) ? matrix : null
}

function parseClipboardTableHtml(html: string) {
  if (!html.trim() || typeof DOMParser === 'undefined') {
    return null
  }

  const document = new DOMParser().parseFromString(html, 'text/html')
  const matrix = Array.from(document.querySelectorAll('tr'))
    .map((row) =>
      Array.from(row.querySelectorAll('th, td')).map((cell) =>
        (cell.textContent ?? '').replace(/\u00a0/g, ' '),
      ),
    )
    .filter((row) => row.length > 0)

  return matrix.length > 1 || matrix.some((row) => row.length > 1) ? matrix : null
}

function getClipboardTableMatrix(clipboardData: DataTransfer) {
  return (
    parseClipboardTableText(clipboardData.getData('text/plain')) ??
    parseClipboardTableHtml(clipboardData.getData('text/html'))
  )
}

type SelectionSidebarMode = 'card' | 'text'
const BOARD_VIEWPORT_RECOVERY_VERSION = 2
const BOARD_TAB_CARD_TRANSFER_DELAY_MS = 450

type TodoItemDragState = {
  sourceCardId: string
  itemId: string
  text: string
  done: boolean
}

type TodoItemDropTarget = {
  cardId: string
  insertionIndex: number
}

type CopiedBoardSelection = {
  cards: BoardCard[]
  connectors: BoardConnector[]
  selectedCardIds: string[]
  activeCardId: string | null
  bounds: {
    left: number
    top: number
    width: number
    height: number
  }
}

type BoardContextMenuState = {
  clientX: number
  clientY: number
  worldPoint: CanvasPoint
  selectionCardIds: string[]
  activeCardId: string | null
  targetCardId: string | null
}

function areTodoItemDropTargetsEqual(
  left: TodoItemDropTarget | null,
  right: TodoItemDropTarget | null,
) {
  return (
    left?.cardId === right?.cardId &&
    left?.insertionIndex === right?.insertionIndex
  )
}

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceSnapshot>(() => loadWorkspace())
  const [appSettings, setAppSettings] = useState<AppSettings>(() => loadAppSettings())
  const [isSnapToGrid, setIsSnapToGrid] = useState(() => loadSnapToGridPreference())
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  const [selectedStrokeId, setSelectedStrokeId] = useState<string | null>(null)
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [activeTableCell, setActiveTableCell] = useState<TableCellSelection | null>(null)
  const [boardDeleteTargetId, setBoardDeleteTargetId] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDrawMode, setIsDrawMode] = useState(false)
  const [isConnectorMode, setIsConnectorMode] = useState(false)
  const [connectorSourceCardId, setConnectorSourceCardId] = useState<string | null>(null)
  const [connectorPreviewPoint, setConnectorPreviewPoint] = useState<CanvasPoint | null>(null)
  const [connectorHoverCardId, setConnectorHoverCardId] = useState<string | null>(null)
  const [drawTool, setDrawTool] = useState<DrawTool>('marker')
  const [drawColorHex, setDrawColorHex] = useState(() =>
    getAppThemeState(appSettings).usesDarkItems
      ? DRAW_DARK_DEFAULT_COLOR_HEX
      : DRAW_LIGHT_DEFAULT_COLOR_HEX,
  )
  const [drawColorPickerMode, setDrawColorPickerMode] = useState<'draw' | 'selected-stroke'>(
    'draw',
  )
  const [drawStrokeSize, setDrawStrokeSize] = useState<number>(DRAW_STROKE_SIZE)
  const [isCanvasHot, setIsCanvasHot] = useState(false)
  const [draggedCreationTool, setDraggedCreationTool] = useState<SidebarCreateToolKind | null>(
    null,
  )
  const [selectionSidebarView, setSelectionSidebarView] =
    useState<SelectionSidebarView>('default')
  const [selectionSidebarMode, setSelectionSidebarMode] =
    useState<SelectionSidebarMode>('card')
  const [calendarSidebarView, setCalendarSidebarView] = useState<'default' | 'palette'>(
    'default',
  )
  const [noteTextToolbarState, setNoteTextToolbarState] = useState<NoteTextToolbarState>(
    DEFAULT_NOTE_TEXT_TOOLBAR_STATE,
  )
  const [dragCreationPreview, setDragCreationPreview] = useState<{
    kind: SidebarCreateToolKind
    worldPoint: CanvasPoint
  } | null>(null)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [cropArmedImageId, setCropArmedImageId] = useState<string | null>(null)
  const [captionEditingImageId, setCaptionEditingImageId] = useState<string | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [dragColumnTargetId, setDragColumnTargetId] = useState<string | null>(null)
  const [activeTodoItemDrag, setActiveTodoItemDrag] = useState<TodoItemDragState | null>(
    null,
  )
  const [hasCopiedBoardSelection, setHasCopiedBoardSelection] = useState(false)
  const [boardContextMenu, setBoardContextMenu] = useState<BoardContextMenuState | null>(null)
  const [documentPreviewCardId, setDocumentPreviewCardId] = useState<string | null>(null)
  const [fileUploadWarning, setFileUploadWarning] = useState<UnsupportedUploadWarning | null>(
    null,
  )
  const [todoItemDropTarget, setTodoItemDropTarget] = useState<TodoItemDropTarget | null>(
    null,
  )
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)
  const [imageCropPreview, setImageCropPreview] = useState<ImageCropPreview | null>(null)
  const [isDrawingStroke, setIsDrawingStroke] = useState(false)
  const [, setStatusText] = useState(
    'Drag on empty space to select. Hold Space and drag, or use middle mouse drag, to pan. Use Draw to sketch above everything, and pinch or Ctrl/Cmd + scroll to zoom.',
  )

  const canvasRef = useRef<HTMLDivElement | null>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawCaptureTargetRef = useRef<HTMLElement | null>(null)
  const drawColorInputRef = useRef<HTMLInputElement | null>(null)
  const backupImportInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const documentInputRef = useRef<HTMLInputElement | null>(null)
  const toolbarDragImageRef = useRef<HTMLElement | null>(null)
  const boardContextMenuRef = useRef<HTMLDivElement | null>(null)
  const interactionRef = useRef<InteractionState | null>(null)
  const gestureZoomRef = useRef<{
    originClientX: number
    originClientY: number
    startZoom: number
  } | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const measuredCardNodesRef = useRef(new Map<string, HTMLElement>())
  const measuredCardSizesRef = useRef(new Map<string, MeasuredCardSize>())
  const cardLayoutVersionRef = useRef(0)
  const boardLayoutCacheRef = useRef<{
    cards: BoardCard[]
    measureVersion: number
    layouts: ReturnType<typeof getBoardCardLayouts>
  } | null>(null)
  const todoItemInputRefs = useRef(new Map<string, HTMLTextAreaElement>())
  const imageCaptionInputRefs = useRef(new Map<string, HTMLTextAreaElement>())
  const noteEditorRefs = useRef(new Map<string, HTMLDivElement>())
  const isSpacePressedRef = useRef(false)
  const draftStrokeRef = useRef<DrawStroke | null>(null)
  const drawPointerIdRef = useRef<number | null>(null)
  const pendingTodoFocusIdRef = useRef<string | null>(null)
  const activeNoteEditorIdRef = useRef<string | null>(null)
  const savedNoteSelectionRef = useRef<Range | null>(null)
  const activeTodoItemDragRef = useRef<TodoItemDragState | null>(null)
  const copiedBoardSelectionRef = useRef<CopiedBoardSelection | null>(null)
  const todoItemDropTargetRef = useRef<TodoItemDropTarget | null>(null)
  const undoStackRef = useRef<WorkspaceSnapshot[]>([])
  const [, setCardLayoutVersion] = useState(0)
  const workspacePersistTimeoutRef = useRef<number | null>(null)
  const boardTabCardTransferTimeoutRef = useRef<number | null>(null)
  const historyGroupRef = useRef<{
    key: string
    expiresAt: number
  } | null>(null)
  const hoveredBoardTabCardTransferIdRef = useRef<string | null>(null)
  const canvasDoubleClickEligibleRef = useRef(false)
  const recoveredBoardViewportKeysRef = useRef(new Set<string>())
  const workspaceRef = useRef(workspace)
  const selectedCardIdsRef = useRef(selectedCardIds)
  const selectedStrokeIdRef = useRef(selectedStrokeId)
  const selectedConnectorIdRef = useRef(selectedConnectorId)
  const activeCardIdRef = useRef(activeCardId)
  const isSnapToGridRef = useRef(isSnapToGrid)
  const previousUsesDarkItemsRef = useRef(getAppThemeState(appSettings).usesDarkItems)
  const appThemeState = getAppThemeState(appSettings)
  const activeWorkspaceTabId = workspace.activeTabId
  const isCalendarTabActive = activeWorkspaceTabId === CALENDAR_TAB_ID
  const calendar = workspace.calendar
  const activeBoardTab = getActiveBoardTab(workspace)
  const boardTabs = workspace.boards
  const activeBoardId = activeBoardTab.id
  const board = activeBoardTab.board
  const viewport = activeBoardTab.viewport
  const selectedCalendarDate = calendar.selectedDate
  const selectedCalendarEntry = selectedCalendarDate
    ? calendar.entries[selectedCalendarDate] ?? null
    : null
  const selectedCalendarPalette = getNotePaletteMap(appThemeState.usesDarkItems)[
    selectedCalendarEntry?.palette ?? DEFAULT_CARD_PALETTE
  ]

  const getCurrentBoardState = (currentWorkspace = workspaceRef.current) =>
    getActiveBoardTab(currentWorkspace).board
  const getCurrentViewportState = (currentWorkspace = workspaceRef.current) =>
    getActiveBoardTab(currentWorkspace).viewport

  useEffect(() => {
    return () => {
      if (boardTabCardTransferTimeoutRef.current !== null) {
        window.clearTimeout(boardTabCardTransferTimeoutRef.current)
        boardTabCardTransferTimeoutRef.current = null
      }
      copiedBoardSelectionRef.current = null
      toolbarDragImageRef.current?.remove()
      toolbarDragImageRef.current = null
    }
  }, [])

  useEffect(() => {
    workspaceRef.current = workspace
  }, [workspace])

  useEffect(() => {
    setWorkspace((current) => {
      const nextCalendar = syncCalendarAutoMentions(current.calendar, current.boards)
      if (nextCalendar === current.calendar) {
        return current
      }

      const nextWorkspace = {
        ...current,
        calendar: nextCalendar,
      }

      workspaceRef.current = nextWorkspace
      return nextWorkspace
    })
  }, [workspace.boards])

  const flushWorkspacePersistence = useEffectEvent(() => {
    if (workspacePersistTimeoutRef.current !== null) {
      window.clearTimeout(workspacePersistTimeoutRef.current)
      workspacePersistTimeoutRef.current = null
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaceRef.current))
  })

  useEffect(() => {
    isSnapToGridRef.current = isSnapToGrid
  }, [isSnapToGrid])

  useEffect(() => {
    selectedCardIdsRef.current = selectedCardIds
  }, [selectedCardIds])

  useEffect(() => {
    selectedStrokeIdRef.current = selectedStrokeId
  }, [selectedStrokeId])

  useEffect(() => {
    selectedConnectorIdRef.current = selectedConnectorId
  }, [selectedConnectorId])

  useEffect(() => {
    activeCardIdRef.current = activeCardId
  }, [activeCardId])

  useEffect(() => {
    activeTodoItemDragRef.current = activeTodoItemDrag
  }, [activeTodoItemDrag])

  useEffect(() => {
    todoItemDropTargetRef.current = todoItemDropTarget
  }, [todoItemDropTarget])

  useEffect(() => {
    if (workspacePersistTimeoutRef.current !== null) {
      window.clearTimeout(workspacePersistTimeoutRef.current)
    }

    workspacePersistTimeoutRef.current = window.setTimeout(() => {
      flushWorkspacePersistence()
    }, WORKSPACE_PERSIST_DELAY_MS)

    return () => {
      if (workspacePersistTimeoutRef.current !== null) {
        window.clearTimeout(workspacePersistTimeoutRef.current)
        workspacePersistTimeoutRef.current = null
      }
    }
  }, [workspace])

  useEffect(() => {
    const handlePageHide = () => {
      flushWorkspacePersistence()
    }

    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('beforeunload', handlePageHide)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('beforeunload', handlePageHide)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(appSettings))
  }, [appSettings])

  useEffect(() => {
    const nextPrimaryColor = appThemeState.usesDarkItems
      ? DRAW_DARK_DEFAULT_COLOR_HEX
      : DRAW_LIGHT_DEFAULT_COLOR_HEX
    const previousPrimaryColor = appThemeState.usesDarkItems
      ? DRAW_LIGHT_DEFAULT_COLOR_HEX
      : DRAW_DARK_DEFAULT_COLOR_HEX

    setDrawColorHex((current) =>
      current.toLowerCase() === previousPrimaryColor ? nextPrimaryColor : current,
    )
  }, [appThemeState.usesDarkItems])

  useEffect(() => {
    window.localStorage.setItem(SNAP_TO_GRID_STORAGE_KEY, JSON.stringify(isSnapToGrid))
  }, [isSnapToGrid])

  useEffect(() => {
    setWorkspace((current) => {
      let didChange = false
      const nextBoards = current.boards.map((boardTab) => {
        let didBoardChange = false
        const nextCards = boardTab.board.cards.map((card) => {
          const normalizedCard = normalizeCard(card)
          const frameChanged =
            normalizedCard.x !== card.x ||
            normalizedCard.y !== card.y ||
            normalizedCard.width !== card.width ||
            normalizedCard.height !== card.height

          if (!frameChanged) {
            return card
          }

          didBoardChange = true
          return normalizedCard
        })

        if (!didBoardChange) {
          return boardTab
        }

        didChange = true
        return {
          ...boardTab,
          updatedAt: new Date().toISOString(),
          board: {
            ...boardTab.board,
            cards: nextCards,
          },
        }
      })

      return didChange
        ? {
            ...current,
            boards: nextBoards,
          }
        : current
    })
  }, [])

  useEffect(() => {
    const existingIds = new Set(board.cards.map((card) => card.id))
    const filteredSelection = selectedCardIds.filter((cardId) => existingIds.has(cardId))
    const nextActiveId =
      activeCardId && existingIds.has(activeCardId)
        ? activeCardId
        : filteredSelection.at(-1) ?? null

    if (
      filteredSelection.length !== selectedCardIds.length ||
      nextActiveId !== activeCardId
    ) {
      setSelectedCardIds(filteredSelection)
      setActiveCardId(nextActiveId)
    }
  }, [board.cards, selectedCardIds, activeCardId])

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const currentBoard = getCurrentBoardState()
      const currentViewport = getCurrentViewportState()
      const currentCardsById = new Map(
        currentBoard.cards.map((card) => [card.id, card] as const),
      )
      const sizeUpdates = new Map<string, number>()
      let didMeasureChange = false

      for (const entry of entries) {
        const target = entry.target as HTMLElement
        const cardId = target.dataset.cardId
        if (!cardId) {
          continue
        }

        const card = currentCardsById.get(cardId)
        if (!card) {
          continue
        }

        const previousMeasuredSize = measuredCardSizesRef.current.get(cardId)
        const rect = target.getBoundingClientRect()
        const nextMeasuredSize = normalizeMeasuredCardSize(rect, currentViewport.zoom)
        const widthChanged =
          !previousMeasuredSize ||
          Math.abs(previousMeasuredSize.width - nextMeasuredSize.width) > 1
        const heightChanged =
          !previousMeasuredSize ||
          Math.abs(previousMeasuredSize.height - nextMeasuredSize.height) > 1

        if (widthChanged) {
          target
            .querySelectorAll<HTMLTextAreaElement>('textarea[data-autoresize="true"]')
            .forEach((textarea) => autoResizeTextarea(textarea))
        }

        if (widthChanged || heightChanged) {
          measuredCardSizesRef.current.set(cardId, nextMeasuredSize)
          if (widthChanged || card.kind === 'image' || card.kind === 'column' || card.kind === 'table') {
            didMeasureChange = true
          }
        }

        if (card.kind === 'image' || card.kind === 'column' || card.kind === 'table') {
          continue
        }

        if (Math.abs(card.height - nextMeasuredSize.height) > 1) {
          sizeUpdates.set(cardId, nextMeasuredSize.height)
        }
      }

      if (didMeasureChange) {
        cardLayoutVersionRef.current += 1
        boardLayoutCacheRef.current = null
        setCardLayoutVersion((current) => current + 1)
      }

      if (!sizeUpdates.size) {
        return
      }

      setWorkspace((current) => {
        let changed = false
        const currentBoard = getActiveBoardTab(current).board

        const nextCards = currentBoard.cards.map((card) => {
          const nextHeight = sizeUpdates.get(card.id)
          if (!nextHeight || card.kind === 'image' || card.kind === 'column' || card.kind === 'table') {
            return card
          }

          if (card.height === nextHeight) {
            return card
          }

          changed = true
          return {
            ...card,
            height: nextHeight,
          }
        })

        if (!changed) {
          return current
        }

        const nextWorkspace = updateActiveBoardTab(current, (currentBoardTab) => ({
          ...currentBoardTab,
          board: touchBoard({
            ...currentBoardTab.board,
            cards: nextCards,
          }),
        }))

        workspaceRef.current = nextWorkspace
        return nextWorkspace
      })
    })

    resizeObserverRef.current = observer
    for (const node of measuredCardNodesRef.current.values()) {
      observer.observe(node)
    }

    return () => {
      observer.disconnect()
      resizeObserverRef.current = null
    }
  }, [])

  const getCurrentBoardLayouts = (currentBoard = getCurrentBoardState()) => {
    const measureVersion = cardLayoutVersionRef.current
    const cachedLayouts = boardLayoutCacheRef.current

    if (
      cachedLayouts &&
      cachedLayouts.cards === currentBoard.cards &&
      cachedLayouts.measureVersion === measureVersion
    ) {
      return cachedLayouts.layouts
    }

    const nextLayouts = getBoardCardLayouts(currentBoard.cards, measuredCardSizesRef.current)
    boardLayoutCacheRef.current = {
      cards: currentBoard.cards,
      measureVersion,
      layouts: nextLayouts,
    }
    return nextLayouts
  }

  const boardCardLayouts = getCurrentBoardLayouts(board)
  const selectedCardIdsSet = new Set(selectedCardIds)
  const selectedBoardCards = board.cards.filter((card) => selectedCardIdsSet.has(card.id))
  const selectedStroke =
    selectedStrokeId ? board.strokes.find((stroke) => stroke.id === selectedStrokeId) ?? null : null
  const selectedConnector =
    selectedConnectorId
      ? board.connectors.find((connector) => connector.id === selectedConnectorId) ?? null
      : null
  const selectedCard =
    selectedCardIds.length === 1 && !selectedStroke && !selectedConnector
      ? board.cards.find((card) => card.id === selectedCardIds[0]) ?? null
      : null
  const selectedTextCard =
    selectedCard?.kind === 'note' || selectedCard?.kind === 'heading'
      ? selectedCard
      : null
  const selectedTableCard = selectedCard?.kind === 'table' ? selectedCard : null
  const activeSelectedTableCell =
    selectedTableCard &&
    activeTableCell?.cardId === selectedTableCard.id &&
    activeTableCell.rowIndex < selectedTableCard.rowCount &&
    activeTableCell.columnIndex < selectedTableCard.columnCount &&
    activeTableCell.anchorRowIndex < selectedTableCard.rowCount &&
    activeTableCell.anchorColumnIndex < selectedTableCard.columnCount
      ? activeTableCell
      : null
  const activeSelectedTableCellRange = activeSelectedTableCell
    ? getTableCellSelectionRange(activeSelectedTableCell)
    : null
  const activeSelectedTableCellCount = activeSelectedTableCellRange
    ? getTableCellSelectionSize(activeSelectedTableCellRange)
    : 0
  const isActiveSelectedTableCellRangeMulti = activeSelectedTableCellCount > 1
  const activeSelectedTableCellFormat =
    activeSelectedTableCell && selectedTableCard
      ? selectedTableCard.cellFormats[activeSelectedTableCell.rowIndex]?.[
          activeSelectedTableCell.columnIndex
        ] ?? createDefaultTableCellFormat(activeSelectedTableCell.rowIndex)
      : null
  const selectedTextCardId = selectedTextCard?.id ?? null
  const selectedCount =
    selectedCardIds.length + (selectedStroke ? 1 : 0) + (selectedConnector ? 1 : 0)
  const isDocumentOnlySelection =
    selectedBoardCards.length > 0 &&
    selectedBoardCards.every((card) => card.kind === 'document') &&
    selectedStroke === null &&
    selectedConnector === null
  const canDeleteBoard = boardTabs.length > 1
  const boardDeleteTarget =
    boardDeleteTargetId
      ? boardTabs.find((boardTab) => boardTab.id === boardDeleteTargetId) ?? null
      : null
  const activeBoardLabel = board.title.trim() || 'Untitled board'
  const selectedImageCropReady =
    selectedCard?.kind === 'image' &&
    selectedCardIds.length === 1 &&
    cropArmedImageId === selectedCard.id
  const previewedDocumentCard =
    !isCalendarTabActive && documentPreviewCardId
      ? (board.cards.find(
          (card): card is DocumentCard =>
            card.id === documentPreviewCardId && card.kind === 'document',
        ) ?? null)
      : null

  useEffect(() => {
    if (!selectedTableCard || activeSelectedTableCell) {
      return
    }

    if (activeTableCell !== null) {
      setActiveTableCell(null)
    }
  }, [selectedTableCard, activeSelectedTableCell, activeTableCell])

  useEffect(() => {
    if (activeSelectedTableCell || !isTableCellSelectionView(selectionSidebarView)) {
      return
    }

    setSelectionSidebarView('default')
  }, [activeSelectedTableCell, selectionSidebarView])

  useEffect(() => {
    if (!selectedTextCardId) {
      activeNoteEditorIdRef.current = null
      savedNoteSelectionRef.current = null
      setNoteTextToolbarState(DEFAULT_NOTE_TEXT_TOOLBAR_STATE)
      return
    }

    activeNoteEditorIdRef.current = selectedTextCardId
    window.requestAnimationFrame(() => {
      syncNoteTextToolbarState(selectedTextCardId)
    })
  }, [selectedTextCardId])

  const handleDocumentSelectionChange = useEffectEvent(() => {
    if (!activeNoteEditorIdRef.current) {
      return
    }

    syncNoteTextToolbarState(activeNoteEditorIdRef.current)
  })

  useEffect(() => {
    const handleSelectionChange = () => handleDocumentSelectionChange()

    document.addEventListener('selectionchange', handleSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  useEffect(() => {
    if (
      cropArmedImageId &&
      (!selectedCard || selectedCard.kind !== 'image' || selectedCard.id !== cropArmedImageId)
    ) {
      setCropArmedImageId(null)
      setImageCropPreview(null)
    }
  }, [cropArmedImageId, selectedCard])

  useEffect(() => {
    if (
      captionEditingImageId &&
      (!selectedCard || selectedCard.kind !== 'image' || selectedCard.id !== captionEditingImageId)
    ) {
      setCaptionEditingImageId(null)
    }
  }, [captionEditingImageId, selectedCard])

  useEffect(() => {
    if (!captionEditingImageId) {
      return
    }

    window.requestAnimationFrame(() => {
      const input = imageCaptionInputRefs.current.get(captionEditingImageId)
      if (!input) {
        return
      }

      input.focus()
      const cursorPosition = input.value.length
      input.setSelectionRange(cursorPosition, cursorPosition)
      autoResizeTextarea(input)
    })
  }, [captionEditingImageId])

  useEffect(() => {
    if (!documentPreviewCardId) {
      return
    }

    if (!previewedDocumentCard) {
      setDocumentPreviewCardId(null)
    }
  }, [documentPreviewCardId, previewedDocumentCard])

  useEffect(() => {
    if (!isConnectorMode) {
      setConnectorHoverCardId(null)
    }
  }, [isConnectorMode])

  useEffect(() => {
    if (selectedStrokeId && !board.strokes.some((stroke) => stroke.id === selectedStrokeId)) {
      setSelectedStrokeId(null)
    }
  }, [board.strokes, selectedStrokeId])

  useEffect(() => {
    if (
      selectedConnectorId &&
      !board.connectors.some((connector) => connector.id === selectedConnectorId)
    ) {
      setSelectedConnectorId(null)
    }
  }, [board.connectors, selectedConnectorId])

  useEffect(() => {
    if (connectorSourceCardId && !board.cards.some((card) => card.id === connectorSourceCardId)) {
      setConnectorSourceCardId(null)
      setConnectorPreviewPoint(null)
    }
  }, [board.cards, connectorSourceCardId])

  const registerMeasuredCard = (cardId: string) => (node: HTMLElement | null) => {
    const previousNode = measuredCardNodesRef.current.get(cardId)
    if (previousNode && resizeObserverRef.current) {
      resizeObserverRef.current.unobserve(previousNode)
    }

    if (!node) {
      measuredCardNodesRef.current.delete(cardId)
      return
    }

    const previousMeasuredSize = measuredCardSizesRef.current.get(cardId)
    node.dataset.cardId = cardId
    node
      .querySelectorAll<HTMLTextAreaElement>('textarea[data-autoresize="true"]')
      .forEach((textarea) => autoResizeTextarea(textarea))
    const nextMeasuredSize = normalizeMeasuredCardSize(
      node.getBoundingClientRect(),
      getCurrentViewportState().zoom,
    )
    const widthChanged =
      !previousMeasuredSize ||
      Math.abs(previousMeasuredSize.width - nextMeasuredSize.width) > 1
    const heightChanged =
      !previousMeasuredSize ||
      Math.abs(previousMeasuredSize.height - nextMeasuredSize.height) > 1

    measuredCardSizesRef.current.set(cardId, nextMeasuredSize)
    measuredCardNodesRef.current.set(cardId, node)
    resizeObserverRef.current?.observe(node)

    if (widthChanged || heightChanged) {
      boardLayoutCacheRef.current = null
      cardLayoutVersionRef.current += 1
      setCardLayoutVersion((current) => current + 1)
    }
  }

  const registerTodoItemInput = (itemId: string) => (node: HTMLTextAreaElement | null) => {
    if (!node) {
      todoItemInputRefs.current.delete(itemId)
      return
    }

    todoItemInputRefs.current.set(itemId, node)

    if (pendingTodoFocusIdRef.current === itemId) {
      pendingTodoFocusIdRef.current = null
      window.requestAnimationFrame(() => {
        const currentNode = todoItemInputRefs.current.get(itemId)
        if (!currentNode) {
          return
        }

        currentNode.focus()
        const cursorPosition = currentNode.value.length
        currentNode.setSelectionRange(cursorPosition, cursorPosition)
        autoResizeTextarea(currentNode)
      })
    }
  }

  const registerImageCaptionInput = (cardId: string) => (node: HTMLTextAreaElement | null) => {
    if (!node) {
      imageCaptionInputRefs.current.delete(cardId)
      return
    }

    imageCaptionInputRefs.current.set(cardId, node)
    autoResizeTextarea(node)
  }

  const registerNoteEditor = (cardId: string) => (node: HTMLDivElement | null) => {
    if (!node) {
      noteEditorRefs.current.delete(cardId)
      if (activeNoteEditorIdRef.current === cardId) {
        savedNoteSelectionRef.current = null
      }
      return
    }

    node.dataset.cardId = cardId
    noteEditorRefs.current.set(cardId, node)
  }

  const getHeadingTitleFromContent = (content: string) => {
    if (!content) {
      return ''
    }

    const container = document.createElement('div')
    container.innerHTML = content
    return (container.textContent?.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() ?? '').slice(
      0,
      80,
    )
  }

  const applyHeadingContentAlignment = (
    content: string,
    textAlign: WorkspaceCore.NoteTextAlign,
  ) => {
    if (!content.trim()) {
      return content
    }

    const container = document.createElement('div')
    container.innerHTML = content
    const blocks = container.querySelectorAll<HTMLElement>('p, h1, h2, h3, blockquote, pre, ul, ol')

    if (blocks.length) {
      blocks.forEach((block) => {
        block.style.textAlign = textAlign
      })
    } else if (container.firstElementChild instanceof HTMLElement) {
      container.firstElementChild.style.textAlign = textAlign
    }

    return normalizeRichNoteHtml(container.innerHTML)
  }

  const updateNoteContent = (
    cardId: string,
    nextContent: string,
    options?: WorkspaceMutationOptions,
  ) => {
    const normalizedContent = normalizeRichNoteHtml(nextContent)
    const currentCard = getCurrentBoardState().cards.find(
      (card): card is RichTextCard =>
        card.id === cardId && (card.kind === 'note' || card.kind === 'heading'),
    )

    if (!currentCard || currentCard.content === normalizedContent) {
      return
    }

    updateCard(
      cardId,
      (card) =>
        card.kind === 'note'
          ? {
              ...card,
              content: normalizedContent,
              contentMode: 'rich',
            }
          : card.kind === 'heading'
            ? {
                ...card,
                title: getHeadingTitleFromContent(normalizedContent),
                content: normalizedContent,
                contentMode: 'rich',
              }
          : card,
      options,
    )
  }

  const setActiveNoteEditor = (cardId: string) => {
    activeNoteEditorIdRef.current = cardId
    setSelectionSidebarMode('text')
    setSelectionSidebarView('default')
  }

  const syncNoteTextToolbarState = (cardId?: string | null) => {
    const targetCardId = cardId ?? activeNoteEditorIdRef.current
    if (!targetCardId) {
      setNoteTextToolbarState(DEFAULT_NOTE_TEXT_TOOLBAR_STATE)
      return
    }

    const editor = noteEditorRefs.current.get(targetCardId) ?? null
    const selection =
      typeof window !== 'undefined' && typeof window.getSelection === 'function'
        ? window.getSelection()
        : null

    if (!editor) {
      setNoteTextToolbarState(DEFAULT_NOTE_TEXT_TOOLBAR_STATE)
      return
    }

    if (isSelectionInsideEditor(selection, editor) && selection && selection.rangeCount > 0) {
      savedNoteSelectionRef.current = selection.getRangeAt(0).cloneRange()
    }

    const inlineFormattingState = getSelectionInlineFormattingState(editor, selection)

    setNoteTextToolbarState({
      blockStyle: getNoteTextBlockStyle(editor, selection),
      isBold: inlineFormattingState.isBold,
      isItalic: inlineFormattingState.isItalic,
      isUnderline: inlineFormattingState.isUnderline,
      isStrikeThrough: inlineFormattingState.isStrikeThrough,
      isBulletList: queryRichTextCommandState('insertUnorderedList'),
      isNumberedList: queryRichTextCommandState('insertOrderedList'),
      textColor: inlineFormattingState.textColor,
      defaultTextColor: inlineFormattingState.defaultTextColor,
    })
  }

  const remapRichTextColorsForThemeChange = useEffectEvent((nextUsesDarkItems: boolean) => {
    setWorkspace((current) => remapWorkspaceRichTextColorsForTheme(current, nextUsesDarkItems))

    window.requestAnimationFrame(() => {
      syncNoteTextToolbarState(activeNoteEditorIdRef.current)
    })
  })

  useEffect(() => {
    const previousUsesDarkItems = previousUsesDarkItemsRef.current
    if (previousUsesDarkItems === appThemeState.usesDarkItems) {
      return
    }

    previousUsesDarkItemsRef.current = appThemeState.usesDarkItems
    remapRichTextColorsForThemeChange(appThemeState.usesDarkItems)
  }, [appThemeState.usesDarkItems])

  const restoreNoteEditorSelection = (cardId: string) => {
    const editor = noteEditorRefs.current.get(cardId)
    if (!editor) {
      return null
    }

    configureNoteRichTextCommands()
    editor.focus()

    const selection =
      typeof window !== 'undefined' && typeof window.getSelection === 'function'
        ? window.getSelection()
        : null

    if (!selection) {
      return editor
    }

    if (isSelectionInsideEditor(selection, editor) && selection.rangeCount > 0) {
      savedNoteSelectionRef.current = selection.getRangeAt(0).cloneRange()
      return editor
    }

    selection.removeAllRanges()

    if (
      savedNoteSelectionRef.current &&
      editor.contains(savedNoteSelectionRef.current.commonAncestorContainer)
    ) {
      selection.addRange(savedNoteSelectionRef.current)
      return editor
    }

    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    selection.addRange(range)
    savedNoteSelectionRef.current = range.cloneRange()

    return editor
  }

  const resolveTargetNoteCardId = () =>
    activeNoteEditorIdRef.current ??
    (activeCardIdRef.current && selectedCardIdsRef.current.includes(activeCardIdRef.current)
      ? activeCardIdRef.current
      : null)

  const { applySelectedNoteCommand, applySelectedNoteBlockStyle, applySelectedNoteTextColor } =
    createNoteFormattingController({
      noteTextToolbarState,
      savedSelectionRef: savedNoteSelectionRef,
      resolveTargetCardId: resolveTargetNoteCardId,
      restoreNoteEditorSelection,
      updateNoteContent,
      syncNoteTextToolbarState,
      setStatusText,
    })

  const setSelection = (cardIds: string[], activeId?: string | null) => {
    const uniqueIds = [...new Set(cardIds)]
    const nextActiveId = activeId ?? uniqueIds.at(-1) ?? null
    setSelectionSidebarMode('card')
    selectedCardIdsRef.current = uniqueIds
    activeCardIdRef.current = nextActiveId
    selectedStrokeIdRef.current = null
    selectedConnectorIdRef.current = null
    setSelectedCardIds(uniqueIds)
    setActiveCardId(nextActiveId)
    setSelectedStrokeId(null)
    setSelectedConnectorId(null)
  }

  const clearSelection = () => {
    setSelectionSidebarMode('card')
    selectedCardIdsRef.current = []
    activeCardIdRef.current = null
    selectedStrokeIdRef.current = null
    selectedConnectorIdRef.current = null
    setSelectedCardIds([])
    setActiveCardId(null)
    setActiveTableCell(null)
    setSelectedStrokeId(null)
    setSelectedConnectorId(null)
  }

  const selectStroke = (strokeId: string) => {
    focusCanvas()
    cancelCropMode()
    setSelectedCardIds([])
    setActiveCardId(null)
    setActiveTableCell(null)
    setSelectedStrokeId(strokeId)
    setSelectedConnectorId(null)
    setStatusText('Stroke selected. Press Delete or Backspace to remove it.')
  }

  const selectConnector = (connectorId: string) => {
    focusCanvas()
    cancelCropMode()
    setSelectedCardIds([])
    setActiveCardId(null)
    setActiveTableCell(null)
    setSelectedStrokeId(null)
    setSelectedConnectorId(connectorId)
    setStatusText('Connector selected. Press Delete or Backspace to remove it.')
  }

  const bringCardsToFront = (cardIds: string[]) => {
    if (!cardIds.length) {
      return
    }

    const selectedIds = new Set(cardIds)
    updateBoard((currentBoard) => {
      const chosenCards = currentBoard.cards
        .filter((card) => selectedIds.has(card.id))
        .sort((left, right) => left.zIndex - right.zIndex)

      if (!chosenCards.length) {
        return currentBoard
      }

      const highestRemainingZ = currentBoard.cards.reduce((highest, card) => {
        if (selectedIds.has(card.id)) {
          return highest
        }

        return Math.max(highest, card.zIndex)
      }, 0)

      const zIndexMap = new Map(
        chosenCards.map((card, index) => [card.id, highestRemainingZ + index + 1]),
      )

      return {
        ...currentBoard,
        cards: currentBoard.cards.map((card) =>
          zIndexMap.has(card.id)
            ? { ...card, zIndex: zIndexMap.get(card.id) ?? card.zIndex }
            : card,
        ),
      }
    })
  }

  const updateBoard = (
    recipe: (currentBoard: BoardState) => BoardState,
    options?: WorkspaceMutationOptions,
  ) => {
    rememberWorkspaceForUndo(options)
    setWorkspace((current) => {
      const nextWorkspace = updateActiveBoardTab(current, (currentBoardTab) => ({
        ...currentBoardTab,
        board: touchBoard(recipe(currentBoardTab.board)),
      }))

      workspaceRef.current = nextWorkspace
      return nextWorkspace
    })
  }

  const updateViewport = (
    recipe: (currentViewport: CanvasViewport) => CanvasViewport,
    options?: WorkspaceMutationOptions,
  ) => {
    rememberWorkspaceForUndo(options)
    setWorkspace((current) => {
      const nextWorkspace = updateActiveBoardTab(current, (currentBoardTab) => ({
        ...currentBoardTab,
        viewport: recipe(currentBoardTab.viewport),
      }))

      workspaceRef.current = nextWorkspace
      return nextWorkspace
    })
  }

  const updateCalendar = (
    recipe: (currentCalendar: WorkspaceCore.CalendarState) => WorkspaceCore.CalendarState,
    options?: WorkspaceMutationOptions,
  ) => {
    rememberWorkspaceForUndo(options)
    setWorkspace((current) => {
      const nextWorkspace = {
        ...current,
        calendar: recipe(current.calendar),
      }

      workspaceRef.current = nextWorkspace
      return nextWorkspace
    })
  }

  const screenToWorld = (
    clientX: number,
    clientY: number,
    currentViewport = getCurrentViewportState(),
  ): CanvasPoint => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) {
      return { x: 0, y: 0 }
    }

    return {
      x: (clientX - rect.left - currentViewport.x) / currentViewport.zoom,
      y: (clientY - rect.top - currentViewport.y) / currentViewport.zoom,
    }
  }

  const getCanvasLocalPoint = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) {
      return { x: 0, y: 0 }
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const getLayoutCanvasRect = (
    layout: Pick<CardLayout, 'x' | 'y' | 'width' | 'height'>,
    currentViewport = getCurrentViewportState(),
  ) => ({
    x: currentViewport.x + layout.x * currentViewport.zoom,
    y: currentViewport.y + layout.y * currentViewport.zoom,
    width: layout.width * currentViewport.zoom,
    height: layout.height * currentViewport.zoom,
  })

  const getCardCanvasRect = (cardId: string) => {
    const canvas = canvasRef.current
    const node = measuredCardNodesRef.current.get(cardId)
    if (!canvas || !node) {
      return null
    }

    const canvasRect = canvas.getBoundingClientRect()
    const nodeRect = node.getBoundingClientRect()

    return {
      x: nodeRect.left - canvasRect.left,
      y: nodeRect.top - canvasRect.top,
      width: nodeRect.width,
      height: nodeRect.height,
    }
  }

  const dismissCanvasEditing = () => {
    const activeElement = document.activeElement
    if (activeElement instanceof HTMLElement && canvasRef.current?.contains(activeElement)) {
      activeElement.blur()
    }

    if (typeof window !== 'undefined' && typeof window.getSelection === 'function') {
      window.getSelection()?.removeAllRanges()
    }

    activeNoteEditorIdRef.current = null
    savedNoteSelectionRef.current = null
  }

  const getViewportCenterInWorld = (): CanvasPoint => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) {
      return { x: 220, y: 180 }
    }

    return screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2)
  }

  const getPlacementPosition = (x: number, y: number) => {
    if (!isSnapToGridRef.current) {
      return { x, y }
    }

    return {
      x: snapCoordinateToGrid(x),
      y: snapCoordinateToGrid(y),
    }
  }

  const getCenteredCardPosition = (point: CanvasPoint, width: number, height: number) =>
    getPlacementPosition(point.x - width / 2, point.y - height / 2)

  const getResizedCardWidth = (
    cardX: number,
    rawWidth: number,
    minWidth: number,
    maxWidth: number,
  ) => {
    const clampedWidth = clamp(rawWidth, minWidth, maxWidth)
    if (!isSnapToGridRef.current) {
      return clampedWidth
    }

    const snappedRightEdge = clamp(
      snapCoordinateToGrid(cardX + clampedWidth),
      cardX + minWidth,
      cardX + maxWidth,
    )

    return clamp(snappedRightEdge - cardX, minWidth, maxWidth)
  }

  const getCardLayout = (cardId: string, currentBoard = getCurrentBoardState()) =>
    getCurrentBoardLayouts(currentBoard).layouts.get(cardId) ?? null

  const closeBoardContextMenu = () => {
    setBoardContextMenu(null)
  }

  const buildCopiedBoardSelection = (
    selectionIds: string[],
    activeId: string | null,
  ): CopiedBoardSelection | null => {
    const uniqueSelectionIds = [...new Set(selectionIds)]
    if (!uniqueSelectionIds.length) {
      return null
    }

    const selectedIdSet = new Set(uniqueSelectionIds)
    const currentBoard = getCurrentBoardState()
    const currentLayouts = getCurrentBoardLayouts(currentBoard)
    const selectedColumnIds = new Set(
      currentBoard.cards
        .filter((card) => selectedIdSet.has(card.id) && isColumnCard(card))
        .map((card) => card.id),
    )
    const sourceCards = currentBoard.cards
      .filter((card) => {
        if (selectedIdSet.has(card.id)) {
          return true
        }

        return isColumnChildCard(card) && !!card.columnId && selectedColumnIds.has(card.columnId)
      })
      .sort((left, right) => left.zIndex - right.zIndex)

    if (!sourceCards.length) {
      return null
    }

    const includedColumnIds = new Set(
      sourceCards
        .filter((card): card is ColumnCard => isColumnCard(card))
        .map((card) => card.id),
    )
    const snapshotCards = sourceCards.map<BoardCard>((card) => {
      const layout = currentLayouts.layouts.get(card.id)
      const nextX = layout?.x ?? card.x
      const nextY = layout?.y ?? card.y
      const nextWidth = layout?.width ?? card.width
      const nextHeight = layout?.height ?? card.height

      if (isColumnCard(card)) {
        return {
          ...card,
          x: nextX,
          y: nextY,
          width: nextWidth,
          height: nextHeight,
        }
      }

      const keepColumnAttachment = !!card.columnId && includedColumnIds.has(card.columnId)

      return {
        ...card,
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight,
        columnId: keepColumnAttachment ? card.columnId : null,
        columnIndex: keepColumnAttachment ? card.columnIndex : 0,
      }
    })
    const snapshotCardIdSet = new Set(snapshotCards.map((card) => card.id))
    let left = snapshotCards[0].x
    let top = snapshotCards[0].y
    let right = snapshotCards[0].x + snapshotCards[0].width
    let bottom = snapshotCards[0].y + snapshotCards[0].height

    for (const card of snapshotCards) {
      left = Math.min(left, card.x)
      top = Math.min(top, card.y)
      right = Math.max(right, card.x + card.width)
      bottom = Math.max(bottom, card.y + card.height)
    }

    return {
      cards: snapshotCards,
      connectors: currentBoard.connectors.filter(
        (connector) =>
          snapshotCardIdSet.has(connector.fromCardId) && snapshotCardIdSet.has(connector.toCardId),
      ),
      selectedCardIds: uniqueSelectionIds.filter((cardId) => snapshotCardIdSet.has(cardId)),
      activeCardId:
        activeId && selectedIdSet.has(activeId) ? activeId : uniqueSelectionIds.at(-1) ?? null,
      bounds: {
        left,
        top,
        width: right - left,
        height: bottom - top,
      },
    }
  }

  const copyCardsToClipboard = (selectionIds: string[], activeId: string | null) => {
    const copiedSelection = buildCopiedBoardSelection(selectionIds, activeId)
    if (!copiedSelection) {
      setStatusText('Select a card to copy first.')
      return
    }

    copiedBoardSelectionRef.current = copiedSelection
    setHasCopiedBoardSelection(true)
    closeBoardContextMenu()
    setStatusText(
      copiedSelection.selectedCardIds.length === 1
        ? 'Card copied.'
        : `${copiedSelection.selectedCardIds.length} cards copied.`,
    )
  }

  const pasteCopiedCardsToBoard = (worldPoint = getViewportCenterInWorld()) => {
    const copiedSelection = copiedBoardSelectionRef.current
    if (!copiedSelection) {
      setStatusText('Copy a card first.')
      return
    }

    const currentBoard = getCurrentBoardState()
    const sourceCards = [...copiedSelection.cards].sort((left, right) => left.zIndex - right.zIndex)
    const pastedCardIdMap = new Map(
      sourceCards.map((card) => [card.id, crypto.randomUUID()] as const),
    )
    const selectedSourceIdSet = new Set(copiedSelection.selectedCardIds)
    const selectedPastedIds: string[] = []
    const pasteOrigin = getPlacementPosition(
      worldPoint.x - copiedSelection.bounds.width / 2,
      worldPoint.y - copiedSelection.bounds.height / 2,
    )
    let nextZIndex = getNextZIndex(currentBoard.cards)

    const pastedCards = sourceCards.map<BoardCard>((card) => {
      const nextId = pastedCardIdMap.get(card.id) ?? crypto.randomUUID()
      const nextX = pasteOrigin.x + (card.x - copiedSelection.bounds.left)
      const nextY = pasteOrigin.y + (card.y - copiedSelection.bounds.top)

      if (selectedSourceIdSet.has(card.id)) {
        selectedPastedIds.push(nextId)
      }

      if (isColumnCard(card)) {
        return {
          ...card,
          id: nextId,
          x: nextX,
          y: nextY,
          zIndex: nextZIndex++,
        }
      }

      return {
        ...card,
        id: nextId,
        x: nextX,
        y: nextY,
        columnId: card.columnId ? pastedCardIdMap.get(card.columnId) ?? null : null,
        zIndex: nextZIndex++,
      }
    })

    const pastedConnectors = copiedSelection.connectors.flatMap<BoardConnector>((connector) => {
      const nextFromCardId = pastedCardIdMap.get(connector.fromCardId)
      const nextToCardId = pastedCardIdMap.get(connector.toCardId)

      if (!nextFromCardId || !nextToCardId) {
        return []
      }

      return [
        {
          id: crypto.randomUUID(),
          fromCardId: nextFromCardId,
          toCardId: nextToCardId,
        },
      ]
    })

    updateBoard(
      (nextBoard) => ({
        ...nextBoard,
        cards: normalizeColumnCards([...nextBoard.cards, ...pastedCards]),
        connectors: [...nextBoard.connectors, ...pastedConnectors],
      }),
      {
        recordUndo: true,
      },
    )

    setSelection(
      selectedPastedIds,
      copiedSelection.activeCardId
        ? pastedCardIdMap.get(copiedSelection.activeCardId) ?? selectedPastedIds.at(-1) ?? null
        : selectedPastedIds.at(-1) ?? null,
    )
    focusCanvas()
    closeBoardContextMenu()
    setStatusText(
      selectedPastedIds.length === 1
        ? 'Card pasted.'
        : `${selectedPastedIds.length} cards pasted.`,
    )
  }

  const handleWindowPaste = useEffectEvent((event: ClipboardEvent) => {
    if (
      isSettingsOpen ||
      isCalendarTabActive ||
      !selectedTableCard ||
      !activeSelectedTableCell ||
      !event.clipboardData
    ) {
      return
    }

    const tableMatrix = getClipboardTableMatrix(event.clipboardData)
    if (!tableMatrix) {
      return
    }

    const eventCardId = getEventTargetCardId(event.target)
    const activeElement = document.activeElement
    const activeElementCardId = getEventTargetCardId(activeElement)
    const isPasteTargetInsideSelectedTable =
      eventCardId === selectedTableCard.id || activeElementCardId === selectedTableCard.id
    const isEditingTarget =
      isEditingEventTarget(event.target) || isEditingEventTarget(activeElement)

    if (isEditingTarget && !isPasteTargetInsideSelectedTable) {
      return
    }

    const targetRange = activeSelectedTableCellRange ?? getTableCellSelectionRange(activeSelectedTableCell)
    const startRowIndex = targetRange.startRowIndex
    const startColumnIndex = targetRange.startColumnIndex
    const sourceRowCount = tableMatrix.length
    const sourceColumnCount = tableMatrix.reduce(
      (highest, row) => Math.max(highest, row.length),
      0,
    )

    if (sourceRowCount === 0 || sourceColumnCount === 0) {
      return
    }

    event.preventDefault()

    const nextRowCount = Math.min(
      TABLE_MAX_ROWS,
      Math.max(selectedTableCard.rowCount, startRowIndex + sourceRowCount),
    )
    const nextColumnCount = Math.min(
      TABLE_MAX_COLUMNS,
      Math.max(selectedTableCard.columnCount, startColumnIndex + sourceColumnCount),
    )
    const appliedRowCount = Math.min(sourceRowCount, nextRowCount - startRowIndex)
    const appliedColumnCount = Math.max(
      0,
      tableMatrix.reduce(
        (highest, row) =>
          Math.max(highest, Math.min(row.length, nextColumnCount - startColumnIndex)),
        0,
      ),
    )

    if (appliedRowCount <= 0 || appliedColumnCount <= 0) {
      setStatusText('There was no room to paste those cells.')
      return
    }

    updateTableCard(
      selectedTableCard.id,
      (card) => {
        const resizedCard =
          nextRowCount !== card.rowCount || nextColumnCount !== card.columnCount
            ? resizeTableCard(card, nextRowCount, nextColumnCount)
            : card
        const nextCells = resizedCard.cells.map((row) => [...row])

        for (let rowOffset = 0; rowOffset < appliedRowCount; rowOffset += 1) {
          const sourceRow = tableMatrix[rowOffset] ?? []
          const rowPasteWidth = Math.min(sourceRow.length, nextColumnCount - startColumnIndex)

          for (let columnOffset = 0; columnOffset < rowPasteWidth; columnOffset += 1) {
            nextCells[startRowIndex + rowOffset][startColumnIndex + columnOffset] =
              sourceRow[columnOffset] ?? ''
          }
        }

        return {
          ...resizedCard,
          cells: nextCells,
        }
      },
      {
        recordUndo: true,
        historyGroupKey: `table-paste:${selectedTableCard.id}`,
      },
    )

    setActiveTableCell(
      createTableCellSelection(
        selectedTableCard.id,
        startRowIndex + appliedRowCount - 1,
        startColumnIndex + appliedColumnCount - 1,
        startRowIndex,
        startColumnIndex,
      ),
    )

    const wasClipped =
      appliedRowCount < sourceRowCount || appliedColumnCount < sourceColumnCount
    let statusText =
      appliedRowCount === 1 && appliedColumnCount === 1
        ? 'Cell pasted.'
        : `Pasted ${appliedRowCount} row${appliedRowCount === 1 ? '' : 's'} by ${appliedColumnCount} column${appliedColumnCount === 1 ? '' : 's'}.`

    if (wasClipped) {
      statusText += ' Some cells were clipped to the table limit.'
    }

    setStatusText(statusText)
  })

  const prepareCardsForDrag = (cardIds: string[]) => {
    const draggedCardIds = new Set(cardIds)
    const currentBoard = getCurrentBoardState()
    const currentLayouts = getCurrentBoardLayouts(currentBoard)
    const chosenCards = currentBoard.cards
      .filter((card) => draggedCardIds.has(card.id))
      .sort((left, right) => left.zIndex - right.zIndex)

    if (!chosenCards.length) {
      return currentBoard
    }

    const highestRemainingZ = currentBoard.cards.reduce((highest, card) => {
      if (draggedCardIds.has(card.id)) {
        return highest
      }

      return Math.max(highest, card.zIndex)
    }, 0)

    const zIndexMap = new Map(
      chosenCards.map((card, index) => [card.id, highestRemainingZ + index + 1]),
    )

    const nextBoard = touchBoard({
      ...currentBoard,
      cards: normalizeColumnCards(
        currentBoard.cards.map((card) => {
          if (!draggedCardIds.has(card.id)) {
            return card
          }

          const layout = currentLayouts.layouts.get(card.id)
          const detachedCard =
            isColumnChildCard(card) && card.columnId
              ? {
                  ...card,
                  x: layout?.x ?? card.x,
                  y: layout?.y ?? card.y,
                  width: layout?.width ?? card.width,
                  height: layout?.height ?? card.height,
                  columnId: null,
                  columnIndex: 0,
                }
              : card

          return {
            ...detachedCard,
            zIndex: zIndexMap.get(card.id) ?? detachedCard.zIndex,
          }
        }),
      ),
    })

    const nextWorkspace = updateActiveBoardTab(workspaceRef.current, (currentBoardTab) => ({
      ...currentBoardTab,
      board: nextBoard,
    }))

    workspaceRef.current = nextWorkspace
    setWorkspace(nextWorkspace)
    return nextBoard
  }

  const getColumnDropTarget = (
    clientX: number,
    clientY: number,
    draggedCardIds: string[],
    currentBoard = getCurrentBoardState(),
  ) => {
    const currentLayouts = getCurrentBoardLayouts(currentBoard)
    const pointerTarget = getColumnDropTargetAtPoint(
      screenToWorld(clientX, clientY),
      draggedCardIds,
      currentBoard,
      currentLayouts,
    )

    if (pointerTarget || !draggedCardIds.length) {
      return pointerTarget
    }

    const draggedIdSet = new Set(draggedCardIds)
    const columns = currentBoard.cards
      .filter(isColumnCard)
      .sort((left, right) => right.zIndex - left.zIndex)

    let bestOverlapMatch:
      | {
          columnId: string
          referenceY: number
          overlapArea: number
        }
      | null = null

    for (const column of columns) {
      if (draggedIdSet.has(column.id)) {
        continue
      }

      const columnLayout = currentLayouts.layouts.get(column.id)
      if (!columnLayout) {
        continue
      }

      for (const draggedCardId of draggedCardIds) {
        const draggedLayout = currentLayouts.layouts.get(draggedCardId)
        if (!draggedLayout) {
          continue
        }

        const overlapWidth =
          Math.min(draggedLayout.x + draggedLayout.width, columnLayout.x + columnLayout.width) -
          Math.max(draggedLayout.x, columnLayout.x)
        const overlapHeight =
          Math.min(draggedLayout.y + draggedLayout.height, columnLayout.y + columnLayout.height) -
          Math.max(draggedLayout.y, columnLayout.y)

        if (overlapWidth <= 0 || overlapHeight <= 0) {
          continue
        }

        const overlapArea = overlapWidth * overlapHeight
        if (bestOverlapMatch && overlapArea <= bestOverlapMatch.overlapArea) {
          continue
        }

        bestOverlapMatch = {
          columnId: column.id,
          referenceY: clamp(
            draggedLayout.y + draggedLayout.height / 2,
            columnLayout.y,
            columnLayout.y + columnLayout.height,
          ),
          overlapArea,
        }
      }
    }

    if (!bestOverlapMatch) {
      return null
    }

    const columnChildren = (currentLayouts.columnChildren.get(bestOverlapMatch.columnId) ?? []).filter(
      (child) => !draggedIdSet.has(child.id),
    )

    let insertionIndex = columnChildren.length
    for (let index = 0; index < columnChildren.length; index += 1) {
      const childLayout = currentLayouts.layouts.get(columnChildren[index].id)
      if (childLayout && bestOverlapMatch.referenceY < childLayout.y + childLayout.height / 2) {
        insertionIndex = index
        break
      }
    }

    return {
      columnId: bestOverlapMatch.columnId,
      insertionIndex,
    }
  }

  const getStrokeWorldBounds = (stroke: DrawStroke) => {
    if (!stroke.points.length) {
      return null
    }

    let left = stroke.points[0].x
    let right = stroke.points[0].x
    let top = stroke.points[0].y
    let bottom = stroke.points[0].y

    for (const point of stroke.points) {
      left = Math.min(left, point.x)
      right = Math.max(right, point.x)
      top = Math.min(top, point.y)
      bottom = Math.max(bottom, point.y)
    }

    const padding = Math.max(stroke.size / 2, 1)

    return {
      left: left - padding,
      top: top - padding,
      right: right + padding,
      bottom: bottom + padding,
    }
  }

  const getColumnDropTargetAtPoint = (
    worldPoint: CanvasPoint,
    draggedCardIds: string[] = [],
    currentBoard = getCurrentBoardState(),
    currentLayouts = getCurrentBoardLayouts(currentBoard),
  ) => {
    const draggedIdSet = new Set(draggedCardIds)

    return currentBoard.cards
      .filter(isColumnCard)
      .sort((left, right) => right.zIndex - left.zIndex)
      .reduce<{ columnId: string; insertionIndex: number } | null>((match, column) => {
        if (match || draggedIdSet.has(column.id)) {
          return match
        }

        const layout = currentLayouts.layouts.get(column.id)
        if (
          !layout ||
          worldPoint.x < layout.x ||
          worldPoint.x > layout.x + layout.width ||
          worldPoint.y < layout.y ||
          worldPoint.y > layout.y + layout.height
        ) {
          return match
        }

        const columnChildren = (currentLayouts.columnChildren.get(column.id) ?? []).filter(
          (child) => !draggedIdSet.has(child.id),
        )

        let insertionIndex = columnChildren.length
        for (let index = 0; index < columnChildren.length; index += 1) {
          const childLayout = currentLayouts.layouts.get(columnChildren[index].id)
          if (childLayout && worldPoint.y < childLayout.y + childLayout.height / 2) {
            insertionIndex = index
            break
          }
        }

        return {
          columnId: column.id,
          insertionIndex,
        }
      }, null)
  }

  const dockCardsIntoColumn = (
    draggedCardIds: string[],
    columnId: string,
    insertionIndex: number,
  ) => {
    const draggedIdSet = new Set(draggedCardIds)

    updateBoard((currentBoard) => {
      const targetColumn = currentBoard.cards.find(
        (card): card is ColumnCard => card.id === columnId && isColumnCard(card),
      )

      if (!targetColumn) {
        return currentBoard
      }

      const nonDraggedColumnChildren = new Map<string, ColumnChildCard[]>()

      for (const card of currentBoard.cards) {
        if (!isColumnChildCard(card) || draggedIdSet.has(card.id) || !card.columnId) {
          continue
        }

        const columnChildren = nonDraggedColumnChildren.get(card.columnId) ?? []
        columnChildren.push(card)
        nonDraggedColumnChildren.set(card.columnId, columnChildren)
      }

      for (const children of nonDraggedColumnChildren.values()) {
        children.sort((left, right) => {
          if (left.columnIndex !== right.columnIndex) {
            return left.columnIndex - right.columnIndex
          }

          return left.zIndex - right.zIndex
        })
      }

      const draggedCards = currentBoard.cards.filter(
        (card): card is ColumnChildCard =>
          draggedIdSet.has(card.id) && isColumnChildCard(card),
      )

      if (!draggedCards.length) {
        return currentBoard
      }

      const nextTargetChildren = [...(nonDraggedColumnChildren.get(columnId) ?? [])]
      nextTargetChildren.splice(insertionIndex, 0, ...draggedCards)
      nonDraggedColumnChildren.set(columnId, nextTargetChildren)

      const nextColumnIndexes = new Map<string, number>()
      for (const children of nonDraggedColumnChildren.values()) {
        children.forEach((child, index) => {
          nextColumnIndexes.set(child.id, index)
        })
      }

      const nextCards = currentBoard.cards.map((card) => {
        if (!isColumnChildCard(card)) {
          return card
        }

        if (!draggedIdSet.has(card.id)) {
          if (!card.columnId) {
            return card
          }

          return {
            ...card,
            columnIndex: nextColumnIndexes.get(card.id) ?? card.columnIndex,
          }
        }

        return {
          ...card,
          columnId,
          columnIndex: nextColumnIndexes.get(card.id) ?? insertionIndex,
        }
      })

      return {
        ...currentBoard,
        cards: normalizeColumnCards(nextCards),
      }
    })
  }

  const focusCanvas = () => {
    canvasRef.current?.focus({ preventScroll: true })
  }

  const clearBoardTabCardTransferHover = () => {
    if (boardTabCardTransferTimeoutRef.current !== null) {
      window.clearTimeout(boardTabCardTransferTimeoutRef.current)
      boardTabCardTransferTimeoutRef.current = null
    }

    hoveredBoardTabCardTransferIdRef.current = null
  }

  const getHoveredBoardTabIdAtClientPoint = (clientX: number, clientY: number) => {
    const hoveredElement = document.elementFromPoint(clientX, clientY)
    if (!(hoveredElement instanceof HTMLElement)) {
      return null
    }

    return hoveredElement.closest<HTMLElement>('[data-board-tab-id]')?.dataset.boardTabId ?? null
  }

  const transferDraggedCardsToBoard = useEffectEvent((targetBoardId: string) => {
    const interaction = interactionRef.current
    if (!interaction || interaction.mode !== 'drag-card') {
      return
    }

    const currentWorkspace = workspaceRef.current
    const sourceBoardId = currentWorkspace.activeBoardId
    if (targetBoardId === sourceBoardId) {
      return
    }

    const sourceBoardTab = currentWorkspace.boards.find((boardTab) => boardTab.id === sourceBoardId)
    const targetBoardTab = currentWorkspace.boards.find((boardTab) => boardTab.id === targetBoardId)
    if (!sourceBoardTab || !targetBoardTab) {
      return
    }

    const draggedCardIds = interaction.cardOrigins.map((origin) => origin.cardId)
    if (!draggedCardIds.length) {
      return
    }

    const draggedCardIdSet = new Set(draggedCardIds)
    const sourceBoard = sourceBoardTab.board
    const sourceCardsById = new Map(sourceBoard.cards.map((card) => [card.id, card] as const))
    const draggedCards = draggedCardIds.flatMap((cardId) => {
      const card = sourceCardsById.get(cardId)
      return card ? [card] : []
    })

    if (!draggedCards.length) {
      return
    }

    const anchorCard = sourceCardsById.get(interaction.anchorCardId) ?? draggedCards[0]
    if (!anchorCard) {
      return
    }

    const sourcePointerWorld = screenToWorld(
      interaction.currentClientX,
      interaction.currentClientY,
      sourceBoardTab.viewport,
    )
    const targetPointerWorld = screenToWorld(
      interaction.currentClientX,
      interaction.currentClientY,
      targetBoardTab.viewport,
    )
    const anchorPointerOffsetX = sourcePointerWorld.x - anchorCard.x
    const anchorPointerOffsetY = sourcePointerWorld.y - anchorCard.y
    const anchorDestination = getPlacementPosition(
      targetPointerWorld.x - anchorPointerOffsetX,
      targetPointerWorld.y - anchorPointerOffsetY,
    )
    const destinationHighestZ = targetBoardTab.board.cards.reduce(
      (highest, card) => Math.max(highest, card.zIndex),
      0,
    )
    const draggedCardsByZIndex = [...draggedCards].sort((left, right) => left.zIndex - right.zIndex)
    const destinationZIndexMap = new Map(
      draggedCardsByZIndex.map((card, index) => [card.id, destinationHighestZ + index + 1]),
    )
    const movedCards = draggedCards.map((card) => ({
      ...card,
      x: anchorDestination.x + (card.x - anchorCard.x),
      y: anchorDestination.y + (card.y - anchorCard.y),
      zIndex: destinationZIndexMap.get(card.id) ?? card.zIndex,
    }))
    const sourceLayouts = getCurrentBoardLayouts(sourceBoard)
    const movedColumnIds = new Set(
      sourceBoard.cards
        .filter((card) => draggedCardIdSet.has(card.id) && isColumnCard(card))
        .map((card) => card.id),
    )
    const nextSourceCards = sourceBoard.cards.flatMap<BoardCard>((card) => {
      if (draggedCardIdSet.has(card.id)) {
        return []
      }

      if (
        isColumnChildCard(card) &&
        card.columnId &&
        movedColumnIds.has(card.columnId)
      ) {
        const layout = sourceLayouts.layouts.get(card.id)
        return [
          {
            ...card,
            x: layout?.x ?? card.x,
            y: layout?.y ?? card.y,
            width: layout?.width ?? card.width,
            height: layout?.height ?? card.height,
            columnId: null,
            columnIndex: 0,
          },
        ]
      }

      return [card]
    })
    const movedConnectors = sourceBoard.connectors.filter(
      (connector) =>
        draggedCardIdSet.has(connector.fromCardId) && draggedCardIdSet.has(connector.toCardId),
    )

    const nextWorkspace = {
      ...currentWorkspace,
      boards: currentWorkspace.boards.map((boardTab) => {
        if (boardTab.id === sourceBoardId) {
          return {
            ...boardTab,
            board: touchBoard({
              ...sourceBoard,
              cards: normalizeColumnCards(nextSourceCards),
              connectors: sourceBoard.connectors.filter(
                (connector) =>
                  !draggedCardIdSet.has(connector.fromCardId) &&
                  !draggedCardIdSet.has(connector.toCardId),
              ),
            }),
          }
        }

        if (boardTab.id === targetBoardId) {
          return {
            ...boardTab,
            board: touchBoard({
              ...boardTab.board,
              cards: normalizeColumnCards([...boardTab.board.cards, ...movedCards]),
              connectors: [...boardTab.board.connectors, ...movedConnectors],
            }),
          }
        }

        return boardTab
      }),
      activeBoardId: targetBoardId,
      activeTabId: targetBoardId,
    }

    workspaceRef.current = nextWorkspace
    setWorkspace(nextWorkspace)
    setSelection(draggedCardIds, interaction.anchorCardId)
    setDragColumnTargetId(null)
    interactionRef.current = {
      mode: 'drag-card',
      startClientX: interaction.currentClientX,
      startClientY: interaction.currentClientY,
      currentClientX: interaction.currentClientX,
      currentClientY: interaction.currentClientY,
      anchorCardId: interaction.anchorCardId,
      cardOrigins: movedCards.map((card) => ({
        cardId: card.id,
        x: card.x,
        y: card.y,
      })),
    }
  })

  const updateBoardTabCardTransferHover = useEffectEvent((clientX: number, clientY: number) => {
    const interaction = interactionRef.current
    if (!interaction || interaction.mode !== 'drag-card') {
      clearBoardTabCardTransferHover()
      return
    }

    const hoveredBoardTabId = getHoveredBoardTabIdAtClientPoint(clientX, clientY)
    const currentBoardId = workspaceRef.current.activeBoardId

    if (!hoveredBoardTabId || hoveredBoardTabId === currentBoardId) {
      clearBoardTabCardTransferHover()
      return
    }

    if (hoveredBoardTabId === hoveredBoardTabCardTransferIdRef.current) {
      return
    }

    clearBoardTabCardTransferHover()
    hoveredBoardTabCardTransferIdRef.current = hoveredBoardTabId
    boardTabCardTransferTimeoutRef.current = window.setTimeout(() => {
      const pendingBoardTabId = hoveredBoardTabCardTransferIdRef.current
      clearBoardTabCardTransferHover()

      if (!pendingBoardTabId) {
        return
      }

      transferDraggedCardsToBoard(pendingBoardTabId)
    }, BOARD_TAB_CARD_TRANSFER_DELAY_MS)
  })

  const releaseDrawPointerCapture = () => {
    const activePointerId = drawPointerIdRef.current
    const drawCaptureTarget = drawCaptureTargetRef.current

    if (activePointerId === null || !drawCaptureTarget) {
      drawPointerIdRef.current = null
      drawCaptureTargetRef.current = null
      return
    }

    try {
      if (drawCaptureTarget.hasPointerCapture(activePointerId)) {
        drawCaptureTarget.releasePointerCapture(activePointerId)
      }
    } catch {
      // The pointer may already be gone if the browser cancelled the stream.
    }

    drawPointerIdRef.current = null
    drawCaptureTargetRef.current = null
  }

  const redrawDrawCanvas = useCallback(() => {
    const drawCanvas = drawCanvasRef.current
    if (!drawCanvas) {
      return
    }

    const rect = drawCanvas.getBoundingClientRect()
    const pixelRatio = window.devicePixelRatio || 1
    const nextWidth = Math.max(1, Math.round(rect.width * pixelRatio))
    const nextHeight = Math.max(1, Math.round(rect.height * pixelRatio))

    if (drawCanvas.width !== nextWidth || drawCanvas.height !== nextHeight) {
      drawCanvas.width = nextWidth
      drawCanvas.height = nextHeight
    }

    const context = drawCanvas.getContext('2d')
    if (!context) {
      return
    }

    context.save()
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
    context.scale(pixelRatio, pixelRatio)

    const currentViewport = getCurrentViewportState()
    const currentBoard = getCurrentBoardState()

    for (const stroke of currentBoard.strokes) {
      drawStrokeOnCanvas(context, stroke, currentViewport)
    }

    if (draftStrokeRef.current) {
      drawStrokeOnCanvas(context, draftStrokeRef.current, currentViewport)
    }

    context.restore()
  }, [])

  useEffect(() => {
    redrawDrawCanvas()
  }, [board.strokes, viewport.x, viewport.y, viewport.zoom, redrawDrawCanvas])

  useEffect(() => {
    const stage = canvasRef.current
    if (!stage || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(() => {
      redrawDrawCanvas()
    })

    observer.observe(stage)
    window.addEventListener('resize', redrawDrawCanvas)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', redrawDrawCanvas)
    }
  }, [redrawDrawCanvas])

  const cancelActiveDrawStroke = (statusMessage?: string) => {
    if (interactionRef.current?.mode === 'draw-stroke') {
      interactionRef.current = null
    }

    releaseDrawPointerCapture()
    draftStrokeRef.current = null
    setIsDrawingStroke(false)
    document.body.style.userSelect = ''
    redrawDrawCanvas()

    if (statusMessage) {
      setStatusText(statusMessage)
    }
  }

  const toggleDrawMode = () => {
    focusCanvas()
    const next = !isDrawMode

    if (next) {
      clearSelection()
      cancelCropMode()
      setIsConnectorMode(false)
      setConnectorSourceCardId(null)
      setConnectorPreviewPoint(null)
      setConnectorHoverCardId(null)
      if (drawTool === 'eraser' && !getCurrentBoardState().strokes.length) {
        setDrawTool('marker')
      }
    } else {
      cancelActiveDrawStroke()
    }

    setIsDrawMode(next)
    setStatusText(
      next
        ? 'Draw mode on. Drag to sketch above the board. Hold Space or use middle mouse drag to pan.'
        : 'Draw mode off.',
    )
  }

  const createConnectorBetweenCards = (fromCardId: string, toCardId: string) => {
    if (fromCardId === toCardId) {
      setStatusText('Choose a different item to finish the line.')
      return
    }

    const connectorKey = getConnectorKey(fromCardId, toCardId)
    const existingConnector = getCurrentBoardState().connectors.find(
      (connector) => getConnectorKey(connector.fromCardId, connector.toCardId) === connectorKey,
    )

    if (existingConnector) {
      setConnectorSourceCardId(null)
      setConnectorPreviewPoint(null)
      selectConnector(existingConnector.id)
      setStatusText('Those items are already connected.')
      return
    }

    updateBoard(
      (currentBoard) => ({
        ...currentBoard,
        connectors: [
          ...currentBoard.connectors,
          {
            id: crypto.randomUUID(),
            fromCardId,
            toCardId,
          },
        ],
      }),
      {
        recordUndo: true,
      },
    )

    clearSelection()
    setConnectorSourceCardId(null)
    setConnectorPreviewPoint(null)
    setStatusText('Connector added. Click another item to start the next line.')
  }

  const handleConnectorCardPress = (cardId: string) => {
    focusCanvas()

    if (!connectorSourceCardId) {
      clearSelection()
      cancelCropMode()
      setConnectorSourceCardId(cardId)
      setConnectorPreviewPoint(null)
      setStatusText('Connector start set. Click another item to finish the line.')
      return
    }

    createConnectorBetweenCards(connectorSourceCardId, cardId)
  }

  const toggleConnectorMode = () => {
    focusCanvas()
    const next = !isConnectorMode

    if (next) {
      clearSelection()
      cancelCropMode()
      cancelActiveDrawStroke()
      dismissCanvasEditing()
      setIsDrawMode(false)
      setCaptionEditingImageId(null)
      setConnectorSourceCardId(null)
      setConnectorPreviewPoint(null)
      setConnectorHoverCardId(null)
    } else {
      setConnectorSourceCardId(null)
      setConnectorPreviewPoint(null)
      setConnectorHoverCardId(null)
    }

    setIsConnectorMode(next)
    setStatusText(
      next
        ? 'Connector mode on. Click one item, then another to create a line.'
        : 'Connector mode off.',
    )
  }

  const toggleSnapToGrid = () => {
    setIsSnapToGrid((current) => {
      const next = !current
      setStatusText(next ? 'Snap to grid on.' : 'Snap to grid off.')
      return next
    })
  }

  const updateAppSettings = (recipe: (current: AppSettings) => AppSettings) => {
    setAppSettings((current) => normalizeAppSettings(recipe(current)))
  }

  const closeSettings = () => {
    setIsSettingsOpen(false)
    focusCanvas()
  }

  const toggleSettings = () => {
    setIsSettingsOpen((current) => {
      const next = !current
      if (!next) {
        window.requestAnimationFrame(() => {
          focusCanvas()
        })
      }
      return next
    })
  }

  const resetAppSettings = () => {
    setAppSettings(normalizeAppSettings(null))
    setStatusText('App appearance reset.')
  }

  const applyAppThemePreset = (preset: AppThemePreset) => {
    if (preset.id === CUSTOM_THEME_PRESET.id) {
      updateAppSettings((current) => ({
        ...current,
        themePresetId: CUSTOM_THEME_PRESET.id,
      }))
      setStatusText('Custom theme ready. Adjust the colors below.')
      return
    }

    updateAppSettings((current) => ({
      ...current,
      backgroundColor: preset.backgroundColor,
      sidebarColor: preset.sidebarColor,
      themePresetId: preset.id,
    }))
    setStatusText(`${preset.label} theme applied.`)
  }

  const rememberWorkspaceForUndo = (options?: WorkspaceMutationOptions) => {
    if (!options?.recordUndo) {
      return
    }

    const currentWorkspace = workspaceRef.current
    const groupKey = options.historyGroupKey
    const now = Date.now()
    const activeGroup = historyGroupRef.current

    if (groupKey && activeGroup?.key === groupKey && activeGroup.expiresAt > now) {
      historyGroupRef.current = {
        key: groupKey,
        expiresAt: now + HISTORY_GROUP_WINDOW_MS,
      }
      return
    }

    if (undoStackRef.current.at(-1) !== currentWorkspace) {
      undoStackRef.current = [
        ...undoStackRef.current.slice(-(UNDO_HISTORY_LIMIT - 1)),
        currentWorkspace,
      ]
    }

    historyGroupRef.current = groupKey
      ? {
          key: groupKey,
          expiresAt: now + HISTORY_GROUP_WINDOW_MS,
        }
      : null
  }

  const undoWorkspace = () => {
    const currentWorkspace = workspaceRef.current
    let previousWorkspace: WorkspaceSnapshot | null = null
    let nextUndoStack = undoStackRef.current

    while (nextUndoStack.length) {
      const candidate = nextUndoStack[nextUndoStack.length - 1]
      nextUndoStack = nextUndoStack.slice(0, -1)

      if (candidate !== currentWorkspace) {
        previousWorkspace = candidate
        break
      }
    }

    undoStackRef.current = nextUndoStack
    historyGroupRef.current = null

    if (!previousWorkspace) {
      setStatusText('Nothing to undo.')
      return
    }

    interactionRef.current = null
    releaseDrawPointerCapture()
    draftStrokeRef.current = null
    workspaceRef.current = previousWorkspace
    setWorkspace(previousWorkspace)
    setIsPanning(false)
    setSelectionRect(null)
    setImageCropPreview(null)
    setCropArmedImageId(null)
    setIsDrawingStroke(false)
    document.body.style.userSelect = ''
    redrawDrawCanvas()
    setStatusText('Undid the last change.')
  }

  const {
    closeDeleteBoardWarning,
    confirmDeleteBoard,
    createBoard,
    downloadWorkspaceBackup,
    fitBoard,
    handleBackupImportChange,
    openBackupImportPicker,
    openDeleteBoardWarning,
    renameActiveBoard,
    resetBoardUiState,
    resetZoom,
    setZoomFromCornerControl,
    switchBoardTab,
    zoomAroundClientPoint,
  } = createWorkspaceBoardController({
    interactionRef,
    historyGroupRef,
    activeNoteEditorIdRef,
    savedNoteSelectionRef,
    pendingTodoFocusIdRef,
    draftStrokeRef,
    workspaceRef,
    canvasRef,
    backupImportInputRef,
    activeBoardId,
    activeTabId: activeWorkspaceTabId,
    boardDeleteTargetId,
    canDeleteBoard,
    updateBoard,
    updateViewport,
    getCurrentBoardState,
    getCurrentBoardLayouts,
    getCurrentViewportState,
    appSettings,
    isSnapToGrid,
    setWorkspace,
    setAppSettings: (settings) => setAppSettings(normalizeAppSettings(settings)),
    setIsSnapToGrid,
    clearSelection,
    focusCanvas,
    releaseDrawPointerCapture,
    redrawDrawCanvas,
    setActiveTableCell,
    setConnectorSourceCardId,
    setConnectorPreviewPoint,
    setConnectorHoverCardId,
    setBoardDeleteTargetId,
    setIsCanvasHot,
    setDraggedCreationTool,
    setDragCreationPreview,
    setSelectionSidebarView,
    setDragColumnTargetId,
    setSelectionRect,
    setImageCropPreview,
    setCropArmedImageId,
    setCaptionEditingImageId,
    setIsPanning,
    setIsDrawingStroke,
    setStatusText,
    rememberWorkspaceForUndo,
    closeSettings,
  })

  const beginDrawStroke = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || isSpacePressedRef.current) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    focusCanvas()

    const point = screenToWorld(event.clientX, event.clientY)
    const nextStroke: DrawStroke = {
      id: crypto.randomUUID(),
      tool: drawTool,
      color: drawTool === 'marker' ? getDrawStrokeColor(drawColorHex) : DRAW_STROKE_COLOR,
      size: drawStrokeSize,
      points: [point],
    }

    interactionRef.current = {
      mode: 'draw-stroke',
      strokeId: nextStroke.id,
      tool: nextStroke.tool,
      color: nextStroke.color,
      size: nextStroke.size,
      points: nextStroke.points,
    }
    draftStrokeRef.current = nextStroke
    drawPointerIdRef.current = event.pointerId
    drawCaptureTargetRef.current = event.currentTarget
    setIsDrawingStroke(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    document.body.style.userSelect = 'none'
    redrawDrawCanvas()
  }

  const commitDrawStroke = (interaction: Extract<InteractionState, { mode: 'draw-stroke' }>) => {
    if (!interaction.points.length) {
      return
    }

    const stroke: DrawStroke = {
      id: interaction.strokeId,
      tool: interaction.tool,
      color: interaction.color,
      size: interaction.size,
      points: interaction.points,
    }

    updateBoard(
      (currentBoard) => ({
        ...currentBoard,
        strokes: [...currentBoard.strokes, stroke],
      }),
      {
        recordUndo: true,
      },
    )
    setStatusText('Stroke added.')
  }

  const clearDrawings = () => {
    if (!getCurrentBoardState().strokes.length) {
      return
    }

    focusCanvas()
    cancelActiveDrawStroke()
    setSelectedStrokeId(null)
    updateBoard(
      (currentBoard) => ({
        ...currentBoard,
        strokes: [],
      }),
      {
        recordUndo: true,
      },
    )
    setStatusText('Cleared drawing layer.')
  }

  const cancelCropMode = (statusMessage?: string) => {
    if (interactionRef.current?.mode === 'crop-image') {
      interactionRef.current = null
    }

    setCropArmedImageId(null)
    setImageCropPreview(null)
    document.body.style.userSelect = ''

    if (statusMessage) {
      setStatusText(statusMessage)
    }
  }

  const toggleImageCropMode = (cardId: string) => {
    focusCanvas()

    if (cropArmedImageId === cardId) {
      cancelCropMode('Crop cancelled.')
      return
    }

    setCaptionEditingImageId(null)
    setCropArmedImageId(cardId)
    setStatusText('Crop mode ready. Drag across the image to choose the crop area.')
  }

  const toggleImageCaptionMode = (cardId: string) => {
    if (captionEditingImageId === cardId) {
      setCaptionEditingImageId(null)
      focusCanvas()
      setStatusText('Image note hidden.')
      return
    }

    if (cropArmedImageId) {
      cancelCropMode()
    }

    setCaptionEditingImageId(cardId)
    setStatusText('Image note ready. Type underneath the image.')
  }

  const focusCard = (cardId: string, preserveExistingSelection = false) => {
    const nextSelection =
      preserveExistingSelection && selectedCardIdsRef.current.includes(cardId)
        ? selectedCardIdsRef.current
        : [cardId]

    setSelectionSidebarMode('card')
    setSelection(nextSelection, cardId)

    if (!preserveExistingSelection) {
      bringCardsToFront(nextSelection)
    }
  }

  const revealCardSettingsForEditing = (cardId: string) => {
    if (cropArmedImageId) {
      cancelCropMode()
    }

    setSelectionSidebarMode('card')
    const alreadySelected =
      selectedStrokeIdRef.current === null &&
      selectedCardIdsRef.current.length === 1 &&
      selectedCardIdsRef.current[0] === cardId

    if (alreadySelected) {
      setActiveCardId(cardId)
      return
    }

    setSelection([cardId], cardId)
  }

  const updateCard = (
    cardId: string,
    recipe: (card: BoardCard) => BoardCard,
    options?: WorkspaceMutationOptions,
  ) => {
    updateBoard(
      (currentBoard) => ({
        ...currentBoard,
        cards: currentBoard.cards.map((card) =>
          card.id === cardId ? recipe(card) : card,
        ),
      }),
      options,
    )
  }

  const {
    addTableColumn,
    addTableRow,
    handleNoteContentChange,
    handleTodoItemRemove,
    handleTodoItemTextChange,
    handleTodoItemToggle,
    insertTodoItemAfter,
    toggleTableTitle,
    updateColumnCardTitle,
    updateImageCaption,
    updateLinkCardUrl,
    updateTableCard,
    updateTableCell,
    updateTableCellFormat,
    updateTableTitle,
  } = createCardMutationController({
    updateCard,
    updateNoteContent,
    setPendingTodoFocusId: (itemId) => {
      pendingTodoFocusIdRef.current = itemId
    },
    setStatusText,
  })

  const focusTodoItemInput = (itemId: string) => {
    pendingTodoFocusIdRef.current = itemId

    window.requestAnimationFrame(() => {
      const input = todoItemInputRefs.current.get(itemId)
      if (!input) {
        return
      }

      input.focus()
      const cursorPosition = input.value.length
      input.setSelectionRange(cursorPosition, cursorPosition)
      autoResizeTextarea(input)
    })
  }

  const moveTodoItemBetweenCards = (
    sourceCardId: string,
    itemId: string,
    targetCardId: string,
    rawInsertionIndex: number,
  ) => {
    const currentBoard = getCurrentBoardState()
    const sourceCard = currentBoard.cards.find(
      (card): card is TodoCard => card.id === sourceCardId && card.kind === 'todo',
    )
    const targetCard = currentBoard.cards.find(
      (card): card is TodoCard => card.id === targetCardId && card.kind === 'todo',
    )

    if (!sourceCard || !targetCard) {
      return false
    }

    const sourceIndex = sourceCard.items.findIndex((item) => item.id === itemId)
    if (sourceIndex < 0) {
      return false
    }

    const draggedItem = sourceCard.items[sourceIndex]

    if (sourceCardId === targetCardId) {
      const nextItems = sourceCard.items.filter((item) => item.id !== itemId)
      const adjustedInsertionIndex = clamp(
        rawInsertionIndex - (sourceIndex < rawInsertionIndex ? 1 : 0),
        0,
        nextItems.length,
      )

      if (adjustedInsertionIndex === sourceIndex) {
        return false
      }

      nextItems.splice(adjustedInsertionIndex, 0, draggedItem)
      updateCard(
        sourceCardId,
        (card) =>
          card.kind === 'todo'
            ? {
                ...card,
                items: nextItems,
              }
            : card,
        {
          recordUndo: true,
        },
      )
      focusTodoItemInput(itemId)
      setStatusText('Task reordered.')
      return true
    }

    const targetIsBlankPlaceholder =
      targetCard.items.length === 1 &&
      targetCard.items[0].text.trim().length === 0 &&
      !targetCard.items[0].done
    const nextSourceItems = sourceCard.items.filter((item) => item.id !== itemId)
    const nextTargetItems = targetIsBlankPlaceholder ? [] : [...targetCard.items]

    nextTargetItems.splice(clamp(rawInsertionIndex, 0, nextTargetItems.length), 0, draggedItem)

    updateBoard(
      (current) => ({
        ...current,
        cards: current.cards.map((card) => {
          if (card.id === sourceCardId && card.kind === 'todo') {
            return {
              ...card,
              items: nextSourceItems.length ? nextSourceItems : [createTodoItem('')],
            }
          }

          if (card.id === targetCardId && card.kind === 'todo') {
            return {
              ...card,
              items: nextTargetItems,
            }
          }

          return card
        }),
      }),
      {
        recordUndo: true,
      },
    )

    focusTodoItemInput(itemId)
    setStatusText('Task moved.')
    return true
  }

  const updateHeadingAccentColor = (cardId: string, accentColor: string | null) => {
    updateCard(
      cardId,
      (card) =>
        card.kind === 'heading'
          ? {
              ...card,
              accentColor,
            }
          : card,
      {
        recordUndo: true,
        historyGroupKey: `heading-accent:${cardId}`,
      },
    )
    setStatusText('Header style updated.')
  }

  const updateHeadingTextAlign = (cardId: string, textAlign: WorkspaceCore.NoteTextAlign) => {
    updateCard(
      cardId,
      (card) =>
        card.kind === 'heading'
          ? {
              ...card,
              content: applyHeadingContentAlignment(card.content, textAlign),
              textAlign,
            }
          : card,
      {
        recordUndo: true,
        historyGroupKey: `heading-align:${cardId}`,
      },
    )
    setStatusText('Header alignment updated.')
  }

  const getCropPreviewRect = (interaction: Extract<InteractionState, { mode: 'crop-image' }>) =>
    getClampedSelectionRect(
      interaction.startWorldX - interaction.originCardX,
      interaction.startWorldY - interaction.originCardY,
      interaction.currentWorldX - interaction.originCardX,
      interaction.currentWorldY - interaction.originCardY,
      interaction.originCardWidth,
      interaction.originCardHeight,
    )

  const commitImageCrop = (interaction: Extract<InteractionState, { mode: 'crop-image' }>) => {
    const previewRect = getCropPreviewRect(interaction)

    if (previewRect.width < 4 || previewRect.height < 4) {
      return false
    }

    const nextCrop = normalizeImageCrop({
      x:
        interaction.originCrop.x +
        (previewRect.left / interaction.originCardWidth) * interaction.originCrop.width,
      y:
        interaction.originCrop.y +
        (previewRect.top / interaction.originCardHeight) * interaction.originCrop.height,
      width:
        (previewRect.width / interaction.originCardWidth) * interaction.originCrop.width,
      height:
        (previewRect.height / interaction.originCardHeight) * interaction.originCrop.height,
    })

    const aspectRatio = previewRect.width / Math.max(previewRect.height, 1)
    const nextWidth = Math.max(previewRect.width, IMAGE_MIN_WIDTH)
    const nextHeight =
      previewRect.width >= IMAGE_MIN_WIDTH
        ? previewRect.height
        : Math.max(1, Math.round(nextWidth / aspectRatio))

    updateCard(
      interaction.cardId,
      (card) =>
        card.kind === 'image'
          ? {
              ...card,
              x: interaction.originCardX + previewRect.left,
              y: interaction.originCardY + previewRect.top,
              width: nextWidth,
              height: nextHeight,
              crop: nextCrop,
            }
          : card,
    )

    setStatusText('Image cropped.')
    return true
  }

  const {
    addHeading,
    addNote,
    addNoteAt,
    addTodo,
    addLink,
    addColumn,
    addTable,
    addSidebarCreateToolAt,
  } = createCardCreationController({
      getCurrentBoardState,
      getCenteredCardPosition,
      getColumnDropTargetAtPoint,
      getViewportCenterInWorld,
      updateBoard,
      setSelection,
      setStatusText,
      setPendingTodoFocusId: (itemId) => {
        pendingTodoFocusIdRef.current = itemId
      },
      isSnapToGridEnabled: () => isSnapToGridRef.current,
    })

  const {
    handleCanvasDragEnter,
    handleCanvasDragLeave,
    handleCanvasDragOver,
    handleCanvasDrop,
    handleDocumentInputChange,
    handleImageInputChange,
    handleToolbarButtonDragEnd,
    handleToolbarButtonDragStart,
  } = createAssetImportController({
    usesDarkItems: appThemeState.usesDarkItems,
    draggedCreationTool,
    toolbarDragImageRef,
    setDraggedCreationTool,
    setDragCreationPreview,
    setIsCanvasHot,
    addSidebarCreateToolAt,
    screenToWorld,
    getCurrentBoardState,
    getViewportCenterInWorld,
    getPlacementPosition,
    updateBoard,
    setSelection,
    setStatusText,
    setUnsupportedUploadWarning: setFileUploadWarning,
    isSnapToGridEnabled: () => isSnapToGridRef.current,
    getSidebarCreateToolFromDataTransfer,
  })

  const {
    applySelectedCardAccentColor,
    applySelectedPalette,
    applySelectedStrokeColor,
    duplicateSelectedCards,
    handleDrawColorInputChange,
    openCustomDrawColorPicker,
    openLinkUrl,
    openSelectedLink,
    removeCards,
    removeConnectors,
    removeStrokes,
    toggleSelectedImageFit,
  } = createWorkspaceCardActionsController({
    activeCardIdRef,
    selectedCardIdsRef,
    selectedStrokeIdRef,
    selectedConnectorIdRef,
    isSnapToGridRef,
    drawColorInputRef,
    selectedCard,
    drawColorPickerMode,
    setSelection,
    setSelectedStrokeId,
    setSelectedConnectorId,
    setDrawColorHex,
    setDrawColorPickerMode,
    setStatusText,
    updateBoard,
    updateCard,
    getCurrentBoardState,
    getCurrentBoardLayouts,
    getPlacementPosition,
  })


  const {
    beginCardDrag,
    beginCardResize,
    beginCardSurfacePointerDown,
    beginMarqueeSelection,
    beginPan,
    createCardDragInteraction,
    finishMarqueeSelection,
    handleImagePointerDown,
    updateMarqueeSelection,
  } = createInteractionStartController({
    interactionRef,
    selectedCardIdsRef,
    getCurrentBoardState,
    getCurrentViewportState,
    getCurrentBoardLayouts,
    getCanvasLocalPoint,
    getCropPreviewRect,
    getCardLayout,
    screenToWorld,
    prepareCardsForDrag,
    rememberWorkspaceForUndo,
    setSelection,
    clearSelection,
    setSelectionRect,
    setDragColumnTargetId,
    setActiveTableCell,
    setImageCropPreview,
    focusCanvas,
    focusCard,
    setActiveCardId,
    handleConnectorCardPress,
    isConnectorMode,
    cropArmedImageId,
    setIsPanning,
  })

  const workspaceInteractionController = createWorkspaceInteractionController({
    canvasRef,
    interactionRef,
    gestureZoomRef,
    draftStrokeRef,
    isSpacePressedRef,
    selectedCardIdsRef,
    selectedStrokeIdRef,
    selectedConnectorIdRef,
    isSnapToGridRef,
    canvasDoubleClickEligibleRef,
    isSpacePressed,
    isBoardViewActive: !isCalendarTabActive,
    isSettingsOpen,
    captionEditingImageId,
    cropArmedImageId,
    isConnectorMode,
    connectorSourceCardId,
    isDrawMode,
    getCurrentViewportState,
    getCurrentBoardState,
    updateViewport,
    updateBoard,
    updateCard,
    getCanvasLocalPoint,
    getCropPreviewRect,
    screenToWorld,
    getResizedCardWidth,
    getColumnDropTarget,
    dockCardsIntoColumn,
    finishMarqueeSelection,
    updateMarqueeSelection,
    commitImageCrop,
    commitDrawStroke,
    createCardDragInteraction,
    releaseDrawPointerCapture,
    redrawDrawCanvas,
    setSelectionRect,
    setImageCropPreview,
    setDragColumnTargetId,
    setIsPanning,
    setIsDrawingStroke,
    setCropArmedImageId,
    setIsSpacePressed,
    setConnectorPreviewPoint,
    setConnectorHoverCardId,
    setCaptionEditingImageId,
    setConnectorSourceCardId,
    setIsConnectorMode,
    setIsDrawMode,
    setStatusText,
    clearSelection,
    closeSettings,
    focusCanvas,
    undoWorkspace,
    cancelCropMode,
    cancelActiveDrawStroke,
    addHeading,
    addNote,
    addTodo,
    addLink,
    addNoteAt,
    fitBoard,
    resetZoom,
    duplicateSelectedCards,
    removeStrokes,
    removeConnectors,
    removeCards,
    zoomAroundClientPoint,
    beginPan,
    beginMarqueeSelection,
  })

  useEffect(() => {
    if (isCalendarTabActive) {
      return
    }

    const recoveryKey = `${BOARD_VIEWPORT_RECOVERY_VERSION}:${activeBoardId}:${board.cards.length}:${board.strokes.length}`
    if (recoveredBoardViewportKeysRef.current.has(recoveryKey)) {
      return
    }

    if (!board.cards.length && !board.strokes.length) {
      recoveredBoardViewportKeysRef.current.add(recoveryKey)
      return
    }

    const canvas = canvasRef.current
    if (!canvas || viewport.zoom <= 0) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      return
    }

    const visibleWorldBounds = {
      left: (-viewport.x) / viewport.zoom,
      top: (-viewport.y) / viewport.zoom,
      right: (rect.width - viewport.x) / viewport.zoom,
      bottom: (rect.height - viewport.y) / viewport.zoom,
    }
    const cardBounds = board.cards.map((card) => {
      const layout = boardCardLayouts.layouts.get(card.id)
      return {
        left: layout?.x ?? card.x,
        top: layout?.y ?? card.y,
        right: (layout?.x ?? card.x) + (layout?.width ?? card.width),
        bottom: (layout?.y ?? card.y) + (layout?.height ?? card.height),
      }
    })
    const strokeBounds = board.strokes
      .map((stroke) => getStrokeWorldBounds(stroke))
      .filter(
        (
          bounds,
        ): bounds is {
          left: number
          top: number
          right: number
          bottom: number
        } => bounds !== null,
      )
    const contentBounds = [...cardBounds, ...strokeBounds]
    const isBoundsCenterVisible = (bounds: {
      left: number
      top: number
      right: number
      bottom: number
    }) => {
      const centerX = (bounds.left + bounds.right) / 2
      const centerY = (bounds.top + bounds.bottom) / 2
      return (
        centerX >= visibleWorldBounds.left &&
        centerX <= visibleWorldBounds.right &&
        centerY >= visibleWorldBounds.top &&
        centerY <= visibleWorldBounds.bottom
      )
    }
    const hasMeaningfulVisibleContent = contentBounds.some((bounds) => {
      const intersectionLeft = Math.max(bounds.left, visibleWorldBounds.left)
      const intersectionTop = Math.max(bounds.top, visibleWorldBounds.top)
      const intersectionRight = Math.min(bounds.right, visibleWorldBounds.right)
      const intersectionBottom = Math.min(bounds.bottom, visibleWorldBounds.bottom)
      const intersectionWidth = Math.max(intersectionRight - intersectionLeft, 0)
      const intersectionHeight = Math.max(intersectionBottom - intersectionTop, 0)
      const visibleScreenArea =
        intersectionWidth * viewport.zoom * intersectionHeight * viewport.zoom
      const totalScreenArea =
        Math.max(bounds.right - bounds.left, 1) *
        viewport.zoom *
        Math.max(bounds.bottom - bounds.top, 1) *
        viewport.zoom
      const visibleRatio = totalScreenArea > 0 ? visibleScreenArea / totalScreenArea : 0

      return visibleRatio >= 0.35 || isBoundsCenterVisible(bounds)
    })
    const fullContentBounds = {
      left: Math.min(...contentBounds.map((bounds) => bounds.left)),
      top: Math.min(...contentBounds.map((bounds) => bounds.top)),
      right: Math.max(...contentBounds.map((bounds) => bounds.right)),
      bottom: Math.max(...contentBounds.map((bounds) => bounds.bottom)),
    }
    const isContentCenterVisible = isBoundsCenterVisible(fullContentBounds)

    recoveredBoardViewportKeysRef.current.add(recoveryKey)
    if (hasMeaningfulVisibleContent || isContentCenterVisible) {
      return
    }

    window.requestAnimationFrame(() => {
      fitBoard()
    })
  }, [
    activeBoardId,
    board.cards,
    board.strokes,
    boardCardLayouts.layouts,
    fitBoard,
    isCalendarTabActive,
    viewport.x,
    viewport.y,
    viewport.zoom,
  ])

  const {
    handleCanvasDoubleClick,
    handleCanvasPointerDown,
    handleCanvasPointerDownCapture,
    handleCanvasPointerLeave,
    handleCanvasPointerMove,
    handleCanvasWheel,
  } = workspaceInteractionController

  const handleGlobalPointerMove = useEffectEvent((event: PointerEvent) => {
    workspaceInteractionController.handleGlobalPointerMove(event)
    updateBoardTabCardTransferHover(event.clientX, event.clientY)
  })
  const clearInteraction = useEffectEvent(() => {
    clearBoardTabCardTransferHover()
    workspaceInteractionController.clearInteraction()
  })
  const handleGlobalKeyDown = useEffectEvent((event: KeyboardEvent) => {
    workspaceInteractionController.handleGlobalKeyDown(event)
  })
  const handleGlobalKeyUp = useEffectEvent((event: KeyboardEvent) => {
    workspaceInteractionController.handleGlobalKeyUp(event)
  })
  const handleWindowBlur = useEffectEvent(() => {
    clearBoardTabCardTransferHover()
    closeBoardContextMenu()
    workspaceInteractionController.handleWindowBlur()
  })
  const handleGestureStart = useEffectEvent((event: Event) => {
    workspaceInteractionController.handleGestureStart(event)
  })
  const handleGestureChange = useEffectEvent((event: Event) => {
    workspaceInteractionController.handleGestureChange(event)
  })
  const handleGestureEnd = useEffectEvent((event: Event) => {
    workspaceInteractionController.handleGestureEnd(event)
  })

  const getTodoItemDropTargetAtClientPoint = (
    clientX: number,
    clientY: number,
  ): TodoItemDropTarget | null => {
    const hoveredElement = document.elementFromPoint(clientX, clientY)
    if (!(hoveredElement instanceof HTMLElement)) {
      return null
    }

    const hoveredList = hoveredElement.closest<HTMLElement>('[data-todo-list-card-id]')
    if (!hoveredList?.dataset.todoListCardId) {
      return null
    }

    const hoveredRow = hoveredElement.closest<HTMLElement>('[data-todo-row-item-id]')
    if (hoveredRow?.dataset.todoItemIndex) {
      const rowIndex = Number.parseInt(hoveredRow.dataset.todoItemIndex, 10)
      if (Number.isFinite(rowIndex)) {
        const rowRect = hoveredRow.getBoundingClientRect()
        return {
          cardId: hoveredList.dataset.todoListCardId,
          insertionIndex: rowIndex + (clientY > rowRect.top + rowRect.height / 2 ? 1 : 0),
        }
      }
    }

    const rowNodes = hoveredList.querySelectorAll<HTMLElement>('[data-todo-row-item-id]')
    let insertionIndex = rowNodes.length

    for (const rowNode of rowNodes) {
      const rowIndex = Number.parseInt(rowNode.dataset.todoItemIndex ?? '', 10)
      if (!Number.isFinite(rowIndex)) {
        continue
      }

      const rowRect = rowNode.getBoundingClientRect()
      if (clientY < rowRect.top + rowRect.height / 2) {
        insertionIndex = rowIndex
        break
      }
    }

    return {
      cardId: hoveredList.dataset.todoListCardId,
      insertionIndex,
    }
  }

  const resetTodoItemDrag = () => {
    activeTodoItemDragRef.current = null
    todoItemDropTargetRef.current = null
    setActiveTodoItemDrag(null)
    setTodoItemDropTarget(null)
    document.body.style.userSelect = ''
  }

  const beginTodoItemDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    payload: TodoItemDragState,
  ) => {
    if (event.button !== 0 || isConnectorMode) {
      return
    }

    activeTodoItemDragRef.current = payload
    todoItemDropTargetRef.current = null
    setActiveTodoItemDrag(payload)
    setTodoItemDropTarget(null)
    document.body.style.userSelect = 'none'
  }

  const handleTodoItemDragPointerMove = useEffectEvent((event: PointerEvent) => {
    if (!activeTodoItemDragRef.current) {
      return
    }

    const nextDropTarget = getTodoItemDropTargetAtClientPoint(event.clientX, event.clientY)

    if (areTodoItemDropTargetsEqual(todoItemDropTargetRef.current, nextDropTarget)) {
      return
    }

    todoItemDropTargetRef.current = nextDropTarget
    setTodoItemDropTarget(nextDropTarget)
  })

  const finishTodoItemDrag = useEffectEvent((options?: { shouldCommit?: boolean }) => {
    const activeDrag = activeTodoItemDragRef.current
    if (!activeDrag) {
      return
    }

    const shouldCommit = options?.shouldCommit ?? true
    const dropTarget = todoItemDropTargetRef.current

    resetTodoItemDrag()

    if (!shouldCommit || !dropTarget) {
      return
    }

    moveTodoItemBetweenCards(
      activeDrag.sourceCardId,
      activeDrag.itemId,
      dropTarget.cardId,
      dropTarget.insertionIndex,
    )
  })

  const handleTodoItemDragKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !activeTodoItemDragRef.current) {
      return
    }

    event.preventDefault()
    finishTodoItemDrag({ shouldCommit: false })
  })

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => handleGlobalPointerMove(event)
    const handlePointerUp = () => clearInteraction()
    const handlePointerCancel = () => clearInteraction()
    const handleKeyDown = (event: KeyboardEvent) => handleGlobalKeyDown(event)
    const handleKeyUp = (event: KeyboardEvent) => handleGlobalKeyUp(event)
    const onWindowBlur = () => handleWindowBlur()

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', onWindowBlur)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', onWindowBlur)
    }
    // The registered handlers intentionally rely on refs and effect events for fresh state.
  }, [])

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => handleWindowPaste(event)

    window.addEventListener('paste', handlePaste)

    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => handleTodoItemDragPointerMove(event)
    const handlePointerUp = () => finishTodoItemDrag()
    const handlePointerCancel = () => finishTodoItemDrag({ shouldCommit: false })
    const handleKeyDown = (event: KeyboardEvent) => handleTodoItemDragKeyDown(event)
    const handleWindowBlurEvent = () => finishTodoItemDrag({ shouldCommit: false })

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', handleWindowBlurEvent)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', handleWindowBlurEvent)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const onGestureStart = (event: Event) => handleGestureStart(event)
    const onGestureChange = (event: Event) => handleGestureChange(event)
    const onGestureEnd = (event: Event) => handleGestureEnd(event)

    canvas.addEventListener('gesturestart', onGestureStart as EventListener, {
      passive: false,
    })
    canvas.addEventListener('gesturechange', onGestureChange as EventListener, {
      passive: false,
    })
    canvas.addEventListener('gestureend', onGestureEnd as EventListener, {
      passive: false,
    })

    return () => {
      canvas.removeEventListener('gesturestart', onGestureStart as EventListener)
      canvas.removeEventListener('gesturechange', onGestureChange as EventListener)
      canvas.removeEventListener('gestureend', onGestureEnd as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!boardContextMenu) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && boardContextMenuRef.current?.contains(target)) {
        return
      }

      closeBoardContextMenu()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeBoardContextMenu()
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [boardContextMenu])

  useEffect(() => {
    closeBoardContextMenu()
  }, [activeWorkspaceTabId, isSettingsOpen])

  const selectedPaletteCard =
    selectedCard && isPaletteCard(selectedCard) ? selectedCard : null
  const isSelectionSidebar =
    !isDrawMode && !isConnectorMode && selectedCount > 0 && !isDocumentOnlySelection
  const drawLayerActive = isDrawMode || isDrawingStroke
  const primaryDrawColorHex = appThemeState.usesDarkItems
    ? DRAW_DARK_DEFAULT_COLOR_HEX
    : DRAW_LIGHT_DEFAULT_COLOR_HEX
  const primaryDrawColorLabel = appThemeState.usesDarkItems ? 'White' : 'Black'
  const drawColorSwatches = [
    { hex: primaryDrawColorHex, label: primaryDrawColorLabel },
    { hex: DRAW_RED_COLOR_HEX, label: 'Red' },
  ] as const
  const normalizedDrawColorHex = drawColorHex.toLowerCase()
  const isCustomDrawColor = !drawColorSwatches.some(
    (colorOption) => colorOption.hex === normalizedDrawColorHex,
  )
  const zoomPercentage = Math.round(viewport.zoom * 100)
  const appThemeStyle = buildAppThemeStyle(appSettings)
  const activeAppThemePreset = getActiveAppThemePreset(appSettings)
  const isCustomThemeSelected = activeAppThemePreset.id === CUSTOM_THEME_PRESET.id
  const primaryTools = buildPrimaryTools({
    isConnectorMode,
    isDrawMode,
    onToggleConnectorMode: toggleConnectorMode,
    onToggleDrawMode: toggleDrawMode,
    onAddHeading: addHeading,
    onAddNote: addNote,
    onAddTodo: addTodo,
    onAddLink: addLink,
    onAddTable: addTable,
    onOpenImagePicker: () => {
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
        imageInputRef.current.click()
      }
    },
    onAddColumn: addColumn,
  })
  const uploadFileTool: ToolbarTool = {
    id: 'add-document',
    label: 'Upload file',
    icon: 'document',
    onClick: () => {
      if (documentInputRef.current) {
        documentInputRef.current.value = ''
        documentInputRef.current.click()
      }
    },
  }
  const utilityTools = buildUtilityTools({
    isSettingsOpen,
    onFitBoard: fitBoard,
    onToggleSettings: toggleSettings,
  })
  const switchWorkspaceTab = (tabId: string) => {
    setCalendarSidebarView('default')

    if (tabId === CALENDAR_TAB_ID) {
      if (activeWorkspaceTabId === CALENDAR_TAB_ID) {
        return
      }

      const nextWorkspace = {
        ...workspaceRef.current,
        activeTabId: CALENDAR_TAB_ID,
      }

      workspaceRef.current = nextWorkspace
      setWorkspace(nextWorkspace)
      resetBoardUiState()
      setStatusText('Calendar ready. Select a day to open the detail panel.')
      return
    }

    switchBoardTab(tabId)
  }

  const openBoardContextMenu = useEffectEvent(
    (target: EventTarget | null, clientX: number, clientY: number) => {
      if (
        isEditingEventTarget(target) ||
        interactionRef.current?.mode === 'drag-card' ||
        activeTodoItemDragRef.current
      ) {
        closeBoardContextMenu()
        return
      }

      const targetCardId = getEventTargetCardId(target)
      const currentlySelectedIds = selectedCardIdsRef.current
      let nextSelectionIds: string[] = []
      let nextActiveCardId: string | null = null

      if (targetCardId) {
        if (currentlySelectedIds.includes(targetCardId)) {
          nextSelectionIds = currentlySelectedIds
          nextActiveCardId =
            activeCardIdRef.current && currentlySelectedIds.includes(activeCardIdRef.current)
              ? activeCardIdRef.current
              : targetCardId
        } else {
          dismissCanvasEditing()
          nextSelectionIds = [targetCardId]
          nextActiveCardId = targetCardId
          setSelection(nextSelectionIds, targetCardId)
        }
      } else if (currentlySelectedIds.length > 0) {
        nextSelectionIds = currentlySelectedIds
        nextActiveCardId =
          activeCardIdRef.current && currentlySelectedIds.includes(activeCardIdRef.current)
            ? activeCardIdRef.current
            : currentlySelectedIds.at(-1) ?? null
      }

      focusCanvas()
      setBoardContextMenu({
        clientX,
        clientY,
        worldPoint: screenToWorld(clientX, clientY),
        selectionCardIds: nextSelectionIds,
        activeCardId: nextActiveCardId,
        targetCardId,
      })
    },
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const handleNativeMouseDown = (event: MouseEvent) => {
      if (event.button !== 2) {
        return
      }

      if (!(event.target instanceof Node) || !canvas.contains(event.target)) {
        return
      }

      if (isEditingEventTarget(event.target)) {
        return
      }

      event.preventDefault()
      openBoardContextMenu(event.target, event.clientX, event.clientY)
    }

    const handleNativeContextMenu = (event: MouseEvent) => {
      if (!(event.target instanceof Node) || !canvas.contains(event.target)) {
        return
      }

      if (isEditingEventTarget(event.target)) {
        return
      }

      event.preventDefault()
    }

    canvas.addEventListener('mousedown', handleNativeMouseDown, true)
    canvas.addEventListener('contextmenu', handleNativeContextMenu, true)

    return () => {
      canvas.removeEventListener('mousedown', handleNativeMouseDown, true)
      canvas.removeEventListener('contextmenu', handleNativeContextMenu, true)
    }
  }, [openBoardContextMenu])

  const closeCalendarDetails = () => {
    if (!selectedCalendarDate) {
      return
    }

    setCalendarSidebarView('default')
    updateCalendar((currentCalendar) => ({
      ...currentCalendar,
      selectedDate: null,
    }))
    setStatusText('Calendar details closed.')
  }

  const selectCalendarDate = (dateKey: string) => {
    setCalendarSidebarView('default')
    updateCalendar((currentCalendar) => ({
      ...currentCalendar,
      visibleMonth: dateKey.slice(0, 7),
      selectedDate: dateKey,
    }))
  }

  const showPreviousCalendarMonth = () => {
    setCalendarSidebarView('default')
    updateCalendar((currentCalendar) => ({
      ...currentCalendar,
      visibleMonth: shiftCalendarMonth(currentCalendar.visibleMonth, -1),
      selectedDate: null,
    }))
  }

  const showNextCalendarMonth = () => {
    setCalendarSidebarView('default')
    updateCalendar((currentCalendar) => ({
      ...currentCalendar,
      visibleMonth: shiftCalendarMonth(currentCalendar.visibleMonth, 1),
      selectedDate: null,
    }))
  }

  const jumpCalendarToToday = () => {
    const todayDateKey = getCalendarDateKey()
    setCalendarSidebarView('default')
    updateCalendar((currentCalendar) => ({
      ...currentCalendar,
      visibleMonth: getCalendarMonthKey(),
      selectedDate: todayDateKey,
    }))
    setStatusText('Jumped to today.')
  }

  const updateCalendarEntry = (
    dateKey: string,
    field: 'headline' | 'plans' | 'notes',
    value: string,
  ) => {
    updateCalendar(
      (currentCalendar) => {
        const existingEntry = currentCalendar.entries[dateKey] ?? {
          headline: '',
          plans: '',
          notes: '',
          palette: DEFAULT_CARD_PALETTE,
          updatedAt: new Date().toISOString(),
        }
        const nextEntry = {
          ...existingEntry,
          [field]: value,
          updatedAt: new Date().toISOString(),
        }
        const nextEntries = {
          ...currentCalendar.entries,
        }

        if (!isCalendarEntryMeaningful(nextEntry)) {
          delete nextEntries[dateKey]
        } else {
          nextEntries[dateKey] = nextEntry
        }

        return {
          ...currentCalendar,
          visibleMonth: dateKey.slice(0, 7),
          selectedDate: dateKey,
          entries: nextEntries,
        }
      },
      {
        recordUndo: true,
        historyGroupKey: `calendar-entry:${dateKey}`,
      },
    )
  }

  const updateCalendarEntryPalette = (dateKey: string, paletteId: NotePaletteId) => {
    updateCalendar(
      (currentCalendar) => {
        const existingEntry = currentCalendar.entries[dateKey] ?? {
          headline: '',
          plans: '',
          notes: '',
          palette: DEFAULT_CARD_PALETTE,
          updatedAt: new Date().toISOString(),
        }
        const nextEntry = {
          ...existingEntry,
          palette: paletteId,
          updatedAt: new Date().toISOString(),
        }
        const nextEntries = {
          ...currentCalendar.entries,
        }

        if (!isCalendarEntryMeaningful(nextEntry)) {
          delete nextEntries[dateKey]
        } else {
          nextEntries[dateKey] = nextEntry
        }

        return {
          ...currentCalendar,
          visibleMonth: dateKey.slice(0, 7),
          selectedDate: dateKey,
          entries: nextEntries,
        }
      },
      {
        recordUndo: true,
        historyGroupKey: `calendar-palette:${dateKey}`,
      },
    )
    setStatusText('Date color updated.')
  }

  const calendarUtilityTools: ToolbarTool[] = [
    {
      id: 'calendar-settings',
      label: 'Settings',
      icon: 'settings',
      onClick: toggleSettings,
      active: isSettingsOpen,
    },
  ]
  const calendarPrimaryTools: ToolbarTool[] = selectedCalendarDate
    ? [
        {
          id: 'calendar-color',
          label: 'Color',
          icon: 'swatch',
          iconColor: selectedCalendarPalette.background,
          onClick: () =>
            setCalendarSidebarView((current) =>
              current === 'palette' ? 'default' : 'palette',
            ),
          active: calendarSidebarView === 'palette',
        },
      ]
    : []
  const calendarSidebarPopout =
    isCalendarTabActive && selectedCalendarDate && calendarSidebarView === 'palette' ? (
      <div className="tool-popout" aria-label="Date color settings">
        <div className="tool-panel tool-panel--selection-mode">
          <div className="tool-panel-kicker">Selected date</div>
          <div className="tool-panel-title">Color</div>
          <p className="tool-panel-copy">Choose a color for this date.</p>
          <div className="palette-grid">
            {getNotePalettes(appThemeState.usesDarkItems).map((palette) => (
              <button
                key={palette.id}
                type="button"
                className={`palette-chip ${
                  (selectedCalendarEntry?.palette ?? DEFAULT_CARD_PALETTE) === palette.id
                    ? 'is-active'
                    : ''
                }`}
                onClick={() => updateCalendarEntryPalette(selectedCalendarDate, palette.id)}
              >
                <span
                  className="palette-chip-swatch"
                  style={{ background: palette.background, borderColor: palette.border }}
                />
                <span className="palette-chip-label">{palette.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    ) : null
  const renderToolbarButton = (tool: ToolbarTool) => (
    <WorkspaceToolButton
      key={tool.id}
      tool={tool}
      onDragStart={(event) => handleToolbarButtonDragStart(event, tool)}
      onDragEnd={() => handleToolbarButtonDragEnd()}
    />
  )
  const dragCreationPreviewStyle = dragCreationPreview
    ? (() => {
        const toolSize = getSidebarCreateToolSize(dragCreationPreview.kind)
        const position = getCenteredCardPosition(
          dragCreationPreview.worldPoint,
          toolSize.width,
          toolSize.height,
        )

        return {
          label: getSidebarCreateToolLabel(dragCreationPreview.kind),
          style: {
            left: viewport.x + position.x * viewport.zoom,
            top: viewport.y + position.y * viewport.zoom,
            width: toolSize.width * viewport.zoom,
            height: toolSize.height * viewport.zoom,
          },
        }
      })()
    : null

  useEffect(() => {
    setSelectionSidebarView('default')
  }, [selectedCard?.id, selectedCount, selectedStrokeId, selectedConnectorId, isDrawMode, isConnectorMode])

  useEffect(() => {
    if (!isCalendarTabActive || !selectedCalendarDate) {
      setCalendarSidebarView('default')
    }
  }, [isCalendarTabActive, selectedCalendarDate])

  const drawModePrimaryTools = buildDrawModePrimaryTools({
    drawTool,
    onSetDrawTool: (tool, statusText) => {
      setDrawTool(tool)
      setStatusText(statusText)
    },
  })
  const drawModeColorTools = buildDrawModeColorTools({
    drawTool,
    primaryDrawColorHex,
    primaryDrawColorLabel,
    drawColorHex,
    isCustomDrawColor,
    onSetDrawColor: setDrawColorHex,
    onOpenCustomColor: () => openCustomDrawColorPicker('draw'),
    onStatusText: setStatusText,
  })
  const drawModeSizeTools = buildDrawModeSizeTools({
    drawStrokeSize,
    onSetDrawStrokeSize: setDrawStrokeSize,
    onStatusText: setStatusText,
  })
  const drawModeUtilityTools = buildDrawModeUtilityTools({
    onClearDrawings: clearDrawings,
  })

  const exitSelectionSidebar = () => {
    cancelCropMode()
    setSelectionSidebarView('default')
    clearSelection()
    setStatusText('Selection cleared.')
  }

  const connectorSelectionTools = buildConnectorSelectionTools({
    selectedConnector,
    onRemoveConnectors: removeConnectors,
  })
  const strokeSelectionTools = buildStrokeSelectionTools({
    selectedStroke,
    primaryDrawColorHex,
    primaryDrawColorLabel,
    drawColorSwatches,
    onApplyStrokeColor: applySelectedStrokeColor,
    onOpenCustomColor: (initialColor) =>
      openCustomDrawColorPicker('selected-stroke', initialColor),
    onRemoveStrokes: removeStrokes,
    colorToHex,
  })

  const handleBrandClick = () => {
    if (isCalendarTabActive) {
      if (!selectedCalendarDate) {
        return
      }

      closeCalendarDetails()
      return
    }

    focusCanvas()

    if (isDrawMode) {
      cancelActiveDrawStroke()
      setIsDrawMode(false)
      setStatusText('Draw mode off.')
      return
    }

    if (isConnectorMode) {
      setIsConnectorMode(false)
      setConnectorSourceCardId(null)
      setConnectorPreviewPoint(null)
      setConnectorHoverCardId(null)
      setStatusText('Connector mode off.')
      return
    }

    if (selectedCount > 0) {
      exitSelectionSidebar()
    }
  }

  const isBrandInteractive = isCalendarTabActive
    ? selectedCalendarDate !== null
    : isDrawMode || isConnectorMode || selectedCount > 0

  const {
    handleTableCellPointerDown,
    handleTableCellFocus,
    handleTableTitlePointerDown,
    setActiveTableCellBlockStyle,
    toggleActiveTableCellInlineStyle,
    setActiveTableCellValueType,
    setActiveTableCellBackgroundColor,
    setActiveTableCellAlignment,
    activateActiveTableCellFormula,
  } = createTableCellController({
    selectedCardIdsSet,
    selectedCardIds,
    hasSelectedStroke: selectedStroke !== null,
    hasSelectedConnector: selectedConnector !== null,
    activeSelectedTableCell,
    activeSelectedTableCellRange,
    selectedTableCard,
    isActiveSelectedTableCellRangeMulti,
    beginCardSurfacePointerDown: (event, card) => beginCardSurfacePointerDown(event, card),
    setActiveTableCell,
    setStatusText,
    focusCanvas,
    revealCardSettingsForEditing,
    updateTableCard,
    updateTableCell,
    updateTableCellFormat,
  })

  const connectorLayer = (
    <CanvasConnectorLayer
      connectors={board.connectors}
      layouts={boardCardLayouts.layouts}
      connectorSourceCardId={connectorSourceCardId}
      connectorPreviewPoint={connectorPreviewPoint}
      selectedConnectorId={selectedConnector?.id ?? null}
      isConnectorMode={isConnectorMode}
      getCardCanvasRect={getCardCanvasRect}
      getLayoutCanvasRect={getLayoutCanvasRect}
      onSelectConnector={selectConnector}
    />
  )

  const strokeSelectionOverlay = (
    <CanvasStrokeSelectionOverlay
      strokes={board.strokes}
      viewport={viewport}
      drawLayerActive={drawLayerActive}
      isConnectorMode={isConnectorMode}
      selectedStrokeId={selectedStroke?.id ?? null}
      onSelectStroke={selectStroke}
    />
  )

  const renderCard = (card: BoardCard) => (
    <WorkspaceBoardCard
      key={card.id}
      card={card}
      layouts={boardCardLayouts.layouts}
      columnChildren={boardCardLayouts.columnChildren}
      selectedCardIdsSet={selectedCardIdsSet}
      selectedCount={selectedCount}
      isConnectorMode={isConnectorMode}
      connectorSourceCardId={connectorSourceCardId}
      connectorHoverCardId={connectorHoverCardId}
      dragColumnTargetId={dragColumnTargetId}
      draggedTodoItemId={activeTodoItemDrag?.itemId ?? null}
      todoDropTargetCardId={todoItemDropTarget?.cardId ?? null}
      todoDropInsertionIndex={todoItemDropTarget?.insertionIndex ?? null}
      captionEditingImageId={captionEditingImageId}
      cropArmedImageId={cropArmedImageId}
      selectedImageCropReady={selectedImageCropReady}
      imageCropPreview={imageCropPreview}
      activeSelectedTableCell={activeSelectedTableCell}
      activeSelectedTableCellRange={activeSelectedTableCellRange}
      usesDarkItems={appThemeState.usesDarkItems}
      registerMeasuredCard={registerMeasuredCard}
      registerImageCaptionInput={registerImageCaptionInput}
      registerTodoItemInput={registerTodoItemInput}
      registerNoteEditor={registerNoteEditor}
      autoResizeTextarea={autoResizeTextarea}
      normalizeRichNoteHtml={normalizeRichNoteHtml}
      configureRichTextCommands={configureNoteRichTextCommands}
      onImagePointerDown={handleImagePointerDown}
      onCardSurfacePointerDown={beginCardSurfacePointerDown}
      onCardDragPointerDown={beginCardDrag}
      onCardResizePointerDown={beginCardResize}
      onOpenDocumentPreview={setDocumentPreviewCardId}
      onToggleImageCaption={toggleImageCaptionMode}
      onToggleImageCrop={toggleImageCropMode}
      onUpdateImageCaption={updateImageCaption}
      onStopImageCaptionEditing={() => setCaptionEditingImageId(null)}
      onCancelCropMode={() => cancelCropMode()}
      onFocusCard={(cardId) => focusCard(cardId)}
      onActivateCard={setActiveCardId}
      onStartImageCaptionEditing={setCaptionEditingImageId}
      onFocusCanvas={focusCanvas}
      onStatusText={setStatusText}
      onRevealCardSettingsForEditing={revealCardSettingsForEditing}
      onActivateNoteEditor={setActiveNoteEditor}
      onNoteSelectionChange={syncNoteTextToolbarState}
      onNoteContentChange={handleNoteContentChange}
      onToggleTodo={handleTodoItemToggle}
      onTodoTextChange={handleTodoItemTextChange}
      onInsertTodoAfter={insertTodoItemAfter}
      onRemoveTodo={handleTodoItemRemove}
      onTodoDragHandlePointerDown={beginTodoItemDrag}
      onOpenLink={openLinkUrl}
      onLinkUrlChange={updateLinkCardUrl}
      onTableTitleFocus={(cardId) => {
        revealCardSettingsForEditing(cardId)
        setActiveTableCell(null)
      }}
      onTableTitleChange={updateTableTitle}
      onTableTitlePointerDown={handleTableTitlePointerDown}
      onTableCellFocus={handleTableCellFocus}
      onTableCellChange={updateTableCell}
      onTableCellPointerDown={handleTableCellPointerDown}
      onColumnTitleChange={updateColumnCardTitle}
    />
  )

  const workspaceBrandLabel = isCalendarTabActive
    ? selectedCalendarDate
      ? 'Close the selected day'
      : 'LESS NOTE'
    : isDrawMode || isConnectorMode
      ? 'Return to the main toolbar'
      : selectedCount > 0
        ? 'Clear selection and return to the main toolbar'
        : 'LESS NOTE'

  const boardTabItems = [
    {
      id: CALENDAR_TAB_ID,
      title: 'Calendar',
      label: 'Calendar',
      ariaLabel: 'Calendar',
      isActive: isCalendarTabActive,
      inputSize: 8,
      placeholder: 'Calendar',
      isEditable: false,
      icon: 'calendar' as const,
    },
    ...boardTabs.map((boardTab, index) => {
      const boardTabLabel = boardTab.board.title.trim() || `Board ${index + 1}`

      return {
        id: boardTab.id,
        title: boardTab.board.title,
        label: boardTabLabel,
        ariaLabel: boardTabLabel,
        isActive: activeWorkspaceTabId === boardTab.id,
        inputSize: Math.max(boardTabLabel.length, 6),
        placeholder: `Board ${index + 1}`,
        isEditable: true,
      }
    }),
  ]

  const canDeleteActiveTab = !isCalendarTabActive && canDeleteBoard
  const deleteBoardButtonLabel = isCalendarTabActive
    ? 'Calendar tab is permanent'
    : canDeleteBoard
      ? `Delete ${activeBoardLabel}`
      : 'Create another board before deleting this one'

  const boardDeleteTargetSummary = boardDeleteTarget
    ? {
        title: boardDeleteTarget.board.title.trim(),
        cardCount: boardDeleteTarget.board.cards.length,
        strokeCount: boardDeleteTarget.board.strokes.length,
        connectorCount: boardDeleteTarget.board.connectors.length,
      }
    : null

  const themePresetOptions = APP_THEME_PRESETS.map((preset) => ({
    id: preset.id,
    label: preset.label,
    previewBackground:
      preset.id === CUSTOM_THEME_PRESET.id
        ? `linear-gradient(90deg, ${appSettings.sidebarColor} 0 30%, ${appSettings.backgroundColor} 30% 100%)`
        : `linear-gradient(90deg, ${preset.sidebarColor} 0 30%, ${preset.backgroundColor} 30% 100%)`,
    modeLabel:
      preset.id === MIDNIGHT_THEME_PRESET.id
        ? 'Midnight background'
        : preset.id === CUSTOM_THEME_PRESET.id
        ? 'Adjust colors'
        : 'Board preset',
    isActive: activeAppThemePreset.id === preset.id,
    onSelect: () => applyAppThemePreset(preset),
  }))

  const selectionMarquee = selectionRect ? (
    <div
      className="canvas-selection-marquee"
      style={{
        left: selectionRect.left,
        top: selectionRect.top,
        width: selectionRect.width,
        height: selectionRect.height,
      }}
    />
  ) : null

  const creationPreview = dragCreationPreviewStyle ? (
    <div className="canvas-create-preview" style={dragCreationPreviewStyle.style}>
      <span>{dragCreationPreviewStyle.label}</span>
    </div>
  ) : null

  const canvasViewportClassName = `canvas-viewport ${isCanvasHot ? 'is-hot' : ''} ${
    isSpacePressed ? 'is-pan-ready' : ''
  } ${isPanning ? 'is-panning' : ''} ${isDrawMode ? 'is-draw-ready' : ''} ${
    isConnectorMode ? 'is-connect-ready' : ''
  } ${isDrawingStroke ? 'is-drawing' : ''}`
  const boardContextMenuStyle = boardContextMenu
    ? {
        left:
          typeof window === 'undefined'
            ? boardContextMenu.clientX
            : Math.max(12, Math.min(boardContextMenu.clientX, window.innerWidth - 220)),
        top:
          typeof window === 'undefined'
            ? boardContextMenu.clientY
            : Math.max(12, Math.min(boardContextMenu.clientY, window.innerHeight - 140)),
      }
    : null
  const hasBoardContextMenuCopyAction =
    (boardContextMenu?.selectionCardIds.length ?? 0) > 0
  const hasBoardContextMenuPasteAction = hasCopiedBoardSelection

  return (
    <div className="app-shell" style={appThemeStyle}>
      <input
        ref={backupImportInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleBackupImportChange}
      />

      <WorkspaceSidebarPanel
        isDrawMode={isDrawMode}
        selectedCount={selectedCount}
        cropArmedImageId={cropArmedImageId}
        selectionSidebarMode={selectionSidebarMode}
        selectionSidebarView={selectionSidebarView}
        isSelectionSidebar={isSelectionSidebar}
        brandLabel={workspaceBrandLabel}
        isBrandInteractive={isBrandInteractive}
        drawPrimaryContent={drawModePrimaryTools.map(renderToolbarButton)}
        drawColorContent={
          drawModeColorTools.length ? drawModeColorTools.map(renderToolbarButton) : null
        }
        drawSizeContent={drawModeSizeTools.map(renderToolbarButton)}
        drawUtilityContent={drawModeUtilityTools.map(renderToolbarButton)}
        defaultSidebarPopout={isCalendarTabActive ? calendarSidebarPopout : null}
        defaultPrimaryContent={
          isCalendarTabActive
            ? calendarPrimaryTools.length
              ? calendarPrimaryTools.map(renderToolbarButton)
              : null
            : primaryTools.map(renderToolbarButton)
        }
        defaultSecondaryContent={
          isCalendarTabActive ? null : renderToolbarButton(uploadFileTool)
        }
        defaultUtilityContent={
          isCalendarTabActive
            ? calendarUtilityTools.map(renderToolbarButton)
            : utilityTools.map(renderToolbarButton)
        }
        drawColorInputRef={drawColorInputRef}
        drawColorHex={drawColorHex}
        imageInputRef={imageInputRef}
        documentInputRef={documentInputRef}
        onBrandClick={handleBrandClick}
        onDrawColorInputChange={handleDrawColorInputChange}
        onImageInputChange={handleImageInputChange}
        onDocumentInputChange={handleDocumentInputChange}
        connectorSelectionTools={connectorSelectionTools}
        strokeSelectionTools={strokeSelectionTools}
        selectedCard={selectedCard}
        selectedCardIds={selectedCardIds}
        selectedTableCard={selectedTableCard}
        selectedPaletteCard={selectedPaletteCard}
        selectedTextCard={selectedTextCard}
        activeSelectedTableCell={activeSelectedTableCell}
        activeSelectedTableCellRange={activeSelectedTableCellRange}
        activeSelectedTableCellFormat={activeSelectedTableCellFormat}
        isActiveSelectedTableCellRangeMulti={isActiveSelectedTableCellRangeMulti}
        usesDarkItems={appThemeState.usesDarkItems}
        noteTextToolbarState={noteTextToolbarState}
        renderToolbarButton={renderToolbarButton}
        setSelectionSidebarMode={setSelectionSidebarMode}
        setSelectionSidebarView={setSelectionSidebarView}
        duplicateSelectedCards={duplicateSelectedCards}
        removeCards={removeCards}
        openSelectedLink={openSelectedLink}
        toggleSelectedImageFit={toggleSelectedImageFit}
        toggleImageCropMode={toggleImageCropMode}
        activateActiveTableCellFormula={activateActiveTableCellFormula}
        toggleTableTitle={toggleTableTitle}
        addTableColumn={addTableColumn}
        addTableRow={addTableRow}
        applySelectedPalette={applySelectedPalette}
        applySelectedCardAccentColor={applySelectedCardAccentColor}
        applySelectedNoteBlockStyle={applySelectedNoteBlockStyle}
        applySelectedNoteCommand={applySelectedNoteCommand}
        applySelectedNoteTextColor={applySelectedNoteTextColor}
        applySelectedHeadingAccentColor={updateHeadingAccentColor}
        applySelectedHeadingAlignment={updateHeadingTextAlign}
        setActiveTableCellBlockStyle={setActiveTableCellBlockStyle}
        toggleActiveTableCellInlineStyle={toggleActiveTableCellInlineStyle}
        setActiveTableCellValueType={setActiveTableCellValueType}
        setActiveTableCellBackgroundColor={setActiveTableCellBackgroundColor}
        setActiveTableCellAlignment={setActiveTableCellAlignment}
      />

      <main className="workspace-stage">
        {!isCalendarTabActive ? (
          <WorkspaceCornerTools
            isSnapToGrid={isSnapToGrid}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            zoom={viewport.zoom}
            zoomPercentage={zoomPercentage}
            onToggleSnapToGrid={toggleSnapToGrid}
            onZoomChange={setZoomFromCornerControl}
            onResetZoom={resetZoom}
          />
        ) : null}
        <BoardTabs
          tabs={boardTabItems}
          canDelete={canDeleteActiveTab}
          deleteAriaLabel={deleteBoardButtonLabel}
          deleteTitle={deleteBoardButtonLabel}
          onCreate={createBoard}
          onDelete={openDeleteBoardWarning}
          onSelect={switchWorkspaceTab}
          onRename={(_, title) => {
            renameActiveBoard(title)
          }}
        />
        {isCalendarTabActive ? (
          <WorkspaceCalendarView
            calendar={calendar}
            usesDarkItems={appThemeState.usesDarkItems}
            onSelectDate={selectCalendarDate}
            onCloseDetails={closeCalendarDetails}
            onPreviousMonth={showPreviousCalendarMonth}
            onNextMonth={showNextCalendarMonth}
            onJumpToToday={jumpCalendarToToday}
            onUpdateEntry={updateCalendarEntry}
          />
        ) : (
          <CanvasViewportComponent
            canvasRef={canvasRef}
            drawCanvasRef={drawCanvasRef}
            className={canvasViewportClassName}
            worldStyle={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
              transformOrigin: '0 0',
            }}
            drawLayerActive={drawLayerActive}
            showEmptyState={!board.cards.length && !board.strokes.length}
            connectorLayer={connectorLayer}
            worldContent={board.cards.map(renderCard)}
            selectionMarquee={selectionMarquee}
            creationPreview={creationPreview}
            strokeSelectionOverlay={strokeSelectionOverlay}
            onPointerDownCapture={handleCanvasPointerDownCapture}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerLeave={handleCanvasPointerLeave}
            onDoubleClick={handleCanvasDoubleClick}
            onWheel={handleCanvasWheel}
            onDragEnter={handleCanvasDragEnter}
            onDragLeave={handleCanvasDragLeave}
            onDragOver={handleCanvasDragOver}
            onDrop={(event) => {
              void handleCanvasDrop(event)
            }}
            onDrawLayerPointerDown={beginDrawStroke}
          />
        )}
      </main>
      {boardContextMenu && boardContextMenuStyle ? (
        <div
          ref={boardContextMenuRef}
          className="workspace-context-menu"
          role="menu"
          style={boardContextMenuStyle}
          onPointerDown={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <button
            type="button"
            className="workspace-context-menu-button"
            disabled={!hasBoardContextMenuCopyAction}
            onClick={() =>
              copyCardsToClipboard(
                boardContextMenu.selectionCardIds,
                boardContextMenu.activeCardId,
              )
            }
          >
            Copy
          </button>
          <button
            type="button"
            className="workspace-context-menu-button"
            disabled={!hasBoardContextMenuPasteAction}
            onClick={() => pasteCopiedCardsToBoard(boardContextMenu.worldPoint)}
          >
            Paste
          </button>
        </div>
      ) : null}
      <DocumentPreviewModal
        documentCard={previewedDocumentCard}
        onClose={() => setDocumentPreviewCardId(null)}
      />
      <FileUploadWarningModal
        warning={fileUploadWarning}
        onClose={() => setFileUploadWarning(null)}
      />
      <DeleteBoardModal
        target={boardDeleteTargetSummary}
        onClose={closeDeleteBoardWarning}
        onConfirm={confirmDeleteBoard}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        activePresetLabel={activeAppThemePreset.label}
        themePresets={themePresetOptions}
        isCustomThemeSelected={isCustomThemeSelected}
        backgroundColor={appSettings.backgroundColor}
        sidebarColor={appSettings.sidebarColor}
        isMidnightTheme={appThemeState.isMidnightTheme}
        isAutoNightModeBoard={appThemeState.isAutoNightModeBoard}
        isAutoNightModeSidebar={appThemeState.isAutoNightModeSidebar}
        isNightMode={appThemeState.isNightMode}
        boardCount={boardTabs.length}
        onClose={closeSettings}
        onReset={resetAppSettings}
        onBackgroundColorChange={(color) =>
          updateAppSettings((current) => ({
            ...current,
            backgroundColor: color,
            themePresetId: CUSTOM_THEME_PRESET.id,
          }))
        }
        onSidebarColorChange={(color) =>
          updateAppSettings((current) => ({
            ...current,
            sidebarColor: color,
            themePresetId: CUSTOM_THEME_PRESET.id,
          }))
        }
        onNightModeChange={(nextValue) =>
          updateAppSettings((current) => ({
            ...current,
            isDarkMode: nextValue,
          }))
        }
        onDownloadBackup={downloadWorkspaceBackup}
        onUploadBackup={openBackupImportPicker}
      />
    </div>
  )
}

export default App


