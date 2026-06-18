import { useEffect, useRef, useState } from 'react'

import { ToolbarIcon } from '../ToolbarIcon'
import { getDomainLabel, type LinkCard } from '../../../workspace/core'

type WorkspaceLinkCardBodyProps = {
  card: LinkCard
  isSelected: boolean
  isConnectorMode: boolean
  onFocusCard: (cardId: string) => void
  onOpenLink: (url: string) => void
  onUrlChange: (cardId: string, url: string) => void
}

function WorkspaceLinkCardBody({
  card,
  isSelected,
  isConnectorMode,
  onFocusCard,
  onOpenLink,
  onUrlChange,
}: WorkspaceLinkCardBodyProps) {
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [failedLogoUrl, setFailedLogoUrl] = useState('')
  const urlInputRef = useRef<HTMLInputElement | null>(null)
  const pointerDownWasSelectedRef = useRef(false)
  const trimmedUrl = card.url.trim()
  const showUrlInput = isEditingUrl
  const normalizedUrl = normalizeUrl(trimmedUrl)
  const siteLogoUrl = getSiteLogoUrl(normalizedUrl)
  const didLogoFail = !!siteLogoUrl && failedLogoUrl === siteLogoUrl
  const domainLabel = getDomainLabel(normalizedUrl || trimmedUrl)
  const siteInitial = domainLabel.slice(0, 1).toUpperCase() || 'L'

  useEffect(() => {
    if (isSelected && !isConnectorMode) {
      return
    }

    setIsEditingUrl(false)
  }, [isConnectorMode, isSelected])

  useEffect(() => {
    if (!showUrlInput || !isSelected || isConnectorMode) {
      return
    }

    urlInputRef.current?.focus()
    urlInputRef.current?.select()
  }, [showUrlInput, isSelected, isConnectorMode])

  const beginUrlEditing = () => {
    onFocusCard(card.id)
    setIsEditingUrl(true)
  }

  return (
    <div className="card-link-body">
      {showUrlInput ? (
        <input
          ref={urlInputRef}
          className="card-url-input link-url-input is-editing"
          value={card.url}
          readOnly={isConnectorMode}
          tabIndex={isConnectorMode ? -1 : undefined}
          onFocus={() => onFocusCard(card.id)}
          onChange={(event) => onUrlChange(card.id, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              event.stopPropagation()
              setIsEditingUrl(false)
              event.currentTarget.blur()
            }

            if (event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              setIsEditingUrl(false)
              event.currentTarget.blur()
            }
          }}
          onBlur={() => {
            setIsEditingUrl(false)
          }}
          onPointerDown={(event) => event.stopPropagation()}
          placeholder="Add a URL..."
        />
      ) : (
        <div
          className={`link-url-frame ${trimmedUrl ? '' : 'link-url-frame--placeholder'}`}
          onPointerDownCapture={() => {
            pointerDownWasSelectedRef.current = isSelected
          }}
        >
          <span className="link-site-mark" aria-hidden="true">
            {siteLogoUrl && !didLogoFail ? (
              <img
                className="link-site-logo"
                src={siteLogoUrl}
                alt=""
                loading="lazy"
                onError={() => setFailedLogoUrl(siteLogoUrl)}
              />
            ) : (
              <span className="link-site-fallback">{siteInitial}</span>
            )}
          </span>
          <div
            className="link-url-surface"
            onClick={(event) => {
              if (isConnectorMode || !pointerDownWasSelectedRef.current) {
                return
              }

              event.preventDefault()
              event.stopPropagation()
              beginUrlEditing()
            }}
          >
            <div className={`link-url-display ${trimmedUrl ? '' : 'is-placeholder'}`}>
              {trimmedUrl || 'Add a URL...'}
            </div>
          </div>
          {trimmedUrl ? (
            <button
              type="button"
              className="link-open-button"
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onOpenLink(card.url)
              }}
              aria-label={domainLabel ? `Open ${domainLabel}` : 'Open link'}
            >
              <ToolbarIcon name="open" />
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}

function normalizeUrl(url: string) {
  if (!url) {
    return ''
  }

  try {
    return new URL(url).toString()
  } catch {
    try {
      return new URL(`https://${url}`).toString()
    } catch {
      return ''
    }
  }
}

function getSiteLogoUrl(url: string) {
  if (!url) {
    return null
  }

  try {
    const hostname = new URL(url).hostname

    if (!hostname) {
      return null
    }

    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`
  } catch {
    return null
  }
}

export default WorkspaceLinkCardBody
