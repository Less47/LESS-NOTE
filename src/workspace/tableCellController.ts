import type { PointerEvent as ReactPointerEvent } from 'react'

import type {
  NoteBlockStyle,
  TableCard,
  TableCellAlign,
  TableCellFormat,
  TableCellSelection,
  TableCellSelectionRange,
  TableCellValueType,
  WorkspaceMutationOptions,
} from './core'
import {
  TABLE_CELL_TYPE_OPTIONS,
  createTableCellSelection,
  getLegacyTableCellTextStyle,
  getTableCellCoordinateLabel,
  getTableCellSelectionLabel,
  getTableCellSelectionRange,
  isTableCellWithinSelectionRange,
  normalizeOptionalTableCellColor,
} from './core'

type TableCellControllerDependencies = {
  selectedCardIdsSet: ReadonlySet<string>
  selectedCardIds: string[]
  hasSelectedStroke: boolean
  hasSelectedConnector: boolean
  activeSelectedTableCell: TableCellSelection | null
  activeSelectedTableCellRange: TableCellSelectionRange | null
  selectedTableCard: TableCard | null
  isActiveSelectedTableCellRangeMulti: boolean
  beginCardSurfacePointerDown: (
    event: ReactPointerEvent<HTMLElement>,
    card: TableCard,
  ) => void
  setActiveTableCell: (selection: TableCellSelection | null) => void
  setStatusText: (text: string) => void
  focusCanvas: () => void
  revealCardSettingsForEditing: (cardId: string) => void
  updateTableCard: (
    cardId: string,
    recipe: (card: TableCard) => TableCard,
    options?: WorkspaceMutationOptions,
  ) => void
  updateTableCell: (
    cardId: string,
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) => void
  updateTableCellFormat: (
    cardId: string,
    rowIndex: number,
    columnIndex: number,
    recipe: (format: TableCellFormat) => TableCellFormat,
    options?: WorkspaceMutationOptions,
  ) => void
}

function createTableCellController({
  selectedCardIdsSet,
  selectedCardIds,
  hasSelectedStroke,
  hasSelectedConnector,
  activeSelectedTableCell,
  activeSelectedTableCellRange,
  selectedTableCard,
  isActiveSelectedTableCellRangeMulti,
  beginCardSurfacePointerDown,
  setActiveTableCell,
  setStatusText,
  focusCanvas,
  revealCardSettingsForEditing,
  updateTableCard,
  updateTableCell,
  updateTableCellFormat,
}: TableCellControllerDependencies) {
  const selectSingleTableCell = (cardId: string, rowIndex: number, columnIndex: number) => {
    setActiveTableCell(createTableCellSelection(cardId, rowIndex, columnIndex))
  }

  const selectTableCellRange = (
    cardId: string,
    rowIndex: number,
    columnIndex: number,
    anchorRowIndex: number,
    anchorColumnIndex: number,
  ) => {
    setActiveTableCell(
      createTableCellSelection(
        cardId,
        rowIndex,
        columnIndex,
        anchorRowIndex,
        anchorColumnIndex,
      ),
    )
  }

  const handleTableCellPointerDown = (
    event: ReactPointerEvent<HTMLInputElement>,
    card: TableCard,
    rowIndex: number,
    columnIndex: number,
  ) => {
    const isSelectedTable =
      selectedCardIdsSet.has(card.id) &&
      selectedCardIds.length === 1 &&
      !hasSelectedStroke &&
      !hasSelectedConnector

    if (!isSelectedTable) {
      beginCardSurfacePointerDown(event as unknown as ReactPointerEvent<HTMLElement>, card)
      setActiveTableCell(null)
      setStatusText('Table selected. Click a cell again to edit it.')
      return
    }

    if (event.shiftKey && activeSelectedTableCell?.cardId === card.id) {
      event.preventDefault()
      event.stopPropagation()
      focusCanvas()
      selectTableCellRange(
        card.id,
        rowIndex,
        columnIndex,
        activeSelectedTableCell.anchorRowIndex,
        activeSelectedTableCell.anchorColumnIndex,
      )
      const selectionLabel = getTableCellSelectionLabel(
        getTableCellSelectionRange(
          createTableCellSelection(
            card.id,
            rowIndex,
            columnIndex,
            activeSelectedTableCell.anchorRowIndex,
            activeSelectedTableCell.anchorColumnIndex,
          ),
        ),
      )
      setStatusText(`Selected cells ${selectionLabel}.`)
      return
    }

    event.stopPropagation()
    selectSingleTableCell(card.id, rowIndex, columnIndex)
  }

  const handleTableCellFocus = (card: TableCard, rowIndex: number, columnIndex: number) => {
    revealCardSettingsForEditing(card.id)
    selectSingleTableCell(card.id, rowIndex, columnIndex)
    setStatusText(`Editing cell ${getTableCellCoordinateLabel(rowIndex, columnIndex)}.`)
  }

  const handleTableTitlePointerDown = (
    event: ReactPointerEvent<HTMLInputElement>,
    card: TableCard,
  ) => {
    const isSelectedTable =
      selectedCardIdsSet.has(card.id) &&
      selectedCardIds.length === 1 &&
      !hasSelectedStroke &&
      !hasSelectedConnector

    if (!isSelectedTable) {
      beginCardSurfacePointerDown(event as unknown as ReactPointerEvent<HTMLElement>, card)
      setActiveTableCell(null)
      setStatusText('Table selected.')
      return
    }

    event.stopPropagation()
    setActiveTableCell(null)
  }

  const updateActiveTableCellFormatting = (
    recipe: (format: TableCellFormat) => TableCellFormat,
    statusText: string,
    historyGroupKey: string,
  ) => {
    if (!activeSelectedTableCell || !activeSelectedTableCellRange) {
      return
    }

    updateTableCard(
      activeSelectedTableCell.cardId,
      (card) => ({
        ...card,
        cellFormats: card.cellFormats.map((row, currentRowIndex) =>
          row.map((format, currentColumnIndex) => {
            if (
              !isTableCellWithinSelectionRange(
                currentRowIndex,
                currentColumnIndex,
                activeSelectedTableCellRange,
              )
            ) {
              return format
            }

            const nextFormat = recipe(format)

            return {
              ...nextFormat,
              backgroundColor: normalizeOptionalTableCellColor(nextFormat.backgroundColor),
              textStyle: getLegacyTableCellTextStyle(nextFormat.blockStyle, nextFormat.isBold),
            }
          }),
        ),
      }),
      {
        recordUndo: true,
        historyGroupKey,
      },
    )
    setStatusText(statusText)
  }

  const setActiveTableCellBlockStyle = (blockStyle: NoteBlockStyle) => {
    updateActiveTableCellFormatting(
      (format) => ({
        ...format,
        blockStyle,
      }),
      'Cell text style updated.',
      `table-cell-style:${activeSelectedTableCell?.cardId}:${activeSelectedTableCell?.rowIndex}:${activeSelectedTableCell?.columnIndex}`,
    )
  }

  const toggleActiveTableCellInlineStyle = (
    property: 'isBold' | 'isItalic' | 'isUnderline' | 'isStrikeThrough',
    statusText: string,
  ) => {
    updateActiveTableCellFormatting(
      (format) => {
        switch (property) {
          case 'isBold':
            return { ...format, isBold: !format.isBold }
          case 'isItalic':
            return { ...format, isItalic: !format.isItalic }
          case 'isUnderline':
            return { ...format, isUnderline: !format.isUnderline }
          case 'isStrikeThrough':
            return { ...format, isStrikeThrough: !format.isStrikeThrough }
        }
      },
      statusText,
      `table-cell-inline:${property}:${activeSelectedTableCell?.cardId}:${activeSelectedTableCell?.rowIndex}:${activeSelectedTableCell?.columnIndex}`,
    )
  }

  const setActiveTableCellValueType = (valueType: TableCellValueType) => {
    const optionLabel =
      TABLE_CELL_TYPE_OPTIONS.find((option) => option.id === valueType)?.label ?? 'Cell'

    updateActiveTableCellFormatting(
      (format) => ({
        ...format,
        valueType,
        align:
          valueType === 'checkbox'
            ? 'center'
            : valueType === 'number' || valueType === 'currency' || valueType === 'percentage'
            ? 'right'
            : valueType === 'text'
            ? 'left'
            : format.align,
      }),
      `${optionLabel} cell ready.`,
      `table-cell-type:${activeSelectedTableCell?.cardId}:${activeSelectedTableCell?.rowIndex}:${activeSelectedTableCell?.columnIndex}`,
    )
  }

  const setActiveTableCellBackgroundColor = (backgroundColor: string | null) => {
    updateActiveTableCellFormatting(
      (format) => ({
        ...format,
        tone: backgroundColor ? format.tone : 'default',
        backgroundColor,
      }),
      'Cell color updated.',
      `table-cell-color:${activeSelectedTableCell?.cardId}:${activeSelectedTableCell?.rowIndex}:${activeSelectedTableCell?.columnIndex}`,
    )
  }

  const setActiveTableCellAlignment = (align: TableCellAlign) => {
    updateActiveTableCellFormatting(
      (format) => ({
        ...format,
        align,
      }),
      'Cell alignment updated.',
      `table-cell-align:${activeSelectedTableCell?.cardId}:${activeSelectedTableCell?.rowIndex}:${activeSelectedTableCell?.columnIndex}`,
    )
  }

  const activateActiveTableCellFormula = () => {
    if (!activeSelectedTableCell || !selectedTableCard || isActiveSelectedTableCellRangeMulti) {
      return
    }

    const currentValue =
      selectedTableCard.cells[activeSelectedTableCell.rowIndex]?.[
        activeSelectedTableCell.columnIndex
      ] ?? ''

    if (!currentValue.startsWith('=')) {
      updateTableCell(
        activeSelectedTableCell.cardId,
        activeSelectedTableCell.rowIndex,
        activeSelectedTableCell.columnIndex,
        currentValue.length ? `=${currentValue}` : '=',
      )
    }

    updateTableCellFormat(
      activeSelectedTableCell.cardId,
      activeSelectedTableCell.rowIndex,
      activeSelectedTableCell.columnIndex,
      (format) => ({
        ...format,
        blockStyle: 'code',
        textStyle: 'code',
      }),
      {
        recordUndo: true,
        historyGroupKey: `table-cell-formula:${activeSelectedTableCell.cardId}:${activeSelectedTableCell.rowIndex}:${activeSelectedTableCell.columnIndex}`,
      },
    )
    setStatusText('Formula mode ready.')
  }

  return {
    handleTableCellPointerDown,
    handleTableCellFocus,
    handleTableTitlePointerDown,
    setActiveTableCellBlockStyle,
    toggleActiveTableCellInlineStyle,
    setActiveTableCellValueType,
    setActiveTableCellBackgroundColor,
    setActiveTableCellAlignment,
    activateActiveTableCellFormula,
  }
}

export { createTableCellController }
