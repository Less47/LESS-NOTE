import type { UnsupportedUploadWarning } from '../../workspace/documentFiles'

type FileUploadWarningModalProps = {
  warning: UnsupportedUploadWarning | null
  onClose: () => void
}

function FileUploadWarningModal({ warning, onClose }: FileUploadWarningModalProps) {
  if (!warning) {
    return null
  }

  return (
    <div
      className="settings-modal-backdrop file-upload-warning-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="settings-modal file-upload-warning-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="file-upload-warning-title"
      >
        <button
          type="button"
          className="file-upload-warning-close"
          onClick={onClose}
          aria-label="Close upload warning"
        >
          x
        </button>
        <div className="file-upload-warning-icon" aria-hidden="true">
          !
        </div>
        <h2 id="file-upload-warning-title" className="file-upload-warning-title">
          Can&apos;t upload this file
        </h2>
        <p className="file-upload-warning-copy">
          <strong>{warning.extensionLabel}</strong> files are not supported.
        </p>
        <p className="file-upload-warning-file">{warning.fileName}</p>
      </section>
    </div>
  )
}

export default FileUploadWarningModal
