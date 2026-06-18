import type { CSSProperties } from 'react'

type WorkspaceCornerToolsProps = {
  isSnapToGrid: boolean
  minZoom: number
  maxZoom: number
  zoom: number
  zoomPercentage: number
  onToggleSnapToGrid: () => void
  onZoomChange: (zoom: number) => void
  onResetZoom: () => void
}

function WorkspaceCornerTools({
  isSnapToGrid,
  minZoom,
  maxZoom,
  zoom,
  zoomPercentage,
  onToggleSnapToGrid,
  onZoomChange,
  onResetZoom,
}: WorkspaceCornerToolsProps) {
  const zoomProgress =
    maxZoom > minZoom ? ((zoom - minZoom) / (maxZoom - minZoom)) * 100 : 0

  return (
    <div className="workspace-corner-tools">
      <button
        type="button"
        className="workspace-switch"
        role="switch"
        aria-checked={isSnapToGrid}
        aria-label={isSnapToGrid ? 'Turn snap to grid off' : 'Turn snap to grid on'}
        onClick={onToggleSnapToGrid}
      >
        <span className="workspace-switch-label">Snap</span>
        <span className={`workspace-switch-track ${isSnapToGrid ? 'is-active' : ''}`}>
          <span className="workspace-switch-thumb" />
        </span>
      </button>
      <div className="workspace-zoom-control">
        <span className="workspace-zoom-label">Zoom</span>
        <input
          className="workspace-zoom-range"
          type="range"
          min={minZoom}
          max={maxZoom}
          step={0.01}
          value={zoom}
          style={
            {
              '--zoom-progress': `${Math.max(0, Math.min(100, zoomProgress))}%`,
            } as CSSProperties
          }
          aria-label="Zoom workspace"
          onChange={(event) => {
            onZoomChange(Number(event.target.value))
          }}
        />
        <button
          type="button"
          className="workspace-zoom-value"
          onClick={onResetZoom}
          aria-label="Reset zoom to 100 percent"
          title="Reset zoom to 100%"
        >
          {zoomPercentage}%
        </button>
      </div>
    </div>
  )
}

export default WorkspaceCornerTools
