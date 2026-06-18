import type { Dispatch, ReactNode, RefObject, SetStateAction } from 'react'

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
import WorkspaceSidebar from './WorkspaceSidebar'
import {
  WorkspaceSelectionInspector,
  WorkspaceSelectionPopout,
} from './WorkspaceSelectionPanels'

type NoteCommandOptions = {
  historyGroupKey?: string
  statusText?: string
}

type WorkspaceSidebarPanelProps = {
  isDrawMode: boolean
  selectedCount: number
  cropArmedImageId: string | null
  selectionSidebarMode: 'card' | 'text'
  selectionSidebarView: SelectionSidebarView
  isSelectionSidebar: boolean
  brandLabel: string
  isBrandInteractive: boolean
  drawPrimaryContent: ReactNode
  drawColorContent: ReactNode
  drawSizeContent: ReactNode
  drawUtilityContent: ReactNode
  defaultSidebarPopout?: ReactNode
  defaultPrimaryContent: ReactNode
  defaultSecondaryContent?: ReactNode
  defaultUtilityContent: ReactNode
  drawColorInputRef: RefObject<HTMLInputElement | null>
  drawColorHex: string
  imageInputRef: RefObject<HTMLInputElement | null>
  documentInputRef: RefObject<HTMLInputElement | null>
  onBrandClick: () => void
  onDrawColorInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImageInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onDocumentInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  connectorSelectionTools: ToolbarTool[] | null
  strokeSelectionTools: ToolbarTool[] | null
  selectedCard: BoardCard | null
  selectedCardIds: string[]
  selectedTableCard: TableCard | null
  selectedPaletteCard: {
    id: string
    kind: 'note' | 'todo' | 'link' | 'column'
    palette: NotePaletteId
    accentColor: string | null
  } | null
  selectedTextCard: RichTextCard | null
  activeSelectedTableCell: TableCellSelection | null
  activeSelectedTableCellRange: TableCellSelectionRange | null
  activeSelectedTableCellFormat: TableCellFormat | null
  isActiveSelectedTableCellRangeMulti: boolean
  usesDarkItems: boolean
  noteTextToolbarState: NoteTextToolbarState
  renderToolbarButton: (tool: ToolbarTool) => ReactNode
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
  applySelectedPalette: (paletteId: NotePaletteId) => void
  applySelectedCardAccentColor: (cardId: string, accentColor: string | null) => void
  applySelectedNoteBlockStyle: (
    nextStyle: NoteBlockStyle,
    options?: NoteCommandOptions,
  ) => void
  applySelectedNoteCommand: (
    command: string,
    value?: string,
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

function WorkspaceSidebarPanel({
  isDrawMode,
  selectedCount,
  cropArmedImageId,
  selectionSidebarMode,
  selectionSidebarView,
  isSelectionSidebar,
  brandLabel,
  isBrandInteractive,
  drawPrimaryContent,
  drawColorContent,
  drawSizeContent,
  drawUtilityContent,
  defaultSidebarPopout,
  defaultPrimaryContent,
  defaultSecondaryContent,
  defaultUtilityContent,
  drawColorInputRef,
  drawColorHex,
  imageInputRef,
  documentInputRef,
  onBrandClick,
  onDrawColorInputChange,
  onImageInputChange,
  onDocumentInputChange,
  connectorSelectionTools,
  strokeSelectionTools,
  selectedCard,
  selectedCardIds,
  selectedTableCard,
  selectedPaletteCard,
  selectedTextCard,
  activeSelectedTableCell,
  activeSelectedTableCellRange,
  activeSelectedTableCellFormat,
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
  applySelectedPalette,
  applySelectedCardAccentColor,
  applySelectedNoteBlockStyle,
  applySelectedNoteCommand,
  applySelectedNoteTextColor,
  applySelectedHeadingAccentColor,
  applySelectedHeadingAlignment,
  setActiveTableCellBlockStyle,
  toggleActiveTableCellInlineStyle,
  setActiveTableCellValueType,
  setActiveTableCellBackgroundColor,
  setActiveTableCellAlignment,
}: WorkspaceSidebarPanelProps) {
  const selectionContent = (
    <WorkspaceSelectionInspector
      connectorSelectionTools={connectorSelectionTools}
      strokeSelectionTools={strokeSelectionTools}
      selectedCount={selectedCount}
      selectedCard={selectedCard}
      selectedCardIds={selectedCardIds}
      selectedTableCard={selectedTableCard}
      selectedPaletteCard={selectedPaletteCard}
      selectedTextCard={selectedTextCard}
      activeSelectedTableCell={activeSelectedTableCell}
      activeSelectedTableCellFormat={activeSelectedTableCellFormat}
      selectionSidebarMode={selectionSidebarMode}
      selectionSidebarView={selectionSidebarView}
      cropArmedImageId={cropArmedImageId}
      isActiveSelectedTableCellRangeMulti={isActiveSelectedTableCellRangeMulti}
      usesDarkItems={usesDarkItems}
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
      applySelectedNoteBlockStyle={applySelectedNoteBlockStyle}
      applySelectedNoteCommand={applySelectedNoteCommand}
    />
  )

  const selectionSidebarPopout = isSelectionSidebar ? (
    <WorkspaceSelectionPopout
      selectedCard={selectedCard}
      selectedTableCard={selectedTableCard}
      selectedPaletteCard={selectedPaletteCard}
      selectedTextCard={selectedTextCard}
      selectionSidebarMode={selectionSidebarMode}
      selectionSidebarView={selectionSidebarView}
      activeSelectedTableCell={activeSelectedTableCell}
      activeSelectedTableCellRange={activeSelectedTableCellRange}
      activeSelectedTableCellFormat={activeSelectedTableCellFormat}
      isActiveSelectedTableCellRangeMulti={isActiveSelectedTableCellRangeMulti}
      usesDarkItems={usesDarkItems}
      noteTextToolbarState={noteTextToolbarState}
      renderToolbarButton={renderToolbarButton}
      setSelectionSidebarView={setSelectionSidebarView}
      applySelectedPalette={applySelectedPalette}
      applySelectedCardAccentColor={applySelectedCardAccentColor}
      applySelectedNoteBlockStyle={applySelectedNoteBlockStyle}
      applySelectedNoteTextColor={applySelectedNoteTextColor}
      applySelectedHeadingAccentColor={applySelectedHeadingAccentColor}
      applySelectedHeadingAlignment={applySelectedHeadingAlignment}
      setActiveTableCellBlockStyle={setActiveTableCellBlockStyle}
      toggleActiveTableCellInlineStyle={toggleActiveTableCellInlineStyle}
      setActiveTableCellValueType={setActiveTableCellValueType}
      setActiveTableCellBackgroundColor={setActiveTableCellBackgroundColor}
      setActiveTableCellAlignment={setActiveTableCellAlignment}
    />
  ) : null

  return (
    <WorkspaceSidebar
      isSelectionSidebar={isSelectionSidebar}
      isDrawMode={isDrawMode}
      brandLabel={brandLabel}
      isBrandInteractive={isBrandInteractive}
      selectionSidebarPopout={selectionSidebarPopout}
      defaultSidebarPopout={defaultSidebarPopout}
      selectionContent={selectionContent}
      drawPrimaryContent={drawPrimaryContent}
      drawColorContent={drawColorContent}
      drawSizeContent={drawSizeContent}
      drawUtilityContent={drawUtilityContent}
      defaultPrimaryContent={defaultPrimaryContent}
      defaultSecondaryContent={defaultSecondaryContent}
      defaultUtilityContent={defaultUtilityContent}
      drawColorInputRef={drawColorInputRef}
      drawColorHex={drawColorHex}
      imageInputRef={imageInputRef}
      documentInputRef={documentInputRef}
      onBrandClick={onBrandClick}
      onDrawColorInputChange={onDrawColorInputChange}
      onImageInputChange={onImageInputChange}
      onDocumentInputChange={onDocumentInputChange}
    />
  )
}

export default WorkspaceSidebarPanel
