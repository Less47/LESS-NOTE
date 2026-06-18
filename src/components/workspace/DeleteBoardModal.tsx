type DeleteBoardTarget = {
  title: string
  cardCount: number
  strokeCount: number
  connectorCount: number
}

type DeleteBoardModalProps = {
  target: DeleteBoardTarget | null
  onClose: () => void
  onConfirm: () => void
}

function DeleteBoardModal({ target, onClose, onConfirm }: DeleteBoardModalProps) {
  if (!target) {
    return null
  }

  return (
    <div
      className="settings-modal-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="settings-modal warning-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Delete board confirmation"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="settings-modal-header">
          <div className="settings-modal-kicker">Warning</div>
          <div className="settings-modal-title">Delete {target.title || 'this board'}?</div>
        </div>

        <p className="warning-copy">
          This will remove {target.cardCount} {target.cardCount === 1 ? 'card' : 'cards'} and{' '}
          {target.strokeCount} {target.strokeCount === 1 ? 'stroke' : 'strokes'}, plus{' '}
          {target.connectorCount}{' '}
          {target.connectorCount === 1 ? 'connector' : 'connectors'} from this tab.
        </p>
        <p className="warning-copy warning-copy--muted">
          If you do this by mistake, you can still use undo right away to bring it back.
        </p>

        <div className="settings-actions">
          <button type="button" className="settings-button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="settings-button is-danger" onClick={onConfirm}>
            Delete board
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteBoardModal
