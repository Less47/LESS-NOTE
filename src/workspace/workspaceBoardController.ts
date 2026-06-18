import type {
  ChangeEvent,
  MutableRefObject,
} from 'react'

import type {
  AppSettings,
  BoardState,
  CanvasPoint,
  ImageCropPreview,
  InteractionState,
  SelectionRect,
  SelectionSidebarView,
  SidebarCreateToolKind,
  WorkspaceMutationOptions,
  WorkspaceSnapshot,
} from './core'
import {
  MAX_ZOOM,
  MIN_ZOOM,
  clamp,
  createBoardTab,
  createEmptyBoard,
  createWorkspaceBackupFile,
  getActiveBoardTab,
  getBoardCardLayouts,
  getWorkspaceBackupFilename,
  parseWorkspaceBackup,
} from './core'

type DragCreationPreview = {
  kind: SidebarCreateToolKind
  worldPoint: CanvasPoint
} | null

type CreateWorkspaceBoardControllerArgs = {
  interactionRef: MutableRefObject<InteractionState | null>
  historyGroupRef: MutableRefObject<{
    key: string
    expiresAt: number
  } | null>
  activeNoteEditorIdRef: MutableRefObject<string | null>
  savedNoteSelectionRef: MutableRefObject<Range | null>
  pendingTodoFocusIdRef: MutableRefObject<string | null>
  draftStrokeRef: MutableRefObject<import('./core').DrawStroke | null>
  workspaceRef: MutableRefObject<WorkspaceSnapshot>
  canvasRef: MutableRefObject<HTMLDivElement | null>
  backupImportInputRef: MutableRefObject<HTMLInputElement | null>
  activeBoardId: string
  activeTabId: string
  boardDeleteTargetId: string | null
  canDeleteBoard: boolean
  updateBoard: (
    recipe: (currentBoard: BoardState) => BoardState,
    options?: WorkspaceMutationOptions,
  ) => void
  updateViewport: (
    recipe: (currentViewport: import('./core').CanvasViewport) => import('./core').CanvasViewport,
    options?: WorkspaceMutationOptions,
  ) => void
  getCurrentBoardState: () => BoardState
  getCurrentBoardLayouts: (
    currentBoard?: BoardState,
  ) => ReturnType<typeof getBoardCardLayouts>
  getCurrentViewportState: () => import('./core').CanvasViewport
  appSettings: AppSettings
  isSnapToGrid: boolean
  setWorkspace: (workspace: WorkspaceSnapshot) => void
  setAppSettings: (settings: AppSettings) => void
  setIsSnapToGrid: (value: boolean) => void
  clearSelection: () => void
  focusCanvas: () => void
  releaseDrawPointerCapture: () => void
  redrawDrawCanvas: () => void
  setActiveTableCell: (selection: import('./core').TableCellSelection | null) => void
  setConnectorSourceCardId: (cardId: string | null) => void
  setConnectorPreviewPoint: (point: CanvasPoint | null) => void
  setConnectorHoverCardId: (cardId: string | null) => void
  setBoardDeleteTargetId: (boardId: string | null) => void
  setIsCanvasHot: (value: boolean) => void
  setDraggedCreationTool: (tool: SidebarCreateToolKind | null) => void
  setDragCreationPreview: (preview: DragCreationPreview) => void
  setSelectionSidebarView: (view: SelectionSidebarView) => void
  setDragColumnTargetId: (columnId: string | null) => void
  setSelectionRect: (rect: SelectionRect | null) => void
  setImageCropPreview: (preview: ImageCropPreview | null) => void
  setCropArmedImageId: (cardId: string | null) => void
  setCaptionEditingImageId: (cardId: string | null) => void
  setIsPanning: (value: boolean) => void
  setIsDrawingStroke: (value: boolean) => void
  setStatusText: (text: string) => void
  rememberWorkspaceForUndo: (options?: WorkspaceMutationOptions) => void
  closeSettings: () => void
}

function createWorkspaceBoardController(args: CreateWorkspaceBoardControllerArgs) {
  const getStrokeBounds = (stroke: BoardState['strokes'][number]) => {
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

    const strokePadding = Math.max(stroke.size / 2, 1)

    return {
      left: left - strokePadding,
      right: right + strokePadding,
      top: top - strokePadding,
      bottom: bottom + strokePadding,
    }
  }

  const resetBoardUiState = (options?: { focusCanvas?: boolean }) => {
    args.interactionRef.current = null
    args.historyGroupRef.current = null
    args.activeNoteEditorIdRef.current = null
    args.savedNoteSelectionRef.current = null
    args.pendingTodoFocusIdRef.current = null
    args.releaseDrawPointerCapture()
    args.draftStrokeRef.current = null
    args.clearSelection()
    args.setActiveTableCell(null)
    args.setConnectorSourceCardId(null)
    args.setConnectorPreviewPoint(null)
    args.setConnectorHoverCardId(null)
    args.setBoardDeleteTargetId(null)
    args.setIsCanvasHot(false)
    args.setDraggedCreationTool(null)
    args.setDragCreationPreview(null)
    args.setSelectionSidebarView('default')
    args.setDragColumnTargetId(null)
    args.setSelectionRect(null)
    args.setImageCropPreview(null)
    args.setCropArmedImageId(null)
    args.setCaptionEditingImageId(null)
    args.setIsPanning(false)
    args.setIsDrawingStroke(false)
    document.body.style.userSelect = ''

    if (options?.focusCanvas) {
      args.focusCanvas()
    }

    args.redrawDrawCanvas()
  }

  const downloadWorkspaceBackup = () => {
    const backupPayload = createWorkspaceBackupFile(
      args.workspaceRef.current,
      args.appSettings,
      args.isSnapToGrid,
    )
    const backupContents = JSON.stringify(backupPayload, null, 2)
    const backupFilename = getWorkspaceBackupFilename()

    const saveBackupInDesktopShell = async () => {
      if (
        typeof window === 'undefined' ||
        !('__TAURI_INTERNALS__' in window)
      ) {
        return false
      }

      try {
        const { invoke } = await import('@tauri-apps/api/core')
        const savedPath = await invoke<string | null>('save_workspace_backup', {
          filename: backupFilename,
          contents: backupContents,
        })

        if (savedPath === null) {
          args.setStatusText('Backup save cancelled.')
        } else {
          args.setStatusText('Backup saved.')
        }

        return true
      } catch {
        return false
      }
    }

    void (async () => {
      if (await saveBackupInDesktopShell()) {
        return
      }

      const backupBlob = new Blob([backupContents], {
        type: 'application/json',
      })
      const backupUrl = window.URL.createObjectURL(backupBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = backupUrl
      downloadLink.download = backupFilename
      document.body.append(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      window.setTimeout(() => {
        window.URL.revokeObjectURL(backupUrl)
      }, 0)
      args.setStatusText('Backup downloaded.')
    })()
  }

  const openBackupImportPicker = () => {
    if (!args.backupImportInputRef.current) {
      return
    }

    args.backupImportInputRef.current.value = ''
    args.backupImportInputRef.current.click()
  }

  const handleBackupImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const parsed = JSON.parse(await file.text()) as unknown
      const backup = parseWorkspaceBackup(parsed)

      if (!backup) {
        args.setStatusText('That file is not a valid LESS NOTE backup.')
        return
      }

      const nextWorkspace = backup.workspace
      args.rememberWorkspaceForUndo({ recordUndo: true })
      args.workspaceRef.current = nextWorkspace
      args.setWorkspace(nextWorkspace)
      if (backup.appSettings) {
        args.setAppSettings(backup.appSettings)
      }
      if (backup.snapToGrid !== null) {
        args.setIsSnapToGrid(backup.snapToGrid)
      }
      resetBoardUiState()
      args.closeSettings()
      const restoredAppearanceText =
        backup.appSettings || backup.snapToGrid !== null ? ' Appearance restored too.' : ''
      args.setStatusText(
        `Restored ${nextWorkspace.boards.length} ${
          nextWorkspace.boards.length === 1 ? 'board' : 'boards'
        } from backup.${restoredAppearanceText}`,
      )
    } catch {
      args.setStatusText('Backup file could not be read.')
    }
  }

  const switchBoardTab = (boardId: string) => {
    if (boardId === args.activeBoardId && boardId === args.activeTabId) {
      return
    }

    const nextWorkspace = {
      ...args.workspaceRef.current,
      activeBoardId: boardId,
      activeTabId: boardId,
    }

    args.workspaceRef.current = nextWorkspace
    args.setWorkspace(nextWorkspace)
    resetBoardUiState({ focusCanvas: true })
    args.setStatusText(
      `Switched to ${getActiveBoardTab(nextWorkspace).board.title.trim() || 'your board'}.`,
    )
  }

  const createBoard = () => {
    const nextBoardTitle = `Board ${args.workspaceRef.current.boards.length + 1}`
    const nextBoardTab = createBoardTab(createEmptyBoard(nextBoardTitle))
    const nextWorkspace = {
      ...args.workspaceRef.current,
      boards: [...args.workspaceRef.current.boards, nextBoardTab],
      activeBoardId: nextBoardTab.id,
      activeTabId: nextBoardTab.id,
    }

    args.rememberWorkspaceForUndo({ recordUndo: true })
    args.workspaceRef.current = nextWorkspace
    args.setWorkspace(nextWorkspace)
    resetBoardUiState({ focusCanvas: true })
    args.setStatusText(`${nextBoardTitle} created.`)
  }

  const renameActiveBoard = (title: string) => {
    args.updateBoard(
      (currentBoard) => ({
        ...currentBoard,
        title,
      }),
      {
        recordUndo: true,
        historyGroupKey: `board-title:${args.activeBoardId}`,
      },
    )
  }

  const openDeleteBoardWarning = () => {
    if (!args.canDeleteBoard) {
      args.setStatusText('Create another board before deleting this one.')
      return
    }

    args.setBoardDeleteTargetId(args.activeBoardId)
  }

  const closeDeleteBoardWarning = () => {
    args.setBoardDeleteTargetId(null)
  }

  const confirmDeleteBoard = () => {
    const targetBoardId = args.boardDeleteTargetId
    if (!targetBoardId) {
      return
    }

    const currentBoards = args.workspaceRef.current.boards
    if (currentBoards.length <= 1) {
      args.setBoardDeleteTargetId(null)
      args.setStatusText('Create another board before deleting this one.')
      return
    }

    const targetIndex = currentBoards.findIndex((boardTab) => boardTab.id === targetBoardId)
    if (targetIndex < 0) {
      args.setBoardDeleteTargetId(null)
      return
    }

    const targetBoardLabel = currentBoards[targetIndex].board.title.trim() || 'Untitled board'
    const remainingBoards = currentBoards.filter((boardTab) => boardTab.id !== targetBoardId)
    const nextActiveBoard =
      remainingBoards[Math.max(0, targetIndex - 1)] ?? remainingBoards[0] ?? null

    if (!nextActiveBoard) {
      args.setBoardDeleteTargetId(null)
      return
    }

    args.rememberWorkspaceForUndo({ recordUndo: true })

    const nextWorkspace = {
      ...args.workspaceRef.current,
      boards: remainingBoards,
      activeBoardId: nextActiveBoard.id,
      activeTabId: nextActiveBoard.id,
    }

    args.workspaceRef.current = nextWorkspace
    args.setWorkspace(nextWorkspace)
    resetBoardUiState({ focusCanvas: true })
    args.setStatusText(`${targetBoardLabel} deleted.`)
  }

  const zoomAroundClientPoint = (
    targetZoom: number,
    clientX: number,
    clientY: number,
    options?: WorkspaceMutationOptions,
  ) => {
    const rect = args.canvasRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }

    const nextZoom = clamp(targetZoom, MIN_ZOOM, MAX_ZOOM)
    const pointerX = clientX - rect.left
    const pointerY = clientY - rect.top

    args.updateViewport(
      (currentViewport) => {
        const worldX = (pointerX - currentViewport.x) / currentViewport.zoom
        const worldY = (pointerY - currentViewport.y) / currentViewport.zoom

        return {
          zoom: nextZoom,
          x: pointerX - worldX * nextZoom,
          y: pointerY - worldY * nextZoom,
        }
      },
      options,
    )
  }

  const resetZoom = () => {
    const rect = args.canvasRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }

    zoomAroundClientPoint(1, rect.left + rect.width / 2, rect.top + rect.height / 2, {
      recordUndo: true,
    })
    args.setStatusText('Zoom reset to 100%.')
  }

  const setZoomFromCornerControl = (targetZoom: number) => {
    const rect = args.canvasRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }

    zoomAroundClientPoint(targetZoom, rect.left + rect.width / 2, rect.top + rect.height / 2, {
      recordUndo: true,
      historyGroupKey: 'slider-zoom',
    })
  }

  const fitBoard = () => {
    const rect = args.canvasRef.current?.getBoundingClientRect()
    const currentBoard = args.getCurrentBoardState()
    const currentCards = currentBoard.cards
    const currentStrokes = currentBoard.strokes
    const currentLayouts = args.getCurrentBoardLayouts({ ...currentBoard, cards: currentCards })
    if (!rect) {
      return
    }

    if (!currentCards.length && !currentStrokes.length) {
      args.updateViewport(
        () => ({
          x: rect.width / 2,
          y: rect.height / 2,
          zoom: 1,
        }),
        {
          recordUndo: true,
        },
      )
      return
    }

    const cardBounds = currentCards.map((card) => {
      const layout = currentLayouts.layouts.get(card.id)
      return {
        left: layout?.x ?? card.x,
        top: layout?.y ?? card.y,
        right: (layout?.x ?? card.x) + (layout?.width ?? card.width),
        bottom: (layout?.y ?? card.y) + (layout?.height ?? card.height),
      }
    })
    const strokeBounds = currentStrokes
      .map((stroke) => getStrokeBounds(stroke))
      .filter(
        (
          bounds,
        ): bounds is {
          left: number
          right: number
          top: number
          bottom: number
        } => bounds !== null,
      )
    const contentBounds = [...cardBounds, ...strokeBounds]

    if (!contentBounds.length) {
      return
    }

    const left = Math.min(...contentBounds.map((bounds) => bounds.left))
    const top = Math.min(...contentBounds.map((bounds) => bounds.top))
    const right = Math.max(...contentBounds.map((bounds) => bounds.right))
    const bottom = Math.max(...contentBounds.map((bounds) => bounds.bottom))
    const width = Math.max(right - left, 100)
    const height = Math.max(bottom - top, 100)
    const horizontalPadding = clamp(rect.width * 0.08, 48, 140)
    const verticalPadding = clamp(rect.height * 0.08, 48, 140)
    const availableWidth = Math.max(rect.width - horizontalPadding * 2, 1)
    const availableHeight = Math.max(rect.height - verticalPadding * 2, 1)
    const nextZoom = clamp(
      Math.min(availableWidth / width, availableHeight / height),
      MIN_ZOOM,
      MAX_ZOOM,
    )

    args.updateViewport(
      () => ({
        zoom: nextZoom,
        x: rect.width / 2 - (left + width / 2) * nextZoom,
        y: rect.height / 2 - (top + height / 2) * nextZoom,
      }),
      {
        recordUndo: true,
      },
    )

    args.setStatusText('Board fit to contents.')
  }

  return {
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
  }
}

export { createWorkspaceBoardController }
