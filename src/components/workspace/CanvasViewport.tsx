import {
  type CSSProperties,
  type DragEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
  type RefObject,
  type WheelEventHandler,
} from 'react'

type CanvasViewportProps = {
  canvasRef: RefObject<HTMLDivElement | null>
  drawCanvasRef: RefObject<HTMLCanvasElement | null>
  className: string
  worldStyle: CSSProperties
  drawLayerActive: boolean
  showEmptyState: boolean
  connectorLayer: ReactNode
  worldContent: ReactNode
  selectionMarquee: ReactNode
  creationPreview: ReactNode
  strokeSelectionOverlay: ReactNode
  onPointerDownCapture: PointerEventHandler<HTMLDivElement>
  onPointerDown: PointerEventHandler<HTMLDivElement>
  onPointerMove: PointerEventHandler<HTMLDivElement>
  onPointerLeave: PointerEventHandler<HTMLDivElement>
  onDoubleClick: MouseEventHandler<HTMLDivElement>
  onWheel: WheelEventHandler<HTMLDivElement>
  onDragEnter: DragEventHandler<HTMLDivElement>
  onDragLeave: DragEventHandler<HTMLDivElement>
  onDragOver: DragEventHandler<HTMLDivElement>
  onDrop: DragEventHandler<HTMLDivElement>
  onDrawLayerPointerDown: PointerEventHandler<HTMLDivElement>
}

function CanvasViewport({
  canvasRef,
  drawCanvasRef,
  className,
  worldStyle,
  drawLayerActive,
  showEmptyState,
  connectorLayer,
  worldContent,
  selectionMarquee,
  creationPreview,
  strokeSelectionOverlay,
  onPointerDownCapture,
  onPointerDown,
  onPointerMove,
  onPointerLeave,
  onDoubleClick,
  onWheel,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onDrawLayerPointerDown,
}: CanvasViewportProps) {
  return (
    <div
      ref={canvasRef}
      tabIndex={-1}
      className={className}
      onPointerDownCapture={onPointerDownCapture}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onDoubleClick={onDoubleClick}
      onWheel={onWheel}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {connectorLayer}
      <div className={`canvas-world ${drawLayerActive ? 'is-inert' : ''}`} style={worldStyle}>
        {worldContent}
      </div>
      {selectionMarquee}
      {creationPreview}
      <div
        className={`canvas-draw-layer ${drawLayerActive ? 'is-active' : ''}`}
        onPointerDown={onDrawLayerPointerDown}
      >
        <canvas
          ref={drawCanvasRef}
          className="canvas-draw-canvas"
          aria-hidden="true"
          onDragStart={(event) => event.preventDefault()}
        />
      </div>
      {strokeSelectionOverlay}
      {showEmptyState ? (
        <div className="empty-state">
          <strong>Start throwing things down.</strong>
          <p>Add a note, drag a tool into place, or drop some images and files to build the board.</p>
        </div>
      ) : null}
    </div>
  )
}

export default CanvasViewport
