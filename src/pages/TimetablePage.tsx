import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, List, CalendarDays } from 'lucide-react'
import { format, parseISO, isAfter, isBefore, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays, differenceInHours } from 'date-fns'
import { fetchTimetables, type ExamTimetable, type TimetableEntry } from '../lib/supabase'
import { usePlatformStore } from '../store/usePlatformStore'

type View = 'list' | 'calendar'

interface EnrichedEntry extends TimetableEntry {
  timetableTitle: string
  boardId: string | null
}

function Countdown({ examDate }: { examDate: string }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])
  const target = parseISO(examDate)
  const days = differenceInDays(target, now)
  const hours = differenceInHours(target, now) % 24
  if (days < 0) return <span style={{ color: 'var(--text-4)', fontSize: '0.75rem' }}>Completed</span>
  if (days === 0) return <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.8rem' }}>TODAY</span>
  if (days <= 7) return <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.8rem' }}>{days}d {hours}h</span>
  return <span style={{ color: '#60A5FA', fontWeight: 700, fontSize: '0.8rem' }}>{days} days</span>
}

function EntryCard({ entry }: { entry: EnrichedEntry }) {
  const now = new Date()
  const examDate = parseISO(entry.exam_date)
  const isPast = isBefore(examDate, now)
  const isSoon = !isPast && differenceInDays(examDate, now) <= 7

  return (
    <div style={{
      background: 'var(--bg-3)',
      border: `1px solid ${isPast ? 'var(--border)' : isSoon ? 'rgba(245,158,11,0.3)' : 'rgba(30,64,175,0.2)'}`,
      borderLeft: `3px solid ${isPast ? 'var(--border)' : isSoon ? '#F59E0B' : '#1E40AF'}`,
      borderRadius: 'var(--r-md)',
      padding: '12px 14px',
      opacity: isPast ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.9rem' }}>{entry.subject_name}</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-3)' }}>{entry.timetableTitle}</p>
        </div>
        {!isPast && <Countdown examDate={entry.exam_date} />}
        {isPast && <span style={{ fontSize: '0.72rem', color: 'var(--text-4)', background: 'var(--bg-4)', padding: '2px 8px', borderRadius: 6 }}>Done</span>}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-2)' }}>
          <Calendar size={12} color="var(--text-3)" />
          {format(examDate, 'EEE, MMM d, yyyy')}
        </span>
        {entry.exam_time && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-2)' }}>
            <Clock size={12} color="var(--text-3)" /> {entry.exam_time}
          </span>
        )}
        {entry.duration_minutes && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{entry.duration_minutes} min</span>
        )}
      </div>
    </div>
  )
}

function CalendarView({ entries, selectedBoard }: { entries: EnrichedEntry[]; selectedBoard: string | null }) {
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const days = eachDayOfInterval({ start, end })
  const startPad = start.getDay()

  const entriesByDate = entries.reduce<Record<string, EnrichedEntry[]>>((acc, e) => {
    const key = e.exam_date.split('T')[0]
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  const selectedEntries = selectedDate ? (entriesByDate[format(selectedDate, 'yyyy-MM-dd')] ?? []) : []

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => setMonth(m => subMonths(m, 1))} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: 'var(--text-2)' }}>
          <ChevronLeft size={16} />
        </button>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{format(month, 'MMMM yyyy')}</h3>
        <button onClick={() => setMonth(m => addMonths(m, 1))} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: 'var(--text-2)' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 20 }}>
        {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEntries = entriesByDate[key] ?? []
          const isToday = isSameDay(day, new Date())
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const hasExams = dayEntries.length > 0

          return (
            <button key={key} onClick={() => setSelectedDate(d => d && isSameDay(d, day) ? null : day)}
              style={{ aspectRatio: '1', borderRadius: 8, border: `1px solid ${isSelected ? '#1E40AF' : 'transparent'}`, background: isToday ? 'rgba(30,64,175,0.15)' : isSelected ? 'rgba(30,64,175,0.1)' : 'transparent', color: isToday ? '#60A5FA' : 'var(--text-2)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '4px 2px', position: 'relative', transition: 'all 0.15s' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: isToday ? 800 : 500 }}>{format(day, 'd')}</span>
              {hasExams && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {dayEntries.slice(0, 3).map((_, i) => (
                    <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#F59E0B' }} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected date entries */}
      {selectedDate && (
        <div>
          <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-2)' }}>
            {format(selectedDate, 'EEEE, MMMM d')}
          </h4>
          {selectedEntries.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>No exams on this day.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedEntries.map(e => <EntryCard key={e.id} entry={e} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TimetablePage() {
  const { selectedBoard } = usePlatformStore()
  const [timetables, setTimetables] = useState<(ExamTimetable & { entries: TimetableEntry[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('list')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchTimetables(selectedBoard?.id).then(data => {
      setTimetables(data)
      if (data.length > 0) setExpandedId(data[0].id)
    }).finally(() => setLoading(false))
  }, [selectedBoard?.id])

  const allEntries: EnrichedEntry[] = timetables.flatMap(t =>
    (t.entries ?? []).map(e => ({ ...e, timetableTitle: t.title, boardId: t.board_id ?? null }))
  ).sort((a, b) => parseISO(a.exam_date).getTime() - parseISO(b.exam_date).getTime())

  const upcoming = allEntries.filter(e => isAfter(parseISO(e.exam_date), new Date()))
  const past = allEntries.filter(e => !isAfter(parseISO(e.exam_date), new Date()))

  return (
    <div className="page animate-fade-in" style={{ paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700 }}>Exam Timetable</h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-3)' }}>
            {upcoming.length > 0 ? `${upcoming.length} upcoming exam${upcoming.length > 1 ? 's' : ''}` : 'No upcoming exams'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
          {[{ key: 'list', Icon: List }, { key: 'calendar', Icon: CalendarDays }].map(({ key, Icon }) => (
            <button key={key} onClick={() => setView(key as View)}
              style={{ padding: '6px 10px', borderRadius: 7, border: 'none', background: view === key ? 'rgba(30,64,175,0.2)' : 'transparent', color: view === key ? '#60A5FA' : 'var(--text-3)', cursor: 'pointer', transition: 'all 0.15s' }}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ height: 80, background: 'var(--bg-3)', borderRadius: 'var(--r-md)', animation: 'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      ) : allEntries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
          <Calendar size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>No timetables available</p>
          <p style={{ fontSize: '0.85rem' }}>Check back soon for exam schedules.</p>
        </div>
      ) : view === 'calendar' ? (
        <CalendarView entries={allEntries} selectedBoard={selectedBoard?.id ?? null} />
      ) : (
        <div>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcoming.map(e => <EntryCard key={e.id} entry={e} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Past Exams</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {past.slice(0, 5).map(e => <EntryCard key={e.id} entry={e} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
