type BoardTabItem = {
  id: string
  title: string
  label: string
  ariaLabel?: string
  isActive: boolean
  inputSize: number
  placeholder: string
  isEditable?: boolean
  icon?: 'calendar'
}

type BoardTabsProps = {
  tabs: BoardTabItem[]
  canDelete: boolean
  deleteAriaLabel: string
  deleteTitle: string
  onCreate: () => void
  onDelete: () => void
  onSelect: (boardId: string) => void
  onRename: (boardId: string, title: string) => void
}

function CalendarTabIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4.5"
        y="5.5"
        width="15"
        height="14"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 4.5v3M16 4.5v3M4.5 9.2h15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M8.2 12.2h2.2M12 12.2h2.2M15.8 12.2H18M8.2 15.7h2.2M12 15.7h2.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function BoardTabs({
  tabs,
  canDelete,
  deleteAriaLabel,
  deleteTitle,
  onCreate,
  onDelete,
  onSelect,
  onRename,
}: BoardTabsProps) {
  return (
    <div className="workspace-board-tools">
      <div className="board-tabs-row">
        <div className="board-tabs" role="tablist" aria-label="Workspace tabs">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              role="tab"
              data-board-tab-id={tab.icon === 'calendar' ? undefined : tab.id}
              aria-selected={tab.isActive}
              aria-label={tab.ariaLabel ?? tab.label}
              tabIndex={tab.isActive ? -1 : 0}
              title={tab.ariaLabel ?? tab.label}
              className={`board-tab ${tab.isActive ? 'is-active' : ''} ${
                tab.icon ? 'is-icon-only' : ''
              }`}
              onMouseDown={(event) => {
                if (!tab.isActive) {
                  event.preventDefault()
                }
              }}
              onClick={() => {
                if (!tab.isActive) {
                  onSelect(tab.id)
                }
              }}
              onKeyDown={(event) => {
                if (tab.isActive) {
                  return
                }

                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(tab.id)
                }
              }}
            >
              {tab.icon === 'calendar' ? (
                <span className="board-tab-icon">
                  <CalendarTabIcon />
                </span>
              ) : tab.isEditable === false || !tab.isActive ? (
                <span className="board-tab-label">{tab.label}</span>
              ) : (
                <input
                  className="board-tab-input"
                  value={tab.title}
                  readOnly={false}
                  tabIndex={0}
                  size={tab.inputSize}
                  placeholder={tab.placeholder}
                  aria-label="Edit board title"
                  onChange={(event) => {
                    onRename(tab.id, event.target.value)
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="board-create-button"
          onClick={onCreate}
          aria-label="Create new board"
          title="Create new board"
        >
          <span aria-hidden="true">+</span>
        </button>
        <button
          type="button"
          className="board-delete-button"
          onClick={onDelete}
          disabled={!canDelete}
          aria-label={deleteAriaLabel}
          title={deleteTitle}
        >
          <span aria-hidden="true">x</span>
        </button>
      </div>
    </div>
  )
}

export default BoardTabs
