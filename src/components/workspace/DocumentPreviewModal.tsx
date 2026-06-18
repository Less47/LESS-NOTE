import { useEffect } from 'react'

import type { DocumentCard } from '../../workspace/core'
import { formatFileSize } from '../../workspace/documentFiles'

type DocumentPreviewModalProps = {
  documentCard: DocumentCard | null
  onClose: () => void
}

function DocumentPreviewModal({ documentCard, onClose }: DocumentPreviewModalProps) {
  useEffect(() => {
    if (!documentCard) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [documentCard, onClose])

  if (!documentCard) {
    return null
  }

  return (
    <div
      className="settings-modal-backdrop document-preview-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="document-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-preview-title"
      >
        <button
          type="button"
          className="document-preview-close"
          onClick={onClose}
          aria-label="Close document preview"
        >
          x
        </button>

        <div className="document-preview-body">
          {documentCard.previewKind === 'pdf' ? (
            <iframe
              className="document-preview-frame"
              src={documentCard.dataUrl}
              title={`Preview of ${documentCard.fileName}`}
            />
          ) : documentCard.previewKind === 'docx' ? (
            <div
              className="document-preview-html"
              dangerouslySetInnerHTML={{
                __html: documentCard.previewContent ?? '<p>Preview unavailable.</p>',
              }}
            />
          ) : (
            <pre className="document-preview-text">
              {documentCard.previewContent ?? 'Preview unavailable.'}
            </pre>
          )}
        </div>

        <footer className="document-preview-footer">
          <div className="document-preview-file-mark" aria-hidden="true">
            <span>{documentCard.extension || 'file'}</span>
          </div>
          <div className="document-preview-meta">
            <div id="document-preview-title" className="document-preview-name">
              {documentCard.fileName}
            </div>
            <div className="document-preview-actions">
              <a
                className="document-preview-download"
                href={documentCard.dataUrl}
                download={documentCard.fileName}
              >
                Download
              </a>
              <span className="document-preview-size">{formatFileSize(documentCard.fileSize)}</span>
            </div>
          </div>
        </footer>
      </section>
    </div>
  )
}

export default DocumentPreviewModal
