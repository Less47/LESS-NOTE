import {
  memo,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

type TodoRowItem = {
  id: string
  text: string
  done: boolean
}

type TodoRowProps = {
  cardId: string
  item: TodoRowItem
  itemIndex: number
  itemCount: number
  previousItemId: string | null
  nextItemId: string | null
  isCardSelected: boolean
  isInteractionDisabled: boolean
  isDragOrigin: boolean
  autoResizeTextarea: (element: HTMLTextAreaElement) => void
  registerInput: (itemId: string) => (node: HTMLTextAreaElement | null) => void
  onFocusCard: (cardId: string) => void
  onToggle: (cardId: string, itemId: string) => void
  onTextChange: (cardId: string, itemId: string, text: string) => void
  onInsertAfter: (cardId: string, itemId: string) => void
  onRemove: (cardId: string, itemId: string, fallbackItemId: string | null) => void
  onDragHandlePointerDown: (
    event: ReactPointerEvent<HTMLButtonElement>,
    payload: {
      sourceCardId: string
      itemId: string
      text: string
      done: boolean
    },
  ) => void
}

const TodoRow = memo(
  function TodoRow({
    cardId,
    item,
    itemIndex,
    itemCount,
    previousItemId,
    nextItemId,
    isCardSelected,
    isInteractionDisabled,
    isDragOrigin,
    autoResizeTextarea,
    registerInput,
    onFocusCard,
    onToggle,
    onTextChange,
    onInsertAfter,
    onRemove,
    onDragHandlePointerDown,
  }: TodoRowProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const latestTextRef = useRef(item.text)
    const commitTimeoutRef = useRef<number | null>(null)
    const pointerDownWasSelectedRef = useRef(false)
    const [isEditing, setIsEditing] = useState(false)
    const registerNode = registerInput(item.id)

    const clearScheduledCommit = () => {
      if (commitTimeoutRef.current !== null) {
        window.clearTimeout(commitTimeoutRef.current)
        commitTimeoutRef.current = null
      }
    }

    const flushText = () => {
      clearScheduledCommit()
      if (latestTextRef.current !== item.text) {
        onTextChange(cardId, item.id, latestTextRef.current)
      }
    }

    useEffect(() => {
      latestTextRef.current = item.text
      const node = textareaRef.current
      if (node && document.activeElement !== node && node.value !== item.text) {
        node.value = item.text
        autoResizeTextarea(node)
      }
    }, [autoResizeTextarea, item.id, item.text])

    useEffect(() => {
      return () => {
        clearScheduledCommit()
      }
    }, [])

    useEffect(() => {
      if (isCardSelected && !isInteractionDisabled) {
        return
      }

      setIsEditing(false)
    }, [isCardSelected, isInteractionDisabled])

    useEffect(() => {
      if (!isEditing) {
        return
      }

      window.requestAnimationFrame(() => {
        const node = textareaRef.current
        if (!node) {
          return
        }

        node.focus()
        const cursorPosition = node.value.length
        node.setSelectionRange(cursorPosition, cursorPosition)
        autoResizeTextarea(node)
      })
    }, [autoResizeTextarea, isEditing])

    return (
      <div
        className={`todo-row ${isDragOrigin ? 'is-drag-origin' : ''}`}
        data-todo-card-id={cardId}
        data-todo-row-item-id={item.id}
        data-todo-item-index={itemIndex}
      >
        <button
          type="button"
          className="todo-drag-handle"
          disabled={isInteractionDisabled}
          onPointerDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
            flushText()
            onDragHandlePointerDown(event, {
              sourceCardId: cardId,
              itemId: item.id,
              text: latestTextRef.current,
              done: item.done,
            })
          }}
          aria-label={`Drag ${item.text.trim() || 'task'}`}
        >
          <span className="todo-drag-handle-line" />
          <span className="todo-drag-handle-line" />
          <span className="todo-drag-handle-line" />
        </button>
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={item.done}
          disabled={isInteractionDisabled}
          onChange={() => {
            flushText()
            onToggle(cardId, item.id)
          }}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label={item.done ? 'Mark item incomplete' : 'Mark item complete'}
        />
        <div
          className="todo-text-surface"
          onPointerDownCapture={() => {
            pointerDownWasSelectedRef.current = isCardSelected
          }}
          onClick={(event) => {
            if (isInteractionDisabled || isEditing || !pointerDownWasSelectedRef.current) {
              return
            }

            event.preventDefault()
            event.stopPropagation()
            setIsEditing(true)
          }}
        >
          <textarea
            ref={(node) => {
              textareaRef.current = node
              registerNode(node)
            }}
            className={`todo-item-input ${item.done ? 'is-done' : ''} ${
              isEditing ? 'is-editing' : 'is-preview-mode'
            }`}
            defaultValue={item.text}
            readOnly={isInteractionDisabled || !isEditing}
            tabIndex={isInteractionDisabled ? -1 : isEditing ? 0 : -1}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            onFocus={() => {
              onFocusCard(cardId)
              if (!isInteractionDisabled) {
                setIsEditing(true)
              }
            }}
            onChange={(event) => {
              const nextText = event.target.value
              autoResizeTextarea(event.currentTarget)
              latestTextRef.current = nextText
              clearScheduledCommit()
              commitTimeoutRef.current = window.setTimeout(() => {
                commitTimeoutRef.current = null
                if (latestTextRef.current !== item.text) {
                  onTextChange(cardId, item.id, latestTextRef.current)
                }
              }, 120)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                flushText()
                if (latestTextRef.current.trim().length > 0) {
                  onInsertAfter(cardId, item.id)
                }
                return
              }

              if (
                event.key === 'Backspace' &&
                !event.shiftKey &&
                latestTextRef.current.length === 0 &&
                itemCount > 1
              ) {
                event.preventDefault()
                clearScheduledCommit()
                onRemove(cardId, item.id, previousItemId ?? nextItemId)
              }
            }}
            onBlur={() => {
              flushText()
              setIsEditing(false)
            }}
            onPointerDown={(event) => {
              if (!isEditing) {
                return
              }

              event.stopPropagation()
            }}
            data-autoresize="true"
            rows={1}
            placeholder="Add a task..."
          />
        </div>
      </div>
    )
  },
  (previousProps, nextProps) =>
    previousProps.cardId === nextProps.cardId &&
    previousProps.item.id === nextProps.item.id &&
    previousProps.item.text === nextProps.item.text &&
    previousProps.item.done === nextProps.item.done &&
    previousProps.itemIndex === nextProps.itemIndex &&
    previousProps.itemCount === nextProps.itemCount &&
    previousProps.isCardSelected === nextProps.isCardSelected &&
    previousProps.isInteractionDisabled === nextProps.isInteractionDisabled &&
    previousProps.isDragOrigin === nextProps.isDragOrigin &&
    previousProps.previousItemId === nextProps.previousItemId &&
    previousProps.nextItemId === nextProps.nextItemId,
)

export default TodoRow
