type ThemePresetOption = {
  id: string
  label: string
  modeLabel: string
  previewBackground: string
  isActive: boolean
  onSelect: () => void
}

type SettingsModalProps = {
  isOpen: boolean
  activePresetLabel: string
  themePresets: ThemePresetOption[]
  isCustomThemeSelected: boolean
  backgroundColor: string
  sidebarColor: string
  isMidnightTheme: boolean
  isAutoNightModeBoard: boolean
  isAutoNightModeSidebar: boolean
  isNightMode: boolean
  boardCount: number
  onClose: () => void
  onReset: () => void
  onBackgroundColorChange: (color: string) => void
  onSidebarColorChange: (color: string) => void
  onNightModeChange: (nextValue: boolean) => void
  onDownloadBackup: () => void
  onUploadBackup: () => void
}

function SettingsModal({
  isOpen,
  activePresetLabel,
  themePresets,
  isCustomThemeSelected,
  backgroundColor,
  sidebarColor,
  isMidnightTheme,
  isAutoNightModeBoard,
  isAutoNightModeSidebar,
  isNightMode,
  boardCount,
  onClose,
  onReset,
  onBackgroundColorChange,
  onSidebarColorChange,
  onNightModeChange,
  onDownloadBackup,
  onUploadBackup,
}: SettingsModalProps) {
  if (!isOpen) {
    return null
  }

  const isAutoNightMode = isAutoNightModeBoard || isAutoNightModeSidebar
  const autoNightModeCopy = isAutoNightModeBoard && isAutoNightModeSidebar
    ? 'These custom board and sidebar colors are dark enough that each area turns on night mode automatically. Lighten either color to switch that area back.'
    : isAutoNightModeBoard
    ? 'This custom board color is dark enough that the board turns on night mode automatically. Lighten it to switch the board back.'
    : 'This custom sidebar color is dark enough that the sidebar turns on night mode automatically. Lighten it to switch the sidebar back.'

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
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label="App settings"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="settings-modal-header">
          <div className="settings-modal-kicker">Settings</div>
          <div className="settings-modal-title">Settings</div>
        </div>

        <div className="settings-field">
          <div className="settings-row">
            <span className="settings-label">Theme presets</span>
            <span className="settings-value">{activePresetLabel}</span>
          </div>
          <div className="settings-theme-grid" role="group" aria-label="Preset themes">
            {themePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`settings-theme-preset ${preset.isActive ? 'is-active' : ''}`}
                onClick={preset.onSelect}
                aria-pressed={preset.isActive}
              >
                <span
                  className="settings-theme-preview"
                  style={{
                    background: preset.previewBackground,
                  }}
                />
                <span className="settings-theme-meta">
                  <span className="settings-theme-name">{preset.label}</span>
                  <span className="settings-theme-mode">{preset.modeLabel}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {isCustomThemeSelected ? (
          <>
            <div className="settings-field">
              <label className="settings-label" htmlFor="background-color-input">
                Board background
              </label>
              <div className="settings-color-row">
                <input
                  id="background-color-input"
                  className="settings-color-input"
                  type="color"
                  value={backgroundColor}
                  onChange={(event) => onBackgroundColorChange(event.target.value)}
                />
                <span className="settings-value">{backgroundColor}</span>
              </div>
            </div>

            <div className="settings-field">
              <label className="settings-label" htmlFor="sidebar-color-input">
                Sidebar color
              </label>
              <div className="settings-color-row">
                <input
                  id="sidebar-color-input"
                  className="settings-color-input"
                  type="color"
                  value={sidebarColor}
                  onChange={(event) => onSidebarColorChange(event.target.value)}
                />
                <span className="settings-value">{sidebarColor}</span>
              </div>
            </div>
          </>
        ) : null}

        <label
          className={`settings-toggle ${isMidnightTheme || isAutoNightMode ? 'is-disabled' : ''}`}
          htmlFor="night-mode-toggle"
        >
          <div>
            <span className="settings-label">Night mode</span>
            <p className="settings-copy">
              {isMidnightTheme
                ? 'Midnight already controls the background. Switch to another board preset to use night mode.'
                : isAutoNightMode
                ? autoNightModeCopy
                : 'Darken icons, controls, and white cards without changing the board background.'}
            </p>
          </div>
          <span
            className={`settings-toggle-track ${isNightMode || isAutoNightMode ? 'is-active' : ''}`}
            aria-hidden="true"
          >
            <span className="settings-toggle-thumb" />
          </span>
          <input
            id="night-mode-toggle"
            className="settings-toggle-input"
            type="checkbox"
            checked={isNightMode || isAutoNightMode}
            disabled={isMidnightTheme || isAutoNightMode}
            onChange={(event) => onNightModeChange(event.target.checked)}
          />
        </label>

        <div className="settings-field">
          <div className="settings-row">
            <span className="settings-label">Boards backup</span>
            <span className="settings-value">
              {boardCount} {boardCount === 1 ? 'board' : 'boards'}
            </span>
          </div>
          <p className="settings-copy">
            Download your boards and app appearance as a JSON backup. Uploading a backup replaces
            the current boards, restores the saved appearance when present, and you can undo it
            right away if needed.
          </p>
          <div className="settings-actions">
            <button type="button" className="settings-button" onClick={onDownloadBackup}>
              Save backup
            </button>
            <button type="button" className="settings-button" onClick={onUploadBackup}>
              Upload backup
            </button>
          </div>
        </div>

        <div className="settings-actions">
          <button type="button" className="settings-button" onClick={onReset}>
            Reset
          </button>
          <button type="button" className="settings-button is-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
