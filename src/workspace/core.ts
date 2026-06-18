import type { CSSProperties } from 'react'

const STORAGE_KEY = 'less-note.workspace.v1'
const SNAP_TO_GRID_STORAGE_KEY = 'less-note.snap-to-grid'
const APP_SETTINGS_STORAGE_KEY = 'less-note.settings.v1'
const WORKSPACE_BACKUP_FILE_TYPE = 'less-note-backup'
const WORKSPACE_BACKUP_FILE_VERSION = 2
const MIN_ZOOM = 0.35
const MAX_ZOOM = 2.4
const GRID_SIZE = 24
const HEADING_MIN_WIDTH = 240
const NOTE_MIN_WIDTH = 288
const TODO_MIN_WIDTH = 312
const LINK_MIN_WIDTH = 312
const IMAGE_MIN_WIDTH = 96
const DOCUMENT_MIN_WIDTH = 132
const TABLE_MIN_COLUMNS = 1
const TABLE_MIN_ROWS = 1
const TABLE_DEFAULT_COLUMNS = 4
const TABLE_DEFAULT_ROWS = 3
const TABLE_MAX_COLUMNS = 18
const TABLE_MAX_ROWS = 40
const TABLE_CELL_WIDTH = 120
const TABLE_CELL_HEIGHT = 48
const TABLE_TITLE_HEIGHT = 48
const LIGHT_TABLE_CELL_COLOR_SWATCHES = [
  { id: 'default', label: 'Default', color: null },
  { id: 'muted', label: 'Slate', color: '#e3ddd4' },
  { id: 'accent', label: 'Teal', color: '#d4ebf6' },
  { id: 'olive', label: 'Olive', color: '#dce7d2' },
  { id: 'rose', label: 'Rose', color: '#edd7dc' },
  { id: 'sand', label: 'Sand', color: '#ece0ce' },
] as const
const DARK_TABLE_CELL_COLOR_SWATCHES = [
  { id: 'default', label: 'Default', color: null },
  { id: 'muted', label: 'Slate', color: '#3b3b3b' },
  { id: 'accent', label: 'Teal', color: '#35515b' },
  { id: 'olive', label: 'Olive', color: '#56624a' },
  { id: 'rose', label: 'Rose', color: '#63474f' },
  { id: 'sand', label: 'Sand', color: '#67543d' },
] as const
const TABLE_CELL_THEME_COLOR_PAIRS = [
  { light: '#f7f1e6', dark: '#343434' },
  { light: '#ece4d8', dark: '#4a4a4a' },
  { light: '#e3ddd4', dark: '#3b3b3b' },
  { light: '#d4ebf6', dark: '#35515b' },
  { light: '#dce7d2', dark: '#56624a' },
  { light: '#edd7dc', dark: '#63474f' },
  { light: '#ece0ce', dark: '#67543d' },
] as const
const TABLE_CELL_TYPE_OPTIONS = [
  { id: 'auto', badge: 'A', label: 'Auto' },
  { id: 'number', badge: '123', label: 'Number' },
  { id: 'currency', badge: '$', label: 'Currency' },
  { id: 'percentage', badge: '%', label: 'Percentage' },
  { id: 'text', badge: 'ABC', label: 'Text' },
  { id: 'date-time', badge: 'D/T', label: 'Date & Time' },
  { id: 'checkbox', badge: '[ ]', label: 'Checkbox' },
] as const
const UNDO_HISTORY_LIMIT = 80
const HISTORY_GROUP_WINDOW_MS = 900
const DEFAULT_CARD_PALETTE = 'white' as const
const DRAW_BRUSH_SIZES = [3, 6, 12] as const
const DRAW_LIGHT_DEFAULT_COLOR_HEX = '#18201d'
const DRAW_DARK_DEFAULT_COLOR_HEX = '#f5eee4'
const DRAW_RED_COLOR_HEX = '#cb3b32'
const DRAW_STROKE_OPACITY = 0.72
const DRAW_STROKE_COLOR = 'rgba(24, 32, 29, 0.72)'
const DRAW_STROKE_SIZE = DRAW_BRUSH_SIZES[1]
const CARD_DRAG_START_DISTANCE = 4
const NOTE_WIDTH = 312
const NOTE_HEIGHT = 216
const HEADING_WIDTH = 432
const HEADING_HEIGHT = 120
const TODO_WIDTH = 312
const TODO_HEIGHT = 264
const EMPTY_NOTE_HEIGHT = 96
const EMPTY_TODO_HEIGHT = 96
const LINK_WIDTH = 312
const LINK_HEIGHT = 96
const IMAGE_WIDTH = 336
const IMAGE_HEIGHT = 240
const DOCUMENT_WIDTH = 152
const DOCUMENT_HEIGHT = 176
const COLUMN_MIN_WIDTH = 336
const COLUMN_WIDTH = 336
const COLUMN_HEIGHT = 192
const COLUMN_STACK_TOP = 72
const COLUMN_STACK_GAP = 24
const COLUMN_HORIZONTAL_PADDING = 24
const COLUMN_BOTTOM_PADDING = 24
const COLUMN_EMPTY_HEIGHT = 72
const WORKSPACE_PERSIST_DELAY_MS = 240
const DEFAULT_BACKGROUND_COLOR = '#efe8dc'
const DEFAULT_SIDEBAR_COLOR = '#f3ece0'
const TOOLBAR_CREATE_DRAG_DATA_TYPE = 'application/x-less-note-create-tool'
const TOOLBAR_CREATE_DRAG_TEXT_PREFIX = 'less-note:create:'
const MIDNIGHT_THEME_PRESET = {
  id: 'midnight',
  label: 'Midnight',
  backgroundColor: '#1a1d1b',
  sidebarColor: '#262c29',
} as const
const CUSTOM_THEME_PRESET = {
  id: 'custom',
  label: 'Custom',
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  sidebarColor: DEFAULT_SIDEBAR_COLOR,
} as const
const CALENDAR_TAB_ID = 'calendar'
const BUILT_IN_APP_THEME_PRESETS = [
  {
    id: 'paper',
    label: 'Paper',
    backgroundColor: '#efe8dc',
    sidebarColor: '#f3ece0',
  },
  {
    id: 'moss',
    label: 'Moss',
    backgroundColor: '#dde7da',
    sidebarColor: '#cfddc8',
  },
  {
    id: 'coast',
    label: 'Coast',
    backgroundColor: '#e0edf0',
    sidebarColor: '#d0e2e7',
  },
  {
    id: 'clay',
    label: 'Clay',
    backgroundColor: '#ecdccf',
    sidebarColor: '#e1c7b5',
  },
  MIDNIGHT_THEME_PRESET,
] as const
const APP_THEME_PRESETS = [...BUILT_IN_APP_THEME_PRESETS, CUSTOM_THEME_PRESET] as const

type NotePaletteId = 'white' | 'sand' | 'sage' | 'sky' | 'rose'
type AppThemePreset = (typeof APP_THEME_PRESETS)[number]
type AppThemePresetId = AppThemePreset['id']
type NoteTextAlign = 'left' | 'center' | 'right'
type NoteTextSize = 'small' | 'medium' | 'large'
type NoteContentMode = 'plain' | 'rich'
type NoteBlockStyle = 'body' | 'heading' | 'quote' | 'code'
type NoteInlineCommand = 'bold' | 'italic' | 'underline' | 'strikeThrough'

type CanvasViewport = {
  x: number
  y: number
  zoom: number
}

type CardBase = {
  id: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  title: string
}

type ColumnChildBase = CardBase & {
  columnId: string | null
  columnIndex: number
}

type RichTextCardBase = ColumnChildBase & {
  content: string
  contentMode: NoteContentMode
  textAlign: NoteTextAlign
  textSize: NoteTextSize
  isBold: boolean
  isItalic: boolean
}

type NoteCard = RichTextCardBase & {
  kind: 'note'
  palette: NotePaletteId
  accentColor: string | null
}

type HeadingCard = RichTextCardBase & {
  kind: 'heading'
  accentColor: string | null
}

type RichTextCard = NoteCard | HeadingCard

type TodoItem = {
  id: string
  text: string
  done: boolean
}

type TodoCard = ColumnChildBase & {
  kind: 'todo'
  items: TodoItem[]
  palette: NotePaletteId
  accentColor: string | null
}

type TableCard = ColumnChildBase & {
  kind: 'table'
  palette: NotePaletteId
  accentColor: string | null
  showTitle: boolean
  rowCount: number
  columnCount: number
  cells: string[][]
  cellFormats: TableCellFormat[][]
}

type TableCellAlign = 'left' | 'center' | 'right'
type TableCellTone = 'default' | 'muted' | 'accent'
type TableCellTextStyle = 'body' | 'strong' | 'code'
type TableCellSurfaceType = 'body' | 'header'
type TableCellValueType = (typeof TABLE_CELL_TYPE_OPTIONS)[number]['id']

type TableCellFormat = {
  align: TableCellAlign
  tone: TableCellTone
  textStyle: TableCellTextStyle
  type: TableCellSurfaceType
  valueType: TableCellValueType
  blockStyle: NoteBlockStyle
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  isStrikeThrough: boolean
  backgroundColor: string | null
}

type TableCellSelection = {
  cardId: string
  rowIndex: number
  columnIndex: number
  anchorRowIndex: number
  anchorColumnIndex: number
}

type TableCellSelectionRange = {
  startRowIndex: number
  endRowIndex: number
  startColumnIndex: number
  endColumnIndex: number
}

type ImageCrop = {
  x: number
  y: number
  width: number
  height: number
}

type DocumentPreviewKind = 'pdf' | 'docx' | 'text'

type DrawPoint = {
  x: number
  y: number
}

type DrawTool = 'marker' | 'eraser'

type DrawStroke = {
  id: string
  tool: DrawTool
  color: string
  size: number
  points: DrawPoint[]
}

type BoardConnector = {
  id: string
  fromCardId: string
  toCardId: string
}

type LinkCard = ColumnChildBase & {
  kind: 'link'
  url: string
  description: string
  showNote: boolean
  palette: NotePaletteId
  accentColor: string | null
}

type ImageCard = ColumnChildBase & {
  kind: 'image'
  src: string
  caption: string
  fit: 'cover' | 'contain'
  crop: ImageCrop
}

type DocumentCard = ColumnChildBase & {
  kind: 'document'
  fileName: string
  fileSize: number
  mimeType: string
  extension: string
  dataUrl: string
  previewKind: DocumentPreviewKind
  previewContent: string | null
}

type ColumnCard = CardBase & {
  kind: 'column'
  palette: NotePaletteId
  accentColor: string | null
}

type PaletteCard = NoteCard | TodoCard | LinkCard | ColumnCard

type ColumnChildCard =
  | HeadingCard
  | NoteCard
  | TodoCard
  | LinkCard
  | ImageCard
  | DocumentCard
  | TableCard

type BoardCard = ColumnCard | ColumnChildCard

type BoardState = {
  title: string
  updatedAt: string
  cards: BoardCard[]
  strokes: DrawStroke[]
  connectors: BoardConnector[]
}

type BoardTabState = {
  id: string
  board: BoardState
  viewport: CanvasViewport
}

type CalendarAutoMention = {
  id: string
  boardId: string
  boardLabel: string
  cardId: string
  cardKind: BoardCard['kind']
  sourceLabel: string
  excerpt: string
}

type CalendarEntry = {
  headline: string
  plans: string
  notes: string
  palette: NotePaletteId
  updatedAt: string
  autoMentions?: CalendarAutoMention[]
}

type CalendarState = {
  visibleMonth: string
  selectedDate: string | null
  entries: Record<string, CalendarEntry>
}

type WorkspaceSnapshot = {
  boards: BoardTabState[]
  activeBoardId: string
  activeTabId: string
  calendar: CalendarState
}

type WorkspaceBackupFile = {
  type: typeof WORKSPACE_BACKUP_FILE_TYPE
  version: typeof WORKSPACE_BACKUP_FILE_VERSION
  exportedAt: string
  workspace: WorkspaceSnapshot
  appSettings?: AppSettings
  snapToGrid?: boolean
}

type ParsedWorkspaceBackup = {
  workspace: WorkspaceSnapshot
  appSettings: AppSettings | null
  snapToGrid: boolean | null
}

type AppSettings = {
  backgroundColor: string
  sidebarColor: string
  isDarkMode: boolean
  themePresetId: AppThemePresetId
}

type CanvasPoint = {
  x: number
  y: number
}

type SidebarCreateToolKind = 'heading' | 'note' | 'todo' | 'link' | 'table' | 'column'
type SelectionSidebarView =
  | 'default'
  | 'palette'
  | 'note-text'
  | 'heading-style'
  | 'table-cell-style'
  | 'table-cell-type'
  | 'table-cell-color'
  | 'table-cell-align'

type CardLayout = {
  x: number
  y: number
  width: number
  height: number
  columnId: string | null
}

type MeasuredCardSize = {
  width: number
  height: number
}

type NoteTextToolbarState = {
  blockStyle: NoteBlockStyle
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  isStrikeThrough: boolean
  isBulletList: boolean
  isNumberedList: boolean
  textColor: string | null
  defaultTextColor: string | null
}

type SelectionRect = {
  left: number
  top: number
  width: number
  height: number
}

type ImageCropPreview = SelectionRect & {
  cardId: string
}

type WorkspaceMutationOptions = {
  recordUndo?: boolean
  historyGroupKey?: string
}

type TrackpadGestureEvent = Event & {
  clientX?: number
  clientY?: number
  scale: number
}

type ToolbarIconName =
  | 'heading'
  | 'note'
  | 'todo'
  | 'link'
  | 'image'
  | 'document'
  | 'table'
  | 'column'
  | 'connector'
  | 'back'
  | 'crop'
  | 'swatch'
  | 'draw'
  | 'marker'
  | 'eraser'
  | 'color-black'
  | 'color-red'
  | 'color-custom'
  | 'size-small'
  | 'size-medium'
  | 'size-large'
  | 'done'
  | 'style'
  | 'title'
  | 'cell-type'
  | 'formula'
  | 'align'
  | 'add-column'
  | 'add-row'
  | 'fit'
  | 'open'
  | 'duplicate'
  | 'delete'
  | 'settings'

type ToolbarTool = {
  id: string
  label: string
  icon: ToolbarIconName
  onClick: () => void
  createKind?: SidebarCreateToolKind
  iconColor?: string
  active?: boolean
  disabled?: boolean
  tone?: 'default' | 'danger'
}

type InteractionState =
  | {
      mode: 'pan'
      startClientX: number
      startClientY: number
      originViewportX: number
      originViewportY: number
    }
  | {
      mode: 'drag-card'
      startClientX: number
      startClientY: number
      currentClientX: number
      currentClientY: number
      anchorCardId: string
      cardOrigins: Array<{
        cardId: string
        x: number
        y: number
      }>
    }
  | {
      mode: 'press-card'
      startClientX: number
      startClientY: number
      anchorCardId: string
      selectionIds: string[]
    }
  | {
      mode: 'resize-card'
      cardId: string
      startClientX: number
      startClientY: number
      originCardWidth: number
      originCardHeight: number
      preserveAspectRatio: boolean
      originTableColumnCount: number | null
      originTableRowCount: number | null
    }
  | {
      mode: 'marquee-select'
      startCanvasX: number
      startCanvasY: number
      currentCanvasX: number
      currentCanvasY: number
    }
  | {
      mode: 'crop-image'
      cardId: string
      startWorldX: number
      startWorldY: number
      currentWorldX: number
      currentWorldY: number
      originCardX: number
      originCardY: number
      originCardWidth: number
      originCardHeight: number
      originCrop: ImageCrop
    }
  | {
      mode: 'draw-stroke'
      strokeId: string
      tool: DrawTool
      color: string
      size: number
      points: DrawPoint[]
    }

const NOTE_PALETTES: Array<{
  id: NotePaletteId
  label: string
  accent: string
  background: string
  border: string
  shadow: string
}> = [
  {
    id: 'white',
    label: 'White',
    accent: '#4a5953',
    background: '#fffdf9',
    border: '#e6ded2',
    shadow: 'rgba(37, 46, 42, 0.09)',
  },
  {
    id: 'sand',
    label: 'Sand',
    accent: '#a4631b',
    background: '#f4e6bc',
    border: '#dfca8c',
    shadow: 'rgba(164, 99, 27, 0.18)',
  },
  {
    id: 'sage',
    label: 'Sage',
    accent: '#40693b',
    background: '#d7e7c8',
    border: '#b9d1a5',
    shadow: 'rgba(64, 105, 59, 0.18)',
  },
  {
    id: 'sky',
    label: 'Sky',
    accent: '#176a8e',
    background: '#d4ebf6',
    border: '#afd5e8',
    shadow: 'rgba(23, 106, 142, 0.18)',
  },
  {
    id: 'rose',
    label: 'Rose',
    accent: '#9b4a55',
    background: '#f2d9d9',
    border: '#e3b8bd',
    shadow: 'rgba(155, 74, 85, 0.18)',
  },
]

const DARK_NOTE_PALETTES: Array<{
  id: NotePaletteId
  label: string
  accent: string
  background: string
  border: string
  shadow: string
}> = [
  {
    id: 'white',
    label: 'Black',
    accent: '#f5eee4',
    background: '#101312',
    border: '#2a302e',
    shadow: 'rgba(0, 0, 0, 0.34)',
  },
  {
    id: 'sand',
    label: 'Sand',
    accent: '#f2c48d',
    background: '#2f2519',
    border: '#604c33',
    shadow: 'rgba(0, 0, 0, 0.34)',
  },
  {
    id: 'sage',
    label: 'Sage',
    accent: '#9ed7a5',
    background: '#1e2b21',
    border: '#415845',
    shadow: 'rgba(0, 0, 0, 0.34)',
  },
  {
    id: 'sky',
    label: 'Sky',
    accent: '#8ed8f8',
    background: '#172734',
    border: '#395a6c',
    shadow: 'rgba(0, 0, 0, 0.34)',
  },
  {
    id: 'rose',
    label: 'Rose',
    accent: '#f0a7b8',
    background: '#2b1d22',
    border: '#68434d',
    shadow: 'rgba(0, 0, 0, 0.34)',
  },
]

const PALETTE_MAP = Object.fromEntries(
  NOTE_PALETTES.map((palette) => [palette.id, palette]),
) as Record<NotePaletteId, (typeof NOTE_PALETTES)[number]>

const DARK_PALETTE_MAP = Object.fromEntries(
  DARK_NOTE_PALETTES.map((palette) => [palette.id, palette]),
) as Record<NotePaletteId, (typeof DARK_NOTE_PALETTES)[number]>

const DEFAULT_CARD_VISUALS = {
  text: '#1d2d28',
  heading: '#19231f',
  body: 'rgba(29, 45, 40, 0.86)',
  muted: 'rgba(29, 45, 40, 0.62)',
  placeholder: 'rgba(29, 45, 40, 0.42)',
  chipBg: 'rgba(29, 45, 40, 0.08)',
  chipText: 'rgba(29, 45, 40, 0.6)',
  buttonBg: 'rgba(255, 255, 255, 0.58)',
  buttonText: 'rgba(29, 45, 40, 0.8)',
  inputBg: 'rgba(248, 244, 236, 0.88)',
  inputBorder: 'rgba(29, 45, 40, 0.1)',
  doneText: 'rgba(29, 45, 40, 0.48)',
  handleSoft: 'rgba(29, 45, 40, 0.22)',
  handleStrong: 'rgba(29, 45, 40, 0.34)',
}

const DEFAULT_NOTE_TEXT_ALIGN: NoteTextAlign = 'left'
const DEFAULT_NOTE_TEXT_SIZE: NoteTextSize = 'medium'
const DEFAULT_NOTE_TEXT_TOOLBAR_STATE: NoteTextToolbarState = {
  blockStyle: 'body',
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikeThrough: false,
  isBulletList: false,
  isNumberedList: false,
  textColor: null,
  defaultTextColor: null,
}

const NOTE_TEXT_THEME_COLOR_PAIRS = [
  { light: '#1d2d28', dark: '#f5eee4' },
  { light: '#176a8e', dark: '#8ed8f8' },
  { light: '#40693b', dark: '#9ed7a5' },
  { light: '#a4631b', dark: '#f2c48d' },
  { light: '#9b4a55', dark: '#f0a7b8' },
] as const

const DARK_CARD_VISUALS = {
  text: '#f5eee4',
  heading: '#fbf7f1',
  body: 'rgba(245, 238, 228, 0.88)',
  muted: 'rgba(245, 238, 228, 0.64)',
  placeholder: 'rgba(245, 238, 228, 0.34)',
  chipBg: 'rgba(245, 238, 228, 0.1)',
  chipText: 'rgba(245, 238, 228, 0.72)',
  buttonBg: 'rgba(245, 238, 228, 0.08)',
  buttonText: 'rgba(245, 238, 228, 0.84)',
  inputBg: 'rgba(245, 238, 228, 0.06)',
  inputBorder: 'rgba(245, 238, 228, 0.14)',
  doneText: 'rgba(245, 238, 228, 0.42)',
  handleSoft: 'rgba(245, 238, 228, 0.28)',
  handleStrong: 'rgba(245, 238, 228, 0.46)',
}

const SAMPLE_IMAGE = createMoodboardPreview()

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeHexColor(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  const shortMatch = /^#([0-9a-f]{3})$/i.exec(trimmed)
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split('')
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }

  const fullMatch = /^#([0-9a-f]{6})$/i.exec(trimmed)
  if (fullMatch) {
    return `#${fullMatch[1].toLowerCase()}`
  }

  return fallback
}

function hexToRgb(hex: string) {
  const normalized = normalizeHexColor(hex, hex)
  const match = /^#([0-9a-f]{6})$/i.exec(normalized)
  if (!match) {
    return { r: 0, g: 0, b: 0 }
  }

  return {
    r: Number.parseInt(match[1].slice(0, 2), 16),
    g: Number.parseInt(match[1].slice(2, 4), 16),
    b: Number.parseInt(match[1].slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`
}

function mixHexColors(baseHex: string, targetHex: string, amount: number) {
  const clampedAmount = clamp(amount, 0, 1)
  const base = hexToRgb(baseHex)
  const target = hexToRgb(targetHex)

  return rgbToHex(
    base.r + (target.r - base.r) * clampedAmount,
    base.g + (target.g - base.g) * clampedAmount,
    base.b + (target.b - base.b) * clampedAmount,
  )
}

function hexToRgba(hex: string, alpha: number) {
  const color = hexToRgb(hex)
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${clamp(alpha, 0, 1)})`
}

function getRelativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const normalizeChannel = (channel: number) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }

  const red = normalizeChannel(r)
  const green = normalizeChannel(g)
  const blue = normalizeChannel(b)

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function getContrastRatio(firstHex: string, secondHex: string) {
  const firstLuminance = getRelativeLuminance(firstHex)
  const secondLuminance = getRelativeLuminance(secondHex)
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

function shouldAutoEnableNightModeForSurface(color: string) {
  const defaultLightModeText = '#1d2d28'
  const minimumReadableContrast = 4.5

  return getContrastRatio(defaultLightModeText, color) < minimumReadableContrast
}

function isMidnightThemeColors(backgroundColor: string, sidebarColor: string) {
  return (
    normalizeHexColor(backgroundColor, DEFAULT_BACKGROUND_COLOR) ===
      MIDNIGHT_THEME_PRESET.backgroundColor &&
    normalizeHexColor(sidebarColor, DEFAULT_SIDEBAR_COLOR) === MIDNIGHT_THEME_PRESET.sidebarColor
  )
}

function getAppThemeState(settings: AppSettings) {
  const backgroundColor = normalizeHexColor(settings.backgroundColor, DEFAULT_BACKGROUND_COLOR)
  const sidebarColor = normalizeHexColor(settings.sidebarColor, DEFAULT_SIDEBAR_COLOR)
  const isMidnightTheme = isMidnightThemeColors(backgroundColor, sidebarColor)
  const isAutoNightModeBoard =
    !isMidnightTheme &&
    settings.themePresetId === CUSTOM_THEME_PRESET.id &&
    shouldAutoEnableNightModeForSurface(backgroundColor)
  const isAutoNightModeSidebar =
    !isMidnightTheme &&
    settings.themePresetId === CUSTOM_THEME_PRESET.id &&
    shouldAutoEnableNightModeForSurface(sidebarColor)
  const isNightMode = settings.isDarkMode && !isMidnightTheme
  const usesDarkWorkspaceChrome = isAutoNightModeBoard || isNightMode || isMidnightTheme
  const usesDarkSidebarChrome = isAutoNightModeSidebar || isNightMode || isMidnightTheme

  return {
    backgroundColor,
    sidebarColor,
    isMidnightTheme,
    isAutoNightMode: isAutoNightModeBoard || isAutoNightModeSidebar,
    isAutoNightModeBoard,
    isAutoNightModeSidebar,
    isNightMode,
    usesDarkItems: usesDarkWorkspaceChrome,
    usesDarkWorkspaceChrome,
    usesDarkSidebarChrome,
  }
}

function normalizeAppSettings(value: unknown): AppSettings {
  if (!isRecord(value)) {
    return {
      backgroundColor: DEFAULT_BACKGROUND_COLOR,
      sidebarColor: DEFAULT_SIDEBAR_COLOR,
      isDarkMode: false,
      themePresetId: 'paper',
    }
  }

  const backgroundColor = normalizeHexColor(value.backgroundColor, DEFAULT_BACKGROUND_COLOR)
  const sidebarColor = normalizeHexColor(value.sidebarColor, DEFAULT_SIDEBAR_COLOR)
  const isMidnightTheme = isMidnightThemeColors(backgroundColor, sidebarColor)
  const matchedBuiltInPreset =
    BUILT_IN_APP_THEME_PRESETS.find(
      (preset) =>
        preset.backgroundColor === backgroundColor && preset.sidebarColor === sidebarColor,
    ) ?? null
  const rawThemePresetId =
    typeof value.themePresetId === 'string'
      ? APP_THEME_PRESETS.find((preset) => preset.id === value.themePresetId)?.id ?? null
      : null

  return {
    backgroundColor,
    sidebarColor,
    isDarkMode: !isMidnightTheme && value.isDarkMode === true,
    themePresetId:
      rawThemePresetId ?? matchedBuiltInPreset?.id ?? CUSTOM_THEME_PRESET.id,
  }
}

function isAppThemePresetMatch(settings: AppSettings, preset: AppThemePreset) {
  const themeState = getAppThemeState(settings)

  return (
    themeState.backgroundColor === preset.backgroundColor &&
    themeState.sidebarColor === preset.sidebarColor
  )
}

function getActiveAppThemePreset(settings: AppSettings) {
  if (settings.themePresetId === CUSTOM_THEME_PRESET.id) {
    return CUSTOM_THEME_PRESET
  }

  const selectedPreset = BUILT_IN_APP_THEME_PRESETS.find(
    (preset) => preset.id === settings.themePresetId,
  )
  if (selectedPreset && isAppThemePresetMatch(settings, selectedPreset)) {
    return selectedPreset
  }

  return (
    BUILT_IN_APP_THEME_PRESETS.find((preset) => isAppThemePresetMatch(settings, preset)) ??
    CUSTOM_THEME_PRESET
  )
}

function buildChromeThemeTokens(
  usesDarkChrome: boolean,
  isMidnightTheme: boolean,
  accentColorSource: string,
) {
  const textColor = usesDarkChrome ? '#f5eee4' : '#1d2d28'
  const borderColor = usesDarkChrome
    ? hexToRgba('#ffffff', 0.12)
    : hexToRgba('#1d2d28', 0.08)
  const strongBorderColor = usesDarkChrome
    ? hexToRgba('#ffffff', 0.18)
    : hexToRgba('#1d2d28', 0.16)
  const focusColor = usesDarkChrome
    ? hexToRgba(mixHexColors(accentColorSource, '#9ed9cb', 0.45), isMidnightTheme ? 0.34 : 0.28)
    : hexToRgba('#194f47', 0.16)
  const surfaceBg = isMidnightTheme
    ? hexToRgba('#ffffff', 0.06)
    : usesDarkChrome
    ? 'rgba(10, 11, 10, 0.94)'
    : 'rgba(255, 255, 255, 0.56)'
  const surfaceHoverBg = isMidnightTheme
    ? hexToRgba('#ffffff', 0.11)
    : usesDarkChrome
    ? 'rgba(16, 18, 16, 0.98)'
    : 'rgba(255, 255, 255, 0.88)'
  const surfaceActiveBg = isMidnightTheme
    ? hexToRgba(mixHexColors(accentColorSource, '#a7d6cc', 0.42), 0.18)
    : usesDarkChrome
    ? 'rgba(25, 28, 26, 0.98)'
    : 'rgba(240, 248, 245, 0.94)'
  const surfaceIconStart = isMidnightTheme
    ? hexToRgba('#ffffff', 0.1)
    : usesDarkChrome
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(255, 255, 255, 0.94)'
  const surfaceIconEnd = isMidnightTheme
    ? hexToRgba('#ffffff', 0.04)
    : usesDarkChrome
    ? 'rgba(255, 255, 255, 0.02)'
    : 'rgba(245, 238, 226, 0.95)'
  const panelBg = isMidnightTheme
    ? hexToRgba('#101412', 0.76)
    : usesDarkChrome
    ? 'rgba(9, 10, 9, 0.96)'
    : 'rgba(255, 252, 247, 0.72)'
  const panelInset = usesDarkChrome
    ? hexToRgba('#ffffff', isMidnightTheme ? 0.08 : 0.06)
    : 'rgba(255, 255, 255, 0.74)'
  const emptyStateBg = isMidnightTheme
    ? hexToRgba('#0f1412', 0.92)
    : usesDarkChrome
    ? 'rgba(10, 11, 10, 0.96)'
    : 'rgba(255, 251, 244, 0.92)'
  const switchBg = isMidnightTheme
    ? hexToRgba('#101412', 0.9)
    : usesDarkChrome
    ? 'rgba(10, 11, 10, 0.96)'
    : 'rgba(255, 252, 247, 0.9)'
  const switchTrackOff = usesDarkChrome
    ? hexToRgba('#ffffff', isMidnightTheme ? 0.16 : 0.18)
    : 'rgba(29, 45, 40, 0.14)'
  const switchTrackOn = usesDarkChrome
    ? hexToRgba(mixHexColors(accentColorSource, '#9ed9cb', 0.45), 0.9)
    : 'rgba(25, 79, 71, 0.86)'
  const switchThumb = usesDarkChrome ? '#f5eee4' : 'rgba(255, 252, 247, 0.98)'
  const inputBg = usesDarkChrome ? hexToRgba('#ffffff', 0.06) : 'rgba(255, 255, 255, 0.9)'
  const inputBgStrong = usesDarkChrome
    ? hexToRgba('#ffffff', 0.1)
    : 'rgba(255, 255, 255, 0.98)'
  const inputBorder = usesDarkChrome
    ? hexToRgba('#ffffff', 0.12)
    : 'rgba(29, 45, 40, 0.12)'
  const rangeTrack = usesDarkChrome ? hexToRgba('#ffffff', 0.14) : 'rgba(29, 45, 40, 0.12)'
  const rangeFill = usesDarkChrome
    ? mixHexColors(accentColorSource, '#9ed9cb', isMidnightTheme ? 0.45 : 0.34)
    : '#194f47'

  return {
    textColor,
    mutedTextColor: hexToRgba(textColor, usesDarkChrome ? 0.72 : 0.64),
    borderColor,
    strongBorderColor,
    focusColor,
    surfaceBg,
    surfaceHoverBg,
    surfaceActiveBg,
    surfaceIconStart,
    surfaceIconEnd,
    surfaceShadow: usesDarkChrome
      ? '0 10px 18px rgba(0, 0, 0, 0.22)'
      : '0 10px 18px rgba(31, 39, 35, 0.08)',
    panelBg,
    panelInset,
    emptyStateBg,
    emptyStateShadow: usesDarkChrome
      ? '0 22px 40px rgba(0, 0, 0, 0.24)'
      : '0 22px 40px rgba(31, 39, 35, 0.08)',
    switchBg,
    switchTrackOff,
    switchTrackOn,
    switchThumb,
    modalBackdrop: usesDarkChrome ? 'rgba(6, 8, 8, 0.58)' : 'rgba(16, 22, 20, 0.24)',
    inputBg,
    inputBgStrong,
    inputBorder,
    rangeTrack,
    rangeFill,
  }
}

function buildAppThemeStyle(settings: AppSettings): CSSProperties {
  const {
    backgroundColor,
    sidebarColor,
    isMidnightTheme,
    usesDarkWorkspaceChrome,
    usesDarkSidebarChrome,
  } = getAppThemeState(settings)
  const isCustomTheme = settings.themePresetId === CUSTOM_THEME_PRESET.id
  const sidebarChrome = buildChromeThemeTokens(
    usesDarkSidebarChrome,
    isMidnightTheme,
    sidebarColor,
  )
  const workspaceChrome = buildChromeThemeTokens(
    usesDarkWorkspaceChrome,
    isMidnightTheme,
    sidebarColor,
  )

  const sidebarBgStart = isCustomTheme
    ? sidebarColor
    : isMidnightTheme
    ? mixHexColors(sidebarColor, '#1b1f1d', 0.68)
    : mixHexColors(sidebarColor, '#ffffff', 0.8)
  const sidebarBgEnd = isCustomTheme
    ? sidebarColor
    : isMidnightTheme
    ? mixHexColors(sidebarColor, '#080909', 0.8)
    : mixHexColors(sidebarColor, '#efe6d8', 0.62)
  const workspaceBgStart = isCustomTheme
    ? backgroundColor
    : isMidnightTheme
    ? mixHexColors(backgroundColor, '#171a18', 0.7)
    : mixHexColors(backgroundColor, '#faf4ea', 0.74)
  const workspaceBgEnd = isCustomTheme
    ? backgroundColor
    : isMidnightTheme
    ? mixHexColors(backgroundColor, '#070808', 0.82)
    : mixHexColors(backgroundColor, '#efe8dc', 0.58)
  const accentColor = mixHexColors(sidebarColor, '#f18857', isMidnightTheme ? 0.28 : 0.46)
  const modalBg = isMidnightTheme
    ? mixHexColors(sidebarColor, '#111513', 0.72)
    : usesDarkSidebarChrome
    ? 'rgba(10, 11, 10, 0.98)'
    : mixHexColors(backgroundColor, '#fffaf2', 0.78)
  const modalShadow = usesDarkSidebarChrome
    ? '0 24px 54px rgba(0, 0, 0, 0.34)'
    : '0 24px 54px rgba(31, 39, 35, 0.16)'

  return {
    '--app-text': sidebarChrome.textColor,
    '--app-muted-text': sidebarChrome.mutedTextColor,
    '--app-border': sidebarChrome.borderColor,
    '--app-border-strong': sidebarChrome.strongBorderColor,
    '--app-focus-ring': sidebarChrome.focusColor,
    '--sidebar-bg-start': sidebarBgStart,
    '--sidebar-bg-end': sidebarBgEnd,
    '--sidebar-glow': isCustomTheme
      ? 'rgba(0, 0, 0, 0)'
      : hexToRgba(accentColor, isMidnightTheme ? 0.22 : 0.32),
    '--workspace-bg-start': workspaceBgStart,
    '--workspace-bg-end': workspaceBgEnd,
    '--workspace-glow': isCustomTheme
      ? 'rgba(0, 0, 0, 0)'
      : hexToRgba(accentColor, isMidnightTheme ? 0.16 : 0.18),
    '--workspace-orb-a': isCustomTheme
      ? 'rgba(0, 0, 0, 0)'
      : isMidnightTheme
      ? hexToRgba(mixHexColors(backgroundColor, '#f18857', 0.45), 0.14)
      : 'rgba(255, 239, 205, 0.85)',
    '--workspace-orb-b': isCustomTheme
      ? 'rgba(0, 0, 0, 0)'
      : isMidnightTheme
      ? hexToRgba(mixHexColors(backgroundColor, '#8dcfc2', 0.42), 0.12)
      : 'rgba(204, 233, 230, 0.75)',
    '--surface-bg': sidebarChrome.surfaceBg,
    '--surface-hover-bg': sidebarChrome.surfaceHoverBg,
    '--surface-active-bg': sidebarChrome.surfaceActiveBg,
    '--surface-icon-start': sidebarChrome.surfaceIconStart,
    '--surface-icon-end': sidebarChrome.surfaceIconEnd,
    '--surface-shadow': sidebarChrome.surfaceShadow,
    '--panel-bg': sidebarChrome.panelBg,
    '--panel-inset': sidebarChrome.panelInset,
    '--canvas-bg': isCustomTheme ? backgroundColor : workspaceBgEnd,
    '--canvas-inset': isMidnightTheme
      ? hexToRgba('#ffffff', 0.08)
      : 'rgba(255, 255, 255, 0.7)',
    '--canvas-shadow': isMidnightTheme
      ? '0 22px 48px rgba(0, 0, 0, 0.28)'
      : '0 22px 48px rgba(31, 39, 35, 0.08)',
    '--grid-line': isMidnightTheme
      ? hexToRgba('#f5eee4', 0.08)
      : 'rgba(29, 45, 40, 0.055)',
    '--empty-state-bg': workspaceChrome.emptyStateBg,
    '--empty-state-shadow': workspaceChrome.emptyStateShadow,
    '--switch-bg': sidebarChrome.switchBg,
    '--switch-track-off': sidebarChrome.switchTrackOff,
    '--switch-track-on': sidebarChrome.switchTrackOn,
    '--switch-thumb': sidebarChrome.switchThumb,
    '--modal-bg': modalBg,
    '--modal-shadow': modalShadow,
    '--modal-backdrop': sidebarChrome.modalBackdrop,
    '--input-bg': sidebarChrome.inputBg,
    '--input-bg-strong': sidebarChrome.inputBgStrong,
    '--input-border': sidebarChrome.inputBorder,
    '--range-track': sidebarChrome.rangeTrack,
    '--range-fill': sidebarChrome.rangeFill,
    '--sidebar-text': sidebarChrome.textColor,
    '--sidebar-muted-text': sidebarChrome.mutedTextColor,
    '--sidebar-border': sidebarChrome.borderColor,
    '--sidebar-border-strong': sidebarChrome.strongBorderColor,
    '--sidebar-focus-ring': sidebarChrome.focusColor,
    '--sidebar-surface-bg': sidebarChrome.surfaceBg,
    '--sidebar-surface-hover-bg': sidebarChrome.surfaceHoverBg,
    '--sidebar-surface-active-bg': sidebarChrome.surfaceActiveBg,
    '--sidebar-surface-icon-start': sidebarChrome.surfaceIconStart,
    '--sidebar-surface-icon-end': sidebarChrome.surfaceIconEnd,
    '--sidebar-surface-shadow': sidebarChrome.surfaceShadow,
    '--sidebar-panel-bg': sidebarChrome.panelBg,
    '--sidebar-panel-inset': sidebarChrome.panelInset,
    '--sidebar-switch-bg': sidebarChrome.switchBg,
    '--sidebar-switch-track-off': sidebarChrome.switchTrackOff,
    '--sidebar-switch-track-on': sidebarChrome.switchTrackOn,
    '--sidebar-switch-thumb': sidebarChrome.switchThumb,
    '--sidebar-input-bg': sidebarChrome.inputBg,
    '--sidebar-input-bg-strong': sidebarChrome.inputBgStrong,
    '--sidebar-input-border': sidebarChrome.inputBorder,
    '--sidebar-range-track': sidebarChrome.rangeTrack,
    '--sidebar-range-fill': sidebarChrome.rangeFill,
    '--workspace-text': workspaceChrome.textColor,
    '--workspace-muted-text': workspaceChrome.mutedTextColor,
    '--workspace-border': workspaceChrome.borderColor,
    '--workspace-border-strong': workspaceChrome.strongBorderColor,
    '--workspace-focus-ring': workspaceChrome.focusColor,
    '--workspace-surface-bg': workspaceChrome.surfaceBg,
    '--workspace-surface-hover-bg': workspaceChrome.surfaceHoverBg,
    '--workspace-surface-active-bg': workspaceChrome.surfaceActiveBg,
    '--workspace-surface-icon-start': workspaceChrome.surfaceIconStart,
    '--workspace-surface-icon-end': workspaceChrome.surfaceIconEnd,
    '--workspace-surface-shadow': workspaceChrome.surfaceShadow,
    '--workspace-panel-bg': workspaceChrome.panelBg,
    '--workspace-panel-inset': workspaceChrome.panelInset,
    '--workspace-switch-bg': workspaceChrome.switchBg,
    '--workspace-switch-track-off': workspaceChrome.switchTrackOff,
    '--workspace-switch-track-on': workspaceChrome.switchTrackOn,
    '--workspace-switch-thumb': workspaceChrome.switchThumb,
    '--workspace-input-bg': workspaceChrome.inputBg,
    '--workspace-input-bg-strong': workspaceChrome.inputBgStrong,
    '--workspace-input-border': workspaceChrome.inputBorder,
    '--workspace-range-track': workspaceChrome.rangeTrack,
    '--workspace-range-fill': workspaceChrome.rangeFill,
    '--workspace-contrast-line': usesDarkWorkspaceChrome ? '#ffffff' : '#000000',
  } as CSSProperties
}

function touchBoard(board: BoardState): BoardState {
  return {
    ...board,
    updatedAt: new Date().toISOString(),
  }
}

function createDefaultViewport(): CanvasViewport {
  return {
    x: 290,
    y: 170,
    zoom: 0.82,
  }
}

function createBoardTab(board: BoardState, viewport = createDefaultViewport()): BoardTabState {
  return {
    id: crypto.randomUUID(),
    board,
    viewport,
  }
}

function createEmptyBoard(title: string): BoardState {
  return {
    title,
    updatedAt: new Date().toISOString(),
    cards: [],
    strokes: [],
    connectors: [],
  }
}

function getLocalCalendarDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getLocalCalendarMonthKey(date = new Date()) {
  return getLocalCalendarDateKey(date).slice(0, 7)
}

function createEmptyCalendarState(date = new Date()): CalendarState {
  return {
    visibleMonth: getLocalCalendarMonthKey(date),
    selectedDate: null,
    entries: {},
  }
}

function normalizeCalendarMonthKey(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)
    ? value
    : getLocalCalendarMonthKey()
}

function normalizeCalendarDateKey(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : null
}

function normalizeCalendarAutoMention(value: unknown): CalendarAutoMention | null {
  if (!isRecord(value)) {
    return null
  }

  const cardKind =
    typeof value.cardKind === 'string' &&
    ['note', 'heading', 'todo', 'link', 'image', 'document', 'table', 'column'].includes(
      value.cardKind,
    )
      ? (value.cardKind as BoardCard['kind'])
      : null

  if (
    typeof value.id !== 'string' ||
    typeof value.boardId !== 'string' ||
    typeof value.boardLabel !== 'string' ||
    typeof value.cardId !== 'string' ||
    cardKind === null ||
    typeof value.sourceLabel !== 'string' ||
    typeof value.excerpt !== 'string'
  ) {
    return null
  }

  return {
    id: value.id,
    boardId: value.boardId,
    boardLabel: value.boardLabel,
    cardId: value.cardId,
    cardKind,
    sourceLabel: value.sourceLabel,
    excerpt: value.excerpt,
  }
}

function isCalendarEntryMeaningful(
  entry: Pick<CalendarEntry, 'headline' | 'plans' | 'notes' | 'palette' | 'autoMentions'>,
) {
  return (
    Boolean(entry.headline.trim()) ||
    Boolean(entry.plans.trim()) ||
    Boolean(entry.notes.trim()) ||
    entry.palette !== DEFAULT_CARD_PALETTE ||
    Boolean(entry.autoMentions?.length)
  )
}

function normalizeCalendarEntry(value: unknown): CalendarEntry | null {
  if (!isRecord(value)) {
    return null
  }

  const headline = typeof value.headline === 'string' ? value.headline : ''
  const plans = typeof value.plans === 'string' ? value.plans : ''
  const notes = typeof value.notes === 'string' ? value.notes : ''
  const palette = normalizePaletteId(value.palette)
  const autoMentions = Array.isArray(value.autoMentions)
    ? value.autoMentions
        .map((autoMentionValue) => normalizeCalendarAutoMention(autoMentionValue))
        .filter((autoMention): autoMention is CalendarAutoMention => autoMention !== null)
    : []

  if (
    !isCalendarEntryMeaningful({
      headline,
      plans,
      notes,
      palette,
      autoMentions,
    })
  ) {
    return null
  }

  return {
    headline,
    plans,
    notes,
    palette,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
    ...(autoMentions.length ? { autoMentions } : {}),
  }
}

function normalizeCalendarState(value: unknown): CalendarState {
  const fallbackState = createEmptyCalendarState()

  if (!isRecord(value)) {
    return fallbackState
  }

  const entries: Record<string, CalendarEntry> = {}
  const rawEntries = 'entries' in value ? value.entries : null

  if (isRecord(rawEntries)) {
    for (const [dateKey, entryValue] of Object.entries(rawEntries)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        continue
      }

      const normalizedEntry = normalizeCalendarEntry(entryValue)
      if (normalizedEntry) {
        entries[dateKey] = normalizedEntry
      }
    }
  }

  return {
    visibleMonth: normalizeCalendarMonthKey(value.visibleMonth),
    selectedDate: normalizeCalendarDateKey(value.selectedDate),
    entries,
  }
}

function getConnectorKey(fromCardId: string, toCardId: string) {
  return [fromCardId, toCardId].sort().join('::')
}

function normalizeBoardConnectors(connectors: unknown, cards: BoardCard[]): BoardConnector[] {
  if (!Array.isArray(connectors)) {
    return []
  }

  const cardIds = new Set(cards.map((card) => card.id))
  const seenKeys = new Set<string>()
  const normalizedConnectors: BoardConnector[] = []

  for (const connector of connectors) {
    if (!isRecord(connector)) {
      continue
    }

    const fromCardId =
      typeof connector.fromCardId === 'string' ? connector.fromCardId : null
    const toCardId =
      typeof connector.toCardId === 'string' ? connector.toCardId : null

    if (
      !fromCardId ||
      !toCardId ||
      fromCardId === toCardId ||
      !cardIds.has(fromCardId) ||
      !cardIds.has(toCardId)
    ) {
      continue
    }

    const connectorKey = getConnectorKey(fromCardId, toCardId)
    if (seenKeys.has(connectorKey)) {
      continue
    }

    seenKeys.add(connectorKey)
    normalizedConnectors.push({
      id:
        typeof connector.id === 'string' && connector.id.trim().length > 0
          ? connector.id
          : crypto.randomUUID(),
      fromCardId,
      toCardId,
    })
  }

  return normalizedConnectors
}

function getActiveBoardTabIndex(workspace: WorkspaceSnapshot) {
  const activeIndex = workspace.boards.findIndex((boardTab) => boardTab.id === workspace.activeBoardId)
  return activeIndex >= 0 ? activeIndex : 0
}

function getActiveBoardTab(workspace: WorkspaceSnapshot): BoardTabState {
  return workspace.boards[getActiveBoardTabIndex(workspace)]
}

function updateActiveBoardTab(
  workspace: WorkspaceSnapshot,
  recipe: (currentBoardTab: BoardTabState) => BoardTabState,
): WorkspaceSnapshot {
  const activeIndex = getActiveBoardTabIndex(workspace)
  const nextBoards = workspace.boards.map((boardTab, index) =>
    index === activeIndex ? recipe(boardTab) : boardTab,
  )

  return {
    ...workspace,
    boards: nextBoards,
    activeBoardId: nextBoards[activeIndex]?.id ?? workspace.activeBoardId,
  }
}

function getNextZIndex(cards: BoardCard[]) {
  return cards.reduce((highest, card) => Math.max(highest, card.zIndex), 0) + 1
}

function getNextPaletteId(): NotePaletteId {
  return DEFAULT_CARD_PALETTE
}

function normalizeTableColumnCount(value: unknown, fallback = TABLE_DEFAULT_COLUMNS) {
  return clamp(
    typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback,
    TABLE_MIN_COLUMNS,
    TABLE_MAX_COLUMNS,
  )
}

function normalizeTableRowCount(value: unknown, fallback = TABLE_DEFAULT_ROWS) {
  return clamp(
    typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback,
    TABLE_MIN_ROWS,
    TABLE_MAX_ROWS,
  )
}

function createEmptyTableCells(rowCount: number, columnCount: number) {
  return Array.from({ length: rowCount }, () =>
    Array.from({ length: columnCount }, () => ''),
  )
}

function getTableCellColorSwatches(usesDarkItems: boolean) {
  return usesDarkItems ? DARK_TABLE_CELL_COLOR_SWATCHES : LIGHT_TABLE_CELL_COLOR_SWATCHES
}

function getThemeTableCellBaseFillColor(
  type: TableCellSurfaceType,
  tone: TableCellTone = 'default',
) {
  if (type === 'header') {
    return 'var(--table-header-bg, color-mix(in srgb, var(--workspace-range-fill, #194f47) 18%, var(--workspace-input-bg-strong, rgba(255, 255, 255, 0.98)) 82%))'
  }

  if (tone === 'muted') {
    return 'var(--table-muted-bg, color-mix(in srgb, var(--workspace-surface-bg, rgba(255, 255, 255, 0.56)) 62%, var(--workspace-panel-bg, rgba(255, 252, 247, 0.72)) 38%))'
  }

  if (tone === 'accent') {
    return 'var(--table-accent-bg, color-mix(in srgb, var(--workspace-range-fill, #194f47) 24%, var(--workspace-input-bg-strong, rgba(255, 255, 255, 0.98)) 76%))'
  }

  return 'var(--table-cell-bg, color-mix(in srgb, var(--workspace-input-bg-strong, rgba(255, 255, 255, 0.98)) 88%, var(--workspace-panel-bg, rgba(255, 252, 247, 0.72)) 12%))'
}

function getDefaultTableCellFillColor(
  type: TableCellSurfaceType,
  tone: TableCellTone = 'default',
  usesDarkItems: boolean,
) {
  if (type === 'header') {
    return usesDarkItems ? '#4a4a4a' : '#ece4d8'
  }

  if (tone === 'muted') {
    return usesDarkItems ? '#3b3b3b' : '#e3ddd4'
  }

  if (tone === 'accent') {
    return usesDarkItems ? '#35515b' : '#d4ebf6'
  }

  return usesDarkItems ? '#343434' : '#f7f1e6'
}

function getTableCellFillColor(format: TableCellFormat, usesDarkItems: boolean) {
  return format.backgroundColor ?? getDefaultTableCellFillColor(format.type, format.tone, usesDarkItems)
}

function getThemeTableCellFillColor(format: TableCellFormat) {
  return format.backgroundColor ?? getThemeTableCellBaseFillColor(format.type, format.tone)
}

function getLegacyTableCellTextStyle(blockStyle: NoteBlockStyle, isBold: boolean): TableCellTextStyle {
  if (blockStyle === 'code') {
    return 'code'
  }

  return isBold ? 'strong' : 'body'
}

function createDefaultTableCellFormat(rowIndex: number): TableCellFormat {
  return {
    align: 'left',
    tone: 'default',
    textStyle: 'body',
    type: rowIndex === 0 ? 'header' : 'body',
    valueType: 'auto',
    blockStyle: 'body',
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikeThrough: false,
    backgroundColor: null,
  }
}

function normalizeTableCellAlign(value: unknown): TableCellAlign {
  return value === 'center' || value === 'right' ? value : 'left'
}

function normalizeTableCellTone(value: unknown): TableCellTone {
  return value === 'muted' || value === 'accent' ? value : 'default'
}

function normalizeTableCellTextStyle(value: unknown): TableCellTextStyle {
  return value === 'strong' || value === 'code' ? value : 'body'
}

function normalizeTableCellType(value: unknown, rowIndex: number): TableCellSurfaceType {
  return value === 'header' ? 'header' : rowIndex === 0 ? 'header' : 'body'
}

function normalizeTableCellValueType(value: unknown): TableCellValueType {
  return TABLE_CELL_TYPE_OPTIONS.some((option) => option.id === value)
    ? (value as TableCellValueType)
    : 'auto'
}

function normalizeTableCellBlockStyle(value: unknown): NoteBlockStyle {
  return value === 'heading' || value === 'quote' || value === 'code' ? value : 'body'
}

function normalizeOptionalTableCellColor(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const normalizedColor = normalizeHexColor(value, '')
  return /^#[0-9a-f]{6}$/i.test(normalizedColor) ? normalizedColor : null
}

function normalizeSingleTableCellFormat(value: unknown, rowIndex: number): TableCellFormat {
  if (!isRecord(value)) {
    return createDefaultTableCellFormat(rowIndex)
  }

  const legacyTextStyle = normalizeTableCellTextStyle(value.textStyle)
  const normalizedBlockStyle =
    'blockStyle' in value
      ? normalizeTableCellBlockStyle(value.blockStyle)
      : legacyTextStyle === 'code'
      ? 'code'
      : 'body'

  return {
    align: normalizeTableCellAlign(value.align),
    tone: normalizeTableCellTone(value.tone),
    textStyle: legacyTextStyle,
    type: normalizeTableCellType(value.type, rowIndex),
    valueType: normalizeTableCellValueType(value.valueType),
    blockStyle: normalizedBlockStyle,
    isBold: typeof value.isBold === 'boolean' ? value.isBold : legacyTextStyle === 'strong',
    isItalic: value.isItalic === true,
    isUnderline: value.isUnderline === true,
    isStrikeThrough: value.isStrikeThrough === true,
    backgroundColor: normalizeOptionalTableCellColor(value.backgroundColor),
  }
}

function normalizeTableCellFormats(value: unknown, rowCount: number, columnCount: number) {
  const sourceRows = Array.isArray(value) ? value : []

  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const sourceRow = Array.isArray(sourceRows[rowIndex]) ? sourceRows[rowIndex] : []

    return Array.from({ length: columnCount }, (_, columnIndex) =>
      normalizeSingleTableCellFormat(sourceRow[columnIndex], rowIndex),
    )
  })
}

function normalizeTableCells(value: unknown, rowCount: number, columnCount: number) {
  const sourceRows = Array.isArray(value) ? value : []

  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const sourceRow = Array.isArray(sourceRows[rowIndex]) ? sourceRows[rowIndex] : []

    return Array.from({ length: columnCount }, (_, columnIndex) =>
      typeof sourceRow[columnIndex] === 'string' ? sourceRow[columnIndex] : '',
    )
  })
}

function getTableCardDimensions(rowCount: number, columnCount: number, showTitle = false) {
  return {
    width: columnCount * TABLE_CELL_WIDTH,
    height: rowCount * TABLE_CELL_HEIGHT + (showTitle ? TABLE_TITLE_HEIGHT : 0),
  }
}

function resizeTableCard(
  card: Omit<TableCard, 'width' | 'height' | 'rowCount' | 'columnCount' | 'cells'> & {
    width: number
    height: number
    rowCount: number
    columnCount: number
    cells: string[][]
    cellFormats: TableCellFormat[][]
  },
  rowCount: number,
  columnCount: number,
  options?: {
    previousShowTitle?: boolean
  },
): TableCard {
  const normalizedRowCount = normalizeTableRowCount(rowCount, card.rowCount)
  const normalizedColumnCount = normalizeTableColumnCount(columnCount, card.columnCount)
  const previousShowTitle = options?.previousShowTitle ?? card.showTitle
  const previousTitleHeight = previousShowTitle ? TABLE_TITLE_HEIGHT : 0
  const nextTitleHeight = card.showTitle ? TABLE_TITLE_HEIGHT : 0
  const currentColumnCount = Math.max(card.columnCount, 1)
  const currentRowCount = Math.max(card.rowCount, 1)
  const currentWidth = Number.isFinite(card.width)
    ? card.width
    : getTableCardDimensions(card.rowCount, card.columnCount, previousShowTitle).width
  const currentBodyHeight = Math.max(
    TABLE_CELL_HEIGHT,
    (Number.isFinite(card.height)
      ? card.height
      : getTableCardDimensions(card.rowCount, card.columnCount, previousShowTitle).height) -
      previousTitleHeight,
  )
  const currentColumnWidth = Math.max(1, currentWidth / currentColumnCount)
  const currentRowHeight = Math.max(1, currentBodyHeight / currentRowCount)
  const dimensions = {
    width: Math.max(
      getTableCardDimensions(TABLE_MIN_ROWS, TABLE_MIN_COLUMNS).width,
      Math.round(currentColumnWidth * normalizedColumnCount),
    ),
    height: Math.max(
      nextTitleHeight + TABLE_CELL_HEIGHT,
      Math.round(currentRowHeight * normalizedRowCount + nextTitleHeight),
    ),
  }

  return {
    ...card,
    ...dimensions,
    rowCount: normalizedRowCount,
    columnCount: normalizedColumnCount,
    cells: normalizeTableCells(card.cells, normalizedRowCount, normalizedColumnCount),
    cellFormats: normalizeTableCellFormats(
      card.cellFormats,
      normalizedRowCount,
      normalizedColumnCount,
    ),
  }
}

function getTableColumnLabel(columnIndex: number) {
  let remainingIndex = columnIndex
  let label = ''

  do {
    label = String.fromCharCode(65 + (remainingIndex % 26)) + label
    remainingIndex = Math.floor(remainingIndex / 26) - 1
  } while (remainingIndex >= 0)

  return label
}

function getTableCellCoordinateLabel(rowIndex: number, columnIndex: number) {
  return `${getTableColumnLabel(columnIndex)}${rowIndex + 1}`
}

function createTableCellSelection(
  cardId: string,
  rowIndex: number,
  columnIndex: number,
  anchorRowIndex = rowIndex,
  anchorColumnIndex = columnIndex,
): TableCellSelection {
  return {
    cardId,
    rowIndex,
    columnIndex,
    anchorRowIndex,
    anchorColumnIndex,
  }
}

function getTableCellSelectionRange(
  selection: Pick<
    TableCellSelection,
    'rowIndex' | 'columnIndex' | 'anchorRowIndex' | 'anchorColumnIndex'
  >,
): TableCellSelectionRange {
  return {
    startRowIndex: Math.min(selection.anchorRowIndex, selection.rowIndex),
    endRowIndex: Math.max(selection.anchorRowIndex, selection.rowIndex),
    startColumnIndex: Math.min(selection.anchorColumnIndex, selection.columnIndex),
    endColumnIndex: Math.max(selection.anchorColumnIndex, selection.columnIndex),
  }
}

function getTableCellSelectionSize(range: TableCellSelectionRange) {
  return (
    (range.endRowIndex - range.startRowIndex + 1) *
    (range.endColumnIndex - range.startColumnIndex + 1)
  )
}

function getTableCellSelectionLabel(range: TableCellSelectionRange) {
  const startLabel = getTableCellCoordinateLabel(range.startRowIndex, range.startColumnIndex)
  const endLabel = getTableCellCoordinateLabel(range.endRowIndex, range.endColumnIndex)

  return startLabel === endLabel ? startLabel : `${startLabel}:${endLabel}`
}

function isTableCellWithinSelectionRange(
  rowIndex: number,
  columnIndex: number,
  range: TableCellSelectionRange,
) {
  return (
    rowIndex >= range.startRowIndex &&
    rowIndex <= range.endRowIndex &&
    columnIndex >= range.startColumnIndex &&
    columnIndex <= range.endColumnIndex
  )
}

function isTableCellSelectionView(value: SelectionSidebarView) {
  return (
    value === 'table-cell-style' ||
    value === 'table-cell-type' ||
    value === 'table-cell-color' ||
    value === 'table-cell-align'
  )
}

function isColumnCard(card: BoardCard): card is ColumnCard {
  return card.kind === 'column'
}

function isColumnChildCard(card: BoardCard): card is ColumnChildCard {
  return card.kind !== 'column'
}

function getNotePalettes(usesDarkItems: boolean) {
  return usesDarkItems ? DARK_NOTE_PALETTES : NOTE_PALETTES
}

function getNotePaletteMap(usesDarkItems: boolean) {
  return usesDarkItems ? DARK_PALETTE_MAP : PALETTE_MAP
}

function getCardVisualTheme(paletteId: NotePaletteId, usesDarkItems: boolean) {
  const palette = getNotePaletteMap(usesDarkItems)[paletteId]

  return {
    ...(usesDarkItems ? DARK_CARD_VISUALS : DEFAULT_CARD_VISUALS),
    accent: palette.accent,
    background: palette.background,
    border: palette.border,
    shadow: palette.shadow,
  }
}

function isSidebarCreateToolKind(value: unknown): value is SidebarCreateToolKind {
  return (
    value === 'heading' ||
    value === 'note' ||
    value === 'todo' ||
    value === 'link' ||
    value === 'table' ||
    value === 'column'
  )
}

function getSidebarCreateToolLabel(kind: SidebarCreateToolKind) {
  switch (kind) {
    case 'heading':
      return 'Heading'
    case 'note':
      return 'Note'
    case 'todo':
      return 'To do'
    case 'link':
      return 'Link'
    case 'table':
      return 'Table'
    case 'column':
      return 'Column'
  }
}

function getSidebarCreateToolSize(kind: SidebarCreateToolKind) {
  switch (kind) {
    case 'heading':
      return { width: HEADING_WIDTH, height: HEADING_HEIGHT }
    case 'note':
      return { width: NOTE_WIDTH, height: EMPTY_NOTE_HEIGHT }
    case 'todo':
      return { width: TODO_WIDTH, height: EMPTY_TODO_HEIGHT }
    case 'link':
      return { width: LINK_WIDTH, height: LINK_HEIGHT }
    case 'table':
      return getTableCardDimensions(TABLE_DEFAULT_ROWS, TABLE_DEFAULT_COLUMNS)
    case 'column':
      return { width: COLUMN_WIDTH, height: COLUMN_HEIGHT }
  }
}

function getSidebarCreateToolFromDataTransfer(dataTransfer: DataTransfer | null) {
  if (!dataTransfer) {
    return null
  }

  const customData = dataTransfer.getData(TOOLBAR_CREATE_DRAG_DATA_TYPE)
  if (isSidebarCreateToolKind(customData)) {
    return customData
  }

  const plainTextData = dataTransfer.getData('text/plain')
  if (plainTextData.startsWith(TOOLBAR_CREATE_DRAG_TEXT_PREFIX)) {
    const toolKind = plainTextData.slice(TOOLBAR_CREATE_DRAG_TEXT_PREFIX.length)
    return isSidebarCreateToolKind(toolKind) ? toolKind : null
  }

  return null
}

function normalizeNoteTextAlign(value: unknown): NoteTextAlign {
  return value === 'center' || value === 'right' ? value : DEFAULT_NOTE_TEXT_ALIGN
}

function normalizeNoteTextSize(value: unknown): NoteTextSize {
  return value === 'small' || value === 'large' ? value : DEFAULT_NOTE_TEXT_SIZE
}

function normalizeNoteContentMode(value: unknown): NoteContentMode {
  return value === 'rich' ? 'rich' : 'plain'
}

function getDefaultNoteTextSettings() {
  return {
    textAlign: DEFAULT_NOTE_TEXT_ALIGN,
    textSize: DEFAULT_NOTE_TEXT_SIZE,
    isBold: false,
    isItalic: false,
  }
}

function getNoteTextInputStyle(
  note: Pick<RichTextCard, 'textAlign' | 'textSize' | 'isBold' | 'isItalic'>,
): CSSProperties {
  const fontSize =
    note.textSize === 'small' ? '0.9rem' : note.textSize === 'large' ? '1.18rem' : '1rem'

  return {
    textAlign: note.textAlign,
    fontSize,
    fontWeight: note.isBold ? 700 : 500,
    fontStyle: note.isItalic ? 'italic' : 'normal',
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function getLegacyNoteTextStyleString(
  note: Pick<RichTextCard, 'textAlign' | 'textSize' | 'isBold' | 'isItalic'>,
) {
  const noteStyle = getNoteTextInputStyle(note)
  const styleEntries = Object.entries(noteStyle).map(([key, value]) => {
    const cssKey = key.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)
    return `${cssKey}: ${String(value)}`
  })

  return styleEntries.join('; ')
}

function convertPlainTextToRichNoteHtml(
  text: string,
  noteStyle?: Pick<RichTextCard, 'textAlign' | 'textSize' | 'isBold' | 'isItalic'>,
) {
  const normalizedText = text.replace(/\r\n?/g, '\n').trim()
  if (!normalizedText.length) {
    return ''
  }

  const styleAttribute = noteStyle
    ? ` style="${escapeHtml(getLegacyNoteTextStyleString(noteStyle))}"`
    : ''

  return normalizedText
    .split(/\n{2,}/)
    .map((paragraph) => {
      const paragraphHtml = paragraph.split('\n').map((line) => escapeHtml(line)).join('<br>')
      return `<p${styleAttribute}>${paragraphHtml}</p>`
    })
    .join('')
}

function isRichNoteHtmlBlank(html: string) {
  if (!html.trim()) {
    return true
  }

  if (typeof document === 'undefined') {
    return html.replace(/<[^>]+>/g, '').trim().length === 0
  }

  const container = document.createElement('div')
  container.innerHTML = html
  const textContent = container.textContent?.replace(/\u00a0/g, ' ').trim() ?? ''
  return textContent.length === 0 && !container.querySelector('img, video, iframe')
}

function normalizeRichNoteHtml(html: string) {
  if (isRichNoteHtmlBlank(html)) {
    return ''
  }

  const container = document.createElement('div')
  container.innerHTML = html
  container
    .querySelectorAll('[data-note-inline-style], [data-note-inline-format]')
    .forEach((element) => unwrapElementPreserveChildren(element))

  const normalizedHtml = container.innerHTML
  return isRichNoteHtmlBlank(normalizedHtml) ? '' : normalizedHtml
}

function getThemeCounterpartNoteTextColor(color: string, targetUsesDarkItems: boolean) {
  const normalizedColor = colorToHex(color)
  if (!normalizedColor) {
    return null
  }

  const pair = NOTE_TEXT_THEME_COLOR_PAIRS.find(
    (entry) => entry.light === normalizedColor || entry.dark === normalizedColor,
  )
  if (!pair) {
    return null
  }

  return targetUsesDarkItems ? pair.dark : pair.light
}

function getThemeCounterpartTableCellColor(color: string, targetUsesDarkItems: boolean) {
  const normalizedColor = colorToHex(color)
  if (!normalizedColor) {
    return null
  }

  const pair = TABLE_CELL_THEME_COLOR_PAIRS.find(
    (entry) => entry.light === normalizedColor || entry.dark === normalizedColor,
  )
  if (!pair) {
    return null
  }

  return targetUsesDarkItems ? pair.dark : pair.light
}

function remapRichNoteHtmlTextColorsForTheme(html: string, targetUsesDarkItems: boolean) {
  if (!html.trim() || typeof document === 'undefined') {
    return html
  }

  const container = document.createElement('div')
  container.innerHTML = html
  let didChange = false

  container.querySelectorAll<HTMLElement>('font[color], [style]').forEach((element) => {
    if (element instanceof HTMLFontElement && element.color.trim().length > 0) {
      const nextColor = getThemeCounterpartNoteTextColor(element.color, targetUsesDarkItems)
      if (nextColor && nextColor !== colorToHex(element.color)) {
        element.color = nextColor
        didChange = true
      }
    }

    if (!element.style.color.trim().length) {
      return
    }

    const nextColor = getThemeCounterpartNoteTextColor(element.style.color, targetUsesDarkItems)
    if (!nextColor || nextColor === colorToHex(element.style.color)) {
      return
    }

    element.style.color = nextColor
    didChange = true
  })

  if (!didChange) {
    return html
  }

  return normalizeRichNoteHtml(container.innerHTML)
}

function remapWorkspaceRichTextColorsForTheme(
  workspace: WorkspaceSnapshot,
  targetUsesDarkItems: boolean,
) {
  let didChangeWorkspace = false

  const boards = workspace.boards.map((boardTab) => {
    let didChangeBoard = false

    const cards = boardTab.board.cards.map((card) => {
      if (card.kind === 'note' || card.kind === 'heading') {
        const nextContent = remapRichNoteHtmlTextColorsForTheme(card.content, targetUsesDarkItems)
        if (nextContent === card.content) {
          return card
        }

        didChangeBoard = true
        return {
          ...card,
          content: nextContent,
        }
      }

      if (card.kind !== 'table') {
        return card
      }

      let didChangeTable = false
      const nextCellFormats = card.cellFormats.map((row) =>
        row.map((format) => {
          if (!format.backgroundColor) {
            return format
          }

          const nextBackgroundColor = getThemeCounterpartTableCellColor(
            format.backgroundColor,
            targetUsesDarkItems,
          )
          if (!nextBackgroundColor || nextBackgroundColor === format.backgroundColor) {
            return format
          }

          didChangeTable = true
          return {
            ...format,
            backgroundColor: nextBackgroundColor,
          }
        }),
      )

      if (!didChangeTable) {
        return card
      }

      didChangeBoard = true
      return {
        ...card,
        cellFormats: nextCellFormats,
      }
    })

    if (!didChangeBoard) {
      return boardTab
    }

    didChangeWorkspace = true
    return {
      ...boardTab,
      board: touchBoard({
        ...boardTab.board,
        cards,
      }),
    }
  })

  return didChangeWorkspace ? { ...workspace, boards } : workspace
}

function configureNoteRichTextCommands() {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') {
    return
  }

  try {
    document.execCommand('styleWithCSS', false, 'false')
    document.execCommand('defaultParagraphSeparator', false, 'p')
  } catch {
    // Some browsers do not support one or both commands.
  }
}

function isSelectionInsideEditor(selection: Selection | null, editor: HTMLElement | null) {
  if (!selection || !editor || selection.rangeCount === 0) {
    return false
  }

  const anchorNode = selection.anchorNode
  if (!anchorNode) {
    return false
  }

  return editor.contains(anchorNode)
}

function unwrapElementPreserveChildren(element: Element) {
  const parent = element.parentNode
  if (!parent) {
    return
  }

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element)
  }

  parent.removeChild(element)
}

function wrapFragmentTextNodesWithTag(
  fragment: DocumentFragment,
  tagName: 'b' | 'i' | 'u' | 's',
) {
  const textNodes: Text[] = []
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.textContent?.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    },
  })

  while (walker.nextNode()) {
    if (walker.currentNode instanceof Text) {
      textNodes.push(walker.currentNode)
    }
  }

  textNodes.forEach((textNode) => {
    const parent = textNode.parentNode
    if (!parent) {
      return
    }

    const wrapper = document.createElement(tagName)
    parent.replaceChild(wrapper, textNode)
    wrapper.append(textNode)
  })
}

function wrapFragmentTextNodesWithStyledSpan(
  fragment: DocumentFragment,
  styleEntries: Partial<Record<'fontWeight' | 'fontStyle' | 'textDecorationLine', string>>,
) {
  const textNodes: Text[] = []
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.textContent?.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    },
  })

  while (walker.nextNode()) {
    if (walker.currentNode instanceof Text) {
      textNodes.push(walker.currentNode)
    }
  }

  textNodes.forEach((textNode) => {
    const parent = textNode.parentNode
    if (!parent) {
      return
    }

    const wrapper = document.createElement('span')
    if (styleEntries.fontWeight) {
      wrapper.style.fontWeight = styleEntries.fontWeight
    }
    if (styleEntries.fontStyle) {
      wrapper.style.fontStyle = styleEntries.fontStyle
    }
    if (styleEntries.textDecorationLine) {
      wrapper.style.textDecorationLine = styleEntries.textDecorationLine
    }
    parent.replaceChild(wrapper, textNode)
    wrapper.append(textNode)
  })
}

function wrapFragmentTextNodesWithColor(fragment: DocumentFragment, color: string) {
  const textNodes: Text[] = []
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.textContent?.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    },
  })

  while (walker.nextNode()) {
    if (walker.currentNode instanceof Text) {
      textNodes.push(walker.currentNode)
    }
  }

  textNodes.forEach((textNode) => {
    const parent = textNode.parentNode
    if (!parent) {
      return
    }

    const wrapper = document.createElement('span')
    wrapper.style.color = color
    parent.replaceChild(wrapper, textNode)
    wrapper.append(textNode)
  })
}

function isNoteInlineCommand(value: string): value is NoteInlineCommand {
  return (
    value === 'bold' ||
    value === 'italic' ||
    value === 'underline' ||
    value === 'strikeThrough'
  )
}

function getNoteInlineCommandTag(command: NoteInlineCommand): 'b' | 'i' | 'u' | 's' {
  switch (command) {
    case 'bold':
      return 'b'
    case 'italic':
      return 'i'
    case 'underline':
      return 'u'
    case 'strikeThrough':
      return 's'
  }
}

function stripInlineCommandStyleFromElement(element: HTMLElement, command: NoteInlineCommand) {
  if (command === 'bold') {
    element.style.fontWeight = ''
    return
  }

  if (command === 'italic') {
    element.style.fontStyle = ''
    return
  }

  const currentDecoration =
    element.style.textDecorationLine || element.style.textDecoration || ''
  const nextDecoration = currentDecoration
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) =>
      command === 'underline' ? token !== 'underline' : token !== 'line-through',
    )
    .join(' ')

  element.style.textDecorationLine = nextDecoration
  if (!nextDecoration) {
    element.style.removeProperty('text-decoration')
    element.style.removeProperty('text-decoration-line')
  }
}

function hasNoMeaningfulAttributes(element: HTMLElement) {
  if (element.getAttributeNames().some((name) => name !== 'style')) {
    return false
  }

  return !element.getAttribute('style')?.trim()
}

function stripNoteInlineCommandFormatting(root: ParentNode, command: NoteInlineCommand) {
  const matchingSelector =
    command === 'bold'
      ? 'b, strong'
      : command === 'italic'
      ? 'i, em'
      : command === 'underline'
      ? 'u'
      : 's, strike, del'

  root.querySelectorAll(matchingSelector).forEach((element) => {
    unwrapElementPreserveChildren(element)
  })

  root.querySelectorAll<HTMLElement>('span').forEach((element) => {
    const inlineStyle = element.style
    const isMatch =
      (command === 'bold' && inlineStyle.fontWeight.trim().length > 0) ||
      (command === 'italic' && inlineStyle.fontStyle.trim().length > 0) ||
      (command === 'underline' &&
        (inlineStyle.textDecorationLine.includes('underline') ||
          inlineStyle.textDecoration.includes('underline'))) ||
      (command === 'strikeThrough' &&
        (inlineStyle.textDecorationLine.includes('line-through') ||
          inlineStyle.textDecoration.includes('line-through')))

    if (!isMatch) {
      return
    }

    stripInlineCommandStyleFromElement(element, command)
    if (hasNoMeaningfulAttributes(element)) {
      unwrapElementPreserveChildren(element)
    }
  })
}

function stripNoteTextColorFormatting(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('font[color], [style]').forEach((element) => {
    if (element instanceof HTMLFontElement && element.color.trim().length > 0) {
      element.removeAttribute('color')
      if (!element.getAttributeNames().length) {
        unwrapElementPreserveChildren(element)
      }
      return
    }

    if (!(element instanceof HTMLElement) || !element.style.color.trim().length) {
      return
    }

    element.style.color = ''
    if (hasNoMeaningfulAttributes(element)) {
      unwrapElementPreserveChildren(element)
    }
  })
}

function createNoteSelectionMarker(kind: 'start' | 'end') {
  const marker = document.createElement('span')
  marker.setAttribute('data-note-selection-marker', kind)
  marker.style.display = 'inline-block'
  marker.style.width = '0'
  marker.style.overflow = 'hidden'
  marker.style.lineHeight = '0'
  marker.setAttribute('aria-hidden', 'true')
  return marker
}

function insertNoteSelectionMarkers(range: Range) {
  const startMarker = createNoteSelectionMarker('start')
  const endMarker = createNoteSelectionMarker('end')
  const endRange = range.cloneRange()
  endRange.collapse(false)
  endRange.insertNode(endMarker)

  const startRange = range.cloneRange()
  startRange.collapse(true)
  startRange.insertNode(startMarker)

  return { startMarker, endMarker }
}

function restoreSelectionFromNoteMarkers(
  selection: Selection,
  startMarker: HTMLElement,
  endMarker: HTMLElement,
  editor: HTMLElement,
) {
  editor.normalize()

  const nextRange = document.createRange()
  nextRange.setStartAfter(startMarker)
  nextRange.setEndBefore(endMarker)
  selection.removeAllRanges()
  selection.addRange(nextRange)
  startMarker.remove()
  endMarker.remove()

  return nextRange.cloneRange()
}

function elementMatchesNoteInlineCommand(element: HTMLElement, command: NoteInlineCommand) {
  const tagName = element.tagName
  if (command === 'bold' && (tagName === 'B' || tagName === 'STRONG')) {
    return true
  }
  if (command === 'italic' && (tagName === 'I' || tagName === 'EM')) {
    return true
  }
  if (command === 'underline' && tagName === 'U') {
    return true
  }
  if (command === 'strikeThrough' && (tagName === 'S' || tagName === 'STRIKE' || tagName === 'DEL')) {
    return true
  }

  const inlineStyle = element.style
  if (command === 'bold') {
    return inlineStyle.fontWeight.trim().length > 0
  }
  if (command === 'italic') {
    return inlineStyle.fontStyle.trim().length > 0
  }
  if (command === 'underline') {
    return (
      inlineStyle.textDecorationLine.includes('underline') ||
      inlineStyle.textDecoration.includes('underline')
    )
  }

  return (
    inlineStyle.textDecorationLine.includes('line-through') ||
    inlineStyle.textDecoration.includes('line-through')
  )
}

function moveNoteSelectionMarkerOutsideMatchingInlineAncestors(
  marker: HTMLElement,
  editor: HTMLElement,
  command: NoteInlineCommand,
  kind: 'start' | 'end',
) {
  let currentParent = marker.parentElement

  while (currentParent && currentParent !== editor) {
    if (!elementMatchesNoteInlineCommand(currentParent, command)) {
      currentParent = currentParent.parentElement
      continue
    }

    const parent = currentParent.parentNode
    if (!parent) {
      return
    }

    const clone = currentParent.cloneNode(false) as HTMLElement

    if (kind === 'start') {
      let sibling = marker.nextSibling
      while (sibling) {
        const nextSibling = sibling.nextSibling
        clone.appendChild(sibling)
        sibling = nextSibling
      }

      parent.insertBefore(clone, currentParent.nextSibling)
      parent.insertBefore(marker, clone)
    } else {
      while (currentParent.firstChild && currentParent.firstChild !== marker) {
        clone.appendChild(currentParent.firstChild)
      }

      parent.insertBefore(clone, currentParent)
      parent.insertBefore(marker, currentParent)
    }

    if (!clone.firstChild) {
      clone.remove()
    }

    if (!currentParent.firstChild) {
      currentParent.remove()
    }

    currentParent = marker.parentElement
  }
}

function applyDisabledNoteInlineCommandPresentation(
  fragment: DocumentFragment,
  command: NoteInlineCommand,
  decorationState: {
    underline: boolean
    strike: boolean
  },
) {
  if (command === 'bold') {
    wrapFragmentTextNodesWithStyledSpan(fragment, { fontWeight: '400' })
    return
  }

  if (command === 'italic') {
    wrapFragmentTextNodesWithStyledSpan(fragment, { fontStyle: 'normal' })
    return
  }

  const nextDecoration =
    command === 'underline'
      ? decorationState.strike
        ? 'line-through'
        : 'none'
      : decorationState.underline
      ? 'underline'
      : 'none'

  wrapFragmentTextNodesWithStyledSpan(fragment, {
    textDecorationLine: nextDecoration,
  })
}

function getSelectionAnchorElement(editor: HTMLElement | null, selection: Selection | null) {
  if (!editor || !selection || !isSelectionInsideEditor(selection, editor)) {
    return null
  }

  const anchorNode = selection.anchorNode
  if (!anchorNode) {
    return null
  }

  if (anchorNode instanceof Element) {
    return anchorNode
  }

  return anchorNode.parentElement
}

function getSelectionBlockElement(editor: HTMLElement, anchorElement: Element) {
  const blockElement = anchorElement.closest('li, p, h1, h2, h3, blockquote, pre')
  if (blockElement instanceof HTMLElement && editor.contains(blockElement)) {
    return blockElement
  }

  return editor
}

function getElementDefaultTextColor(element: HTMLElement) {
  if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
    return null
  }

  const previousInlineColor = element.style.color
  if (previousInlineColor) {
    element.style.color = ''
  }

  const computedColor = colorToHex(window.getComputedStyle(element).color)

  if (previousInlineColor) {
    element.style.color = previousInlineColor
  }

  return computedColor
}

function getSelectionInlineFormattingState(editor: HTMLElement | null, selection: Selection | null) {
  if (!editor || !selection || !isSelectionInsideEditor(selection, editor)) {
    return {
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrikeThrough: false,
      textColor: null,
      defaultTextColor: null,
    }
  }

  const anchorElement = getSelectionAnchorElement(editor, selection)
  if (!anchorElement || typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
    return {
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrikeThrough: false,
      textColor: null,
      defaultTextColor: null,
    }
  }

  const computedStyle = window.getComputedStyle(anchorElement)
  const blockElement = getSelectionBlockElement(editor, anchorElement)
  const fontWeight = Number.parseInt(computedStyle.fontWeight, 10)
  const textDecorationLine =
    computedStyle.textDecorationLine || computedStyle.textDecoration || ''
  const anchorColor = colorToHex(computedStyle.color)
  const defaultTextColor = getElementDefaultTextColor(blockElement)

  return {
    isBold:
      Number.isFinite(fontWeight) ? fontWeight >= 600 : /bold/i.test(computedStyle.fontWeight),
    isItalic: /italic|oblique/i.test(computedStyle.fontStyle),
    isUnderline: textDecorationLine.includes('underline'),
    isStrikeThrough:
      textDecorationLine.includes('line-through') || textDecorationLine.includes('strikethrough'),
    textColor:
      anchorColor && defaultTextColor && anchorColor !== defaultTextColor ? anchorColor : null,
    defaultTextColor,
  }
}

function getNoteTextBlockStyle(editor: HTMLElement | null, selection: Selection | null): NoteBlockStyle {
  if (!editor || !selection || !isSelectionInsideEditor(selection, editor)) {
    return DEFAULT_NOTE_TEXT_TOOLBAR_STATE.blockStyle
  }

  const anchorElement = getSelectionAnchorElement(editor, selection)
  if (!anchorElement) {
    return DEFAULT_NOTE_TEXT_TOOLBAR_STATE.blockStyle
  }

  const codeBlock = anchorElement.closest('pre')
  if (codeBlock && editor.contains(codeBlock)) {
    return 'code'
  }

  const quoteBlock = anchorElement.closest('blockquote')
  if (quoteBlock && editor.contains(quoteBlock)) {
    return 'quote'
  }

  const headingBlock = anchorElement.closest('h1, h2, h3')
  if (headingBlock && editor.contains(headingBlock)) {
    return 'heading'
  }

  return 'body'
}

function getNoteBlockCommandValue(style: NoteBlockStyle) {
  switch (style) {
    case 'heading':
      return '<h2>'
    case 'quote':
      return '<blockquote>'
    case 'code':
      return '<pre>'
    default:
      return '<p>'
  }
}

function queryRichTextCommandState(command: string) {
  if (typeof document === 'undefined' || typeof document.queryCommandState !== 'function') {
    return false
  }

  try {
    return document.queryCommandState(command)
  } catch {
    return false
  }
}

function normalizePaletteId(value: unknown): NotePaletteId {
  return NOTE_PALETTES.some((palette) => palette.id === value)
    ? (value as NotePaletteId)
    : DEFAULT_CARD_PALETTE
}

function isPaletteCard(card: BoardCard): card is PaletteCard {
  return (
    card.kind === 'note' ||
    card.kind === 'todo' ||
    card.kind === 'link' ||
    card.kind === 'column'
  )
}

function getCardMinWidth(cardOrKind: BoardCard | BoardCard['kind']) {
  const kind = typeof cardOrKind === 'string' ? cardOrKind : cardOrKind.kind

  switch (kind) {
    case 'heading':
      return HEADING_MIN_WIDTH
    case 'note':
      return NOTE_MIN_WIDTH
    case 'todo':
      return TODO_MIN_WIDTH
    case 'link':
      return LINK_MIN_WIDTH
    case 'image':
      return IMAGE_MIN_WIDTH
    case 'document':
      return DOCUMENT_MIN_WIDTH
    case 'table':
      return getTableCardDimensions(TABLE_MIN_ROWS, TABLE_MIN_COLUMNS).width
    case 'column':
      return COLUMN_MIN_WIDTH
  }
}

function normalizeColumnChildPlacement<Card extends ColumnChildCard>(card: Card): Card {
  return {
    ...card,
    columnId: typeof card.columnId === 'string' && card.columnId.trim() ? card.columnId : null,
    columnIndex:
      typeof card.columnIndex === 'number' && Number.isFinite(card.columnIndex)
        ? Math.max(0, Math.round(card.columnIndex))
        : 0,
  } as Card
}

function normalizeColumnCards(cards: BoardCard[]): BoardCard[] {
  const columnIds = new Set(cards.filter(isColumnCard).map((card) => card.id))
  const columnChildren = new Map<string, ColumnChildCard[]>()

  for (const card of cards) {
    if (!isColumnChildCard(card) || !card.columnId || !columnIds.has(card.columnId)) {
      continue
    }

    const currentChildren = columnChildren.get(card.columnId) ?? []
    currentChildren.push(card)
    columnChildren.set(card.columnId, currentChildren)
  }

  const columnIndexByCardId = new Map<string, number>()

  for (const children of columnChildren.values()) {
    children
      .slice()
      .sort((left, right) => {
        if (left.columnIndex !== right.columnIndex) {
          return left.columnIndex - right.columnIndex
        }

        return left.zIndex - right.zIndex
      })
      .forEach((child, index) => {
        columnIndexByCardId.set(child.id, index)
      })
  }

  return cards.map((card) => {
    if (isColumnCard(card)) {
      return {
        ...card,
        palette: normalizePaletteId(card.palette),
      }
    }

    const nextColumnId = card.columnId && columnIds.has(card.columnId) ? card.columnId : null

    return {
      ...card,
      columnId: nextColumnId,
      columnIndex: nextColumnId ? columnIndexByCardId.get(card.id) ?? 0 : 0,
    }
  })
}

function getColumnInnerWidth(column: ColumnCard) {
  return Math.max(120, column.width - COLUMN_HORIZONTAL_PADDING * 2)
}

function getRenderedImageFrameHeight(card: ImageCard, renderedWidth: number) {
  return Math.max(
    IMAGE_MIN_WIDTH,
    Math.round((renderedWidth * card.height) / Math.max(card.width, 1)),
  )
}

function getColumnChildHeight(card: ColumnChildCard, columnInnerWidth: number) {
  if (card.kind !== 'image') {
    return card.height
  }

  return getRenderedImageFrameHeight(card, columnInnerWidth)
}

function getBoardCardLayouts(
  cards: BoardCard[],
  measuredCardSizes: ReadonlyMap<string, MeasuredCardSize> = new Map(),
) {
  const layouts = new Map<string, CardLayout>()
  const columnChildren = new Map<string, ColumnChildCard[]>()
  const columns = cards.filter(isColumnCard)
  const columnIds = new Set(columns.map((card) => card.id))

  for (const card of cards) {
    if (!isColumnChildCard(card) || !card.columnId || !columnIds.has(card.columnId)) {
      continue
    }

    const children = columnChildren.get(card.columnId) ?? []
    children.push(card)
    columnChildren.set(card.columnId, children)
  }

  for (const children of columnChildren.values()) {
    children.sort((left, right) => {
      if (left.columnIndex !== right.columnIndex) {
        return left.columnIndex - right.columnIndex
      }

      return left.zIndex - right.zIndex
    })
  }

  for (const card of cards) {
    if (isColumnCard(card)) {
      continue
    }

    if (!card.columnId || !columnIds.has(card.columnId)) {
      const measuredSize = measuredCardSizes.get(card.id)
      layouts.set(card.id, {
        x: card.x,
        y: card.y,
        width: card.width,
        height: measuredSize?.height ?? card.height,
        columnId: null,
      })
    }
  }

  for (const column of columns) {
    const children = columnChildren.get(column.id) ?? []
    const columnInnerWidth = getColumnInnerWidth(column)
    let currentY = column.y + COLUMN_STACK_TOP

    for (const child of children) {
      const measuredChildHeight = measuredCardSizes.get(child.id)?.height
      const childHeight =
        measuredChildHeight ??
        (child.kind === 'image'
          ? getColumnChildHeight(child, columnInnerWidth)
          : child.height)
      layouts.set(child.id, {
        x: column.x + COLUMN_HORIZONTAL_PADDING,
        y: currentY,
        width: columnInnerWidth,
        height: childHeight,
        columnId: column.id,
      })
      currentY += childHeight + COLUMN_STACK_GAP
    }

    const contentHeight = children.length
      ? currentY - column.y - COLUMN_STACK_GAP + COLUMN_BOTTOM_PADDING
      : COLUMN_STACK_TOP + COLUMN_EMPTY_HEIGHT + COLUMN_BOTTOM_PADDING
    const measuredColumnHeight = measuredCardSizes.get(column.id)?.height

    layouts.set(column.id, {
      x: column.x,
      y: column.y,
      width: column.width,
      height: measuredColumnHeight ?? contentHeight,
      columnId: null,
    })
  }

  return {
    layouts,
    columnChildren,
  }
}

function createDefaultImageCrop(): ImageCrop {
  return {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  }
}

function normalizeImageCrop(crop: unknown): ImageCrop {
  if (!isRecord(crop)) {
    return createDefaultImageCrop()
  }

  const nextWidth = clamp(
    typeof crop.width === 'number' ? crop.width : 1,
    0.02,
    1,
  )
  const nextHeight = clamp(
    typeof crop.height === 'number' ? crop.height : 1,
    0.02,
    1,
  )

  return {
    x: clamp(typeof crop.x === 'number' ? crop.x : 0, 0, 1 - nextWidth),
    y: clamp(typeof crop.y === 'number' ? crop.y : 0, 0, 1 - nextHeight),
    width: nextWidth,
    height: nextHeight,
  }
}

function normalizeDrawStroke(stroke: unknown): DrawStroke | null {
  if (!isRecord(stroke)) {
    return null
  }

  const points = Array.isArray(stroke.points)
    ? stroke.points
        .filter((point): point is DrawPoint => {
          return isRecord(point) && typeof point.x === 'number' && typeof point.y === 'number'
        })
        .map((point) => ({ x: point.x, y: point.y }))
    : []

  if (typeof stroke.id !== 'string' || !points.length) {
    return null
  }

  return {
    id: stroke.id,
    tool: stroke.tool === 'eraser' ? 'eraser' : 'marker',
    color: typeof stroke.color === 'string' ? stroke.color : DRAW_STROKE_COLOR,
    size:
      typeof stroke.size === 'number'
        ? clamp(stroke.size, 1, 48)
        : DRAW_STROKE_SIZE,
    points,
  }
}

function colorHexToRgba(hexColor: string, alpha: number) {
  const normalizedHex = hexColor.trim().replace('#', '')
  const expandedHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split('')
          .map((character) => `${character}${character}`)
          .join('')
      : normalizedHex

  if (!/^[0-9a-fA-F]{6}$/.test(expandedHex)) {
    return DRAW_STROKE_COLOR
  }

  const red = Number.parseInt(expandedHex.slice(0, 2), 16)
  const green = Number.parseInt(expandedHex.slice(2, 4), 16)
  const blue = Number.parseInt(expandedHex.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function colorToHex(color: string) {
  const normalizedColor = color.trim().toLowerCase()

  if (/^#[0-9a-f]{6}$/.test(normalizedColor)) {
    return normalizedColor
  }

  if (/^#[0-9a-f]{3}$/.test(normalizedColor)) {
    return `#${normalizedColor
      .slice(1)
      .split('')
      .map((character) => `${character}${character}`)
      .join('')}`
  }

  const match = normalizedColor.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/i,
  )
  if (!match) {
    return null
  }

  const [red, green, blue] = match.slice(1, 4).map((channel) =>
    clamp(Number.parseInt(channel, 10), 0, 255),
  )

  return `#${[red, green, blue]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`
}

function getDrawStrokeColor(colorHex: string) {
  return colorHexToRgba(colorHex, DRAW_STROKE_OPACITY)
}

function getStrokePathData(points: DrawPoint[]) {
  if (points.length < 2) {
    return null
  }

  let pathData = `M ${points[0].x} ${points[0].y}`

  if (points.length === 2) {
    return `${pathData} L ${points[1].x} ${points[1].y}`
  }

  for (let index = 1; index < points.length - 1; index += 1) {
    const currentPoint = points[index]
    const nextPoint = points[index + 1]
    const midPointX = (currentPoint.x + nextPoint.x) / 2
    const midPointY = (currentPoint.y + nextPoint.y) / 2

    pathData += ` Q ${currentPoint.x} ${currentPoint.y} ${midPointX} ${midPointY}`
  }

  const lastPoint = points[points.length - 1]
  pathData += ` L ${lastPoint.x} ${lastPoint.y}`

  return pathData
}

function drawStrokeOnCanvas(
  context: CanvasRenderingContext2D,
  stroke: DrawStroke,
  viewport: CanvasViewport,
) {
  if (!stroke.points.length) {
    return
  }

  const scaledSize = Math.max(1, stroke.size * viewport.zoom)
  const screenPoints = stroke.points.map((point) => ({
    x: viewport.x + point.x * viewport.zoom,
    y: viewport.y + point.y * viewport.zoom,
  }))

  context.save()
  context.globalCompositeOperation =
    stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
  context.strokeStyle = stroke.color
  context.fillStyle = stroke.color
  context.lineWidth = scaledSize
  context.lineCap = 'round'
  context.lineJoin = 'round'

  if (screenPoints.length === 1) {
    context.beginPath()
    context.arc(screenPoints[0].x, screenPoints[0].y, scaledSize / 2, 0, Math.PI * 2)
    context.fill()
    context.restore()
    return
  }

  context.beginPath()
  context.moveTo(screenPoints[0].x, screenPoints[0].y)

  if (screenPoints.length === 2) {
    context.lineTo(screenPoints[1].x, screenPoints[1].y)
  } else {
    for (let index = 1; index < screenPoints.length - 1; index += 1) {
      const currentPoint = screenPoints[index]
      const nextPoint = screenPoints[index + 1]
      const midPointX = (currentPoint.x + nextPoint.x) / 2
      const midPointY = (currentPoint.y + nextPoint.y) / 2

      context.quadraticCurveTo(currentPoint.x, currentPoint.y, midPointX, midPointY)
    }

    const lastPoint = screenPoints[screenPoints.length - 1]
    context.lineTo(lastPoint.x, lastPoint.y)
  }

  context.stroke()
  context.restore()
}

function normalizeCardWidth(card: BoardCard): BoardCard {
  const minWidth = getCardMinWidth(card)
  if (card.width >= minWidth) {
    return card
  }

  return {
    ...card,
    width: minWidth,
  }
}

function snapCardFrameToGrid(card: BoardCard): BoardCard {
  const snappedX = snapCoordinateToGrid(card.x)
  const snappedY = snapCoordinateToGrid(card.y)

  if (card.kind === 'image') {
    return {
      ...card,
      x: snappedX,
      y: snappedY,
    }
  }

  if (card.kind === 'table') {
    return {
      ...card,
      x: snappedX,
      y: snappedY,
    }
  }

  return {
    ...card,
    x: snappedX,
    y: snappedY,
    width: snapSpanToGrid(card.width, getCardMinWidth(card)),
    height: snapSpanToGrid(card.height),
  }
}

function normalizeCard(card: BoardCard): BoardCard {
  const widthNormalizedCard = snapCardFrameToGrid(normalizeCardWidth(card))

  if (widthNormalizedCard.kind === 'column') {
    return {
      ...widthNormalizedCard,
      palette: normalizePaletteId(widthNormalizedCard.palette),
      accentColor: normalizeOptionalTableCellColor(widthNormalizedCard.accentColor),
    }
  }

  if (widthNormalizedCard.kind === 'note' || widthNormalizedCard.kind === 'heading') {
    const normalizedTextAlign = normalizeNoteTextAlign(widthNormalizedCard.textAlign)
    const normalizedTextSize = normalizeNoteTextSize(widthNormalizedCard.textSize)
    const normalizedIsBold = widthNormalizedCard.isBold === true
    const normalizedIsItalic = widthNormalizedCard.isItalic === true
    const normalizedContentMode = normalizeNoteContentMode(
      'contentMode' in widthNormalizedCard ? widthNormalizedCard.contentMode : null,
    )
    const sourceContent =
      'content' in widthNormalizedCard && typeof widthNormalizedCard.content === 'string'
        ? widthNormalizedCard.content
        : widthNormalizedCard.title
    const normalizedContent =
      normalizedContentMode === 'rich'
        ? normalizeRichNoteHtml(sourceContent)
        : convertPlainTextToRichNoteHtml(sourceContent, {
            textAlign: normalizedTextAlign,
            textSize: normalizedTextSize,
            isBold: normalizedIsBold,
            isItalic: normalizedIsItalic,
          })

    if (widthNormalizedCard.kind === 'note') {
      return {
        ...normalizeColumnChildPlacement(widthNormalizedCard),
        content: normalizedContent,
        contentMode: 'rich' as const,
        palette: normalizePaletteId(widthNormalizedCard.palette),
        accentColor: normalizeOptionalTableCellColor(widthNormalizedCard.accentColor),
        textAlign: normalizedTextAlign,
        textSize: normalizedTextSize,
        isBold: normalizedIsBold,
        isItalic: normalizedIsItalic,
      }
    }

    return {
      ...normalizeColumnChildPlacement(widthNormalizedCard),
      content: normalizedContent,
      contentMode: 'rich' as const,
      accentColor: normalizeOptionalTableCellColor(widthNormalizedCard.accentColor),
      textAlign: normalizedTextAlign,
      textSize: normalizedTextSize,
      isBold: normalizedIsBold,
      isItalic: normalizedIsItalic,
    }
  }

  if (widthNormalizedCard.kind === 'todo') {
    return {
      ...normalizeColumnChildPlacement(widthNormalizedCard),
      palette: normalizePaletteId(widthNormalizedCard.palette),
      accentColor: normalizeOptionalTableCellColor(widthNormalizedCard.accentColor),
    }
  }

  if (widthNormalizedCard.kind === 'link') {
    return {
      ...normalizeColumnChildPlacement(widthNormalizedCard),
      showNote: widthNormalizedCard.showNote !== false,
      palette: normalizePaletteId(widthNormalizedCard.palette),
      accentColor: normalizeOptionalTableCellColor(widthNormalizedCard.accentColor),
    }
  }

  if (widthNormalizedCard.kind === 'table') {
    const normalizedRowCount = normalizeTableRowCount(
      widthNormalizedCard.rowCount,
      Array.isArray(widthNormalizedCard.cells) ? widthNormalizedCard.cells.length : TABLE_DEFAULT_ROWS,
    )
    const normalizedColumnCount = normalizeTableColumnCount(
      widthNormalizedCard.columnCount,
      Array.isArray(widthNormalizedCard.cells)
        ? widthNormalizedCard.cells.reduce((widest, row) => {
            return Array.isArray(row) ? Math.max(widest, row.length) : widest
          }, 0)
        : TABLE_DEFAULT_COLUMNS,
    )

    return resizeTableCard(
      {
        ...normalizeColumnChildPlacement(widthNormalizedCard),
        palette: normalizePaletteId(widthNormalizedCard.palette),
        accentColor: normalizeOptionalTableCellColor(widthNormalizedCard.accentColor),
        showTitle: widthNormalizedCard.showTitle === true,
      },
      normalizedRowCount,
      normalizedColumnCount,
    )
  }

  if (widthNormalizedCard.kind === 'document') {
    const previewKind =
      widthNormalizedCard.previewKind === 'pdf' ||
      widthNormalizedCard.previewKind === 'docx' ||
      widthNormalizedCard.previewKind === 'text'
        ? widthNormalizedCard.previewKind
        : 'text'

    return {
      ...normalizeColumnChildPlacement(widthNormalizedCard),
      fileName:
        typeof widthNormalizedCard.fileName === 'string' && widthNormalizedCard.fileName.trim()
          ? widthNormalizedCard.fileName
          : widthNormalizedCard.title || 'Document',
      fileSize:
        typeof widthNormalizedCard.fileSize === 'number' &&
        Number.isFinite(widthNormalizedCard.fileSize)
          ? Math.max(0, Math.round(widthNormalizedCard.fileSize))
          : 0,
      mimeType: typeof widthNormalizedCard.mimeType === 'string' ? widthNormalizedCard.mimeType : '',
      extension:
        typeof widthNormalizedCard.extension === 'string'
          ? widthNormalizedCard.extension.toLowerCase()
          : '',
      dataUrl: typeof widthNormalizedCard.dataUrl === 'string' ? widthNormalizedCard.dataUrl : '',
      previewKind,
      previewContent:
        typeof widthNormalizedCard.previewContent === 'string'
          ? widthNormalizedCard.previewContent
          : null,
    }
  }

  if (widthNormalizedCard.kind !== 'image') {
    return widthNormalizedCard
  }

  return {
    ...normalizeColumnChildPlacement(widthNormalizedCard),
    crop: normalizeImageCrop(widthNormalizedCard.crop),
  }
}

function normalizeViewport(value: unknown): CanvasViewport {
  const defaultViewport = createDefaultViewport()

  if (!isRecord(value)) {
    return defaultViewport
  }

  return {
    x: typeof value.x === 'number' && Number.isFinite(value.x) ? value.x : defaultViewport.x,
    y: typeof value.y === 'number' && Number.isFinite(value.y) ? value.y : defaultViewport.y,
    zoom:
      typeof value.zoom === 'number' && Number.isFinite(value.zoom)
        ? clamp(value.zoom, MIN_ZOOM, MAX_ZOOM)
        : defaultViewport.zoom,
  }
}

function normalizeBoardState(value: unknown): BoardState {
  if (!isRecord(value)) {
    return createEmptyBoard('Untitled board')
  }

  const cards = Array.isArray(value.cards)
    ? normalizeColumnCards(value.cards.filter(isCard).map(normalizeCard))
    : []

  return {
    title: typeof value.title === 'string' ? value.title : 'Untitled board',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
    cards,
    strokes: Array.isArray(value.strokes)
      ? value.strokes
          .map((stroke) => normalizeDrawStroke(stroke))
          .filter((stroke): stroke is DrawStroke => stroke !== null)
      : [],
    connectors: normalizeBoardConnectors(value.connectors, cards),
  }
}

function normalizeBoardTabState(value: unknown): BoardTabState | null {
  if (!isRecord(value) || !('board' in value)) {
    return null
  }

  return {
    id:
      typeof value.id === 'string' && value.id.trim().length > 0
        ? value.id
        : crypto.randomUUID(),
    board: normalizeBoardState(value.board),
    viewport: normalizeViewport('viewport' in value ? value.viewport : null),
  }
}

function normalizeWorkspace(value: unknown): WorkspaceSnapshot {
  if (isRecord(value) && Array.isArray(value.boards)) {
    const normalizedBoards = value.boards
      .map((boardTab) => normalizeBoardTabState(boardTab))
      .filter((boardTab): boardTab is BoardTabState => boardTab !== null)

    if (normalizedBoards.length > 0) {
      const activeBoardId =
        typeof value.activeBoardId === 'string' &&
        normalizedBoards.some((boardTab) => boardTab.id === value.activeBoardId)
          ? value.activeBoardId
          : normalizedBoards[0].id
      const activeTabId =
        typeof value.activeTabId === 'string' &&
        (value.activeTabId === CALENDAR_TAB_ID ||
          normalizedBoards.some((boardTab) => boardTab.id === value.activeTabId))
          ? value.activeTabId
          : activeBoardId

      return {
        boards: normalizedBoards,
        activeBoardId,
        activeTabId,
        calendar: normalizeCalendarState(value.calendar),
      }
    }
  }

  if (isRecord(value) && 'board' in value && 'viewport' in value) {
    const boardTab = createBoardTab(normalizeBoardState(value.board), normalizeViewport(value.viewport))

    return {
      boards: [boardTab],
      activeBoardId: boardTab.id,
      activeTabId: boardTab.id,
      calendar: createEmptyCalendarState(),
    }
  }

  return createInitialWorkspace()
}

function isWorkspaceBackupCandidate(value: unknown) {
  if (!isRecord(value)) {
    return false
  }

  if ('board' in value && 'viewport' in value) {
    return isRecord(value.board)
  }

  return Array.isArray(value.boards)
    ? value.boards.some((boardTab) => isRecord(boardTab) && 'board' in boardTab)
    : false
}

function parseWorkspaceBackup(value: unknown): ParsedWorkspaceBackup | null {
  if (
    isRecord(value) &&
    value.type === WORKSPACE_BACKUP_FILE_TYPE &&
    'workspace' in value &&
    isWorkspaceBackupCandidate(value.workspace)
  ) {
    return {
      workspace: normalizeWorkspace(value.workspace),
      appSettings: 'appSettings' in value ? normalizeAppSettings(value.appSettings) : null,
      snapToGrid: typeof value.snapToGrid === 'boolean' ? value.snapToGrid : null,
    }
  }

  return isWorkspaceBackupCandidate(value)
    ? {
        workspace: normalizeWorkspace(value),
        appSettings: null,
        snapToGrid: null,
      }
    : null
}

function createWorkspaceBackupFile(
  workspace: WorkspaceSnapshot,
  appSettings: AppSettings,
  snapToGrid: boolean,
): WorkspaceBackupFile {
  return {
    type: WORKSPACE_BACKUP_FILE_TYPE,
    version: WORKSPACE_BACKUP_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    workspace,
    appSettings: normalizeAppSettings(appSettings),
    snapToGrid,
  }
}

function getWorkspaceBackupFilename(date = new Date()) {
  return `less-note-backup-${date.toISOString().replace(/[:.]/g, '-')}.json`
}

function getTopmostCardIdFromSelection(cards: BoardCard[], selectedIds: string[]) {
  const selectedIdSet = new Set(selectedIds)
  return (
    [...cards]
      .filter((card) => selectedIdSet.has(card.id))
      .sort((left, right) => left.zIndex - right.zIndex)
      .at(-1)?.id ?? null
  )
}

function getCardLayoutCenter(layout: Pick<CardLayout, 'x' | 'y' | 'width' | 'height'>): CanvasPoint {
  return {
    x: layout.x + layout.width / 2,
    y: layout.y + layout.height / 2,
  }
}

function getConnectorAnchorPoint(
  layout: Pick<CardLayout, 'x' | 'y' | 'width' | 'height'>,
  toward: CanvasPoint,
): CanvasPoint {
  const center = getCardLayoutCenter(layout)
  const halfWidth = layout.width / 2
  const halfHeight = layout.height / 2
  const deltaX = toward.x - center.x
  const deltaY = toward.y - center.y

  if (Math.abs(deltaX) < 0.001 && Math.abs(deltaY) < 0.001) {
    return center
  }

  const widthRatio = Math.abs(deltaX) / Math.max(halfWidth, 1)
  const heightRatio = Math.abs(deltaY) / Math.max(halfHeight, 1)
  const ratio = Math.max(widthRatio, heightRatio, 1)

  return {
    x: center.x + deltaX / ratio,
    y: center.y + deltaY / ratio,
  }
}

function getConnectorPath(startPoint: CanvasPoint, endPoint: CanvasPoint) {
  return `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`
}

function getDomainLabel(url: string) {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return 'custom link'
  }
}

function isEditingEventTarget(target: EventTarget | null) {
  return target instanceof Element
    ? !!target.closest('input, textarea, select, [contenteditable="true"]')
    : false
}

function isEmptyCanvasDoubleClickTarget(target: EventTarget | null) {
  return target instanceof Element
    ? !target.closest(
        '.board-card, .empty-state, input, textarea, select, button, a, [contenteditable="true"]',
      )
    : false
}

function getEventTargetCardId(target: EventTarget | null) {
  return target instanceof Element
    ? target.closest<HTMLElement>('[data-card-id]')?.dataset.cardId ?? null
    : null
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })
}

function readImageDimensions(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve({
        width: image.naturalWidth || IMAGE_WIDTH,
        height: image.naturalHeight || IMAGE_HEIGHT,
      })
    }
    image.onerror = () => reject(new Error('Unable to measure image'))
    image.src = src
  })
}

function getImageDisplaySize(width: number, height: number) {
  const maxDimension = 420
  const scale = Math.min(1, maxDimension / Math.max(width, height))

  return {
    width: Math.max(96, Math.round(width * scale)),
    height: Math.max(96, Math.round(height * scale)),
  }
}

function snapCoordinateToGrid(value: number) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

function snapSpanToGrid(value: number, minimum = GRID_SIZE) {
  if (!Number.isFinite(value)) {
    return minimum
  }

  return Math.max(minimum, Math.round(value / GRID_SIZE) * GRID_SIZE)
}

function getPositiveModulo(value: number, divisor: number) {
  if (!Number.isFinite(divisor) || divisor === 0) {
    return 0
  }

  const remainder = value % divisor
  return remainder < 0 ? remainder + divisor : remainder
}

function getCanvasClientCenter(element: HTMLElement) {
  const rect = element.getBoundingClientRect()

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

function normalizeMeasuredCardSize(rect: DOMRect | DOMRectReadOnly, zoom: number): MeasuredCardSize {
  const normalizedZoom = Math.max(zoom, 0.001)

  return {
    width: Math.round(rect.width / normalizedZoom),
    height: Math.round(rect.height / normalizedZoom),
  }
}

function createTodoItem(text: string, done = false): TodoItem {
  return {
    id: crypto.randomUUID(),
    text,
    done,
  }
}

function autoResizeTextarea(element: HTMLTextAreaElement) {
  element.style.height = '0px'
  element.style.height = `${element.scrollHeight}px`
}

function getRectFromPoints(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): SelectionRect {
  return {
    left: Math.min(startX, endX),
    top: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  }
}

function getClampedSelectionRect(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  maxWidth: number,
  maxHeight: number,
) {
  return getRectFromPoints(
    clamp(startX, 0, maxWidth),
    clamp(startY, 0, maxHeight),
    clamp(endX, 0, maxWidth),
    clamp(endY, 0, maxHeight),
  )
}

function getImageCropImageStyle(crop: ImageCrop): CSSProperties {
  return {
    width: `${100 / crop.width}%`,
    height: `${100 / crop.height}%`,
    left: `${(-crop.x / crop.width) * 100}%`,
    top: `${(-crop.y / crop.height) * 100}%`,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCard(value: unknown): value is BoardCard {
  if (!isRecord(value)) {
    return false
  }

  const kind = value.kind
  const requiredBaseFields = [
    'id',
    'x',
    'y',
    'width',
    'height',
    'zIndex',
    'title',
  ] as const

  const baseShapeMatches = requiredBaseFields.every((field) => field in value)
  if (!baseShapeMatches || typeof kind !== 'string') {
    return false
  }

  if (kind === 'note') {
    return 'content' in value
  }

  if (kind === 'heading') {
    return true
  }

  if (kind === 'todo') {
    return 'items' in value && Array.isArray(value.items)
  }

  if (kind === 'link') {
    return 'url' in value && 'description' in value
  }

  if (kind === 'image') {
    return (
      'src' in value &&
      'caption' in value &&
      'fit' in value &&
      (!('crop' in value) || isRecord(value.crop))
    )
  }

  if (kind === 'document') {
    return (
      'fileName' in value &&
      'fileSize' in value &&
      'mimeType' in value &&
      'extension' in value &&
      'dataUrl' in value &&
      'previewKind' in value
    )
  }

  if (kind === 'table') {
    return 'palette' in value && 'cells' in value && Array.isArray(value.cells)
  }

  if (kind === 'column') {
    return 'palette' in value
  }

  return false
}

function createMoodboardPreview() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 520">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#14322b" />
          <stop offset="55%" stop-color="#206d61" />
          <stop offset="100%" stop-color="#f4c57f" />
        </linearGradient>
      </defs>
      <rect width="720" height="520" rx="28" fill="url(#bg)" />
      <circle cx="560" cy="115" r="78" fill="#f6ece0" opacity="0.25" />
      <circle cx="175" cy="410" r="108" fill="#ffdcb8" opacity="0.18" />
      <rect x="58" y="62" width="208" height="148" rx="24" fill="#f6ece0" opacity="0.92" />
      <rect x="297" y="102" width="144" height="94" rx="22" fill="#ffdcb8" opacity="0.84" />
      <rect x="484" y="182" width="174" height="148" rx="28" fill="#14322b" opacity="0.72" />
      <rect x="142" y="248" width="250" height="190" rx="28" fill="#f4f0e7" opacity="0.82" />
      <path d="M474 355c28-50 88-78 132-62 25 9 45 28 62 58l-191 83c-23-20-22-53-3-79Z" fill="#f18857" opacity="0.92" />
      <text x="58" y="34" fill="#f7f2e9" font-size="34" font-family="Trebuchet MS, sans-serif" letter-spacing="4">LESS NOTE</text>
      <text x="82" y="132" fill="#14322b" font-size="34" font-family="Georgia, serif">Image cluster</text>
      <text x="82" y="172" fill="#14322b" font-size="18" font-family="Trebuchet MS, sans-serif">Drop references, sketch routes, keep notes attached.</text>
      <text x="170" y="365" fill="#14322b" font-size="24" font-family="Georgia, serif">Your board</text>
      <text x="170" y="400" fill="#14322b" font-size="18" font-family="Trebuchet MS, sans-serif">local-first and loose enough to think inside</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function createInitialWorkspace(): WorkspaceSnapshot {
  const boardTab = createBoardTab({
    title: 'Own the board',
    updatedAt: new Date().toISOString(),
    strokes: [],
    connectors: [],
    cards: [
      {
        id: crypto.randomUUID(),
        kind: 'heading',
        title: 'Own the board',
        contentMode: 'rich',
        accentColor: '#176a8e',
        columnId: null,
        columnIndex: 0,
        x: 92,
        y: 20,
        width: HEADING_WIDTH,
        height: HEADING_HEIGHT,
        zIndex: 1,
        ...getDefaultNoteTextSettings(),
        content: convertPlainTextToRichNoteHtml('Own the board'),
      },
      {
        id: crypto.randomUUID(),
        kind: 'note',
        title: 'North star',
        contentMode: 'rich',
        columnId: null,
        columnIndex: 0,
        x: 90,
        y: 126,
        width: NOTE_WIDTH,
        height: NOTE_HEIGHT,
        zIndex: 2,
        palette: DEFAULT_CARD_PALETTE,
        accentColor: null,
        ...getDefaultNoteTextSettings(),
        content: convertPlainTextToRichNoteHtml(
          'Build a canvas where images, notes, and links can live side by side. Keep it fast, local-first, and easy to rearrange.',
        ),
      },
      {
        id: crypto.randomUUID(),
        kind: 'note',
        title: 'Custom angle',
        contentMode: 'rich',
        columnId: null,
        columnIndex: 0,
        x: 430,
        y: 78,
        width: NOTE_WIDTH,
        height: NOTE_HEIGHT,
        zIndex: 3,
        palette: DEFAULT_CARD_PALETTE,
        accentColor: null,
        ...getDefaultNoteTextSettings(),
        content: convertPlainTextToRichNoteHtml(
          'Ideas worth exploring:\nâ€¢ sticky note color systems\nâ€¢ quick templates\nâ€¢ timeline mode\nâ€¢ AI tagging and search\nâ€¢ offline desktop wrapper later',
        ),
      },
      {
        id: crypto.randomUUID(),
        kind: 'image',
        title: 'Starter moodboard',
        columnId: null,
        columnIndex: 0,
        x: 256,
        y: 340,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        zIndex: 4,
        src: SAMPLE_IMAGE,
        caption: 'Drag image cards around, or drop your own files straight on the canvas.',
        fit: 'cover',
        crop: createDefaultImageCrop(),
      },
      {
        id: crypto.randomUUID(),
        kind: 'link',
        title: '',
        columnId: null,
        columnIndex: 0,
        x: 655,
        y: 315,
        width: LINK_WIDTH,
        height: LINK_HEIGHT,
        zIndex: 5,
        palette: DEFAULT_CARD_PALETTE,
        accentColor: null,
        url: 'https://example.com/reference-pack',
        description: '',
        showNote: false,
      },
      {
        id: crypto.randomUUID(),
        kind: 'note',
        title: 'Shortcuts',
        contentMode: 'rich',
        columnId: null,
        columnIndex: 0,
        x: 820,
        y: 84,
        width: 280,
        height: 188,
        zIndex: 6,
        palette: DEFAULT_CARD_PALETTE,
        accentColor: null,
        ...getDefaultNoteTextSettings(),
        content: convertPlainTextToRichNoteHtml(
          'H for a heading\nN for a new note\nT for a checklist\nL for a new link\nDelete to remove a card\nCtrl/Cmd + D to duplicate\nF to fit the board',
        ),
      },
      {
        id: crypto.randomUUID(),
        kind: 'todo',
        title: 'Launch checklist',
        columnId: null,
        columnIndex: 0,
        x: 1000,
        y: 335,
        width: TODO_WIDTH,
        height: TODO_HEIGHT,
        zIndex: 7,
        palette: DEFAULT_CARD_PALETTE,
        accentColor: null,
        items: [
          createTodoItem('Add grouping and multi-select'),
          createTodoItem('Make image resize handles feel direct'),
          createTodoItem('Package a desktop build'),
          createTodoItem('Test with a big moodboard import', true),
        ],
      },
    ],
  })

  return {
    boards: [boardTab],
    activeBoardId: boardTab.id,
    activeTabId: boardTab.id,
    calendar: createEmptyCalendarState(),
  }
}

function loadWorkspace() {
  if (typeof window === 'undefined') {
    return createInitialWorkspace()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return createInitialWorkspace()
    }

    const parsed = JSON.parse(raw) as unknown
    return normalizeWorkspace(parsed)
  } catch {
    return createInitialWorkspace()
  }
}

function loadAppSettings() {
  if (typeof window === 'undefined') {
    return normalizeAppSettings(null)
  }

  try {
    const raw = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY)
    if (!raw) {
      return normalizeAppSettings(null)
    }

    const parsed = JSON.parse(raw) as unknown
    return normalizeAppSettings(parsed)
  } catch {
    return normalizeAppSettings(null)
  }
}

function loadSnapToGridPreference() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const raw = window.localStorage.getItem(SNAP_TO_GRID_STORAGE_KEY)
    if (!raw) {
      return false
    }

    if (raw === 'true' || raw === 'false') {
      return raw === 'true'
    }

    const parsed = JSON.parse(raw) as unknown
    return typeof parsed === 'boolean' ? parsed : false
  } catch {
    return false
  }
}

export {
  APP_SETTINGS_STORAGE_KEY,
  APP_THEME_PRESETS,
  BUILT_IN_APP_THEME_PRESETS,
  CALENDAR_TAB_ID,
  CARD_DRAG_START_DISTANCE,
  COLUMN_BOTTOM_PADDING,
  COLUMN_EMPTY_HEIGHT,
  COLUMN_HEIGHT,
  COLUMN_HORIZONTAL_PADDING,
  COLUMN_MIN_WIDTH,
  COLUMN_STACK_GAP,
  COLUMN_STACK_TOP,
  COLUMN_WIDTH,
  CUSTOM_THEME_PRESET,
  DARK_CARD_VISUALS,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_CARD_PALETTE,
  DEFAULT_CARD_VISUALS,
  DEFAULT_NOTE_TEXT_TOOLBAR_STATE,
  DEFAULT_SIDEBAR_COLOR,
  DRAW_BRUSH_SIZES,
  DRAW_DARK_DEFAULT_COLOR_HEX,
  DRAW_LIGHT_DEFAULT_COLOR_HEX,
  DRAW_RED_COLOR_HEX,
  DRAW_STROKE_COLOR,
  DRAW_STROKE_OPACITY,
  DRAW_STROKE_SIZE,
  DOCUMENT_HEIGHT,
  DOCUMENT_MIN_WIDTH,
  DOCUMENT_WIDTH,
  EMPTY_NOTE_HEIGHT,
  EMPTY_TODO_HEIGHT,
  GRID_SIZE,
  HEADING_HEIGHT,
  HEADING_MIN_WIDTH,
  HEADING_WIDTH,
  HISTORY_GROUP_WINDOW_MS,
  IMAGE_HEIGHT,
  IMAGE_MIN_WIDTH,
  IMAGE_WIDTH,
  LINK_HEIGHT,
  LINK_MIN_WIDTH,
  LINK_WIDTH,
  MAX_ZOOM,
  MIDNIGHT_THEME_PRESET,
  MIN_ZOOM,
  NOTE_HEIGHT,
  NOTE_MIN_WIDTH,
  NOTE_PALETTES,
  NOTE_WIDTH,
  PALETTE_MAP,
  SAMPLE_IMAGE,
  SNAP_TO_GRID_STORAGE_KEY,
  STORAGE_KEY,
  TABLE_CELL_HEIGHT,
  TABLE_CELL_TYPE_OPTIONS,
  TABLE_CELL_WIDTH,
  TABLE_DEFAULT_COLUMNS,
  TABLE_DEFAULT_ROWS,
  TABLE_MAX_COLUMNS,
  TABLE_MAX_ROWS,
  TABLE_MIN_COLUMNS,
  TABLE_MIN_ROWS,
  TABLE_TITLE_HEIGHT,
  TODO_HEIGHT,
  TODO_MIN_WIDTH,
  TODO_WIDTH,
  TOOLBAR_CREATE_DRAG_DATA_TYPE,
  TOOLBAR_CREATE_DRAG_TEXT_PREFIX,
  UNDO_HISTORY_LIMIT,
  WORKSPACE_BACKUP_FILE_TYPE,
  WORKSPACE_BACKUP_FILE_VERSION,
  WORKSPACE_PERSIST_DELAY_MS,
  applyDisabledNoteInlineCommandPresentation,
  autoResizeTextarea,
  buildAppThemeStyle,
  clamp,
  colorHexToRgba,
  colorToHex,
  configureNoteRichTextCommands,
  convertPlainTextToRichNoteHtml,
  createBoardTab,
  createDefaultImageCrop,
  createDefaultTableCellFormat,
  createDefaultViewport,
  createEmptyBoard,
  createEmptyTableCells,
  createMoodboardPreview,
  createNoteSelectionMarker,
  createTableCellSelection,
  createTodoItem,
  createWorkspaceBackupFile,
  drawStrokeOnCanvas,
  elementMatchesNoteInlineCommand,
  escapeHtml,
  getActiveAppThemePreset,
  getActiveBoardTab,
  getActiveBoardTabIndex,
  getAppThemeState,
  getBoardCardLayouts,
  getCanvasClientCenter,
  getCardLayoutCenter,
  getCardMinWidth,
  getCardVisualTheme,
  getClampedSelectionRect,
  getColumnInnerWidth,
  getColumnChildHeight,
  getConnectorAnchorPoint,
  getConnectorKey,
  getConnectorPath,
  getDefaultNoteTextSettings,
  getDefaultTableCellFillColor,
  getDomainLabel,
  getDrawStrokeColor,
  getEventTargetCardId,
  getImageCropImageStyle,
  getImageDisplaySize,
  getLegacyNoteTextStyleString,
  getLegacyTableCellTextStyle,
  getNextPaletteId,
  getNotePaletteMap,
  getNotePalettes,
  getNextZIndex,
  getNoteBlockCommandValue,
  getNoteInlineCommandTag,
  getNoteTextBlockStyle,
  getNoteTextInputStyle,
  getPositiveModulo,
  getRectFromPoints,
  getRenderedImageFrameHeight,
  getSelectionAnchorElement,
  getSelectionInlineFormattingState,
  getSidebarCreateToolFromDataTransfer,
  getSidebarCreateToolLabel,
  getSidebarCreateToolSize,
  getStrokePathData,
  getTableCardDimensions,
  getTableCellColorSwatches,
  getTableCellCoordinateLabel,
  getTableCellFillColor,
  getThemeTableCellBaseFillColor,
  getThemeTableCellFillColor,
  getTableCellSelectionLabel,
  getTableCellSelectionRange,
  getTableCellSelectionSize,
  getTableColumnLabel,
  getTopmostCardIdFromSelection,
  getWorkspaceBackupFilename,
  hexToRgb,
  hexToRgba,
  hasNoMeaningfulAttributes,
  insertNoteSelectionMarkers,
  isAppThemePresetMatch,
  isCard,
  isCalendarEntryMeaningful,
  isColumnCard,
  isColumnChildCard,
  isEditingEventTarget,
  isEmptyCanvasDoubleClickTarget,
  isMidnightThemeColors,
  isNoteInlineCommand,
  isPaletteCard,
  isRecord,
  isRichNoteHtmlBlank,
  isSelectionInsideEditor,
  isSidebarCreateToolKind,
  isTableCellSelectionView,
  isTableCellWithinSelectionRange,
  isWorkspaceBackupCandidate,
  loadAppSettings,
  loadSnapToGridPreference,
  loadWorkspace,
  mixHexColors,
  moveNoteSelectionMarkerOutsideMatchingInlineAncestors,
  normalizeAppSettings,
  normalizeBoardConnectors,
  normalizeBoardState,
  normalizeBoardTabState,
  normalizeCard,
  normalizeCalendarState,
  normalizeCardWidth,
  normalizeColumnCards,
  normalizeColumnChildPlacement,
  normalizeDrawStroke,
  normalizeHexColor,
  normalizeImageCrop,
  normalizeMeasuredCardSize,
  normalizeNoteContentMode,
  normalizeNoteTextAlign,
  normalizeNoteTextSize,
  normalizeOptionalTableCellColor,
  normalizePaletteId,
  normalizeRichNoteHtml,
  normalizeSingleTableCellFormat,
  normalizeTableCellAlign,
  normalizeTableCellBlockStyle,
  normalizeTableCellFormats,
  normalizeTableCellTextStyle,
  normalizeTableCellTone,
  normalizeTableCellType,
  normalizeTableCellValueType,
  normalizeTableCells,
  normalizeTableColumnCount,
  normalizeTableRowCount,
  normalizeViewport,
  normalizeWorkspace,
  parseWorkspaceBackup,
  queryRichTextCommandState,
  readFileAsDataUrl,
  readImageDimensions,
  remapWorkspaceRichTextColorsForTheme,
  resizeTableCard,
  restoreSelectionFromNoteMarkers,
  rgbToHex,
  snapCoordinateToGrid,
  stripInlineCommandStyleFromElement,
  stripNoteInlineCommandFormatting,
  stripNoteTextColorFormatting,
  touchBoard,
  unwrapElementPreserveChildren,
  updateActiveBoardTab,
  wrapFragmentTextNodesWithColor,
  wrapFragmentTextNodesWithStyledSpan,
  wrapFragmentTextNodesWithTag,
}

export type {
  AppSettings,
  AppThemePreset,
  AppThemePresetId,
  BoardCard,
  BoardConnector,
  BoardState,
  BoardTabState,
  CalendarAutoMention,
  CalendarEntry,
  CalendarState,
  CanvasPoint,
  CanvasViewport,
  CardBase,
  CardLayout,
  ColumnCard,
  ColumnChildBase,
  ColumnChildCard,
  DrawPoint,
  DrawStroke,
  DrawTool,
  DocumentCard,
  DocumentPreviewKind,
  HeadingCard,
  ImageCard,
  ImageCrop,
  ImageCropPreview,
  InteractionState,
  LinkCard,
  MeasuredCardSize,
  NoteBlockStyle,
  NoteCard,
  NoteContentMode,
  NoteInlineCommand,
  NotePaletteId,
  PaletteCard,
  NoteTextAlign,
  NoteTextSize,
  NoteTextToolbarState,
  RichTextCard,
  SelectionRect,
  SelectionSidebarView,
  SidebarCreateToolKind,
  TableCard,
  TableCellAlign,
  TableCellFormat,
  TableCellSelection,
  TableCellSelectionRange,
  TableCellSurfaceType,
  TableCellTextStyle,
  TableCellTone,
  TableCellValueType,
  TodoCard,
  TodoItem,
  ToolbarIconName,
  ToolbarTool,
  TrackpadGestureEvent,
  WorkspaceBackupFile,
  WorkspaceMutationOptions,
  WorkspaceSnapshot,
}
