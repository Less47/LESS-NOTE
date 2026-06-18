import type { DragEventHandler } from 'react'

import type { ToolbarTool } from '../../workspace/core'
import { ToolbarIcon } from './ToolbarIcon'

type WorkspaceToolButtonProps = {
  tool: ToolbarTool
  onDragStart: DragEventHandler<HTMLButtonElement>
  onDragEnd: DragEventHandler<HTMLButtonElement>
}

function WorkspaceToolButton({ tool, onDragStart, onDragEnd }: WorkspaceToolButtonProps) {
  return (
    <button
      type="button"
      className={`tool-button ${tool.active ? 'is-active' : ''} ${
        tool.disabled ? 'is-disabled' : ''
      } ${tool.tone === 'danger' ? 'is-danger' : ''} ${
        tool.createKind ? 'is-draggable' : ''
      }`}
      onClick={tool.onClick}
      draggable={Boolean(tool.createKind && !tool.disabled)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      disabled={tool.disabled}
      aria-label={tool.label}
    >
      <span className="tool-icon" style={tool.iconColor ? { color: tool.iconColor } : undefined}>
        <ToolbarIcon name={tool.icon} />
      </span>
      <span className="tool-button-label">{tool.label}</span>
    </button>
  )
}

export default WorkspaceToolButton
