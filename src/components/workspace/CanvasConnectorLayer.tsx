import type { PointerEvent as ReactPointerEvent } from 'react'

import type { BoardConnector, CanvasPoint, CardLayout } from '../../workspace/core'
import {
  getCardLayoutCenter,
  getConnectorAnchorPoint,
  getConnectorPath,
} from '../../workspace/core'

type CanvasRect = Pick<CardLayout, 'x' | 'y' | 'width' | 'height'>

type CanvasConnectorLayerProps = {
  connectors: BoardConnector[]
  layouts: Map<string, CardLayout>
  connectorSourceCardId: string | null
  connectorPreviewPoint: CanvasPoint | null
  selectedConnectorId: string | null
  isConnectorMode: boolean
  getCardCanvasRect: (cardId: string) => CanvasRect | null
  getLayoutCanvasRect: (layout: CanvasRect) => CanvasRect
  onSelectConnector: (connectorId: string) => void
}

function CanvasConnectorLayer({
  connectors,
  layouts,
  connectorSourceCardId,
  connectorPreviewPoint,
  selectedConnectorId,
  isConnectorMode,
  getCardCanvasRect,
  getLayoutCanvasRect,
  onSelectConnector,
}: CanvasConnectorLayerProps) {
  const sourceLayout = connectorSourceCardId ? layouts.get(connectorSourceCardId) ?? null : null
  const sourceRect =
    connectorSourceCardId && sourceLayout
      ? getCardCanvasRect(connectorSourceCardId) ?? getLayoutCanvasRect(sourceLayout)
      : null
  const previewPath =
    sourceRect && connectorPreviewPoint
      ? getConnectorPath(
          getConnectorAnchorPoint(sourceRect, connectorPreviewPoint),
          connectorPreviewPoint,
        )
      : null

  if (!connectors.length && !previewPath) {
    return null
  }

  const handlePointerDown = (
    event: ReactPointerEvent<SVGPathElement>,
    connectorId: string,
  ) => {
    if (isConnectorMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    onSelectConnector(connectorId)
  }

  return (
    <svg
      className={`board-connector-layer ${isConnectorMode ? 'is-disabled' : ''}`}
      aria-hidden="true"
    >
      {connectors.map((connector) => {
        const fromLayout = layouts.get(connector.fromCardId)
        const toLayout = layouts.get(connector.toCardId)

        if (!fromLayout || !toLayout) {
          return null
        }

        const fromRect = getCardCanvasRect(connector.fromCardId) ?? getLayoutCanvasRect(fromLayout)
        const toRect = getCardCanvasRect(connector.toCardId) ?? getLayoutCanvasRect(toLayout)
        const fromCenter = getCardLayoutCenter(fromRect)
        const toCenter = getCardLayoutCenter(toRect)
        const startPoint = getConnectorAnchorPoint(fromRect, toCenter)
        const endPoint = getConnectorAnchorPoint(toRect, fromCenter)
        const pathData = getConnectorPath(startPoint, endPoint)
        const isSelected = selectedConnectorId === connector.id

        return (
          <g key={connector.id}>
            {isSelected ? (
              <>
                <path className="board-connector-underlay" d={pathData} />
                <path className="board-connector-outline" d={pathData} />
              </>
            ) : null}
            <path className={`board-connector-line ${isSelected ? 'is-selected' : ''}`} d={pathData} />
            <path
              className="board-connector-hit-target"
              d={pathData}
              onPointerDown={(event) => handlePointerDown(event, connector.id)}
            />
          </g>
        )
      })}
      {previewPath ? <path className="board-connector-preview" d={previewPath} /> : null}
    </svg>
  )
}

export default CanvasConnectorLayer
