import type { PointerEvent as ReactPointerEvent } from 'react'

import type { CanvasViewport, DrawStroke } from '../../workspace/core'
import { getStrokePathData } from '../../workspace/core'

type CanvasStrokeSelectionOverlayProps = {
  strokes: DrawStroke[]
  viewport: CanvasViewport
  drawLayerActive: boolean
  isConnectorMode: boolean
  selectedStrokeId: string | null
  onSelectStroke: (strokeId: string) => void
}

function CanvasStrokeSelectionOverlay({
  strokes,
  viewport,
  drawLayerActive,
  isConnectorMode,
  selectedStrokeId,
  onSelectStroke,
}: CanvasStrokeSelectionOverlayProps) {
  if (!strokes.length) {
    return null
  }

  const handlePointerDown = (
    event: ReactPointerEvent<SVGPathElement | SVGCircleElement>,
    strokeId: string,
  ) => {
    if (drawLayerActive || isConnectorMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    onSelectStroke(strokeId)
  }

  return (
    <svg
      className={`canvas-draw-hit-layer ${
        drawLayerActive || isConnectorMode ? 'is-disabled' : ''
      }`}
      aria-hidden="true"
    >
      <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
        {strokes.map((stroke) => {
          if (stroke.tool !== 'marker' || !stroke.points.length) {
            return null
          }

          const isSelected = selectedStrokeId === stroke.id
          const pathData = getStrokePathData(stroke.points)
          const hitStrokeWidth = Math.max(stroke.size, 18 / Math.max(viewport.zoom, 0.001))
          const selectionStrokeWidth = stroke.size + 10 / Math.max(viewport.zoom, 0.001)

          if (pathData) {
            return (
              <g key={stroke.id}>
                {isSelected ? (
                  <>
                    <path
                      className="stroke-selection-underlay"
                      d={pathData}
                      strokeWidth={selectionStrokeWidth}
                    />
                    <path
                      className="stroke-selection-outline"
                      d={pathData}
                      strokeWidth={Math.max(
                        stroke.size,
                        selectionStrokeWidth - 4 / Math.max(viewport.zoom, 0.001),
                      )}
                    />
                  </>
                ) : null}
                <path
                  className="stroke-hit-target"
                  d={pathData}
                  strokeWidth={hitStrokeWidth}
                  onPointerDown={(event) => handlePointerDown(event, stroke.id)}
                />
              </g>
            )
          }

          const point = stroke.points[0]
          const radius = Math.max(stroke.size / 2, 8 / Math.max(viewport.zoom, 0.001))

          return (
            <g key={stroke.id}>
              {isSelected ? (
                <>
                  <circle
                    className="stroke-selection-underlay"
                    cx={point.x}
                    cy={point.y}
                    r={radius + 5 / Math.max(viewport.zoom, 0.001)}
                    strokeWidth={4 / Math.max(viewport.zoom, 0.001)}
                  />
                  <circle
                    className="stroke-selection-outline"
                    cx={point.x}
                    cy={point.y}
                    r={radius + 3 / Math.max(viewport.zoom, 0.001)}
                    strokeWidth={3 / Math.max(viewport.zoom, 0.001)}
                  />
                </>
              ) : null}
              <circle
                className="stroke-hit-target-point"
                cx={point.x}
                cy={point.y}
                r={radius}
                strokeWidth={Math.max(stroke.size, 18 / Math.max(viewport.zoom, 0.001))}
                onPointerDown={(event) => handlePointerDown(event, stroke.id)}
              />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export default CanvasStrokeSelectionOverlay
