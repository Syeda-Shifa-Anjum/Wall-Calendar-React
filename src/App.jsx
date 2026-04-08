import { useEffect, useMemo, useRef, useState } from 'react'
import Holidays from 'date-holidays'
import './App.css'

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const MONTH_IMAGES = [
  'https://picsum.photos/seed/wallcal-jan/1200/900',
  'https://picsum.photos/seed/wallcal-feb/1200/900',
  'https://picsum.photos/seed/wallcal-mar/1200/900',
  'https://picsum.photos/seed/wallcal-apr/1200/900',
  'https://picsum.photos/seed/wallcal-may/1200/900',
  'https://picsum.photos/seed/wallcal-jun/1200/900',
  'https://picsum.photos/seed/wallcal-jul/1200/900',
  'https://picsum.photos/seed/wallcal-aug/1200/900',
  'https://picsum.photos/seed/wallcal-sep/1200/900',
  'https://picsum.photos/seed/wallcal-oct/1200/900',
  'https://picsum.photos/seed/wallcal-nov/1200/900',
  'https://picsum.photos/seed/wallcal-dec/1200/900',
]

const YEAR_OPTIONS = Array.from({ length: 131 }, (_, index) => 1970 + index)

const TURN_DURATION_MS = 1280
const TURN_SWAP_MS = 640

const toDateOnly = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const toISODate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const isSameDay = (a, b) => a?.getTime() === b?.getTime()

const toHolidayISODate = (holiday) => {
  const raw = holiday.date || holiday.start
  if (!raw) return null

  if (typeof raw === 'string') {
    return raw.slice(0, 10)
  }

  return toISODate(new Date(raw))
}

const getIndiaHolidaysByDate = (year) => {
  const india = new Holidays('IN')
  const allHolidayEntries = india.getHolidays(year)

  return allHolidayEntries.reduce((acc, holiday) => {
    const dateKey = toHolidayISODate(holiday)
    if (!dateKey) return acc

    const reasonText = `${holiday.name}${holiday.type ? ` (${holiday.type})` : ''}`
    const existing = acc[dateKey]

    if (!existing) {
      acc[dateKey] = {
        title: holiday.name,
        reasons: [reasonText],
      }
      return acc
    }

    if (!existing.reasons.includes(reasonText)) {
      existing.reasons.push(reasonText)
      existing.title = existing.reasons.length > 1 ? 'Multiple Holidays' : existing.title
    }

    return acc
  }, {})
}

const buildCalendarGrid = (monthDate) => {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const mondayStartOffset = (firstOfMonth.getDay() + 6) % 7
  const gridStart = new Date(year, month, 1 - mondayStartOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    return {
      day,
      isCurrentMonth: day.getMonth() === month,
      isWeekend: day.getDay() === 0 || day.getDay() === 6,
    }
  })
}

function App() {
  const [activeMonth, setActiveMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [monthNotes, setMonthNotes] = useState({})
  const [rangeNotes, setRangeNotes] = useState({})
  const [dayNotes, setDayNotes] = useState({})
  const [isTurning, setIsTurning] = useState(false)
  const [turnDirection, setTurnDirection] = useState('next')

  const monthSwapTimerRef = useRef(null)
  const turnEndTimerRef = useRef(null)

  const today = useMemo(() => toDateOnly(new Date()), [])

  const monthLabel = useMemo(
    () =>
      activeMonth.toLocaleDateString('en-US', {
        month: 'long',
      }),
    [activeMonth],
  )
  const yearLabel = activeMonth.getFullYear()
  const monthKey = getMonthKey(activeMonth)
  const calendarDays = useMemo(() => buildCalendarGrid(activeMonth), [activeMonth])
  const holidayCalendarByYear = useMemo(() => {
    const years = [yearLabel - 1, yearLabel, yearLabel + 1]
    return years.reduce((acc, year) => {
      acc[year] = getIndiaHolidaysByDate(year)
      return acc
    }, {})
  }, [yearLabel])
  const monthImage = MONTH_IMAGES[activeMonth.getMonth()]
  const monthNote = monthNotes[monthKey] ?? ''
  const selectedDayKey = selectedDay ? toISODate(selectedDay) : ''
  const selectedDayNote = selectedDayKey ? dayNotes[selectedDayKey] ?? '' : ''
  const selectedHoliday = selectedDay
    ? holidayCalendarByYear[selectedDay.getFullYear()]?.[selectedDayKey] ?? null
    : null
  const rangeKey = rangeStart && rangeEnd ? `${toISODate(rangeStart)}__${toISODate(rangeEnd)}` : ''
  const rangeNote = rangeKey ? rangeNotes[rangeKey] ?? '' : ''

  useEffect(() => {
    return () => {
      window.clearTimeout(monthSwapTimerRef.current)
      window.clearTimeout(turnEndTimerRef.current)
    }
  }, [])

  const shiftMonth = (offset) => {
    if (isTurning) return

    const nextMonth = new Date(
      activeMonth.getFullYear(),
      activeMonth.getMonth() + offset,
      1,
    )

    setTurnDirection(offset > 0 ? 'next' : 'prev')
    setIsTurning(true)

    window.clearTimeout(monthSwapTimerRef.current)
    window.clearTimeout(turnEndTimerRef.current)

    monthSwapTimerRef.current = window.setTimeout(() => {
      setActiveMonth(nextMonth)
    }, TURN_SWAP_MS)

    turnEndTimerRef.current = window.setTimeout(() => {
      setIsTurning(false)
    }, TURN_DURATION_MS)
  }

  const handleYearChange = (event) => {
    const nextYear = Number(event.target.value)
    if (Number.isNaN(nextYear)) return

    setActiveMonth(new Date(nextYear, activeMonth.getMonth(), 1))
  }

  const handleDaySelect = (rawDate, isCurrentMonth) => {
    const date = toDateOnly(rawDate)
    setSelectedDay(date)

    if (!isCurrentMonth) {
      setActiveMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    }

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date)
      setRangeEnd(null)
      return
    }

    if (date.getTime() < rangeStart.getTime()) {
      setRangeEnd(rangeStart)
      setRangeStart(date)
      return
    }

    setRangeEnd(date)
  }

  const isInRange = (date) => {
    if (!rangeStart || !rangeEnd) return false
    const time = date.getTime()
    return time > rangeStart.getTime() && time < rangeEnd.getTime()
  }

  const clearRange = () => {
    setRangeStart(null)
    setRangeEnd(null)
  }

  const updateMonthNote = (value) => {
    setMonthNotes((prev) => ({
      ...prev,
      [monthKey]: value,
    }))
  }

  const updateRangeNote = (value) => {
    if (!rangeKey) return
    setRangeNotes((prev) => ({
      ...prev,
      [rangeKey]: value,
    }))
  }

  const updateDayNote = (value) => {
    if (!selectedDayKey) return
    setDayNotes((prev) => ({
      ...prev,
      [selectedDayKey]: value,
    }))
  }

  return (
    <main className="wall-scene">
      <section className="calendar-hanging" aria-label="Wall hanging calendar">
        <div className="hanger-wrap" aria-hidden="true">
          <span className="hook" />
          <span className="rope" />
        </div>

        <article
          className={[
            'calendar-card',
            isTurning && 'turning',
            isTurning && `turn-${turnDirection}`,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="spiral" aria-hidden="true">
            {Array.from({ length: 26 }, (_, index) => (
              <span key={index} className="ring" />
            ))}
          </div>
          <span className="page-curl" aria-hidden="true" />

          <section className="photo-sheet" aria-label="Monthly picture">
            <img src={monthImage} alt={`${monthLabel} feature`} />
            <div className="photo-corner" aria-hidden="true" />
            <div className="month-badge">
              <label className="year-switch" htmlFor="year-select">
                <span>Year</span>
                <select id="year-select" value={yearLabel} onChange={handleYearChange}>
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
              <h1>{monthLabel}</h1>
            </div>
          </section>

          <section className="date-sheet">
            <section className="notes-area" aria-label="Notes area">
              <h2>Notes</h2>

              <label htmlFor="month-note">Monthly Memo</label>
              <textarea
                id="month-note"
                value={monthNote}
                onChange={(event) => updateMonthNote(event.target.value)}
                placeholder={`Plan for ${monthLabel}`}
              />

              <label htmlFor="range-note">
                Range Note {rangeKey ? `(${toISODate(rangeStart)} to ${toISODate(rangeEnd)})` : ''}
              </label>
              <textarea
                id="range-note"
                value={rangeNote}
                onChange={(event) => updateRangeNote(event.target.value)}
                placeholder="Select a start and end date to attach a note"
                disabled={!rangeKey}
              />

              <label htmlFor="day-note">
                Day Note {selectedDay ? `(${selectedDayKey})` : ''}
              </label>
              <textarea
                id="day-note"
                value={selectedDayNote}
                onChange={(event) => updateDayNote(event.target.value)}
                placeholder="Tap any date and add a specific reminder"
                disabled={!selectedDay}
              />

              {selectedHoliday && (
                <article className="holiday-info" aria-live="polite">
                  <p className="holiday-info-label">Holiday Reason</p>
                  <h3>{selectedHoliday.title}</h3>
                  <p>{selectedHoliday.reasons.join('; ')}</p>
                </article>
              )}
            </section>

            <div className="month-grid-wrap" aria-label="Monthly dates">
              <div className="month-nav">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Previous month"
                  disabled={isTurning}
                >
                  {'<'}
                </button>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                  disabled={isTurning}
                >
                  {'>'}
                </button>
              </div>

              <div className="weekday-row" aria-hidden="true">
                {WEEKDAYS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="month-grid" role="grid" aria-label="Month grid">
                {calendarDays.map(({ day, isCurrentMonth, isWeekend }) => {
                  const dayKey = toISODate(day)
                  const holiday = holidayCalendarByYear[day.getFullYear()]?.[dayKey] ?? null
                  const start = isSameDay(day, rangeStart)
                  const end = isSameDay(day, rangeEnd)
                  const selected = isSameDay(day, selectedDay)
                  const currentDay = isSameDay(day, today)

                  return (
                    <button
                      type="button"
                    key={day.toISOString()}
                    className={[
                      'day-number',
                      !isCurrentMonth && 'outside',
                      isWeekend && isCurrentMonth && 'weekend',
                      holiday && 'holiday',
                      start && 'range-start',
                      end && 'range-end',
                      isInRange(day) && 'in-range',
                      selected && 'selected-day',
                      currentDay && 'today',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleDaySelect(day, isCurrentMonth)}
                    aria-pressed={start || end || isInRange(day)}
                    aria-label={holiday ? `${day.getDate()} ${monthLabel}, ${holiday.reasons.join('; ')}` : undefined}
                  >
                    {day.getDate()}
                  </button>
                  )
                })}
              </div>

              <div className="range-toolbar">
                <p>
                  Start: {rangeStart ? toISODate(rangeStart) : 'Not selected'}
                  <br />
                  End: {rangeEnd ? toISODate(rangeEnd) : 'Not selected'}
                </p>
                <button type="button" onClick={clearRange}>Clear</button>
              </div>
            </div>
          </section>
        </article>
      </section>
    </main>
  )
}

export default App
