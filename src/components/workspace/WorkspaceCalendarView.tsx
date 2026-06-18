import type { CSSProperties } from 'react'

import type { CalendarState } from '../../workspace/core'
import { DEFAULT_CARD_PALETTE, getCardVisualTheme } from '../../workspace/core'
import { getCalendarEntryPreview } from '../../workspace/calendarAutoSync'

type CalendarEntryField = 'headline' | 'plans' | 'notes'

type WorkspaceCalendarViewProps = {
  calendar: CalendarState
  usesDarkItems: boolean
  onSelectDate: (dateKey: string) => void
  onCloseDetails: () => void
  onPreviousMonth: () => void
  onNextMonth: () => void
  onJumpToToday: () => void
  onUpdateEntry: (dateKey: string, field: CalendarEntryField, value: string) => void
}

type CalendarDay = {
  dateKey: string
  dayNumber: number
  isToday: boolean
  isSelected: boolean
  preview: string
  hasContent: boolean
  label: string
  style: CSSProperties
}

type CalendarCell =
  | {
      kind: 'day'
      day: CalendarDay
    }
  | {
      kind: 'empty'
      id: string
    }

function parseMonthKey(monthKey: string) {
  const [year, month] = monthKey.split('-').map((part) => Number.parseInt(part, 10))
  return new Date(year, month - 1, 1)
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map((part) => Number.parseInt(part, 10))
  return new Date(year, month - 1, day)
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildCalendarCells(calendar: CalendarState, usesDarkItems: boolean) {
  const visibleMonthDate = parseMonthKey(calendar.visibleMonth)
  const year = visibleMonthDate.getFullYear()
  const monthIndex = visibleMonthDate.getMonth()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const rowCount = Math.ceil(daysInMonth / 7)
  const totalCells = rowCount * 7
  const todayKey = toDateKey(new Date())
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const dayCells: CalendarCell[] = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(year, monthIndex, index + 1)
    const dateKey = toDateKey(date)
    const entry = calendar.entries[dateKey]
    const palette = getCardVisualTheme(entry?.palette ?? DEFAULT_CARD_PALETTE, usesDarkItems)
    const hasStoredColor = Boolean(entry)

    return {
      kind: 'day',
      day: {
        dateKey,
        dayNumber: index + 1,
        isToday: dateKey === todayKey,
        isSelected: dateKey === calendar.selectedDate,
        preview: getCalendarEntryPreview(entry),
        hasContent: Boolean(entry),
        label: dateFormatter.format(date),
        style: {
          '--calendar-day-bg': hasStoredColor ? palette.background : 'transparent',
          '--calendar-day-surface-border': hasStoredColor ? palette.border : 'transparent',
          '--calendar-day-accent': palette.accent,
          '--calendar-day-text': hasStoredColor ? palette.text : 'var(--app-text)',
          '--calendar-day-muted-text': hasStoredColor ? palette.muted : 'var(--app-muted-text)',
          '--calendar-day-hover-bg': hasStoredColor ? palette.buttonBg : 'rgba(255, 255, 255, 0.38)',
        } as CSSProperties,
      },
    }
  })

  const emptyCells: CalendarCell[] = Array.from(
    { length: Math.max(0, totalCells - dayCells.length) },
    (_, index) => ({
      kind: 'empty',
      id: `empty-${index + 1}`,
    }),
  )

  return {
    cells: [...dayCells, ...emptyCells],
    rowCount,
  }
}

function WorkspaceCalendarView({
  calendar,
  usesDarkItems,
  onSelectDate,
  onCloseDetails,
  onPreviousMonth,
  onNextMonth,
  onJumpToToday,
  onUpdateEntry,
}: WorkspaceCalendarViewProps) {
  const { cells, rowCount } = buildCalendarCells(calendar, usesDarkItems)
  const visibleMonthDate = parseMonthKey(calendar.visibleMonth)
  const visibleMonthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonthDate)
  const daysInMonth = cells.filter((cell) => cell.kind === 'day').length

  const selectedDateKey = calendar.selectedDate
  const selectedDate = selectedDateKey ? parseDateKey(selectedDateKey) : null
  const selectedEntry = selectedDateKey ? calendar.entries[selectedDateKey] ?? null : null
  const selectedDateLabel = selectedDate
    ? new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(selectedDate)
    : ''
  const updatedAtLabel =
    selectedEntry?.updatedAt &&
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(selectedEntry.updatedAt))
  const hasSavedNotes = Boolean(selectedEntry?.notes.trim())
  const detailMetaLabel = hasSavedNotes
    ? updatedAtLabel
      ? `Last updated ${updatedAtLabel}`
      : 'Notes saved'
    : 'No notes saved yet'

  return (
    <section className="calendar-page" aria-label="Calendar workspace">
      <div className="calendar-surface">
        <header className="calendar-toolbar">
          <div className="calendar-toolbar-copy">
            <span className="calendar-toolbar-kicker">Calendar</span>
            <h1 className="calendar-toolbar-title">{visibleMonthLabel}</h1>
            <p className="calendar-toolbar-text">
              {daysInMonth} day{daysInMonth === 1 ? '' : 's'} in a compact month view. Select a
              day to open notes on the right.
            </p>
          </div>

          <div className="calendar-toolbar-actions">
            <button
              type="button"
              className="calendar-toolbar-button"
              onClick={onPreviousMonth}
            >
              Prev
            </button>
            <button type="button" className="calendar-toolbar-button" onClick={onJumpToToday}>
              Today
            </button>
            <button type="button" className="calendar-toolbar-button" onClick={onNextMonth}>
              Next
            </button>
          </div>
        </header>

        <div className="calendar-grid" style={{ '--calendar-row-count': `${rowCount}` } as CSSProperties}>
          {cells.map((cell) => {
            if (cell.kind === 'empty') {
              return <div key={cell.id} className="calendar-day calendar-day--empty" aria-hidden="true" />
            }

            const day = cell.day

            return (
              <button
                key={day.dateKey}
                type="button"
                className={`calendar-day ${day.isToday ? 'is-today' : ''} ${
                  day.isSelected ? 'is-selected' : ''
                }`}
                aria-pressed={day.isSelected}
                title={day.label}
                style={day.style}
                onClick={() => onSelectDate(day.dateKey)}
              >
                <div className="calendar-day-top">
                  <span className="calendar-day-number">{day.dayNumber}</span>
                  {day.isToday ? <span className="calendar-day-chip">Today</span> : null}
                </div>
                <div className="calendar-day-body">
                  {day.preview ? (
                    <span className="calendar-day-preview">{day.preview}</span>
                  ) : (
                    <span className="calendar-day-preview is-empty" aria-hidden="true" />
                  )}
                  {day.hasContent ? <span className="calendar-day-dot" aria-hidden="true" /> : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <aside
        className={`calendar-details ${selectedDateKey ? 'is-open' : ''}`}
        aria-hidden={!selectedDateKey}
      >
        {selectedDateKey ? (
          <>
            <header className="calendar-details-header">
              <div className="calendar-details-heading">
                <span className="calendar-toolbar-kicker">Selected day</span>
                <h2 className="calendar-details-title">{selectedDateLabel}</h2>
                <p className="calendar-details-text">{detailMetaLabel}</p>
              </div>

              <button
                type="button"
                className="calendar-details-close"
                aria-label="Close day details"
                onClick={onCloseDetails}
              >
                x
              </button>
            </header>

            <label className="calendar-field calendar-field--grow">
              <span className="calendar-field-label">Notes</span>
              <textarea
                className="calendar-field-input calendar-field-textarea calendar-field-textarea--notes"
                rows={10}
                value={selectedEntry?.notes ?? ''}
                placeholder="Capture anything you want to keep with this date."
                onChange={(event) => onUpdateEntry(selectedDateKey, 'notes', event.target.value)}
              />
            </label>
          </>
        ) : null}
      </aside>
    </section>
  )
}

export default WorkspaceCalendarView
