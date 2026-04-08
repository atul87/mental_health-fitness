import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Edit3, Save, Calendar, Target, Heart, Camera, LogOut, Brain, BookOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'
import './Profile.css'

const buildHighlights = ({ moodCount, journalCount, exerciseCount }) => ([
  {
    title: 'Mood Check-Ins',
    description: `${moodCount} total mood entries recorded`,
    icon: Target,
    color: '#10b981'
  },
  {
    title: 'Exercise Practice',
    description: `${exerciseCount} guided wellness sessions completed`,
    icon: Heart,
    color: '#f093fb'
  },
  {
    title: 'Journal Writing',
    description: `${journalCount} reflections saved privately`,
    icon: BookOpen,
    color: '#667eea'
  }
])

export default function Profile() {
  const { user, logout, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState({ moodCount: 0, journalCount: 0, exerciseCount: 0 })
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio || '',
    goals: user.goals?.length ? user.goals.join(', ') : ''
  })

  useEffect(() => {
    setProfileData({
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      goals: user.goals?.length ? user.goals.join(', ') : ''
    })
  }, [user])

  useEffect(() => {
    const fetchProfileSummary = async () => {
      try {
        const [moodResult, journalResult, exerciseResult] = await Promise.all([
          apiRequest('/api/mood/history'),
          apiRequest('/api/journal'),
          apiRequest('/api/exercises/history')
        ])

        setSummary({
          moodCount: moodResult.data.success ? moodResult.data.moods.length : 0,
          journalCount: journalResult.data.success ? journalResult.data.entries.length : 0,
          exerciseCount: exerciseResult.data.success ? exerciseResult.data.history.length : 0
        })
      } catch (fetchError) {
        console.error('Failed to load profile summary', fetchError)
      }
    }

    fetchProfileSummary()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      const goals = profileData.goals
        .split(',')
        .map((goal) => goal.trim())
        .filter(Boolean)

      const { response, data } = await apiRequest('/api/auth/me', {
        method: 'PUT',
        body: {
          name: profileData.name,
          email: profileData.email,
          bio: profileData.bio,
          goals
        }
      })

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to update profile')
        return
      }

      updateUser(data.user)
      setIsEditing(false)
    } catch (saveError) {
      setError('Unable to update your profile right now.')
      console.error('Failed to update profile', saveError)
    } finally {
      setLoading(false)
    }
  }

  const highlights = buildHighlights(summary)

  return (
    <div className="profile">
      <div className="container">
        <motion.div
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Your Profile</h1>
          <p>Manage your account details and keep your wellness goals up to date</p>
        </motion.div>

        <div className="profile-content">
          <motion.div
            className="profile-main card-3d"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="profile-avatar-section">
              <div className="avatar-container">
                <img src={user.avatar} alt={user.name} className="profile-avatar" />
                <button className="avatar-edit-btn" type="button" disabled title="Avatar updates are not supported yet">
                  <Camera size={16} />
                </button>
              </div>
              <div className="profile-basic-info">
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(event) => setProfileData((previous) => ({ ...previous, name: event.target.value }))}
                    className="edit-name-input"
                  />
                ) : (
                  <h2>{user.name}</h2>
                )}
                <p className="join-date">
                  <Calendar size={16} />
                  Joined {new Date(user.joinDate).toLocaleDateString()}
                </p>
              </div>
              <div className="profile-actions">
                <button
                  className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  disabled={loading}
                >
                  {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                  {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {error && (
              <div className="detail-section">
                <p style={{ color: '#fca5a5' }}>{error}</p>
              </div>
            )}

            <div className="profile-details">
              <div className="detail-section">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(event) => setProfileData((previous) => ({ ...previous, email: event.target.value }))}
                    className="edit-input"
                  />
                ) : (
                  <p>{user.email}</p>
                )}
              </div>

              <div className="detail-section">
                <label>Bio</label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(event) => setProfileData((previous) => ({ ...previous, bio: event.target.value }))}
                    className="edit-textarea"
                    rows={3}
                  />
                ) : (
                  <p>{user.bio}</p>
                )}
              </div>

              <div className="detail-section">
                <label>Wellness Goals</label>
                {isEditing ? (
                  <textarea
                    value={profileData.goals}
                    onChange={(event) => setProfileData((previous) => ({ ...previous, goals: event.target.value }))}
                    className="edit-textarea"
                    rows={3}
                    placeholder="Separate goals with commas"
                  />
                ) : (
                  <div className="goals-list">
                    {(user.goals || []).map((goal) => (
                      <div key={goal} className="goal-item">
                        <Target size={16} />
                        <span>{goal}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="detail-section">
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      logout()
                    }
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="profile-stats card-3d"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3>Progress Highlights</h3>
            <div className="achievements-grid">
              {highlights.map((highlight) => (
                <motion.div
                  key={highlight.title}
                  className="achievement-card"
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                >
                  <div className="achievement-icon" style={{ backgroundColor: highlight.color }}>
                    <highlight.icon size={24} />
                  </div>
                  <h4>{highlight.title}</h4>
                  <p>{highlight.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="goals-list" style={{ marginTop: '1.5rem' }}>
              <div className="goal-item">
                <Brain size={16} />
                <span>{user.isAnonymous ? 'Anonymous session active' : 'Verified personal account'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
