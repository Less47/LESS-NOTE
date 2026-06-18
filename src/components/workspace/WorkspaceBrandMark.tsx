import { ToolbarIcon } from './ToolbarIcon'

type WorkspaceBrandMarkProps = {
  variant?: 'logo' | 'back'
}

function WorkspaceBrandMark({ variant = 'logo' }: WorkspaceBrandMarkProps) {
  if (variant === 'back') {
    return (
      <span className="tool-brand-mark tool-brand-mark--back" aria-hidden="true">
        <span className="tool-brand-mark-icon">
          <ToolbarIcon name="back" />
        </span>
      </span>
    )
  }

  return (
    <span className="tool-brand-mark" aria-hidden="true">
      <span className="tool-brand-mark-letter tool-brand-mark-letter--base">L</span>
      <span className="tool-brand-mark-letter tool-brand-mark-letter--accent">N</span>
    </span>
  )
}

export default WorkspaceBrandMark
