import type {
  BoardCard,
  TableCard,
  TableCellFormat,
  TodoItem,
  WorkspaceMutationOptions,
} from './core'
import {
  TABLE_MAX_COLUMNS,
  TABLE_MAX_ROWS,
  clamp,
  createDefaultTableCellFormat,
  createTodoItem,
  resizeTableCard,
} from './core'

type CreateCardMutationControllerArgs = {
  updateCard: (
    cardId: string,
    recipe: (card: BoardCard) => BoardCard,
    options?: WorkspaceMutationOptions,
  ) => void
  updateNoteContent: (
    cardId: string,
    html: string,
    options?: WorkspaceMutationOptions,
  ) => void
  setPendingTodoFocusId: (itemId: string | null) => void
  setStatusText: (text: string) => void
}

function createCardMutationController(args: CreateCardMutationControllerArgs) {
  const updateImageCaption = (cardId: string, caption: string) => {
    args.updateCard(
      cardId,
      (currentCard) =>
        currentCard.kind === 'image'
          ? {
              ...currentCard,
              caption,
            }
          : currentCard,
      {
        recordUndo: true,
        historyGroupKey: `image-caption:${cardId}`,
      },
    )
  }

  const updateTodoItems = (
    cardId: string,
    recipe: (items: TodoItem[]) => TodoItem[],
    options?: WorkspaceMutationOptions,
  ) => {
    args.updateCard(
      cardId,
      (card) =>
        card.kind === 'todo'
          ? {
              ...card,
              items: recipe(card.items),
            }
          : card,
      options,
    )
  }

  const updateTableCell = (
    cardId: string,
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) => {
    args.updateCard(
      cardId,
      (card) => {
        if (card.kind !== 'table') {
          return card
        }

        const nextCells = card.cells.map((row, currentRowIndex) =>
          currentRowIndex === rowIndex
            ? row.map((cell, currentColumnIndex) =>
                currentColumnIndex === columnIndex ? value : cell,
              )
            : row,
        )

        return {
          ...card,
          cells: nextCells,
        }
      },
      {
        recordUndo: true,
        historyGroupKey: `table-cell:${cardId}:${rowIndex}:${columnIndex}`,
      },
    )
  }

  const updateTableCellFormat = (
    cardId: string,
    rowIndex: number,
    columnIndex: number,
    recipe: (format: TableCellFormat) => TableCellFormat,
    options?: WorkspaceMutationOptions,
  ) => {
    args.updateCard(
      cardId,
      (card) => {
        if (card.kind !== 'table') {
          return card
        }

        const nextFormats = card.cellFormats.map((row, currentRowIndex) =>
          currentRowIndex === rowIndex
            ? row.map((format, currentColumnIndex) =>
                currentColumnIndex === columnIndex ? recipe(format) : format,
              )
            : row,
        )

        return {
          ...card,
          cellFormats: nextFormats,
        }
      },
      options,
    )
  }

  const updateTableCard = (
    cardId: string,
    recipe: (card: TableCard) => TableCard,
    options?: WorkspaceMutationOptions,
  ) => {
    args.updateCard(
      cardId,
      (card) => (card.kind === 'table' ? recipe(card) : card),
      options,
    )
  }

  const updateTableTitle = (cardId: string, title: string) => {
    updateTableCard(
      cardId,
      (card) => ({
        ...card,
        title,
      }),
      {
        recordUndo: true,
        historyGroupKey: `table-title:${cardId}`,
      },
    )
  }

  const toggleTableTitle = (cardId: string) => {
    updateTableCard(
      cardId,
      (card) =>
        resizeTableCard(
          {
            ...card,
            showTitle: !card.showTitle,
            title: card.title.trim().length ? card.title : 'New Table',
          },
          card.rowCount,
          card.columnCount,
          {
            previousShowTitle: card.showTitle,
          },
        ),
      {
        recordUndo: true,
      },
    )

    args.setStatusText('Table title updated.')
  }

  const addTableColumn = (cardId: string, insertionIndex?: number) => {
    updateTableCard(
      cardId,
      (card) => {
        if (card.columnCount >= TABLE_MAX_COLUMNS) {
          return card
        }

        const nextIndex =
          typeof insertionIndex === 'number'
            ? clamp(insertionIndex, 0, card.columnCount)
            : card.columnCount
        const nextCells = card.cells.map((row) => {
          const nextRow = [...row]
          nextRow.splice(nextIndex, 0, '')
          return nextRow
        })
        const nextFormats = card.cellFormats.map((row, rowIndex) => {
          const nextRow = [...row]
          nextRow.splice(nextIndex, 0, createDefaultTableCellFormat(rowIndex))
          return nextRow
        })

        return resizeTableCard(
          {
            ...card,
            cells: nextCells,
            cellFormats: nextFormats,
          },
          card.rowCount,
          card.columnCount + 1,
        )
      },
      {
        recordUndo: true,
      },
    )

    args.setStatusText('Column added.')
  }

  const addTableRow = (cardId: string, insertionIndex?: number) => {
    updateTableCard(
      cardId,
      (card) => {
        if (card.rowCount >= TABLE_MAX_ROWS) {
          return card
        }

        const nextIndex =
          typeof insertionIndex === 'number'
            ? clamp(insertionIndex, 0, card.rowCount)
            : card.rowCount
        const nextCells = [...card.cells]
        nextCells.splice(nextIndex, 0, Array.from({ length: card.columnCount }, () => ''))
        const nextFormats = [...card.cellFormats]
        nextFormats.splice(
          nextIndex,
          0,
          Array.from({ length: card.columnCount }, () =>
            createDefaultTableCellFormat(nextIndex),
          ),
        )

        return resizeTableCard(
          {
            ...card,
            cells: nextCells,
            cellFormats: nextFormats,
          },
          card.rowCount + 1,
          card.columnCount,
        )
      },
      {
        recordUndo: true,
      },
    )

    args.setStatusText('Row added.')
  }

  const insertTodoItemAfter = (cardId: string, itemId: string) => {
    const nextItem = createTodoItem('')
    args.setPendingTodoFocusId(nextItem.id)

    updateTodoItems(
      cardId,
      (items) => {
        const index = items.findIndex((item) => item.id === itemId)
        if (index === -1) {
          return items
        }

        const nextItems = [...items]
        nextItems.splice(index + 1, 0, nextItem)
        return nextItems
      },
      {
        recordUndo: true,
      },
    )
  }

  const updateTodoItem = (
    cardId: string,
    itemId: string,
    recipe: (item: TodoItem) => TodoItem,
    options?: WorkspaceMutationOptions,
  ) => {
    updateTodoItems(
      cardId,
      (items) => items.map((item) => (item.id === itemId ? recipe(item) : item)),
      options,
    )
  }

  const removeTodoItem = (cardId: string, itemId: string) => {
    updateTodoItems(
      cardId,
      (items) => {
        if (items.length === 1) {
          return [createTodoItem('')]
        }

        return items.filter((item) => item.id !== itemId)
      },
      {
        recordUndo: true,
      },
    )
  }

  const handleTodoItemToggle = (cardId: string, itemId: string) => {
    updateTodoItem(
      cardId,
      itemId,
      (currentItem) => ({
        ...currentItem,
        done: !currentItem.done,
      }),
      {
        recordUndo: true,
      },
    )
  }

  const handleTodoItemTextChange = (cardId: string, itemId: string, text: string) => {
    updateTodoItem(
      cardId,
      itemId,
      (currentItem) => ({
        ...currentItem,
        text,
      }),
      {
        recordUndo: true,
        historyGroupKey: `todo-item:${cardId}:${itemId}`,
      },
    )
  }

  const handleNoteContentChange = (cardId: string, html: string) => {
    args.updateNoteContent(cardId, html, {
      recordUndo: true,
      historyGroupKey: `note-content:${cardId}`,
    })
  }

  const handleTodoItemRemove = (
    cardId: string,
    itemId: string,
    fallbackItemId: string | null,
  ) => {
    args.setPendingTodoFocusId(fallbackItemId)
    removeTodoItem(cardId, itemId)
  }

  const updateLinkCardUrl = (cardId: string, url: string) => {
    args.updateCard(
      cardId,
      (currentCard) =>
        currentCard.kind === 'link' ? { ...currentCard, url } : currentCard,
      {
        recordUndo: true,
        historyGroupKey: `link-url:${cardId}`,
      },
    )
  }

  const updateColumnCardTitle = (cardId: string, title: string) => {
    args.updateCard(
      cardId,
      (currentCard) =>
        currentCard.kind === 'column' ? { ...currentCard, title } : currentCard,
      {
        recordUndo: true,
        historyGroupKey: `column-title:${cardId}`,
      },
    )
  }

  return {
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
  }
}

export { createCardMutationController }
