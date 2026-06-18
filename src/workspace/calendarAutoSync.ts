import type {
  BoardCard,
  BoardTabState,
  CalendarAutoMention,
  CalendarEntry,
  CalendarState,
} from './core'
import {
  DEFAULT_CARD_PALETTE,
  getDomainLabel,
  getTableColumnLabel,
  isCalendarEntryMeaningful,
} from './core'

type DateTextMatch = {
  dateKey: string
  index: number
  matchedText: string
}

type TextSource = {
  id: string
  label: string
  text: string
}

const MONTH_INDEX_BY_NAME: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
}

const MONTH_NAME_PATTERN =
  'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?'
const YEAR_FIRST_DATE_PATTERN = /\b((?:19|20)\d{2})[./-](\d{1,2})[./-](\d{1,2})\b/g
const NUMERIC_DATE_PATTERN = /\b(\d{1,2})([./-])(\d{1,2})\2(\d{2,4})\b/g
const MONTH_NAME_FIRST_PATTERN = new RegExp(
  `\\b(${MONTH_NAME_PATTERN})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,)?(?:\\s+(\\d{2,4}))?\\b`,
  'gi',
)
const DAY_FIRST_MONTH_NAME_PATTERN = new RegExp(
  `\\b(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+of)?\\s+(${MONTH_NAME_PATTERN})(?:,)?(?:\\s+(\\d{2,4}))?\\b`,
  'gi',
)

function normalizeWhitespace(value: string) {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractPlainTextFromRichHtml(html: string) {
  if (!html.trim()) {
    return ''
  }

  if (typeof document === 'undefined') {
    return normalizeWhitespace(html.replace(/<[^>]+>/g, ' '))
  }

  const container = document.createElement('div')
  container.innerHTML = html
  return normalizeWhitespace(container.textContent ?? '')
}

function normalizeYear(rawYear: string | undefined, fallbackYear: number) {
  if (!rawYear) {
    return fallbackYear
  }

  const parsedYear = Number.parseInt(rawYear, 10)
  if (!Number.isFinite(parsedYear)) {
    return fallbackYear
  }

  if (rawYear.length === 2) {
    return parsedYear >= 70 ? 1900 + parsedYear : 2000 + parsedYear
  }

  return parsedYear
}

function getValidDateKey(year: number, month: number, day: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  const candidate = new Date(year, month - 1, day)
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null
  }

  const monthKey = `${month}`.padStart(2, '0')
  const dayKey = `${day}`.padStart(2, '0')
  return `${year}-${monthKey}-${dayKey}`
}

function pushDateMatch(
  matchesByKey: Map<string, DateTextMatch>,
  dateKey: string | null,
  index: number,
  matchedText: string,
) {
  if (!dateKey) {
    return
  }

  const normalizedMatchedText = normalizeWhitespace(matchedText)
  const identityKey = `${dateKey}:${index}:${normalizedMatchedText.length}`
  if (matchesByKey.has(identityKey)) {
    return
  }

  matchesByKey.set(identityKey, {
    dateKey,
    index,
    matchedText: normalizedMatchedText,
  })
}

function findDateMentions(text: string, fallbackYear = new Date().getFullYear()) {
  const matchesByKey = new Map<string, DateTextMatch>()

  for (const match of text.matchAll(YEAR_FIRST_DATE_PATTERN)) {
    pushDateMatch(
      matchesByKey,
      getValidDateKey(
        Number.parseInt(match[1], 10),
        Number.parseInt(match[2], 10),
        Number.parseInt(match[3], 10),
      ),
      match.index ?? 0,
      match[0],
    )
  }

  for (const match of text.matchAll(MONTH_NAME_FIRST_PATTERN)) {
    const month = MONTH_INDEX_BY_NAME[match[1].toLowerCase()] ?? null
    pushDateMatch(
      matchesByKey,
      month
        ? getValidDateKey(
            normalizeYear(match[3], fallbackYear),
            month,
            Number.parseInt(match[2], 10),
          )
        : null,
      match.index ?? 0,
      match[0],
    )
  }

  for (const match of text.matchAll(DAY_FIRST_MONTH_NAME_PATTERN)) {
    const month = MONTH_INDEX_BY_NAME[match[2].toLowerCase()] ?? null
    pushDateMatch(
      matchesByKey,
      month
        ? getValidDateKey(
            normalizeYear(match[3], fallbackYear),
            month,
            Number.parseInt(match[1], 10),
          )
        : null,
      match.index ?? 0,
      match[0],
    )
  }

  for (const match of text.matchAll(NUMERIC_DATE_PATTERN)) {
    const first = Number.parseInt(match[1], 10)
    const separator = match[2]
    const second = Number.parseInt(match[3], 10)
    const year = normalizeYear(match[4], fallbackYear)

    let month: number | null = null
    let day: number | null = null

    if (separator === '.') {
      day = first
      month = second
    } else if (first > 12 && second <= 12) {
      day = first
      month = second
    } else if (second > 12 && first <= 12) {
      month = first
      day = second
    } else if (first <= 12 && second <= 12) {
      month = first
      day = second
    }

    pushDateMatch(
      matchesByKey,
      month !== null && day !== null ? getValidDateKey(year, month, day) : null,
      match.index ?? 0,
      match[0],
    )
  }

  return [...matchesByKey.values()].sort((left, right) => left.index - right.index)
}

function buildExcerpt(text: string, index: number, matchedText: string) {
  const radius = 44
  const start = Math.max(0, index - radius)
  const end = Math.min(text.length, index + matchedText.length + radius)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < text.length ? '...' : ''
  return `${prefix}${normalizeWhitespace(text.slice(start, end))}${suffix}`.slice(0, 140)
}

function getBoardLabel(boardTab: BoardTabState, boardIndex: number) {
  const trimmedTitle = boardTab.board.title.trim()
  return trimmedTitle || `Board ${boardIndex + 1}`
}

function getCardTextSources(card: BoardCard) {
  switch (card.kind) {
    case 'note':
      return [
        {
          id: 'body',
          label: 'Note',
          text: extractPlainTextFromRichHtml(card.content),
        },
      ] satisfies TextSource[]
    case 'heading':
      return [
        {
          id: 'body',
          label: 'Heading',
          text: extractPlainTextFromRichHtml(card.content),
        },
      ] satisfies TextSource[]
    case 'todo':
      return card.items
        .filter((item) => item.text.trim())
        .map((item, index) => ({
          id: `item:${item.id}`,
          label: `To-do item ${index + 1}`,
          text: item.text,
        }))
    case 'link':
      return card.url.trim()
        ? [
            {
              id: 'url',
              label: `Link URL${card.url.trim() ? ` (${getDomainLabel(card.url)})` : ''}`,
              text: card.url,
            },
          ]
        : []
    case 'image':
      return card.caption.trim()
        ? [
            {
              id: 'caption',
              label: 'Image caption',
              text: card.caption,
            },
          ]
        : []
    case 'document':
      if (card.previewKind === 'docx' && card.previewContent?.trim()) {
        return [
          {
            id: 'preview',
            label: 'Document text',
            text: extractPlainTextFromRichHtml(card.previewContent),
          },
        ] satisfies TextSource[]
      }

      if (card.previewKind === 'text' && card.previewContent?.trim()) {
        return [
          {
            id: 'preview',
            label: 'Document text',
            text: card.previewContent,
          },
        ] satisfies TextSource[]
      }

      return card.fileName.trim()
        ? [
            {
              id: 'file',
              label: 'Document name',
              text: card.fileName,
            },
          ]
        : []
    case 'table': {
      const sources: TextSource[] = []

      if (card.title.trim()) {
        sources.push({
          id: 'title',
          label: 'Table title',
          text: card.title,
        })
      }

      card.cells.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
          if (!cell.trim()) {
            return
          }

          sources.push({
            id: `cell:${rowIndex}:${columnIndex}`,
            label: `Table cell ${getTableColumnLabel(columnIndex)}${rowIndex + 1}`,
            text: cell,
          })
        })
      })

      return sources
    }
    case 'column':
      return card.title.trim()
        ? [
            {
              id: 'title',
              label: 'Column title',
              text: card.title,
            },
          ]
        : []
  }
}

function areAutoMentionsEqual(
  left: CalendarAutoMention[] | undefined,
  right: CalendarAutoMention[] | undefined,
) {
  const leftMentions = left ?? []
  const rightMentions = right ?? []

  if (leftMentions.length !== rightMentions.length) {
    return false
  }

  return leftMentions.every((leftMention, index) => {
    const rightMention = rightMentions[index]
    return (
      leftMention.id === rightMention.id &&
      leftMention.boardId === rightMention.boardId &&
      leftMention.boardLabel === rightMention.boardLabel &&
      leftMention.cardId === rightMention.cardId &&
      leftMention.cardKind === rightMention.cardKind &&
      leftMention.sourceLabel === rightMention.sourceLabel &&
      leftMention.excerpt === rightMention.excerpt
    )
  })
}

function buildCalendarAutoMentions(boards: readonly BoardTabState[]) {
  const mentionsByDate: Record<string, CalendarAutoMention[]> = {}

  boards.forEach((boardTab, boardIndex) => {
    const boardLabel = getBoardLabel(boardTab, boardIndex)

    boardTab.board.cards.forEach((card) => {
      const sources = getCardTextSources(card)

      sources.forEach((source) => {
        const normalizedText = normalizeWhitespace(source.text)
        if (!normalizedText) {
          return
        }

        const seenDateKeys = new Set<string>()
        for (const match of findDateMentions(normalizedText)) {
          if (seenDateKeys.has(match.dateKey)) {
            continue
          }

          seenDateKeys.add(match.dateKey)
          const nextMention: CalendarAutoMention = {
            id: `${boardTab.id}:${card.id}:${source.id}:${match.dateKey}`,
            boardId: boardTab.id,
            boardLabel,
            cardId: card.id,
            cardKind: card.kind,
            sourceLabel: source.label,
            excerpt: buildExcerpt(normalizedText, match.index, match.matchedText),
          }

          mentionsByDate[match.dateKey] = [...(mentionsByDate[match.dateKey] ?? []), nextMention]
        }
      })
    })
  })

  for (const dateKey of Object.keys(mentionsByDate)) {
    mentionsByDate[dateKey].sort((left, right) => {
      if (left.boardLabel !== right.boardLabel) {
        return left.boardLabel.localeCompare(right.boardLabel)
      }

      if (left.sourceLabel !== right.sourceLabel) {
        return left.sourceLabel.localeCompare(right.sourceLabel)
      }

      return left.excerpt.localeCompare(right.excerpt)
    })
  }

  return mentionsByDate
}

function getCalendarEntryPreview(entry: CalendarEntry | undefined) {
  if (!entry) {
    return ''
  }

  const headline = entry.headline.trim()
  if (headline) {
    return headline
  }

  const plans = entry.plans.trim()
  if (plans) {
    return plans
  }

  const notes = entry.notes.trim()
  if (notes) {
    return notes
  }

  return entry.autoMentions?.[0]?.excerpt ?? ''
}

function syncCalendarAutoMentions(currentCalendar: CalendarState, boards: readonly BoardTabState[]) {
  const mentionsByDate = buildCalendarAutoMentions(boards)
  const nextEntries: CalendarState['entries'] = {}
  const dateKeys = [...new Set([...Object.keys(currentCalendar.entries), ...Object.keys(mentionsByDate)])]
    .sort()
  let didChange = false

  for (const dateKey of dateKeys) {
    const currentEntry = currentCalendar.entries[dateKey]
    const nextAutoMentions = mentionsByDate[dateKey] ?? []

    if (!currentEntry) {
      if (!nextAutoMentions.length) {
        continue
      }

      nextEntries[dateKey] = {
        headline: '',
        plans: '',
        notes: '',
        palette: DEFAULT_CARD_PALETTE,
        updatedAt: new Date().toISOString(),
        autoMentions: nextAutoMentions,
      }
      didChange = true
      continue
    }

    const currentAutoMentions = currentEntry.autoMentions ?? []
    const autoMentionsChanged = !areAutoMentionsEqual(currentAutoMentions, nextAutoMentions)
    let nextEntry: CalendarEntry = currentEntry

    if (autoMentionsChanged) {
      if (nextAutoMentions.length) {
        nextEntry = {
          ...currentEntry,
          autoMentions: nextAutoMentions,
        }
      } else {
        const entryWithoutAutoMentions = { ...currentEntry }
        delete entryWithoutAutoMentions.autoMentions
        nextEntry = entryWithoutAutoMentions
      }
    }

    if (
      !isCalendarEntryMeaningful({
        headline: nextEntry.headline,
        plans: nextEntry.plans,
        notes: nextEntry.notes,
        palette: nextEntry.palette,
        autoMentions: nextEntry.autoMentions,
      })
    ) {
      didChange = true
      continue
    }

    nextEntries[dateKey] = nextEntry
    if (nextEntry !== currentEntry) {
      didChange = true
    }
  }

  if (!didChange) {
    return currentCalendar
  }

  return {
    ...currentCalendar,
    entries: nextEntries,
  }
}

export { getCalendarEntryPreview, syncCalendarAutoMentions }
