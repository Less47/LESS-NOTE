import type {
  ChangeEvent,
  MutableRefObject,
} from 'react'

import type {
  BoardCard,
  BoardConnector,
  BoardState,
  NotePaletteId,
  WorkspaceMutationOptions,
} from './core'
import {
  GRID_SIZE,
  getBoardCardLayouts,
  getDrawStrokeColor,
  getNextZIndex,
  isColumnCard,
  isColumnChildCard,
  isPaletteCard,
  normalizeColumnCards,
} from './core'

type CreateWorkspaceCardActionsControllerArgs = {
  activeCardIdRef: MutableRefObject<string | null>
  selectedCardIdsRef: MutableRefObject<string[]>
  selectedStrokeIdRef: MutableRefObject<string | null>
  selectedConnectorIdRef: MutableRefObject<string | null>
  isSnapToGridRef: MutableRefObject<boolean>
  drawColorInputRef: MutableRefObject<HTMLInputElement | null>
  selectedCard: BoardCard | null
  drawColorPickerMode: 'draw' | 'selected-stroke'
  setSelection: (cardIds: string[], activeId?: string | null) => void
  setSelectedStrokeId: (strokeId: string | null) => void
  setSelectedConnectorId: (connectorId: string | null) => void
  setDrawColorHex: (hex: string) => void
  setDrawColorPickerMode: (mode: 'draw' | 'selected-stroke') => void
  setStatusText: (text: string) => void
  updateBoard: (
    recipe: (currentBoard: BoardState) => BoardState,
    options?: WorkspaceMutationOptions,
  ) => void
  updateCard: (
    cardId: string,
    recipe: (card: BoardCard) => BoardCard,
    options?: WorkspaceMutationOptions,
  ) => void
  getCurrentBoardState: () => BoardState
  getCurrentBoardLayouts: (
    currentBoard?: BoardState,
  ) => ReturnType<typeof getBoardCardLayouts>
  getPlacementPosition: (x: number, y: number) => { x: number; y: number }
}

function createWorkspaceCardActionsController(args: CreateWorkspaceCardActionsControllerArgs) {
  const removeCards = (cardIds: string[]) => {
    const cardIdSet = new Set(cardIds)
    if (!cardIdSet.size) {
      return
    }

    args.updateBoard(
      (currentBoard) => {
        const currentLayouts = args.getCurrentBoardLayouts(currentBoard)
        const removedColumnIds = new Set(
          currentBoard.cards
            .filter((card) => cardIdSet.has(card.id) && isColumnCard(card))
            .map((card) => card.id),
        )

        const nextCards = currentBoard.cards.flatMap<BoardCard>((card) => {
          if (cardIdSet.has(card.id)) {
            return []
          }

          if (
            isColumnChildCard(card) &&
            card.columnId &&
            removedColumnIds.has(card.columnId)
          ) {
            const layout = currentLayouts.layouts.get(card.id)

            return [
              {
                ...card,
                x: layout?.x ?? card.x,
                y: layout?.y ?? card.y,
                width: layout?.width ?? card.width,
                height: layout?.height ?? card.height,
                columnId: null,
                columnIndex: 0,
              },
            ]
          }

          return [card]
        })

        return {
          ...currentBoard,
          cards: normalizeColumnCards(nextCards),
          connectors: currentBoard.connectors.filter(
            (connector) =>
              !cardIdSet.has(connector.fromCardId) && !cardIdSet.has(connector.toCardId),
          ),
        }
      },
      {
        recordUndo: true,
      },
    )
    const remainingSelection = args.selectedCardIdsRef.current.filter(
      (cardId) => !cardIdSet.has(cardId),
    )
    args.setSelection(
      remainingSelection,
      args.activeCardIdRef.current && !cardIdSet.has(args.activeCardIdRef.current)
        ? args.activeCardIdRef.current
        : remainingSelection.at(-1) ?? null,
    )
    args.setStatusText(
      cardIdSet.size === 1 ? 'Card removed.' : `${cardIdSet.size} cards removed.`,
    )
  }

  const removeStrokes = (strokeIds: string[]) => {
    const strokeIdSet = new Set(strokeIds)
    if (!strokeIdSet.size) {
      return
    }

    args.updateBoard(
      (currentBoard) => ({
        ...currentBoard,
        strokes: currentBoard.strokes.filter((stroke) => !strokeIdSet.has(stroke.id)),
      }),
      {
        recordUndo: true,
      },
    )

    if (
      args.selectedStrokeIdRef.current &&
      strokeIdSet.has(args.selectedStrokeIdRef.current)
    ) {
      args.setSelectedStrokeId(null)
    }

    args.setStatusText(
      strokeIdSet.size === 1 ? 'Stroke removed.' : `${strokeIdSet.size} strokes removed.`,
    )
  }

  const removeConnectors = (connectorIds: string[]) => {
    const connectorIdSet = new Set(connectorIds)
    if (!connectorIdSet.size) {
      return
    }

    args.updateBoard(
      (currentBoard) => ({
        ...currentBoard,
        connectors: currentBoard.connectors.filter(
          (connector) => !connectorIdSet.has(connector.id),
        ),
      }),
      {
        recordUndo: true,
      },
    )

    if (
      args.selectedConnectorIdRef.current &&
      connectorIdSet.has(args.selectedConnectorIdRef.current)
    ) {
      args.setSelectedConnectorId(null)
    }

    args.setStatusText(
      connectorIdSet.size === 1
        ? 'Connector removed.'
        : `${connectorIdSet.size} connectors removed.`,
    )
  }

  const applySelectedStrokeColor = (colorHex: string) => {
    const strokeId = args.selectedStrokeIdRef.current
    if (!strokeId) {
      return
    }

    const nextColor = getDrawStrokeColor(colorHex)
    args.setDrawColorHex(colorHex)

    args.updateBoard(
      (currentBoard) => ({
        ...currentBoard,
        strokes: currentBoard.strokes.map((stroke) =>
          stroke.id === strokeId && stroke.tool === 'marker'
            ? { ...stroke, color: nextColor }
            : stroke,
        ),
      }),
      {
        recordUndo: true,
        historyGroupKey: `stroke-color:${strokeId}`,
      },
    )

    args.setStatusText('Stroke color updated.')
  }

  const openCustomDrawColorPicker = (
    mode: 'draw' | 'selected-stroke',
    initialColor?: string,
  ) => {
    const colorInput = args.drawColorInputRef.current

    if (initialColor) {
      args.setDrawColorHex(initialColor)
      if (colorInput) {
        colorInput.value = initialColor
      }
    }

    args.setDrawColorPickerMode(mode)
    colorInput?.click()
  }

  const handleDrawColorInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextColorHex = event.target.value

    if (
      args.drawColorPickerMode === 'selected-stroke' &&
      args.selectedStrokeIdRef.current
    ) {
      applySelectedStrokeColor(nextColorHex)
    } else {
      args.setDrawColorHex(nextColorHex)
      args.setStatusText('Draw color updated.')
    }

    args.setDrawColorPickerMode('draw')
  }

  const duplicateSelectedCards = () => {
    const selectedIds = args.selectedCardIdsRef.current
    if (!selectedIds.length) {
      return
    }

    const selectedIdSet = new Set(selectedIds)
    const currentBoard = args.getCurrentBoardState()
    const currentLayouts = args.getCurrentBoardLayouts(currentBoard)
    const selectedColumnIds = new Set(
      currentBoard.cards
        .filter((card) => selectedIdSet.has(card.id) && isColumnCard(card))
        .map((card) => card.id),
    )
    const sourceCards = currentBoard.cards
      .filter((card) => {
        if (selectedIdSet.has(card.id)) {
          return true
        }

        return isColumnChildCard(card) && !!card.columnId && selectedColumnIds.has(card.columnId)
      })
      .sort((left, right) => left.zIndex - right.zIndex)

    if (!sourceCards.length) {
      return
    }

    const baseZIndex = getNextZIndex(currentBoard.cards)
    const duplicateOffset = args.isSnapToGridRef.current ? GRID_SIZE : 42
    const columnIdMap = new Map<string, string>()
    const duplicatedCardIdMap = new Map<string, string>()
    let nextZIndex = baseZIndex
    const selectedDuplicateIds: string[] = []

    const duplicates = sourceCards.map((card) => {
      const layout = currentLayouts.layouts.get(card.id)
      const position = args.getPlacementPosition(
        (layout?.x ?? card.x) + duplicateOffset,
        (layout?.y ?? card.y) + duplicateOffset,
      )

      if (isColumnCard(card)) {
        const nextId = crypto.randomUUID()
        columnIdMap.set(card.id, nextId)
        duplicatedCardIdMap.set(card.id, nextId)
        if (selectedIdSet.has(card.id)) {
          selectedDuplicateIds.push(nextId)
        }

        return {
          ...card,
          id: nextId,
          x: position.x,
          y: position.y,
          zIndex: nextZIndex++,
        }
      }

      const nextId = crypto.randomUUID()
      duplicatedCardIdMap.set(card.id, nextId)
      if (selectedIdSet.has(card.id)) {
        selectedDuplicateIds.push(nextId)
      }

      return {
        ...card,
        id: nextId,
        x: position.x,
        y: position.y,
        width: layout?.width ?? card.width,
        height: layout?.height ?? card.height,
        columnId: card.columnId ? columnIdMap.get(card.columnId) ?? card.columnId : null,
        zIndex: nextZIndex++,
      }
    })

    args.updateBoard(
      (nextBoard) => {
        const duplicatedConnectors = currentBoard.connectors.flatMap<BoardConnector>(
          (connector) => {
            const nextFromCardId = duplicatedCardIdMap.get(connector.fromCardId)
            const nextToCardId = duplicatedCardIdMap.get(connector.toCardId)

            if (!nextFromCardId || !nextToCardId) {
              return []
            }

            return [
              {
                id: crypto.randomUUID(),
                fromCardId: nextFromCardId,
                toCardId: nextToCardId,
              },
            ]
          },
        )

        return {
          ...nextBoard,
          cards: normalizeColumnCards([...nextBoard.cards, ...duplicates]),
          connectors: [...nextBoard.connectors, ...duplicatedConnectors],
        }
      },
      {
        recordUndo: true,
      },
    )

    args.setSelection(
      selectedDuplicateIds,
      selectedDuplicateIds.at(-1) ?? null,
    )
    args.setStatusText(
      selectedDuplicateIds.length === 1
        ? 'Card duplicated.'
        : `${selectedDuplicateIds.length} cards duplicated.`,
    )
  }

  const applySelectedPalette = (paletteId: NotePaletteId) => {
    const cardId = args.activeCardIdRef.current
    if (!cardId) {
      return
    }

    args.updateCard(
      cardId,
      (card) => {
        if (!isPaletteCard(card)) {
          return card
        }

        return {
          ...card,
          palette: paletteId,
        }
      },
      {
        recordUndo: true,
      },
    )

    args.setStatusText('Card color updated.')
  }

  const applySelectedCardAccentColor = (cardId: string, accentColor: string | null) => {
    args.updateCard(
      cardId,
      (card) =>
        isPaletteCard(card)
          ? {
              ...card,
              accentColor,
            }
          : card,
      {
        recordUndo: true,
        historyGroupKey: `card-accent:${cardId}`,
      },
    )

    args.setStatusText('Card accent updated.')
  }

  const toggleSelectedImageFit = () => {
    const cardId = args.activeCardIdRef.current
    if (!cardId) {
      return
    }

    args.updateCard(
      cardId,
      (card) =>
        card.kind === 'image'
          ? {
              ...card,
              fit: card.fit === 'cover' ? 'contain' : 'cover',
            }
          : card,
      {
        recordUndo: true,
      },
    )

    args.setStatusText('Image fit mode updated.')
  }

  const openLinkUrl = (url: string) => {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      args.setStatusText('Add a URL before opening the link.')
      return
    }

    const normalizedUrl = /^[a-z][a-z\d+.-]*:/i.test(trimmedUrl)
      ? trimmedUrl
      : `https://${trimmedUrl}`

    try {
      const resolvedUrl = new URL(normalizedUrl)
      window.open(resolvedUrl.toString(), '_blank', 'noopener,noreferrer')
      args.setStatusText('Opened the link.')
    } catch {
      args.setStatusText('That link URL is not valid yet.')
    }
  }

  const openSelectedLink = () => {
    if (!args.selectedCard || args.selectedCard.kind !== 'link') {
      return
    }

    openLinkUrl(args.selectedCard.url)
  }

  return {
    applySelectedCardAccentColor,
    applySelectedPalette,
    applySelectedStrokeColor,
    duplicateSelectedCards,
    handleDrawColorInputChange,
    openCustomDrawColorPicker,
    openLinkUrl,
    openSelectedLink,
    removeCards,
    removeConnectors,
    removeStrokes,
    toggleSelectedImageFit,
  }
}

export { createWorkspaceCardActionsController }
