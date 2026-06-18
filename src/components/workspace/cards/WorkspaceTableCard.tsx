import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'

import type {
  TableCard,
  TableCellSelection,
  TableCellSelectionRange,
} from '../../../workspace/core'
import {
  createDefaultTableCellFormat,
  getTableColumnLabel,
  getThemeTableCellBaseFillColor,
  getThemeTableCellFillColor,
  isTableCellWithinSelectionRange,
} from '../../../workspace/core'

type WorkspaceTableCardProps = {
  card: TableCard
  isSelected: boolean
  isConnectorMode: boolean
  activeCell: TableCellSelection | null
  activeRange: TableCellSelectionRange | null
  onTitleFocus: () => void
  onTitleChange: (title: string) => void
  onTitlePointerDown: (event: PointerEvent<HTMLInputElement>) => void
  onCellFocus: (rowIndex: number, columnIndex: number) => void
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void
  onCellPointerDown: (
    event: PointerEvent<HTMLInputElement>,
    rowIndex: number,
    columnIndex: number,
  ) => void
}

function WorkspaceTableCard({
  card,
  isSelected,
  isConnectorMode,
  activeCell,
  activeRange,
  onTitleFocus,
  onTitleChange,
  onTitlePointerDown,
  onCellFocus,
  onCellChange,
  onCellPointerDown,
}: WorkspaceTableCardProps) {
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const cellInputRefs = useRef(new Map<string, HTMLInputElement>())
  const pendingActivationRef = useRef<
    | {
        kind: 'title'
        wasSelected: boolean
      }
    | {
        kind: 'cell'
        rowIndex: number
        columnIndex: number
        wasSelected: boolean
        wasActive: boolean
        shiftKey: boolean
      }
    | null
  >(null)
  const [editingTarget, setEditingTarget] = useState<
    | {
        kind: 'title'
      }
    | {
        kind: 'cell'
        rowIndex: number
        columnIndex: number
      }
    | null
  >(null)
  const titleStyle = {
    background: getThemeTableCellBaseFillColor('header'),
  } as CSSProperties
  const isEditingTitle = editingTarget?.kind === 'title'
  const getCellKey = (rowIndex: number, columnIndex: number) => `${rowIndex}:${columnIndex}`

  useEffect(() => {
    if (isSelected && !isConnectorMode) {
      return
    }

    setEditingTarget(null)
  }, [isConnectorMode, isSelected])

  useEffect(() => {
    if (editingTarget?.kind !== 'cell') {
      return
    }

    const isEditingActiveCell =
      activeCell?.cardId === card.id &&
      activeCell.rowIndex === editingTarget.rowIndex &&
      activeCell.columnIndex === editingTarget.columnIndex

    if (isEditingActiveCell) {
      return
    }

    setEditingTarget(null)
  }, [activeCell, card.id, editingTarget])

  useEffect(() => {
    if (!editingTarget) {
      return
    }

    window.requestAnimationFrame(() => {
      if (editingTarget.kind === 'title') {
        const input = titleInputRef.current
        if (!input) {
          return
        }

        input.focus()
        const cursorPosition = input.value.length
        input.setSelectionRange(cursorPosition, cursorPosition)
        return
      }

      const input = cellInputRefs.current.get(
        getCellKey(editingTarget.rowIndex, editingTarget.columnIndex),
      )
      if (!input) {
        return
      }

      input.focus()
      const cursorPosition = input.value.length
      input.setSelectionRange(cursorPosition, cursorPosition)
    })
  }, [editingTarget])

  const getTableCellStyle = (rowIndex: number, columnIndex: number) => {
    const format =
      card.cellFormats[rowIndex]?.[columnIndex] ?? createDefaultTableCellFormat(rowIndex)
    const isActiveCell =
      activeCell?.cardId === card.id &&
      activeCell.rowIndex === rowIndex &&
      activeCell.columnIndex === columnIndex
    const isRangeCell =
      activeCell?.cardId === card.id &&
      activeRange !== null &&
      isTableCellWithinSelectionRange(rowIndex, columnIndex, activeRange)
    const baseBackground = getThemeTableCellFillColor(format)
    const background =
      isRangeCell && !isActiveCell
        ? `color-mix(in srgb, ${baseBackground} 88%, #8dcfc2 12%)`
        : baseBackground
    const fontWeight =
      format.blockStyle === 'heading' || format.type === 'header' || format.isBold ? 700 : 500
    const fontStyle = format.blockStyle === 'quote' || format.isItalic ? 'italic' : 'normal'
    const textDecorationLine = [
      format.isUnderline ? 'underline' : '',
      format.isStrikeThrough ? 'line-through' : '',
    ]
      .filter(Boolean)
      .join(' ')
    const fontSize =
      format.blockStyle === 'heading'
        ? '0.95rem'
        : format.blockStyle === 'quote'
        ? '0.87rem'
        : format.blockStyle === 'code'
        ? '0.83rem'
        : undefined

    return {
      textAlign: format.align,
      fontWeight,
      fontStyle,
      textDecorationLine: textDecorationLine || undefined,
      fontSize,
      fontFamily:
        format.blockStyle === 'code' ? 'Courier New, Courier, monospace' : undefined,
      letterSpacing: format.blockStyle === 'heading' ? '0.01em' : undefined,
      background,
      boxShadow: isActiveCell
        ? 'inset 0 0 0 1px rgba(141, 207, 194, 0.7)'
        : isRangeCell
        ? 'inset 0 0 0 1px rgba(141, 207, 194, 0.4)'
        : undefined,
    } as CSSProperties
  }

  const tableGridStyle = {
    gridTemplateColumns: `repeat(${card.columnCount}, minmax(0, 1fr))`,
  } as CSSProperties

  return (
    <>
      {card.showTitle ? (
        <input
          ref={titleInputRef}
          className={`table-title-input ${isEditingTitle ? 'is-editing' : 'is-preview-mode'}`}
          style={titleStyle}
          value={card.title}
          readOnly={isConnectorMode || !isEditingTitle}
          tabIndex={isConnectorMode ? -1 : isEditingTitle ? 0 : -1}
          onFocus={() => {
            if (!isEditingTitle) {
              return
            }

            onTitleFocus()
          }}
          onChange={(event) => onTitleChange(event.target.value)}
          onBlur={() => {
            setEditingTarget(null)
          }}
          onPointerDown={(event) => {
            pendingActivationRef.current = {
              kind: 'title',
              wasSelected: isSelected,
            }

            if (isEditingTitle) {
              event.stopPropagation()
            } else {
              event.preventDefault()
            }

            onTitlePointerDown(event)
          }}
          onClick={(event) => {
            const pendingActivation = pendingActivationRef.current
            if (
              isConnectorMode ||
              isEditingTitle ||
              !pendingActivation ||
              pendingActivation.kind !== 'title' ||
              !pendingActivation.wasSelected
            ) {
              return
            }

            event.preventDefault()
            event.stopPropagation()
            setEditingTarget({ kind: 'title' })
          }}
          placeholder="New Table"
        />
      ) : null}

      <div className="table-grid-wrap">
        <div className="table-grid" style={tableGridStyle}>
          {Array.from({ length: card.rowCount }, (_, rowIndex) => (
            <Fragment key={`row-${card.id}-${rowIndex}`}>
              {Array.from({ length: card.columnCount }, (_, columnIndex) => {
                const cellFormat =
                  card.cellFormats[rowIndex]?.[columnIndex] ??
                  createDefaultTableCellFormat(rowIndex)
                const isActiveCell =
                  activeCell?.cardId === card.id &&
                  activeCell.rowIndex === rowIndex &&
                  activeCell.columnIndex === columnIndex
                const isRangeCell =
                  activeCell?.cardId === card.id &&
                  activeRange !== null &&
                  isTableCellWithinSelectionRange(rowIndex, columnIndex, activeRange)
                const isEditingCell =
                  editingTarget?.kind === 'cell' &&
                  editingTarget.rowIndex === rowIndex &&
                  editingTarget.columnIndex === columnIndex
                const inputMode =
                  cellFormat.valueType === 'number' ||
                  cellFormat.valueType === 'currency' ||
                  cellFormat.valueType === 'percentage'
                    ? 'decimal'
                    : undefined

                return (
                  <input
                    key={`cell-${card.id}-${rowIndex}-${columnIndex}`}
                    className={`table-cell-input ${isActiveCell ? 'is-active-cell' : ''} ${
                      isRangeCell ? 'is-range-cell' : ''
                    } ${isEditingCell ? 'is-editing' : 'is-preview-mode'}`}
                    value={card.cells[rowIndex]?.[columnIndex] ?? ''}
                    style={getTableCellStyle(rowIndex, columnIndex)}
                    readOnly={isConnectorMode || !isEditingCell}
                    tabIndex={isConnectorMode ? -1 : isEditingCell ? 0 : -1}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    inputMode={inputMode}
                    aria-label={`Cell ${getTableColumnLabel(columnIndex)}${rowIndex + 1}`}
                    ref={(node) => {
                      const cellKey = getCellKey(rowIndex, columnIndex)
                      if (node) {
                        cellInputRefs.current.set(cellKey, node)
                      } else {
                        cellInputRefs.current.delete(cellKey)
                      }
                    }}
                    onFocus={() => {
                      if (!isEditingCell) {
                        return
                      }

                      onCellFocus(rowIndex, columnIndex)
                    }}
                    onChange={(event) => onCellChange(rowIndex, columnIndex, event.target.value)}
                    onBlur={() => {
                      if (!isEditingCell) {
                        return
                      }

                      setEditingTarget(null)
                    }}
                    onPointerDown={(event) => {
                      pendingActivationRef.current = {
                        kind: 'cell',
                        rowIndex,
                        columnIndex,
                        wasSelected: isSelected,
                        wasActive: isActiveCell,
                        shiftKey: event.shiftKey,
                      }

                      if (isEditingCell) {
                        event.stopPropagation()
                      } else {
                        event.preventDefault()
                      }

                      onCellPointerDown(event, rowIndex, columnIndex)
                    }}
                    onClick={(event) => {
                      const pendingActivation = pendingActivationRef.current
                      if (
                        isConnectorMode ||
                        isEditingCell ||
                        !pendingActivation ||
                        pendingActivation.kind !== 'cell' ||
                        pendingActivation.rowIndex !== rowIndex ||
                        pendingActivation.columnIndex !== columnIndex ||
                        !pendingActivation.wasSelected ||
                        !pendingActivation.wasActive ||
                        pendingActivation.shiftKey
                      ) {
                        return
                      }

                      event.preventDefault()
                      event.stopPropagation()
                      setEditingTarget({
                        kind: 'cell',
                        rowIndex,
                        columnIndex,
                      })
                    }}
                  />
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  )
}

export default WorkspaceTableCard
