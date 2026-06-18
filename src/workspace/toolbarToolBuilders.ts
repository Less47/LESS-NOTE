import type { BoardConnector, DrawStroke, DrawTool, SidebarCreateToolKind, ToolbarTool } from './core'
import { DRAW_BRUSH_SIZES, DRAW_RED_COLOR_HEX } from './core'

type DrawColorSwatch = {
  hex: string
  label: string
}

function buildPrimaryTools(args: {
  isConnectorMode: boolean
  isDrawMode: boolean
  onToggleConnectorMode: () => void
  onToggleDrawMode: () => void
  onAddHeading: () => void
  onAddNote: () => void
  onAddTodo: () => void
  onAddLink: () => void
  onAddTable: () => void
  onOpenImagePicker: () => void
  onAddColumn: () => void
}) {
  const createTool = (
    id: string,
    label: string,
    icon: ToolbarTool['icon'],
    createKind: SidebarCreateToolKind,
    onClick: () => void,
  ): ToolbarTool => ({
    id,
    label,
    icon,
    createKind,
    onClick,
  })

  return [
    {
      id: 'connect',
      label: 'Connect',
      icon: 'connector',
      onClick: args.onToggleConnectorMode,
      active: args.isConnectorMode,
    },
    {
      id: 'draw',
      label: 'Draw',
      icon: 'draw',
      onClick: args.onToggleDrawMode,
      active: args.isDrawMode,
    },
    createTool('add-heading', 'Heading', 'heading', 'heading', args.onAddHeading),
    createTool('add-note', 'Add note', 'note', 'note', args.onAddNote),
    createTool('add-todo', 'To do', 'todo', 'todo', args.onAddTodo),
    createTool('add-link', 'Add link', 'link', 'link', args.onAddLink),
    createTool('add-table', 'Table', 'table', 'table', args.onAddTable),
    {
      id: 'add-image',
      label: 'Add image',
      icon: 'image',
      onClick: args.onOpenImagePicker,
    },
    createTool('add-column', 'Column', 'column', 'column', args.onAddColumn),
  ] satisfies ToolbarTool[]
}

function buildUtilityTools(args: {
  isSettingsOpen: boolean
  onFitBoard: () => void
  onToggleSettings: () => void
}) {
  return [
    {
      id: 'fit-board',
      label: 'Fit board',
      icon: 'fit',
      onClick: args.onFitBoard,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      onClick: args.onToggleSettings,
      active: args.isSettingsOpen,
    },
  ] satisfies ToolbarTool[]
}

function buildDrawModePrimaryTools(args: {
  drawTool: DrawTool
  onSetDrawTool: (tool: DrawTool, statusText: string) => void
}) {
  return [
    {
      id: 'draw-marker',
      label: 'Marker',
      icon: 'marker',
      onClick: () => args.onSetDrawTool('marker', 'Marker ready.'),
      active: args.drawTool === 'marker',
    },
    {
      id: 'draw-eraser',
      label: 'Eraser',
      icon: 'eraser',
      onClick: () => args.onSetDrawTool('eraser', 'Eraser ready.'),
      active: args.drawTool === 'eraser',
    },
  ] satisfies ToolbarTool[]
}

function buildDrawModeColorTools(args: {
  drawTool: DrawTool
  primaryDrawColorHex: string
  primaryDrawColorLabel: string
  drawColorHex: string
  isCustomDrawColor: boolean
  onSetDrawColor: (hex: string) => void
  onOpenCustomColor: () => void
  onStatusText: (text: string) => void
}) {
  if (args.drawTool !== 'marker') {
    return [] as ToolbarTool[]
  }

  const setDrawColor = (hex: string) => {
    args.onSetDrawColor(hex)
    args.onStatusText('Draw color updated.')
  }

  return [
    {
      id: 'draw-color-black',
      label: args.primaryDrawColorLabel,
      icon: 'color-black',
      iconColor: args.primaryDrawColorHex,
      onClick: () => setDrawColor(args.primaryDrawColorHex),
      active: args.drawColorHex.toLowerCase() === args.primaryDrawColorHex,
    },
    {
      id: 'draw-color-red',
      label: 'Red',
      icon: 'color-red',
      iconColor: DRAW_RED_COLOR_HEX,
      onClick: () => setDrawColor(DRAW_RED_COLOR_HEX),
      active: args.drawColorHex.toLowerCase() === DRAW_RED_COLOR_HEX,
    },
    {
      id: 'draw-color-custom',
      label: 'Custom',
      icon: 'color-custom',
      iconColor: args.drawColorHex,
      onClick: args.onOpenCustomColor,
      active: args.isCustomDrawColor,
    },
  ] satisfies ToolbarTool[]
}

function buildDrawModeSizeTools(args: {
  drawStrokeSize: number
  onSetDrawStrokeSize: (size: number) => void
  onStatusText: (text: string) => void
}) {
  return DRAW_BRUSH_SIZES.map((size, index) => ({
    id:
      index === 0 ? 'draw-size-small' : index === 1 ? 'draw-size-medium' : 'draw-size-large',
    label: `${size} px`,
    icon:
      index === 0 ? 'size-small' : index === 1 ? 'size-medium' : 'size-large',
    onClick: () => {
      args.onSetDrawStrokeSize(size)
      args.onStatusText(`Brush size set to ${size}px.`)
    },
    active: args.drawStrokeSize === size,
  })) satisfies ToolbarTool[]
}

function buildDrawModeUtilityTools(args: { onClearDrawings: () => void }) {
  return [
    {
      id: 'draw-clear',
      label: 'Clear',
      icon: 'delete',
      onClick: args.onClearDrawings,
      tone: 'danger',
    },
  ] satisfies ToolbarTool[]
}

function buildConnectorSelectionTools(args: {
  selectedConnector: BoardConnector | null
  onRemoveConnectors: (connectorIds: string[]) => void
}) {
  if (!args.selectedConnector) {
    return null
  }

  const selectedConnector = args.selectedConnector

  return [
    {
      id: 'connector-delete',
      label: 'Delete',
      icon: 'delete',
      onClick: () => args.onRemoveConnectors([selectedConnector.id]),
      tone: 'danger',
    },
  ] satisfies ToolbarTool[]
}

function buildStrokeSelectionTools(args: {
  selectedStroke: DrawStroke | null
  primaryDrawColorHex: string
  primaryDrawColorLabel: string
  drawColorSwatches: readonly DrawColorSwatch[]
  onApplyStrokeColor: (hex: string) => void
  onOpenCustomColor: (initialColor: string) => void
  onRemoveStrokes: (strokeIds: string[]) => void
  colorToHex: (value: string) => string | null
}) {
  if (!args.selectedStroke) {
    return null
  }

  const selectedStroke = args.selectedStroke

  const selectedStrokeDefaultHex =
    args.colorToHex(selectedStroke.color) ?? args.primaryDrawColorHex
  const normalizedSelectedStrokeHex = selectedStrokeDefaultHex.toLowerCase()
  const isCustomSelectedStrokeColor = !args.drawColorSwatches.some(
    (colorOption) => colorOption.hex === normalizedSelectedStrokeHex,
  )

  return [
    ...(selectedStroke.tool === 'marker'
      ? [
          {
            id: 'stroke-color-black',
            label: args.primaryDrawColorLabel,
            icon: 'color-black' as const,
            iconColor: args.primaryDrawColorHex,
            onClick: () => args.onApplyStrokeColor(args.primaryDrawColorHex),
            active: normalizedSelectedStrokeHex === args.primaryDrawColorHex,
          },
          {
            id: 'stroke-color-red',
            label: 'Red',
            icon: 'color-red' as const,
            iconColor: DRAW_RED_COLOR_HEX,
            onClick: () => args.onApplyStrokeColor(DRAW_RED_COLOR_HEX),
            active: normalizedSelectedStrokeHex === DRAW_RED_COLOR_HEX,
          },
          {
            id: 'stroke-color-custom',
            label: 'Custom',
            icon: 'color-custom' as const,
            iconColor: selectedStrokeDefaultHex,
            onClick: () => args.onOpenCustomColor(selectedStrokeDefaultHex),
            active: isCustomSelectedStrokeColor,
          },
        ]
      : []),
    {
      id: 'stroke-delete',
      label: 'Delete',
      icon: 'delete' as const,
      onClick: () => args.onRemoveStrokes([selectedStroke.id]),
      tone: 'danger' as const,
    },
  ] satisfies ToolbarTool[]
}

export {
  buildConnectorSelectionTools,
  buildDrawModeColorTools,
  buildDrawModePrimaryTools,
  buildDrawModeSizeTools,
  buildDrawModeUtilityTools,
  buildPrimaryTools,
  buildStrokeSelectionTools,
  buildUtilityTools,
}
