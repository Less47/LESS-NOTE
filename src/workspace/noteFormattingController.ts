import type { NoteBlockStyle, NoteTextToolbarState, WorkspaceMutationOptions } from './core'
import {
  applyDisabledNoteInlineCommandPresentation,
  getSelectionAnchorElement,
  getNoteBlockCommandValue,
  getNoteInlineCommandTag,
  insertNoteSelectionMarkers,
  isNoteInlineCommand,
  isSelectionInsideEditor,
  moveNoteSelectionMarkerOutsideMatchingInlineAncestors,
  restoreSelectionFromNoteMarkers,
  stripNoteInlineCommandFormatting,
  stripNoteTextColorFormatting,
  wrapFragmentTextNodesWithColor,
  wrapFragmentTextNodesWithTag,
} from './core'

type NoteCommandOptions = {
  historyGroupKey?: string
  statusText?: string
}

type NoteFormattingControllerDependencies = {
  noteTextToolbarState: NoteTextToolbarState
  savedSelectionRef: { current: Range | null }
  resolveTargetCardId: () => string | null
  restoreNoteEditorSelection: (cardId: string) => HTMLDivElement | null
  updateNoteContent: (
    cardId: string,
    nextContent: string,
    options?: WorkspaceMutationOptions,
  ) => void
  syncNoteTextToolbarState: (cardId?: string | null) => void
  setStatusText: (text: string) => void
}

function createNoteFormattingController({
  noteTextToolbarState,
  savedSelectionRef,
  resolveTargetCardId,
  restoreNoteEditorSelection,
  updateNoteContent,
  syncNoteTextToolbarState,
  setStatusText,
}: NoteFormattingControllerDependencies) {
  const getSelectionColorTarget = (editor: HTMLDivElement, selection: Selection) => {
    const anchorElement = getSelectionAnchorElement(editor, selection)
    if (!anchorElement) {
      return editor
    }

    const blockElement = anchorElement.closest('li, p, h1, h2, h3, blockquote, pre')
    if (blockElement instanceof HTMLElement && editor.contains(blockElement)) {
      return blockElement
    }

    return editor
  }

  const applySelectedNoteCommand = (
    command: string,
    value?: string,
    options?: NoteCommandOptions,
  ) => {
    const cardId = resolveTargetCardId()

    if (!cardId) {
      return
    }

    const editor = restoreNoteEditorSelection(cardId)
    if (!editor) {
      return
    }

    const selectionBeforeCommand =
      typeof window !== 'undefined' && typeof window.getSelection === 'function'
        ? window.getSelection()
        : null
    const hasExpandedSelection =
      !!selectionBeforeCommand &&
      isSelectionInsideEditor(selectionBeforeCommand, editor) &&
      selectionBeforeCommand.rangeCount > 0 &&
      !selectionBeforeCommand.getRangeAt(0).collapsed

    if (isNoteInlineCommand(command) && selectionBeforeCommand && hasExpandedSelection) {
      const isCommandActive =
        command === 'bold'
          ? noteTextToolbarState.isBold
          : command === 'italic'
          ? noteTextToolbarState.isItalic
          : command === 'underline'
          ? noteTextToolbarState.isUnderline
          : noteTextToolbarState.isStrikeThrough
      const shouldEnable = !isCommandActive
      const range = selectionBeforeCommand.getRangeAt(0).cloneRange()
      const { startMarker, endMarker } = insertNoteSelectionMarkers(range)

      moveNoteSelectionMarkerOutsideMatchingInlineAncestors(startMarker, editor, command, 'start')
      moveNoteSelectionMarkerOutsideMatchingInlineAncestors(endMarker, editor, command, 'end')

      const contentRange = document.createRange()
      contentRange.setStartAfter(startMarker)
      contentRange.setEndBefore(endMarker)
      const fragment = contentRange.extractContents()

      stripNoteInlineCommandFormatting(fragment, command)

      if (shouldEnable) {
        wrapFragmentTextNodesWithTag(fragment, getNoteInlineCommandTag(command))
      } else {
        applyDisabledNoteInlineCommandPresentation(fragment, command, {
          underline: noteTextToolbarState.isUnderline,
          strike: noteTextToolbarState.isStrikeThrough,
        })
      }

      const insertionRange = document.createRange()
      insertionRange.setStartAfter(startMarker)
      insertionRange.collapse(true)
      insertionRange.insertNode(fragment)

      const restoredRange = restoreSelectionFromNoteMarkers(
        selectionBeforeCommand,
        startMarker,
        endMarker,
        editor,
      )
      if (restoredRange) {
        savedSelectionRef.current = restoredRange
      }

      updateNoteContent(cardId, editor.innerHTML, {
        recordUndo: true,
        historyGroupKey: options?.historyGroupKey ?? `note-format:${cardId}`,
      })
      syncNoteTextToolbarState(cardId)
      setStatusText(options?.statusText ?? 'Text updated.')
      return
    }

    document.execCommand(command, false, value)
    editor.normalize()

    const selectionAfterCommand =
      typeof window !== 'undefined' && typeof window.getSelection === 'function'
        ? window.getSelection()
        : null

    if (
      selectionAfterCommand &&
      isSelectionInsideEditor(selectionAfterCommand, editor) &&
      selectionAfterCommand.rangeCount > 0
    ) {
      savedSelectionRef.current = selectionAfterCommand.getRangeAt(0).cloneRange()
    }

    updateNoteContent(cardId, editor.innerHTML, {
      recordUndo: true,
      historyGroupKey: options?.historyGroupKey ?? `note-format:${cardId}`,
    })
    syncNoteTextToolbarState(cardId)
    setStatusText(options?.statusText ?? 'Text updated.')
  }

  const applySelectedNoteBlockStyle = (
    nextStyle: NoteBlockStyle,
    options?: NoteCommandOptions,
  ) => {
    const cardId = resolveTargetCardId()

    if (!cardId) {
      return
    }

    const editor = restoreNoteEditorSelection(cardId)
    if (!editor) {
      return
    }

    const targetStyle =
      noteTextToolbarState.blockStyle === nextStyle && nextStyle !== 'body' ? 'body' : nextStyle
    document.execCommand('formatBlock', false, getNoteBlockCommandValue(targetStyle))
    editor.normalize()

    const selectionAfterCommand =
      typeof window !== 'undefined' && typeof window.getSelection === 'function'
        ? window.getSelection()
        : null
    if (
      selectionAfterCommand &&
      isSelectionInsideEditor(selectionAfterCommand, editor) &&
      selectionAfterCommand.rangeCount > 0
    ) {
      savedSelectionRef.current = selectionAfterCommand.getRangeAt(0).cloneRange()
    }

    updateNoteContent(cardId, editor.innerHTML, {
      recordUndo: true,
      historyGroupKey: options?.historyGroupKey ?? 'note-format-block',
    })
    syncNoteTextToolbarState(cardId)
    setStatusText(options?.statusText ?? 'Text style updated.')
  }

  const applySelectedNoteTextColor = (nextColor: string | null, options?: NoteCommandOptions) => {
    const cardId = resolveTargetCardId()

    if (!cardId) {
      return
    }

    const editor = restoreNoteEditorSelection(cardId)
    if (!editor) {
      return
    }

    const selectionBeforeCommand =
      typeof window !== 'undefined' && typeof window.getSelection === 'function'
        ? window.getSelection()
        : null
    const hasExpandedSelection =
      !!selectionBeforeCommand &&
      isSelectionInsideEditor(selectionBeforeCommand, editor) &&
      selectionBeforeCommand.rangeCount > 0 &&
      !selectionBeforeCommand.getRangeAt(0).collapsed

    if (selectionBeforeCommand && hasExpandedSelection) {
      const range = selectionBeforeCommand.getRangeAt(0).cloneRange()
      const { startMarker, endMarker } = insertNoteSelectionMarkers(range)

      const contentRange = document.createRange()
      contentRange.setStartAfter(startMarker)
      contentRange.setEndBefore(endMarker)
      const fragment = contentRange.extractContents()

      stripNoteTextColorFormatting(fragment)

      if (nextColor) {
        wrapFragmentTextNodesWithColor(fragment, nextColor)
      }

      const insertionRange = document.createRange()
      insertionRange.setStartAfter(startMarker)
      insertionRange.collapse(true)
      insertionRange.insertNode(fragment)

      const restoredRange = restoreSelectionFromNoteMarkers(
        selectionBeforeCommand,
        startMarker,
        endMarker,
        editor,
      )
      if (restoredRange) {
        savedSelectionRef.current = restoredRange
      }

      updateNoteContent(cardId, editor.innerHTML, {
        recordUndo: true,
        historyGroupKey: options?.historyGroupKey ?? `note-format-color:${cardId}`,
      })
      syncNoteTextToolbarState(cardId)
      setStatusText(options?.statusText ?? 'Text color updated.')
      return
    }

    const targetColor = nextColor ?? noteTextToolbarState.defaultTextColor
    if (!targetColor) {
      return
    }

    if (selectionBeforeCommand && isSelectionInsideEditor(selectionBeforeCommand, editor)) {
      const colorTarget = getSelectionColorTarget(editor, selectionBeforeCommand)
      stripNoteTextColorFormatting(colorTarget)
      colorTarget.style.color = nextColor ?? ''
    } else {
      try {
        document.execCommand('styleWithCSS', false, 'true')
      } catch {
        // Some browsers do not support styleWithCSS.
      }

      document.execCommand('foreColor', false, targetColor)

      try {
        document.execCommand('styleWithCSS', false, 'false')
      } catch {
        // Some browsers do not support styleWithCSS.
      }
    }

    editor.normalize()

    const selectionAfterCommand =
      typeof window !== 'undefined' && typeof window.getSelection === 'function'
        ? window.getSelection()
        : null

    if (
      selectionAfterCommand &&
      isSelectionInsideEditor(selectionAfterCommand, editor) &&
      selectionAfterCommand.rangeCount > 0
    ) {
      savedSelectionRef.current = selectionAfterCommand.getRangeAt(0).cloneRange()
    }

    updateNoteContent(cardId, editor.innerHTML, {
      recordUndo: true,
      historyGroupKey: options?.historyGroupKey ?? `note-format-color:${cardId}`,
    })
    syncNoteTextToolbarState(cardId)
    setStatusText(options?.statusText ?? 'Text color updated.')
  }

  return {
    applySelectedNoteCommand,
    applySelectedNoteBlockStyle,
    applySelectedNoteTextColor,
  }
}

export { createNoteFormattingController }
