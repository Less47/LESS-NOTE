function createDefaultViewport() {
  return {
    x: 290,
    y: 170,
    zoom: 0.82,
  };
}

function getLocalCalendarDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalCalendarMonthKey(date = new Date()) {
  return getLocalCalendarDateKey(date).slice(0, 7);
}

function createEmptyCalendarState(date = new Date()) {
  return {
    visibleMonth: getLocalCalendarMonthKey(date),
    selectedDate: null,
    entries: {},
  };
}

export function createInitialWorkspace() {
  const boardTabId = crypto.randomUUID();
  const now = new Date().toISOString();

  return {
    boards: [
      {
        id: boardTabId,
        viewport: createDefaultViewport(),
        board: {
          title: "Board 1",
          updatedAt: now,
          cards: [],
          strokes: [],
          connectors: [],
        },
      },
    ],
    activeBoardId: boardTabId,
    activeTabId: boardTabId,
    calendar: createEmptyCalendarState(),
  };
}
