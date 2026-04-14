import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Calendar,
  BookOpen,
  Edit3,
  Trash2,
  Save,
  X,
  Heart,
  Sparkles
} from 'lucide-react'
import { format } from 'date-fns'
import { apiRequest } from '../../lib/api'
import { MOOD_OPTIONS } from '../../lib/moods'
import './Journal.css'

const emptyEntry = { title: '', content: '', mood: 5, tags: [] }

const journalPrompts = [
  { emoji: '✨', text: 'What made you smile today?' },
  { emoji: '🙏', text: "What's one thing you're grateful for?" },
  { emoji: '💭', text: 'How are you really feeling right now?' },
  { emoji: '🌱', text: 'What did you learn about yourself today?' },
  { emoji: '💪', text: "What challenge did you overcome?" },
  { emoji: '🌙', text: 'What would make tomorrow great?' }
]

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [isWriting, setIsWriting] = useState(false)
  const [currentEntry, setCurrentEntry] = useState(emptyEntry)
  const [editingEntryId, setEditingEntryId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { response, data } = await apiRequest('/api/journal')
        if (response.ok && data.success) {
          setEntries(data.entries)
        }
      } catch (error) {
        console.error('Failed to load journal entries', error)
      }
    }

    fetchEntries()
  }, [])

  const ReflectionDashboard = () => {
    const avgMood = entries.length > 0
      ? (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1)
      : 0

    return (
      <motion.div
        className="reflection-dashboard glass card-3d"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="dashboard-grid">
          <div className="dashboard-stat">
            <span className="stat-label">Average Mood</span>
            <div className="stat-value-row">
              <Heart className="stat-icon" fill="#ec4899" color="#ec4899" />
              <span className="stat-value">{avgMood}/10</span>
            </div>
            <p className="stat-desc">Your baseline emotional state</p>
          </div>

          <div className="dashboard-summary">
            <div className="summary-header">
              <Sparkles size={18} className="sparkle-icon" />
              <span>AI Perspective</span>
            </div>
            <p className="summary-text">
              {entries.length > 3
                ? "You've been consistent with your reflections. Your entries suggest a focus on personal growth and resilience."
                : "Start writing more to unlock deeper emotional pattern recognition and personalized AI insights."}
            </p>
          </div>

          <div className="dashboard-trends">
            <span className="stat-label">Weekly Activity</span>
            <div className="trend-dots">
              {[...Array(7)].map((_, i) => {
                const day = new Date()
                day.setDate(day.getDate() - (6 - i))
                const hasEntry = entries.some(e => new Date(e.createdAt).toDateString() === day.toDateString())
                return (
                  <div key={i} className={`trend-dot ${hasEntry ? 'active' : ''}`} title={day.toDateString()} />
                )
              })}
            </div>
            <p className="stat-desc">Your 7-day journaling streak</p>
          </div>
        </div>
      </motion.div>
    )
  }

  const openNewEntry = (promptText) => {
    setCurrentEntry({
      ...emptyEntry,
      title: promptText || ''
    })
    setEditingEntryId(null)
    setIsWriting(true)
  }

  const openEditEntry = (entry) => {
    setCurrentEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || []
    })
    setEditingEntryId(entry._id)
    setIsWriting(true)
  }

  const closeEditor = () => {
    setCurrentEntry(emptyEntry)
    setEditingEntryId(null)
    setIsWriting(false)
  }

  const handleSaveEntry = async () => {
    if (!currentEntry.title.trim() || !currentEntry.content.trim()) {
      return
    }

    try {
      const requestPath = editingEntryId ? `/api/journal/${editingEntryId}` : '/api/journal'
      const requestMethod = editingEntryId ? 'PUT' : 'POST'
      const { response, data } = await apiRequest(requestPath, {
        method: requestMethod,
        body: currentEntry
      })

      if (response.ok && data.success) {
        setEntries((previousEntries) => {
          if (editingEntryId) {
            return previousEntries.map((entry) => (
              entry._id === editingEntryId ? data.entry : entry
            ))
          }

          return [data.entry, ...previousEntries]
        })
        closeEditor()
      }
    } catch (error) {
      console.error('Failed to save entry', error)
    }
  }

  const handleDeleteEntry = async (id) => {
    try {
      const { response, data } = await apiRequest(`/api/journal/${id}`, {
        method: 'DELETE'
      })

      if (response.ok && data.success) {
        setEntries((previousEntries) => previousEntries.filter((entry) => entry._id !== id))
      }
    } catch (error) {
      console.error('Failed to delete entry', error)
    }
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMood = selectedMood === null || entry.mood === selectedMood
    return matchesSearch && matchesMood
  })

  return (
    <div className="journal">
      <div className="container">
        <motion.div
          className="journal-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1>Personal Journal</h1>
            <p>Write your thoughts, reflect on your day, and track your emotional journey</p>
          </div>

          <div className="header-actions">
            <button
              className={`btn btn-secondary dashboard-toggle ${showDashboard ? 'active' : ''}`}
              onClick={() => setShowDashboard(!showDashboard)}
            >
              {showDashboard ? 'Hide Insights' : 'Show Insights'}
            </button>
            <motion.button
              className="btn btn-primary new-entry-btn"
              onClick={() => openNewEntry('')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
              New Entry
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showDashboard && <ReflectionDashboard />}
        </AnimatePresence>

        <motion.div
          className="journal-controls card-3d"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="search-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="mood-filter">
            <span>Filter by mood:</span>
            <div className="mood-filter-buttons">
              <button
                className={`mood-filter-btn ${selectedMood === null ? 'active' : ''}`}
                onClick={() => setSelectedMood(null)}
              >
                All
              </button>
              {MOOD_OPTIONS.slice(0, 5).map((mood) => (
                <button
                  key={mood.value}
                  className={`mood-filter-btn ${selectedMood === mood.value ? 'active' : ''}`}
                  onClick={() => setSelectedMood(mood.value)}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isWriting && (
            <motion.div
              className="writing-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditor}
            >
              <motion.div
                className="writing-modal card-3d"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>{editingEntryId ? 'Edit Journal Entry' : 'New Journal Entry'}</h2>
                  <button
                    type="button"
                    className="close-btn"
                    onClick={closeEditor}
                    aria-label="Close journal editor"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-content">
                  <div className="writing-prompt-hint">
                    <Sparkles size={16} />
                    <span>What&apos;s on your mind today?</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Entry title..."
                    value={currentEntry.title}
                    onChange={(event) => setCurrentEntry((previous) => ({ ...previous, title: event.target.value }))}
                    className="title-input"
                  />

                  <div className="mood-selector">
                    <label>How are you feeling?</label>
                    <div className="mood-options">
                      {MOOD_OPTIONS.map((mood) => (
                        <button
                          type="button"
                          key={mood.value}
                          className={`mood-option ${currentEntry.mood === mood.value ? 'selected' : ''}`}
                          onClick={() => setCurrentEntry((previous) => ({ ...previous, mood: mood.value }))}
                          aria-pressed={currentEntry.mood === mood.value}
                        >
                          <span className="mood-emoji">{mood.emoji}</span>
                          <span className="mood-label">{mood.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder="Take a deep breath... then write whatever comes to mind 🌿"
                    value={currentEntry.content}
                    onChange={(event) => setCurrentEntry((previous) => ({ ...previous, content: event.target.value }))}
                    className="content-textarea"
                    rows={8}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeEditor}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveEntry}
                    disabled={!currentEntry.title.trim() || !currentEntry.content.trim()}
                  >
                    <Save size={16} />
                    {editingEntryId ? 'Update Entry' : 'Save Entry'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="journal-entries">
          <AnimatePresence>
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry._id}
                className="journal-entry card-3d"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, rotateX: 5 }}
              >
                <div className="entry-header">
                  <h3>{entry.title}</h3>
                  <div className="entry-meta">
                    <span className="entry-date">
                      <Calendar size={16} />
                      {format(new Date(entry.createdAt), 'MMM dd, yyyy')}
                    </span>
                    <span className="entry-mood">
                      {MOOD_OPTIONS.find((mood) => mood.value === entry.mood)?.emoji}
                    </span>
                  </div>
                </div>

                <div className="entry-content">
                  <p>{entry.content}</p>
                </div>

                <div className="entry-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => openEditEntry(entry)}
                    aria-label={`Edit ${entry.title}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteEntry(entry._id)}
                    aria-label={`Delete ${entry.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredEntries.length === 0 && (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <BookOpen size={48} />
              <h3>
                {searchTerm || selectedMood
                  ? 'No entries found'
                  : 'Start your journaling journey'}
              </h3>
              <p>
                {searchTerm || selectedMood
                  ? 'Try adjusting your search or filter criteria'
                  : 'Choose a prompt below to get started, or write freely'}
              </p>

              {/* Clickable Journal Prompts */}
              {!searchTerm && selectedMood === null && (
                <div className="journal-prompts">
                  {journalPrompts.map((prompt, index) => (
                    <motion.button
                      key={prompt.text}
                      className="prompt-card"
                      onClick={() => openNewEntry(prompt.text)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="prompt-emoji">{prompt.emoji}</span>
                      <span className="prompt-text">{prompt.text}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
