import {
  type ChangeEventHandler,
  type ReactNode,
  type RefObject,
} from 'react'

import WorkspaceBrandMark from './WorkspaceBrandMark'

type WorkspaceSidebarProps = {
  isSelectionSidebar: boolean
  isDrawMode: boolean
  brandLabel: string
  isBrandInteractive: boolean
  selectionSidebarPopout: ReactNode
  defaultSidebarPopout?: ReactNode
  selectionContent: ReactNode
  drawPrimaryContent: ReactNode
  drawColorContent: ReactNode | null
  drawSizeContent: ReactNode
  drawUtilityContent: ReactNode
  defaultPrimaryContent: ReactNode
  defaultSecondaryContent?: ReactNode
  defaultUtilityContent: ReactNode
  drawColorInputRef: RefObject<HTMLInputElement | null>
  drawColorHex: string
  imageInputRef: RefObject<HTMLInputElement | null>
  documentInputRef: RefObject<HTMLInputElement | null>
  onBrandClick: () => void
  onDrawColorInputChange: ChangeEventHandler<HTMLInputElement>
  onImageInputChange: ChangeEventHandler<HTMLInputElement>
  onDocumentInputChange: ChangeEventHandler<HTMLInputElement>
}

function WorkspaceSidebar({
  isSelectionSidebar,
  isDrawMode,
  brandLabel,
  isBrandInteractive,
  selectionSidebarPopout,
  defaultSidebarPopout,
  selectionContent,
  drawPrimaryContent,
  drawColorContent,
  drawSizeContent,
  drawUtilityContent,
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
}: WorkspaceSidebarProps) {
  const hasDefaultPrimaryContent = defaultPrimaryContent !== null
  const hasDefaultSecondaryContent = defaultSecondaryContent !== null
  const activeSidebarPopout = isSelectionSidebar ? selectionSidebarPopout : defaultSidebarPopout
  const brandVariant = isBrandInteractive ? 'back' : 'logo'

  return (
    <div className="sidebar-stage">
      <aside
        className={`tool-rail ${isSelectionSidebar ? 'is-selection-mode' : ''}`}
        aria-label="Toolbar"
      >
        <button
          type="button"
          className={`tool-brand ${isBrandInteractive ? 'is-clickable' : ''}`}
          onClick={onBrandClick}
          aria-label={brandLabel}
        >
          <WorkspaceBrandMark variant={brandVariant} />
        </button>

        {isSelectionSidebar ? (
          selectionContent
        ) : isDrawMode ? (
          <div className="tool-sidebar-mode">
            <div className="tool-stack">{drawPrimaryContent}</div>
            {drawColorContent ? <div className="tool-divider" /> : null}
            {drawColorContent ? <div className="tool-stack">{drawColorContent}</div> : null}
            <div className="tool-divider" />
            <div className="tool-stack">{drawSizeContent}</div>
            <div className="tool-divider" />
            <div className="tool-stack">{drawUtilityContent}</div>
          </div>
        ) : (
          <>
            {hasDefaultPrimaryContent ? (
              <>
                <div className="tool-stack">{defaultPrimaryContent}</div>
                {hasDefaultSecondaryContent || defaultUtilityContent !== null ? (
                  <div className="tool-divider" />
                ) : null}
              </>
            ) : null}
            {hasDefaultSecondaryContent ? (
              <>
                <div className="tool-stack">{defaultSecondaryContent}</div>
                {defaultUtilityContent !== null ? <div className="tool-divider" /> : null}
              </>
            ) : null}
            <div className="tool-stack tool-stack--bottom">{defaultUtilityContent}</div>
          </>
        )}

        <input
          ref={drawColorInputRef}
          type="color"
          hidden
          value={drawColorHex}
          onChange={onDrawColorInputChange}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onImageInputChange}
        />
        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          multiple
          hidden
          onChange={onDocumentInputChange}
        />
      </aside>

      {activeSidebarPopout}
    </div>
  )
}

export default WorkspaceSidebar
