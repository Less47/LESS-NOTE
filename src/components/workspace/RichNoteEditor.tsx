import { memo, useEffect, useRef, useState, type CSSProperties } from 'react'

type RichNoteEditorProps = {
  cardId: string
  value: string
  placeholder: string
  ariaLabel?: string
  style?: CSSProperties
  isSelected: boolean
  isReadOnly: boolean
  registerEditor: (cardId: string) => (node: HTMLDivElement | null) => void
  normalizeHtml: (html: string) => string
  configureRichTextCommands: () => void
  onFocusCard: (cardId: string) => void
  onActivateEditor: (cardId: string) => void
  onSelectionChange: (cardId: string) => void
  onContentChange: (cardId: string, html: string) => void
}

const HEX_COLOR_PATTERN = /#[0-9a-fA-F]{3,8}/g

function isValidHexPreviewToken(token: string) {
  const digitCount = token.length - 1
  return digitCount === 3 || digitCount === 4 || digitCount === 6 || digitCount === 8
}

function isHexPreviewBoundaryCharacter(value: string | undefined) {
  return value === undefined || !/[0-9a-zA-Z_-]/.test(value)
}

function buildHexPreviewFragment(text: string, ownerDocument: Document) {
  const fragment = ownerDocument.createDocumentFragment()
  let hasPreview = false
  let lastIndex = 0

  for (const match of text.matchAll(HEX_COLOR_PATTERN)) {
    const matchedToken = match[0]
    const matchIndex = match.index ?? -1
    if (
      matchIndex < 0 ||
      !isValidHexPreviewToken(matchedToken) ||
      !isHexPreviewBoundaryCharacter(text[matchIndex - 1]) ||
      !isHexPreviewBoundaryCharacter(text[matchIndex + matchedToken.length])
    ) {
      continue
    }

    hasPreview = true

    if (matchIndex > lastIndex) {
      fragment.append(text.slice(lastIndex, matchIndex))
    }

    const preview = ownerDocument.createElement('span')
    preview.className = 'note-hex-preview'

    const swatch = ownerDocument.createElement('span')
    swatch.className = 'note-hex-swatch'
    swatch.setAttribute('aria-hidden', 'true')
    swatch.style.backgroundColor = matchedToken

    const label = ownerDocument.createElement('span')
    label.className = 'note-hex-value'
    label.textContent = matchedToken

    preview.append(swatch, label)
    fragment.append(preview)
    lastIndex = matchIndex + matchedToken.length
  }

  if (!hasPreview) {
    return null
  }

  if (lastIndex < text.length) {
    fragment.append(text.slice(lastIndex))
  }

  return fragment
}

function decorateHexColorPreviews(html: string) {
  if (!html.trim() || typeof document === 'undefined') {
    return html
  }

  const container = document.createElement('div')
  container.innerHTML = html
  const textNodes: Text[] = []
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let currentNode = walker.nextNode()

  while (currentNode) {
    const textNode = currentNode as Text
    const parentElement = textNode.parentElement

    if (!parentElement?.closest('.note-hex-preview')) {
      textNodes.push(textNode)
    }

    currentNode = walker.nextNode()
  }

  for (const textNode of textNodes) {
    const fragment = buildHexPreviewFragment(textNode.data, container.ownerDocument)
    if (!fragment) {
      continue
    }

    textNode.replaceWith(fragment)
  }

  return container.innerHTML
}

function moveCaretToEnd(editor: HTMLDivElement) {
  const selection =
    typeof window !== 'undefined' && typeof window.getSelection === 'function'
      ? window.getSelection()
      : null

  if (!selection) {
    return
  }

  const range = document.createRange()
  range.selectNodeContents(editor)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
}

function moveCaretToPoint(editor: HTMLDivElement, clientX: number, clientY: number) {
  const selection =
    typeof window !== 'undefined' && typeof window.getSelection === 'function'
      ? window.getSelection()
      : null

  if (!selection) {
    return false
  }

  const ownerDocument = editor.ownerDocument
  const modernCaretPositionFromPoint = (
    ownerDocument as Document & {
      caretPositionFromPoint?: (
        x: number,
        y: number,
      ) => {
        offsetNode: Node
        offset: number
      } | null
    }
  ).caretPositionFromPoint

  if (typeof modernCaretPositionFromPoint === 'function') {
    const caretPosition = modernCaretPositionFromPoint.call(
      ownerDocument,
      clientX,
      clientY,
    )
    if (caretPosition && editor.contains(caretPosition.offsetNode)) {
      const range = ownerDocument.createRange()
      range.setStart(caretPosition.offsetNode, caretPosition.offset)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      return true
    }
  }

  const legacyCaretRangeFromPoint = (
    ownerDocument as Document & {
      caretRangeFromPoint?: (x: number, y: number) => Range | null
    }
  ).caretRangeFromPoint

  if (typeof legacyCaretRangeFromPoint === 'function') {
    const range = legacyCaretRangeFromPoint.call(ownerDocument, clientX, clientY)
    if (range && editor.contains(range.startContainer)) {
      selection.removeAllRanges()
      selection.addRange(range)
      return true
    }
  }

  return false
}

const RichNoteEditor = memo(function RichNoteEditor({
  cardId,
  value,
  placeholder,
  ariaLabel = 'Note content',
  style,
  isSelected,
  isReadOnly,
  registerEditor,
  normalizeHtml,
  configureRichTextCommands,
  onFocusCard,
  onActivateEditor,
  onSelectionChange,
  onContentChange,
}: RichNoteEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const pointerDownWasSelectedRef = useRef(false)
  const pendingCaretPointRef = useRef<{
    x: number
    y: number
  } | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const syncEditorMarkup = (editor: HTMLDivElement | null, html: string, editing: boolean) => {
    if (!editor) {
      return
    }

    const renderedHtml = editing ? html : decorateHexColorPreviews(html)
    if (editor.innerHTML !== renderedHtml) {
      editor.innerHTML = renderedHtml
    }
  }

  useEffect(() => {
    syncEditorMarkup(editorRef.current, value, isEditing)
  }, [isEditing, value])

  const emitContentChange = () => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    const nextHtml = normalizeHtml(editor.innerHTML)
    if (nextHtml === '' && editor.innerHTML !== '') {
      editor.innerHTML = ''
    }

    onContentChange(cardId, nextHtml)
    onSelectionChange(cardId)
  }

  useEffect(() => {
    if (isSelected && !isReadOnly) {
      return
    }

    setIsEditing(false)
  }, [isReadOnly, isSelected])

  useEffect(() => {
    if (!isEditing) {
      return
    }

    const focusEditor = () => {
      const editor = editorRef.current
      if (!editor) {
        return
      }

      editor.focus()
      const pendingCaretPoint = pendingCaretPointRef.current
      const movedToPointer =
        pendingCaretPoint !== null
          ? moveCaretToPoint(editor, pendingCaretPoint.x, pendingCaretPoint.y)
          : false

      if (!movedToPointer) {
        moveCaretToEnd(editor)
      }

      pendingCaretPointRef.current = null
    }

    window.requestAnimationFrame(focusEditor)
  }, [isEditing])

  const handleRef = (node: HTMLDivElement | null) => {
    editorRef.current = node
    registerEditor(cardId)(node)
    syncEditorMarkup(node, value, isEditing)
  }

  return (
    <div
      ref={handleRef}
      className={`card-note-body card-note-editor ${
        isEditing ? 'is-editing' : 'is-preview-mode'
      }`}
      style={style}
      contentEditable={!isReadOnly && isEditing}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      tabIndex={isReadOnly ? -1 : isEditing ? 0 : undefined}
      onFocus={() => {
        if (!isEditing) {
          return
        }

        configureRichTextCommands()
        onFocusCard(cardId)
        onActivateEditor(cardId)
        onSelectionChange(cardId)
      }}
      onInput={() => {
        if (!isEditing) {
          return
        }

        emitContentChange()
      }}
      onKeyUp={() => {
        if (!isEditing) {
          return
        }

        onSelectionChange(cardId)
      }}
      onMouseUp={() => {
        if (!isEditing) {
          return
        }

        onSelectionChange(cardId)
      }}
      onBlur={() => {
        if (!isEditing) {
          return
        }

        emitContentChange()
        setIsEditing(false)
      }}
      onPointerDownCapture={(event) => {
        pointerDownWasSelectedRef.current = isSelected
        pendingCaretPointRef.current =
          isSelected && !isEditing
            ? {
                x: event.clientX,
                y: event.clientY,
              }
            : null
      }}
      onPointerDown={(event) => {
        if (!isEditing) {
          return
        }

        event.stopPropagation()
      }}
      onClick={(event) => {
        if (isReadOnly || isEditing || !pointerDownWasSelectedRef.current) {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        setIsEditing(true)
      }}
      onPaste={(event) => {
        if (!isEditing) {
          return
        }

        event.preventDefault()
        configureRichTextCommands()
        const text = event.clipboardData.getData('text/plain')
        document.execCommand('insertText', false, text)
        window.requestAnimationFrame(() => {
          emitContentChange()
        })
      }}
      aria-label={ariaLabel}
    />
  )
})

export default RichNoteEditor
