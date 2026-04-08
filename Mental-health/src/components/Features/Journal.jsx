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
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { apiRequest } from '../../lib/api'
import './Journal.css'

const emptyEntry = { title: '', content: '', mood: 5, tags: [] }

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [isWriting, setIsWriting] = useState(false)
  const [currentEntry, setCurrentEntry] = useState(emptyEntry)
  const [editingEntryId, setEditingEntryId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState(null)

  const moods = [
    { value: 1, emoji: '😭', label: 'Very Sad' },
    { value: 2, emoji: '😢', label: 'Sad' },
    { value: 3, emoji: '😕', label: 'Down' },
    { value: 4, emoji: '😐', label: 'Neutral' },
    { value: 5, emoji: '🙂', label: 'Okay' },
    { value: 6, emoji: '😊', label: 'Good' },
    { value: 7, emoji: '😄', label: 'Happy' },
    { value: 8, emoji: '😆', label: 'Very Happy' },
    { value: 9, emoji: '🤩', label: 'Ecstatic' },
    { value: 10, emoji: '🥰', label: 'Blissful' }
  ]

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

  const openNewEntry = () => {
    setCurrentEntry(emptyEntry)
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
          <h1>Personal Journal</h1>
          <p>Write your thoughts, reflect on your day, and track your emotional journey</p>

          <motion.button
            className="btn btn-primary new-entry-btn"
            onClick={openNewEntry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            New Entry
          </motion.button>
        </motion.div>

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
              {moods.slice(0, 5).map((mood) => (
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
                    className="close-btn"
                    onClick={closeEditor}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-content">
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
                      {moods.map((mood) => (
                        <button
                          key={mood.value}
                          className={`mood-option ${currentEntry.mood === mood.value ? 'selected' : ''}`}
                          onClick={() => setCurrentEntry((previous) => ({ ...previous, mood: mood.value }))}
                        >
                          <span className="mood-emoji">{mood.emoji}</span>
                          <span className="mood-label">{mood.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder="What's on your mind? Write about your day, thoughts, feelings, or anything you'd like to remember..."
                    value={currentEntry.content}
                    onChange={(event) => setCurrentEntry((previous) => ({ ...previous, content: event.target.value }))}
                    className="content-textarea"
                    rows={8}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={closeEditor}
                  >
                    Cancel
                  </button>
                  <button
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
                      {moods.find((mood) => mood.value === entry.mood)?.emoji}
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
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteEntry(entry._id)}
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
              <h3>No entries found</h3>
              <p>
                {searchTerm || selectedMood
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start your journaling journey by writing your first entry'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
