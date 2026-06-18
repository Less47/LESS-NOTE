import { Fragment, type PointerEvent as ReactPointerEvent } from 'react'

import type { TodoCard } from '../../../workspace/core'
import TodoRow from '../TodoRow'

type WorkspaceTodoCardBodyProps = {
  card: TodoCard
  isSelected: boolean
  isConnectorMode: boolean
  draggedItemId: string | null
  dropInsertionIndex: number | null
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

function WorkspaceTodoCardBody({
  card,
  isSelected,
  isConnectorMode,
  draggedItemId,
  dropInsertionIndex,
  autoResizeTextarea,
  registerInput,
  onFocusCard,
  onToggle,
  onTextChange,
  onInsertAfter,
  onRemove,
  onDragHandlePointerDown,
}: WorkspaceTodoCardBodyProps) {
  return (
    <div className="card-todo-body">
      <div
        className={`todo-list ${dropInsertionIndex !== null ? 'is-item-drop-target' : ''}`}
        data-todo-list-card-id={card.id}
        data-todo-item-count={card.items.length}
      >
        {card.items.map((item, itemIndex) => (
          <Fragment key={item.id}>
            {dropInsertionIndex === itemIndex ? (
              <div className="todo-drop-indicator" aria-hidden="true" />
            ) : null}
            <TodoRow
              cardId={card.id}
              item={item}
              itemIndex={itemIndex}
              itemCount={card.items.length}
              previousItemId={card.items[itemIndex - 1]?.id ?? null}
              nextItemId={card.items[itemIndex + 1]?.id ?? null}
              isCardSelected={isSelected}
              isInteractionDisabled={isConnectorMode}
              isDragOrigin={draggedItemId === item.id}
              autoResizeTextarea={autoResizeTextarea}
              registerInput={registerInput}
              onFocusCard={onFocusCard}
              onToggle={onToggle}
              onTextChange={onTextChange}
              onInsertAfter={onInsertAfter}
              onRemove={onRemove}
              onDragHandlePointerDown={onDragHandlePointerDown}
            />
          </Fragment>
        ))}
        {dropInsertionIndex === card.items.length ? (
          <div className="todo-drop-indicator" aria-hidden="true" />
        ) : null}
      </div>
    </div>
  )
}

export default WorkspaceTodoCardBody
