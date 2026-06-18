import type {
  BoardState,
  CanvasPoint,
  ColumnCard,
  HeadingCard,
  LinkCard,
  NoteCard,
  SidebarCreateToolKind,
  TodoCard,
  WorkspaceMutationOptions,
} from './core'
import {
  COLUMN_HEIGHT,
  COLUMN_WIDTH,
  EMPTY_NOTE_HEIGHT,
  EMPTY_TODO_HEIGHT,
  GRID_SIZE,
  HEADING_HEIGHT,
  HEADING_WIDTH,
  LINK_HEIGHT,
  LINK_WIDTH,
  NOTE_WIDTH,
  TABLE_DEFAULT_COLUMNS,
  TABLE_DEFAULT_ROWS,
  TODO_WIDTH,
  createEmptyTableCells,
  createTodoItem,
  getDefaultNoteTextSettings,
  getNextPaletteId,
  getNextZIndex,
  getTableCardDimensions,
  normalizeColumnCards,
  normalizeTableCellFormats,
  resizeTableCard,
} from './core'

type ColumnDropTarget = {
  columnId: string
  insertionIndex: number
}

type CreateCardCreationControllerArgs = {
  getCurrentBoardState: () => BoardState
  getCenteredCardPosition: (point: CanvasPoint, width: number, height: number) => CanvasPoint
  getColumnDropTargetAtPoint: (point: CanvasPoint) => ColumnDropTarget | null
  getViewportCenterInWorld: () => CanvasPoint
  updateBoard: (
    recipe: (currentBoard: BoardState) => BoardState,
    options?: WorkspaceMutationOptions,
  ) => void
  setSelection: (cardIds: string[], activeId?: string | null) => void
  setStatusText: (text: string) => void
  setPendingTodoFocusId: (itemId: string) => void
  isSnapToGridEnabled: () => boolean
}

function createCardCreationController(args: CreateCardCreationControllerArgs) {
  const appendCard = (
    card: BoardState['cards'][number],
    statusText: string,
    columnTarget: ColumnDropTarget | null = null,
  ) => {
    args.updateBoard(
      (currentBoard) => {
        if (!columnTarget || card.kind === 'column') {
          return {
            ...currentBoard,
            cards: [...currentBoard.cards, card],
          }
        }

        const nextCards = currentBoard.cards.map((currentCard) => {
          if (
            currentCard.kind === 'column' ||
            currentCard.columnId !== columnTarget.columnId ||
            currentCard.columnIndex < columnTarget.insertionIndex
          ) {
            return currentCard
          }

          return {
            ...currentCard,
            columnIndex: currentCard.columnIndex + 1,
          }
        })

        return {
          ...currentBoard,
          cards: normalizeColumnCards([
            ...nextCards,
            {
              ...card,
              columnId: columnTarget.columnId,
              columnIndex: columnTarget.insertionIndex,
            },
          ]),
        }
      },
      {
        recordUndo: true,
      },
    )

    args.setSelection([card.id], card.id)
    args.setStatusText(statusText)
  }

  const addNoteAt = (point: CanvasPoint) => {
    const currentBoard = args.getCurrentBoardState()
    const palette = getNextPaletteId()
    const cardId = crypto.randomUUID()
    const columnTarget = args.getColumnDropTargetAtPoint(point)
    const position = args.getCenteredCardPosition(point, NOTE_WIDTH, EMPTY_NOTE_HEIGHT)

    const card: NoteCard = {
      id: cardId,
      kind: 'note',
      title: '',
      content: '',
      contentMode: 'rich',
      ...getDefaultNoteTextSettings(),
      palette,
      accentColor: null,
      columnId: null,
      columnIndex: 0,
      x: position.x,
      y: position.y,
      width: NOTE_WIDTH,
      height: EMPTY_NOTE_HEIGHT,
      zIndex: getNextZIndex(currentBoard.cards),
    }

    appendCard(card, columnTarget ? 'New note added to column.' : 'New note added.', columnTarget)
  }

  const addHeadingAt = (point: CanvasPoint) => {
    const currentBoard = args.getCurrentBoardState()
    const cardId = crypto.randomUUID()
    const columnTarget = args.getColumnDropTargetAtPoint(point)
    const position = args.getCenteredCardPosition(point, HEADING_WIDTH, HEADING_HEIGHT)

    const card: HeadingCard = {
      id: cardId,
      kind: 'heading',
      title: '',
      content: '',
      contentMode: 'rich',
      accentColor: null,
      ...getDefaultNoteTextSettings(),
      columnId: null,
      columnIndex: 0,
      x: position.x,
      y: position.y,
      width: HEADING_WIDTH,
      height: HEADING_HEIGHT,
      zIndex: getNextZIndex(currentBoard.cards),
    }

    appendCard(
      card,
      columnTarget ? 'Heading added to column.' : 'Heading added.',
      columnTarget,
    )
  }

  const addTodoAt = (point: CanvasPoint) => {
    const currentBoard = args.getCurrentBoardState()
    const cardId = crypto.randomUUID()
    const columnTarget = args.getColumnDropTargetAtPoint(point)
    const position = args.getCenteredCardPosition(point, TODO_WIDTH, EMPTY_TODO_HEIGHT)
    const firstItem = createTodoItem('')

    const card: TodoCard = {
      id: cardId,
      kind: 'todo',
      title: '',
      items: [firstItem],
      palette: getNextPaletteId(),
      accentColor: null,
      columnId: null,
      columnIndex: 0,
      x: position.x,
      y: position.y,
      width: TODO_WIDTH,
      height: EMPTY_TODO_HEIGHT,
      zIndex: getNextZIndex(currentBoard.cards),
    }

    args.setPendingTodoFocusId(firstItem.id)
    appendCard(card, columnTarget ? 'Checklist added to column.' : 'Checklist added.', columnTarget)
  }

  const addLinkAt = (point: CanvasPoint) => {
    const currentBoard = args.getCurrentBoardState()
    const cardId = crypto.randomUUID()
    const columnTarget = args.getColumnDropTargetAtPoint(point)
    const position = args.getCenteredCardPosition(point, LINK_WIDTH, LINK_HEIGHT)

    const card: LinkCard = {
      id: cardId,
      kind: 'link',
      title: '',
      palette: getNextPaletteId(),
      accentColor: null,
      columnId: null,
      columnIndex: 0,
      url: '',
      description: '',
      showNote: false,
      x: position.x,
      y: position.y,
      width: LINK_WIDTH,
      height: LINK_HEIGHT,
      zIndex: getNextZIndex(currentBoard.cards),
    }

    appendCard(card, columnTarget ? 'Link card added to column.' : 'Link card added.', columnTarget)
  }

  const addColumnAt = (point: CanvasPoint) => {
    const currentBoard = args.getCurrentBoardState()
    const cardId = crypto.randomUUID()
    const position = args.getCenteredCardPosition(point, COLUMN_WIDTH, COLUMN_HEIGHT)

    const card: ColumnCard = {
      id: cardId,
      kind: 'column',
      title: 'new column',
      palette: getNextPaletteId(),
      accentColor: null,
      x: position.x,
      y: position.y,
      width: COLUMN_WIDTH,
      height: COLUMN_HEIGHT,
      zIndex: getNextZIndex(currentBoard.cards),
    }

    appendCard(card, 'Column added.')
  }

  const addTableAt = (point: CanvasPoint) => {
    const currentBoard = args.getCurrentBoardState()
    const cardId = crypto.randomUUID()
    const tableDimensions = getTableCardDimensions(TABLE_DEFAULT_ROWS, TABLE_DEFAULT_COLUMNS)
    const position = args.getCenteredCardPosition(
      point,
      tableDimensions.width,
      tableDimensions.height,
    )

    const card = resizeTableCard(
      {
        id: cardId,
        kind: 'table',
        title: 'New Table',
        palette: getNextPaletteId(),
        accentColor: null,
        showTitle: false,
        columnId: null,
        columnIndex: 0,
        x: position.x,
        y: position.y,
        width: tableDimensions.width,
        height: tableDimensions.height,
        zIndex: getNextZIndex(currentBoard.cards),
        rowCount: TABLE_DEFAULT_ROWS,
        columnCount: TABLE_DEFAULT_COLUMNS,
        cells: createEmptyTableCells(TABLE_DEFAULT_ROWS, TABLE_DEFAULT_COLUMNS),
        cellFormats: normalizeTableCellFormats(
          null,
          TABLE_DEFAULT_ROWS,
          TABLE_DEFAULT_COLUMNS,
        ),
      },
      TABLE_DEFAULT_ROWS,
      TABLE_DEFAULT_COLUMNS,
    )

    appendCard(card, 'Table added.')
  }

  const getStackedCreationPoint = () => {
    const center = args.getViewportCenterInWorld()
    const offsetStep = args.isSnapToGridEnabled() ? GRID_SIZE : 8
    const offset = args.getCurrentBoardState().cards.length * offsetStep

    return {
      x: center.x + offset,
      y: center.y + offset,
    }
  }

  const addNote = () => addNoteAt(getStackedCreationPoint())
  const addHeading = () => addHeadingAt(getStackedCreationPoint())
  const addTodo = () => addTodoAt(getStackedCreationPoint())
  const addLink = () => addLinkAt(getStackedCreationPoint())
  const addColumn = () => addColumnAt(getStackedCreationPoint())
  const addTable = () => addTableAt(getStackedCreationPoint())

  const addSidebarCreateToolAt = (toolKind: SidebarCreateToolKind, point: CanvasPoint) => {
    switch (toolKind) {
      case 'heading':
        addHeadingAt(point)
        return
      case 'note':
        addNoteAt(point)
        return
      case 'todo':
        addTodoAt(point)
        return
      case 'link':
        addLinkAt(point)
        return
      case 'table':
        addTableAt(point)
        return
      case 'column':
        addColumnAt(point)
        return
    }
  }

  return {
    addColumn,
    addColumnAt,
    addHeading,
    addHeadingAt,
    addLink,
    addLinkAt,
    addNote,
    addNoteAt,
    addSidebarCreateToolAt,
    addTable,
    addTableAt,
    addTodo,
    addTodoAt,
  }
}

export { createCardCreationController }
