import type { Dispatch, ReactNode, SetStateAction } from 'react'

import NoteTextToolIcon from './NoteTextToolIcon'
import type {
  BoardCard,
  NoteBlockStyle,
  NotePaletteId,
  NoteTextAlign,
  NoteTextToolbarState,
  RichTextCard,
  SelectionSidebarView,
  TableCard,
  TableCellAlign,
  TableCellFormat,
  TableCellSelection,
  TableCellSelectionRange,
  TableCellValueType,
  ToolbarTool,
} from '../../workspace/core'
import {
  TABLE_CELL_TYPE_OPTIONS,
  getDefaultTableCellFillColor,
  getNotePaletteMap,
  getNotePalettes,
  getTableCellCoordinateLabel,
  getTableCellColorSwatches,
  getThemeTableCellBaseFillColor,
  getThemeTableCellFillColor,
  getTableCellSelectionLabel,
  normalizeHexColor,
} from '../../workspace/core'

type RenderToolbarButton = (tool: ToolbarTool) => ReactNode

const LIGHT_NOTE_TEXT_COLOR_SWATCHES = [
  { id: 'default', label: 'Default', color: null },
  { id: 'ink', label: 'Ink', color: '#1d2d28' },
  { id: 'teal', label: 'Teal', color: '#176a8e' },
  { id: 'moss', label: 'Moss', color: '#40693b' },
  { id: 'clay', label: 'Clay', color: '#a4631b' },
  { id: 'rose', label: 'Rose', color: '#9b4a55' },
] as const

const DARK_NOTE_TEXT_COLOR_SWATCHES = [
  { id: 'default', label: 'Default', color: null },
  { id: 'paper', label: 'Paper', color: '#f5eee4' },
  { id: 'sky', label: 'Sky', color: '#8ed8f8' },
  { id: 'mint', label: 'Mint', color: '#9ed7a5' },
  { id: 'peach', label: 'Peach', color: '#f2c48d' },
  { id: 'blush', label: 'Blush', color: '#f0a7b8' },
] as const

function isLightDefaultTextColor(color: string | null) {
  const normalized = normalizeHexColor(color, '')
  const match = /^#([0-9a-f]{6})$/i.exec(normalized)
  if (!match) {
    return false
  }

  const red = Number.parseInt(match[1].slice(0, 2), 16)
  const green = Number.parseInt(match[1].slice(2, 4), 16)
  const blue = Number.parseInt(match[1].slice(4, 6), 16)
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255

  return luminance > 0.72
}

const LIGHT_ACCENT_SWATCHES = [
  { id: 'default', label: 'Default', color: null },
  { id: 'teal', label: 'Teal', color: '#176a8e' },
  { id: 'moss', label: 'Moss', color: '#40693b' },
  { id: 'clay', label: 'Clay', color: '#a4631b' },
  { id: 'rose', label: 'Rose', color: '#9b4a55' },
  { id: 'slate', label: 'Slate', color: '#4a5953' },
] as const

const DARK_ACCENT_SWATCHES = [
  { id: 'default', label: 'Default', color: null },
  { id: 'sky', label: 'Sky', color: '#8ed8f8' },
  { id: 'mint', label: 'Mint', color: '#9ed7a5' },
  { id: 'amber', label: 'Amber', color: '#f2c48d' },
  { id: 'blush', label: 'Blush', color: '#f0a7b8' },
  { id: 'paper', label: 'Paper', color: '#f5eee4' },
] as const

type SelectionPaletteCard = {
  id: string
  kind: 'note' | 'todo' | 'link' | 'column'
  palette: NotePaletteId
  accentColor: string | null
} | null

type NoteCommandOptions = {
  historyGroupKey?: string
  statusText?: string
}

type WorkspaceSelectionInspectorProps = {
  connectorSelectionTools: ToolbarTool[] | null
  strokeSelectionTools: ToolbarTool[] | null
  selectedCount: number
  selectedCard: BoardCard | null
  selectedCardIds: string[]
  selectedTableCard: TableCard | null
  selectedPaletteCard: SelectionPaletteCard
  selectedTextCard: RichTextCard | null
  activeSelectedTableCell: TableCellSelection | null
  activeSelectedTableCellFormat: TableCellFormat | null
  selectionSidebarMode: 'card' | 'text'
  selectionSidebarView: SelectionSidebarView
  cropArmedImageId: string | null
  isActiveSelectedTableCellRangeMulti: boolean
  usesDarkItems: boolean
  noteTextToolbarState: NoteTextToolbarState
  renderToolbarButton: RenderToolbarButton
  setSelectionSidebarMode: Dispatch<SetStateAction<'card' | 'text'>>
  setSelectionSidebarView: Dispatch<SetStateAction<SelectionSidebarView>>
  duplicateSelectedCards: () => void
  removeCards: (cardIds: string[]) => void
  openSelectedLink: () => void
  toggleSelectedImageFit: () => void
  toggleImageCropMode: (cardId: string) => void
  activateActiveTableCellFormula: () => void
  toggleTableTitle: (cardId: string) => void
  addTableColumn: (cardId: string, insertIndex?: number) => void
  addTableRow: (cardId: string, insertIndex?: number) => void
  applySelectedNoteBlockStyle: (
    nextStyle: NoteBlockStyle,
    options?: NoteCommandOptions,
  ) => void
  applySelectedNoteCommand: (
    command: string,
    value?: string,
    options?: NoteCommandOptions,
  ) => void
}

type WorkspaceSelectionPopoutProps = {
  selectedCard: BoardCard | null
  selectedTableCard: TableCard | null
  selectedPaletteCard: SelectionPaletteCard
  selectedTextCard: RichTextCard | null
  selectionSidebarMode: 'card' | 'text'
  selectionSidebarView: SelectionSidebarView
  activeSelectedTableCell: TableCellSelection | null
  activeSelectedTableCellRange: TableCellSelectionRange | null
  activeSelectedTableCellFormat: TableCellFormat | null
  isActiveSelectedTableCellRangeMulti: boolean
  usesDarkItems: boolean
  noteTextToolbarState: NoteTextToolbarState
  renderToolbarButton: RenderToolbarButton
  setSelectionSidebarView: Dispatch<SetStateAction<SelectionSidebarView>>
  applySelectedPalette: (paletteId: NotePaletteId) => void
  applySelectedCardAccentColor: (cardId: string, accentColor: string | null) => void
  applySelectedNoteBlockStyle: (
    nextStyle: NoteBlockStyle,
    options?: NoteCommandOptions,
  ) => void
  applySelectedNoteTextColor: (color: string | null, options?: NoteCommandOptions) => void
  applySelectedHeadingAccentColor: (cardId: string, accentColor: string | null) => void
  applySelectedHeadingAlignment: (cardId: string, align: NoteTextAlign) => void
  setActiveTableCellBlockStyle: (blockStyle: NoteBlockStyle) => void
  toggleActiveTableCellInlineStyle: (
    property: 'isBold' | 'isItalic' | 'isUnderline' | 'isStrikeThrough',
    statusText: string,
  ) => void
  setActiveTableCellValueType: (valueType: TableCellValueType) => void
  setActiveTableCellBackgroundColor: (backgroundColor: string | null) => void
  setActiveTableCellAlignment: (align: TableCellAlign) => void
}

function WorkspaceSelectionInspector({
  connectorSelectionTools,
  strokeSelectionTools,
  selectedCount,
  selectedCard,
  selectedCardIds,
  selectedTableCard,
  selectedPaletteCard,
  selectedTextCard,
  activeSelectedTableCell,
  activeSelectedTableCellFormat,
  selectionSidebarMode,
  selectionSidebarView,
  cropArmedImageId,
  isActiveSelectedTableCellRangeMulti,
  usesDarkItems,
  noteTextToolbarState,
  renderToolbarButton,
  setSelectionSidebarMode,
  setSelectionSidebarView,
  duplicateSelectedCards,
  removeCards,
  openSelectedLink,
  toggleSelectedImageFit,
  toggleImageCropMode,
  activateActiveTableCellFormula,
  toggleTableTitle,
  addTableColumn,
  addTableRow,
  applySelectedNoteBlockStyle,
  applySelectedNoteCommand,
}: WorkspaceSelectionInspectorProps) {
  if (connectorSelectionTools) {
    return (
      <div className="tool-sidebar-mode">
        <div className="tool-stack">{connectorSelectionTools.map(renderToolbarButton)}</div>
      </div>
    )
  }

  if (strokeSelectionTools) {
    const strokeColorTools = strokeSelectionTools.filter((tool) =>
      tool.id.startsWith('stroke-color-'),
    )
    const strokeActionTools = strokeSelectionTools.filter((tool) => tool.id === 'stroke-delete')

    return (
      <div className="tool-sidebar-mode">
        {strokeColorTools.length ? (
          <div className="tool-stack">{strokeColorTools.map(renderToolbarButton)}</div>
        ) : null}
        {strokeActionTools.length ? <div className="tool-divider" /> : null}
        {strokeActionTools.length ? (
          <div className="tool-stack">{strokeActionTools.map(renderToolbarButton)}</div>
        ) : null}
      </div>
    )
  }

  if (selectedCount > 1) {
    const multiSelectionTools: ToolbarTool[] = [
      {
        id: 'multi-duplicate',
        label: 'Duplicate',
        icon: 'duplicate',
        onClick: duplicateSelectedCards,
      },
      {
        id: 'multi-delete',
        label: 'Delete',
        icon: 'delete',
        onClick: () => removeCards(selectedCardIds),
        tone: 'danger',
      },
    ]

    return (
      <div className="tool-sidebar-mode">
        <div className="tool-stack">{multiSelectionTools.map(renderToolbarButton)}</div>
      </div>
    )
  }

  if (!selectedCard) {
    return <div className="tool-sidebar-mode" />
  }

  if (selectionSidebarMode === 'text' && selectedTextCard) {
    const textEditingTools: ToolbarTool[] = [
      {
        id: 'text-edit-back',
        label: 'Back',
        icon: 'back',
        onClick: () => {
          setSelectionSidebarMode('card')
          setSelectionSidebarView('default')
        },
      },
      {
        id: 'text-edit-style',
        label: 'Text style',
        icon: 'style',
        onClick: () =>
          setSelectionSidebarView((current) =>
            current === 'note-text' ? 'default' : 'note-text',
          ),
        active: selectionSidebarView === 'note-text',
      },
    ]
    const textEditingActions: Array<{
      id: string
      label: string
      icon: 'bold' | 'italic' | 'underline' | 'strike' | 'bullet-list' | 'numbered-list' | 'code'
      active?: boolean
      onClick: () => void
    }> = [
      {
        id: 'text-edit-bold',
        label: 'Bold',
        icon: 'bold',
        active: noteTextToolbarState.isBold,
        onClick: () =>
          applySelectedNoteCommand('bold', undefined, {
            historyGroupKey: 'note-format-inline',
          }),
      },
      {
        id: 'text-edit-italic',
        label: 'Italic',
        icon: 'italic',
        active: noteTextToolbarState.isItalic,
        onClick: () =>
          applySelectedNoteCommand('italic', undefined, {
            historyGroupKey: 'note-format-inline',
          }),
      },
      {
        id: 'text-edit-strike',
        label: 'Strike',
        icon: 'strike',
        active: noteTextToolbarState.isStrikeThrough,
        onClick: () =>
          applySelectedNoteCommand('strikeThrough', undefined, {
            historyGroupKey: 'note-format-inline',
          }),
      },
      {
        id: 'text-edit-underline',
        label: 'Underline',
        icon: 'underline',
        active: noteTextToolbarState.isUnderline,
        onClick: () =>
          applySelectedNoteCommand('underline', undefined, {
            historyGroupKey: 'note-format-inline',
          }),
      },
      {
        id: 'text-edit-bullets',
        label: 'Bullets',
        icon: 'bullet-list',
        active: noteTextToolbarState.isBulletList,
        onClick: () =>
          applySelectedNoteCommand('insertUnorderedList', undefined, {
            historyGroupKey: 'note-format-list',
            statusText: 'Text list updated.',
          }),
      },
      {
        id: 'text-edit-numbers',
        label: 'Numbers',
        icon: 'numbered-list',
        active: noteTextToolbarState.isNumberedList,
        onClick: () =>
          applySelectedNoteCommand('insertOrderedList', undefined, {
            historyGroupKey: 'note-format-list',
            statusText: 'Text list updated.',
          }),
      },
      {
        id: 'text-edit-code',
        label: 'Code',
        icon: 'code',
        active: noteTextToolbarState.blockStyle === 'code',
        onClick: () =>
          applySelectedNoteBlockStyle('code', {
            historyGroupKey: 'note-format-block',
          }),
      },
    ]

    return (
      <div className="tool-sidebar-mode">
        <div className="tool-stack">{textEditingTools.map(renderToolbarButton)}</div>
        <div className="tool-divider" />
        <div className="text-sidebar-action-list" aria-label="Text editing controls">
          {textEditingActions.map((actionButton) => (
            <button
              key={actionButton.id}
              type="button"
              className={`text-sidebar-action ${actionButton.active ? 'is-active' : ''}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={actionButton.onClick}
              aria-label={actionButton.label}
              title={actionButton.label}
            >
              <span className="text-sidebar-action-icon">
                <NoteTextToolIcon name={actionButton.icon} />
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (selectedTableCard) {
    const activeTableCellColor = activeSelectedTableCellFormat
      ? getThemeTableCellFillColor(activeSelectedTableCellFormat)
      : getThemeTableCellBaseFillColor('header')
    const tableCellTools: ToolbarTool[] = activeSelectedTableCell
      ? [
          {
            id: 'table-cell-style',
            label: 'Text style',
            icon: 'style',
            onClick: () =>
              setSelectionSidebarView((current) =>
                current === 'table-cell-style' ? 'default' : 'table-cell-style',
              ),
            active: selectionSidebarView === 'table-cell-style',
          },
          {
            id: 'table-cell-type',
            label: 'Cell type',
            icon: 'cell-type',
            onClick: () =>
              setSelectionSidebarView((current) =>
                current === 'table-cell-type' ? 'default' : 'table-cell-type',
              ),
            active: selectionSidebarView === 'table-cell-type',
          },
          {
            id: 'table-cell-color',
            label: 'Cell color',
            icon: 'swatch',
            onClick: () =>
              setSelectionSidebarView((current) =>
                current === 'table-cell-color' ? 'default' : 'table-cell-color',
              ),
            active: selectionSidebarView === 'table-cell-color',
            iconColor: activeTableCellColor,
          },
          {
            id: 'table-cell-formula',
            label: 'Formula',
            icon: 'formula',
            onClick: activateActiveTableCellFormula,
            active: activeSelectedTableCellFormat?.blockStyle === 'code',
            disabled: isActiveSelectedTableCellRangeMulti,
          },
          {
            id: 'table-cell-align',
            label: 'Alignment',
            icon: 'align',
            onClick: () =>
              setSelectionSidebarView((current) =>
                current === 'table-cell-align' ? 'default' : 'table-cell-align',
              ),
            active: selectionSidebarView === 'table-cell-align',
          },
        ]
      : []

    const tableStructureTools: ToolbarTool[] = [
      {
        id: 'table-title-toggle',
        label: 'Title',
        icon: 'title',
        onClick: () => toggleTableTitle(selectedTableCard.id),
        active: selectedTableCard.showTitle,
      },
      {
        id: 'table-add-column',
        label: 'Add column',
        icon: 'add-column',
        onClick: () =>
          addTableColumn(
            selectedTableCard.id,
            activeSelectedTableCell ? activeSelectedTableCell.columnIndex + 1 : undefined,
          ),
      },
      {
        id: 'table-add-row',
        label: 'Add row',
        icon: 'add-row',
        onClick: () =>
          addTableRow(
            selectedTableCard.id,
            activeSelectedTableCell ? activeSelectedTableCell.rowIndex + 1 : undefined,
          ),
      },
    ]

    const tableUtilityTools: ToolbarTool[] = [
      {
        id: 'duplicate-selected-table',
        label: 'Duplicate',
        icon: 'duplicate',
        onClick: duplicateSelectedCards,
      },
      {
        id: 'delete-selected-table',
        label: 'Delete',
        icon: 'delete',
        onClick: () => removeCards(selectedCardIds),
        tone: 'danger',
      },
    ]

    return (
      <div className="tool-sidebar-mode">
        {tableCellTools.length ? (
          <div className="tool-stack">{tableCellTools.map(renderToolbarButton)}</div>
        ) : null}
        {tableCellTools.length ? <div className="tool-divider" /> : null}
        <div className="tool-stack">{tableStructureTools.map(renderToolbarButton)}</div>
        <div className="tool-divider" />
        <div className="tool-stack">{tableUtilityTools.map(renderToolbarButton)}</div>
      </div>
    )
  }

  const selectedHeadingCard = selectedCard.kind === 'heading' ? selectedCard : null
  const cardActionTools: ToolbarTool[] = []
  const cardUtilityTools: ToolbarTool[] = [
    {
      id: 'duplicate-selected',
      label: 'Duplicate',
      icon: 'duplicate',
      onClick: duplicateSelectedCards,
    },
    {
      id: 'delete-selected',
      label: 'Delete',
      icon: 'delete',
      onClick: () => removeCards(selectedCardIds),
      tone: 'danger',
    },
  ]

  if (selectedCard.kind === 'link') {
    cardActionTools.push({
      id: 'open-link',
      label: 'Open',
      icon: 'open',
      onClick: openSelectedLink,
    })
  }

  if (selectedCard.kind === 'image') {
    cardActionTools.push({
      id: 'toggle-fit',
      label: selectedCard.fit === 'cover' ? 'Full' : 'Fill',
      icon: 'fit',
      onClick: toggleSelectedImageFit,
    })
    cardActionTools.push({
      id: 'crop-image',
      label: cropArmedImageId === selectedCard.id ? 'Cancel crop' : 'Crop',
      icon: 'crop',
      onClick: () => toggleImageCropMode(selectedCard.id),
      active: cropArmedImageId === selectedCard.id,
    })
  }

  if (selectedPaletteCard) {
    const palette = getNotePaletteMap(usesDarkItems)[selectedPaletteCard.palette]
    cardActionTools.push({
      id: 'open-color-panel',
      label: 'Color',
      icon: 'swatch',
      iconColor: palette.background,
      onClick: () =>
        setSelectionSidebarView((current) => (current === 'palette' ? 'default' : 'palette')),
      active: selectionSidebarView === 'palette',
    })
  }

  if (selectedHeadingCard) {
    cardActionTools.push({
      id: 'open-heading-style-panel',
      label: 'Style',
      icon: 'style',
      iconColor:
        selectedHeadingCard.accentColor ?? (usesDarkItems ? '#8ed8f8' : '#176a8e'),
      onClick: () =>
        setSelectionSidebarView((current) =>
          current === 'heading-style' ? 'default' : 'heading-style',
        ),
      active: selectionSidebarView === 'heading-style',
    })
  }

  return (
    <div className="tool-sidebar-mode">
      {cardActionTools.length ? (
        <div className="tool-stack">{cardActionTools.map(renderToolbarButton)}</div>
      ) : null}
      {cardActionTools.length ? <div className="tool-divider" /> : null}
      <div className="tool-stack">{cardUtilityTools.map(renderToolbarButton)}</div>
    </div>
  )
}

function WorkspaceSelectionPopout({
  selectedCard,
  selectedTableCard,
  selectedPaletteCard,
  selectedTextCard,
  selectionSidebarMode,
  selectionSidebarView,
  activeSelectedTableCell,
  activeSelectedTableCellRange,
  activeSelectedTableCellFormat,
  isActiveSelectedTableCellRangeMulti,
  usesDarkItems,
  noteTextToolbarState,
  renderToolbarButton,
  setSelectionSidebarView,
  applySelectedPalette,
  applySelectedCardAccentColor,
  applySelectedNoteBlockStyle,
  applySelectedNoteTextColor,
  applySelectedHeadingAccentColor,
  applySelectedHeadingAlignment,
  setActiveTableCellBlockStyle,
  toggleActiveTableCellInlineStyle,
  setActiveTableCellValueType,
  setActiveTableCellBackgroundColor,
  setActiveTableCellAlignment,
}: WorkspaceSelectionPopoutProps) {
  if (!selectedCard) {
    return null
  }

  const selectedHeadingCard = selectedCard.kind === 'heading' ? selectedCard : null

  const selectionSubviewBackTool: ToolbarTool = {
    id: 'selection-back',
    label: 'Back',
    icon: 'back',
    onClick: () => setSelectionSidebarView('default'),
  }

  if (selectedTableCard && activeSelectedTableCell && activeSelectedTableCellFormat) {
    const tableCellSwatches = getTableCellColorSwatches(usesDarkItems)
    const activeTableCellLabel = activeSelectedTableCellRange
      ? getTableCellSelectionLabel(activeSelectedTableCellRange)
      : getTableCellCoordinateLabel(
          activeSelectedTableCell.rowIndex,
          activeSelectedTableCell.columnIndex,
        )
    const activeTableCellLabelPrefix = isActiveSelectedTableCellRangeMulti ? 'Cells' : 'Cell'
    const activeTableCellColor =
      activeSelectedTableCellFormat.backgroundColor ??
      getDefaultTableCellFillColor(
        activeSelectedTableCellFormat.type,
        activeSelectedTableCellFormat.tone,
        usesDarkItems,
      )
    const normalizedActiveTableCellColor = normalizeHexColor(
      activeTableCellColor,
      activeTableCellColor,
    )
    const hasCustomActiveTableCellColor =
      activeSelectedTableCellFormat.backgroundColor !== null &&
      !tableCellSwatches.some(
        (swatch) => swatch.color === activeSelectedTableCellFormat.backgroundColor,
      )

    if (selectionSidebarView === 'table-cell-style') {
      const tableStyleButtons: Array<{
        id: NoteBlockStyle
        label: string
      }> = [
        { id: 'body', label: 'Text' },
        { id: 'heading', label: 'Heading' },
        { id: 'quote', label: 'Quote' },
        { id: 'code', label: 'Code' },
      ]
      const tableActionButtons: Array<{
        id: string
        label: string
        icon: 'bold' | 'italic' | 'underline' | 'strike'
        active?: boolean
        onClick: () => void
      }> = [
        {
          id: 'table-format-bold',
          label: 'Bold',
          icon: 'bold',
          active: activeSelectedTableCellFormat.isBold,
          onClick: () => toggleActiveTableCellInlineStyle('isBold', 'Cell text style updated.'),
        },
        {
          id: 'table-format-italic',
          label: 'Italic',
          icon: 'italic',
          active: activeSelectedTableCellFormat.isItalic,
          onClick: () =>
            toggleActiveTableCellInlineStyle('isItalic', 'Cell text style updated.'),
        },
        {
          id: 'table-format-underline',
          label: 'Underline',
          icon: 'underline',
          active: activeSelectedTableCellFormat.isUnderline,
          onClick: () =>
            toggleActiveTableCellInlineStyle('isUnderline', 'Cell text style updated.'),
        },
        {
          id: 'table-format-strike',
          label: 'Strike',
          icon: 'strike',
          active: activeSelectedTableCellFormat.isStrikeThrough,
          onClick: () =>
            toggleActiveTableCellInlineStyle('isStrikeThrough', 'Cell text style updated.'),
        },
      ]

      return (
        <div
          className="tool-popout tool-popout--note-format tool-popout--table-cell"
          aria-label="Cell text settings"
        >
          <div className="tool-stack">{[selectionSubviewBackTool].map(renderToolbarButton)}</div>
          <div className="tool-divider" />
          <div className="tool-panel tool-panel--selection-mode">
            <div className="tool-panel-kicker">
              {activeTableCellLabelPrefix} {activeTableCellLabel}
            </div>
            <div className="tool-panel-title">Text style</div>
            <p className="tool-panel-copy">
              {isActiveSelectedTableCellRangeMulti
                ? 'Style the selected table cells.'
                : 'Style the active table cell.'}
            </p>

            <div className="note-format-style-grid">
              {tableStyleButtons.map((styleButton) => (
                <button
                  key={styleButton.id}
                  type="button"
                  className={`note-format-style-chip ${
                    activeSelectedTableCellFormat.blockStyle === styleButton.id
                      ? 'is-active'
                      : ''
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setActiveTableCellBlockStyle(styleButton.id)}
                >
                  {styleButton.label}
                </button>
              ))}
            </div>

            <div className="note-format-action-list">
              {tableActionButtons.map((actionButton) => (
                <button
                  key={actionButton.id}
                  type="button"
                  className={`note-format-button ${actionButton.active ? 'is-active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={actionButton.onClick}
                >
                  <span className="note-format-button-icon">
                    <NoteTextToolIcon name={actionButton.icon} />
                  </span>
                  <span className="note-format-button-label">{actionButton.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (selectionSidebarView === 'table-cell-type') {
      return (
        <div className="tool-popout tool-popout--table-cell" aria-label="Cell type settings">
          <div className="tool-stack">{[selectionSubviewBackTool].map(renderToolbarButton)}</div>
          <div className="tool-divider" />
          <div className="tool-panel tool-panel--selection-mode">
            <div className="tool-panel-kicker">
              {activeTableCellLabelPrefix} {activeTableCellLabel}
            </div>
            <div className="tool-panel-title">Cell type</div>
            <p className="tool-panel-copy">
              {isActiveSelectedTableCellRangeMulti
                ? 'Choose how the selected cells should behave.'
                : 'Choose how this cell should behave.'}
            </p>
            <div className="table-cell-type-list">
              {TABLE_CELL_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`table-cell-type-option ${
                    activeSelectedTableCellFormat.valueType === option.id ? 'is-active' : ''
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setActiveTableCellValueType(option.id)}
                >
                  <span className="table-cell-type-badge">{option.badge}</span>
                  <span className="table-cell-type-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (selectionSidebarView === 'table-cell-color') {
      return (
        <div className="tool-popout tool-popout--table-cell" aria-label="Cell color settings">
          <div className="tool-stack">{[selectionSubviewBackTool].map(renderToolbarButton)}</div>
          <div className="tool-divider" />
          <div className="tool-panel tool-panel--selection-mode">
            <div className="tool-panel-kicker">
              {activeTableCellLabelPrefix} {activeTableCellLabel}
            </div>
            <div className="tool-panel-title">Cell color</div>
            <p className="tool-panel-copy">
              {isActiveSelectedTableCellRangeMulti
                ? 'Pick a fill for the selected cells.'
                : 'Pick a fill for the active cell.'}
            </p>
            <div className="palette-grid">
              {tableCellSwatches.map((swatch) => {
                const swatchColor =
                  swatch.color ??
                  getThemeTableCellBaseFillColor(activeSelectedTableCellFormat.type, 'default')
                const isActiveSwatch =
                  swatch.color === null
                    ? activeSelectedTableCellFormat.backgroundColor === null &&
                      activeSelectedTableCellFormat.tone === 'default'
                    : normalizedActiveTableCellColor === swatch.color

                return (
                  <button
                    key={swatch.id}
                    type="button"
                    className={`palette-chip ${isActiveSwatch ? 'is-active' : ''}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setActiveTableCellBackgroundColor(swatch.color)}
                  >
                    <span
                      className="palette-chip-swatch"
                      style={{
                        background: swatchColor,
                        borderColor: usesDarkItems
                          ? 'rgba(255, 255, 255, 0.16)'
                          : 'rgba(29, 45, 40, 0.12)',
                      }}
                    />
                    <span className="palette-chip-label">{swatch.label}</span>
                  </button>
                )
              })}
            </div>
            <label
              className={`draw-color-picker ${hasCustomActiveTableCellColor ? 'is-active' : ''}`}
            >
              <span>Custom</span>
              <input
                className="draw-color-input"
                type="color"
                value={
                  activeSelectedTableCellFormat.backgroundColor ?? normalizedActiveTableCellColor
                }
                onChange={(event) =>
                  setActiveTableCellBackgroundColor(
                    normalizeHexColor(event.target.value, event.target.value),
                  )
                }
              />
            </label>
          </div>
        </div>
      )
    }

    if (selectionSidebarView === 'table-cell-align') {
      const alignOptions: Array<{
        id: TableCellAlign
        label: string
      }> = [
        { id: 'left', label: 'Left' },
        { id: 'center', label: 'Center' },
        { id: 'right', label: 'Right' },
      ]

      return (
        <div className="tool-popout tool-popout--table-cell" aria-label="Cell alignment settings">
          <div className="tool-stack">{[selectionSubviewBackTool].map(renderToolbarButton)}</div>
          <div className="tool-divider" />
          <div className="tool-panel tool-panel--selection-mode">
            <div className="tool-panel-kicker">
              {activeTableCellLabelPrefix} {activeTableCellLabel}
            </div>
            <div className="tool-panel-title">Alignment</div>
            <p className="tool-panel-copy">
              {isActiveSelectedTableCellRangeMulti
                ? 'Align the contents of the selected cells.'
                : 'Align the contents of the active cell.'}
            </p>
            <div className="tool-panel-action-grid tool-panel-action-grid--triple">
              {alignOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`tool-panel-action ${
                    activeSelectedTableCellFormat.align === option.id ? 'is-active' : ''
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setActiveTableCellAlignment(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }
  }

  if (selectionSidebarView === 'palette' && selectedPaletteCard) {
    const notePalettes = getNotePalettes(usesDarkItems)
    const accentSwatches = usesDarkItems ? DARK_ACCENT_SWATCHES : LIGHT_ACCENT_SWATCHES
    const selectedCardPalette = getNotePaletteMap(usesDarkItems)[selectedPaletteCard.palette]
    const selectedCardAccentValue = selectedPaletteCard.accentColor ?? selectedCardPalette.accent
    const hasCustomSelectedCardAccentColor =
      selectedPaletteCard.accentColor !== null &&
      !accentSwatches.some((swatch) => swatch.color === selectedPaletteCard.accentColor)

    return (
      <div className="tool-popout" aria-label="Color settings">
        <div className="tool-stack">{[selectionSubviewBackTool].map(renderToolbarButton)}</div>
        <div className="tool-divider" />
        <div className="tool-panel tool-panel--selection-mode">
          <div className="tool-panel-kicker">Card look</div>
          <div className="tool-panel-title">Color</div>
          <p className="tool-panel-copy">Choose a base color and accent bar for this card.</p>

          <div className="tool-panel-section">
            <div className="tool-panel-section-label">Card color</div>
            <div className="palette-grid">
              {notePalettes.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  className={`palette-chip ${
                    selectedPaletteCard.palette === palette.id ? 'is-active' : ''
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applySelectedPalette(palette.id)}
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

          <div className="tool-panel-section">
            <div className="tool-panel-section-label">Accent bar</div>
            <div className="palette-grid">
              {accentSwatches.map((swatch) => {
                const isActive =
                  swatch.color === null
                    ? selectedPaletteCard.accentColor == null
                    : selectedPaletteCard.accentColor === swatch.color

                return (
                  <button
                    key={swatch.id}
                    type="button"
                    className={`palette-chip ${isActive ? 'is-active' : ''}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      applySelectedCardAccentColor(selectedPaletteCard.id, swatch.color)
                    }
                  >
                    <span
                      className="palette-chip-swatch"
                      style={{
                        background: `linear-gradient(180deg, ${
                          swatch.color ?? 'transparent'
                        } 0 32%, ${selectedCardPalette.background} 32% 100%)`,
                        borderColor: swatch.color ?? selectedCardPalette.border,
                      }}
                    />
                    <span className="palette-chip-label">{swatch.label}</span>
                  </button>
                )
              })}
            </div>

            <label
              className={`draw-color-picker ${
                hasCustomSelectedCardAccentColor ? 'is-active' : ''
              }`}
            >
              <span>Custom accent</span>
              <input
                className="draw-color-input"
                type="color"
                value={selectedCardAccentValue}
                onChange={(event) =>
                  applySelectedCardAccentColor(
                    selectedPaletteCard.id,
                    normalizeHexColor(event.target.value, event.target.value),
                  )
                }
              />
            </label>
          </div>
        </div>
      </div>
    )
  }

  if (selectionSidebarView === 'heading-style' && selectedHeadingCard) {
    const headingAccentSwatches = usesDarkItems ? DARK_ACCENT_SWATCHES : LIGHT_ACCENT_SWATCHES
    const headingAccentValue = selectedHeadingCard.accentColor ?? (usesDarkItems ? '#8ed8f8' : '#176a8e')
    const alignOptions: Array<{
      id: NoteTextAlign
      label: string
    }> = [
      { id: 'left', label: 'Left' },
      { id: 'center', label: 'Center' },
      { id: 'right', label: 'Right' },
    ]

    return (
      <div className="tool-popout" aria-label="Header style settings">
        <div className="tool-stack">{[selectionSubviewBackTool].map(renderToolbarButton)}</div>
        <div className="tool-divider" />
        <div className="tool-panel tool-panel--selection-mode">
          <div className="tool-panel-kicker">Header card</div>
          <div className="tool-panel-title">Style</div>
          <p className="tool-panel-copy">
            Set the accent bar and align the header text.
          </p>

          <div className="tool-panel-section">
            <div className="tool-panel-section-label">Accent bar</div>
            <div className="palette-grid">
              {headingAccentSwatches.map((swatch) => {
                const isActive =
                  swatch.color === null
                    ? selectedHeadingCard.accentColor === null
                    : selectedHeadingCard.accentColor === swatch.color

                return (
                  <button
                    key={swatch.id}
                    type="button"
                    className={`palette-chip ${isActive ? 'is-active' : ''}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applySelectedHeadingAccentColor(selectedHeadingCard.id, swatch.color)}
                  >
                    <span
                      className="palette-chip-swatch"
                      style={
                        swatch.color
                          ? {
                              background: `linear-gradient(180deg, ${swatch.color} 0 32%, transparent 32% 100%)`,
                              borderColor: swatch.color,
                            }
                          : {
                              background:
                                'linear-gradient(180deg, #ffffff00 0 32%, #fffdf9 32% 100%)',
                              borderColor: 'rgba(29, 45, 40, 0.16)',
                            }
                      }
                    />
                    <span className="palette-chip-label">{swatch.label}</span>
                  </button>
                )
              })}
            </div>
            <label className="draw-color-picker">
              <span>Custom accent</span>
              <input
                className="draw-color-input"
                type="color"
                value={headingAccentValue}
                onChange={(event) =>
                  applySelectedHeadingAccentColor(
                    selectedHeadingCard.id,
                    normalizeHexColor(event.target.value, event.target.value),
                  )
                }
              />
            </label>
          </div>

          <div className="tool-panel-section">
            <div className="tool-panel-section-label">Alignment</div>
            <div className="tool-panel-action-grid tool-panel-action-grid--triple">
              {alignOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`tool-panel-action ${
                    selectedHeadingCard.textAlign === option.id ? 'is-active' : ''
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applySelectedHeadingAlignment(selectedHeadingCard.id, option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectionSidebarMode === 'text' && selectionSidebarView === 'note-text' && selectedTextCard) {
    const noteTextColorSwatches = isLightDefaultTextColor(noteTextToolbarState.defaultTextColor)
      ? DARK_NOTE_TEXT_COLOR_SWATCHES
      : LIGHT_NOTE_TEXT_COLOR_SWATCHES
    const noteTextColorValue =
      noteTextToolbarState.textColor ?? noteTextToolbarState.defaultTextColor ?? '#1d2d28'
    const noteStyleButtons: Array<{
      id: NoteBlockStyle
      label: string
    }> = [
      { id: 'body', label: 'Text' },
      { id: 'heading', label: 'Heading' },
      { id: 'quote', label: 'Quote' },
      { id: 'code', label: 'Code' },
    ]

    return (
      <div className="tool-popout tool-popout--note-format" aria-label="Text settings">
        <div className="tool-stack">{[selectionSubviewBackTool].map(renderToolbarButton)}</div>
        <div className="tool-divider" />
        <div className="tool-panel tool-panel--selection-mode">
          <div className="tool-panel-kicker">Text editor</div>
          <div className="tool-panel-title">Text style</div>
          <p className="tool-panel-copy">
            Change the block style and text color for the current selection.
          </p>

          <div className="note-format-style-grid">
            {noteStyleButtons.map((styleButton) => (
              <button
                key={styleButton.id}
                type="button"
                className={`note-format-style-chip ${
                  noteTextToolbarState.blockStyle === styleButton.id ? 'is-active' : ''
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applySelectedNoteBlockStyle(styleButton.id)}
              >
                {styleButton.label}
              </button>
            ))}
          </div>

          <div className="tool-panel-section">
            <div className="tool-panel-section-label">Text color</div>
            <div className="palette-grid">
              {noteTextColorSwatches.map((swatch) => {
                const isActive =
                  swatch.color === null
                    ? noteTextToolbarState.textColor === null
                    : noteTextToolbarState.textColor === swatch.color

                return (
                  <button
                    key={swatch.id}
                    type="button"
                    className={`palette-chip ${isActive ? 'is-active' : ''}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      applySelectedNoteTextColor(swatch.color, {
                        historyGroupKey: 'note-format-color',
                      })
                    }
                  >
                    <span
                      className="palette-chip-swatch"
                      style={
                        swatch.color
                          ? { background: swatch.color, borderColor: swatch.color }
                          : {
                              background:
                                'linear-gradient(135deg, #fffdf9 0%, #fffdf9 42%, #f18857 42%, #f18857 58%, #fffdf9 58%, #fffdf9 100%)',
                            }
                      }
                    />
                    <span className="palette-chip-label">{swatch.label}</span>
                  </button>
                )
              })}
            </div>

            <label className="draw-color-picker" onPointerDown={(event) => event.stopPropagation()}>
              <span>Custom color</span>
              <input
                type="color"
                className="draw-color-input"
                value={noteTextColorValue}
                onChange={(event) =>
                  applySelectedNoteTextColor(normalizeHexColor(event.target.value, '#1d2d28'), {
                    historyGroupKey: 'note-format-color',
                  })
                }
              />
            </label>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export { WorkspaceSelectionInspector, WorkspaceSelectionPopout }
