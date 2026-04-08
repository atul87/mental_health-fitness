import { createElement, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Heart,
  MessageCircle,
  BookOpen,
  Activity,
  Calendar,
  Target,
  Brain,
  Smile,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { apiRequest } from '../../lib/api'
import './Dashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const mapMoodToScore = (mood) => {
  switch (mood) {
    case 'Very Positive':
      return 10
    case 'Positive':
      return 8
    case 'Neutral':
      return 6
    case 'Negative':
      return 4
    case 'Very Negative':
      return 2
    default:
      return 6
  }
}

const formatRelativeTime = (dateValue) => {
  const diffMs = Date.now() - new Date(dateValue).getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

const calculateMoodStreak = (moods) => {
  if (!moods.length) {
    return 0
  }

  const uniqueDays = [...new Set(
    moods.map((mood) => new Date(mood.createdAt).toISOString().slice(0, 10))
  )].sort((left, right) => new Date(right) - new Date(left))

  let streak = 0
  const current = new Date()

  for (let index = 0; index < uniqueDays.length; index += 1) {
    const expectedDate = new Date(current)
    expectedDate.setDate(current.getDate() - index)
    const expectedDay = expectedDate.toISOString().slice(0, 10)

    if (uniqueDays[index] === expectedDay) {
      streak += 1
    } else {
      break
    }
  }

  return streak
}

const getMoodTrend = (moodData) => {
  if (moodData.length < 2) return 'steady'
  const recent = moodData.slice(-3)
  const older = moodData.slice(-6, -3)
  if (older.length === 0) return 'steady'
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
  if (recentAvg > olderAvg + 0.5) return 'improving'
  if (recentAvg < olderAvg - 0.5) return 'declining'
  return 'steady'
}

const getInsightMessage = (trend, streak, average) => {
  if (trend === 'improving') {
    return { text: "You've been feeling better lately — keep it up! 🌿", icon: TrendingUp, color: '#10b981' }
  }
  if (trend === 'declining') {
    return { text: "Hang in there — every step counts 💙", icon: TrendingDown, color: '#6366f1' }
  }
  if (streak >= 3) {
    return { text: `Amazing ${streak}-day streak! You're building real momentum 🔥`, icon: Sparkles, color: '#f59e0b' }
  }
  if (parseFloat(average) >= 7) {
    return { text: "You're doing great today — keep shining 🌟", icon: Sparkles, color: '#f59e0b' }
  }
  return { text: "You're here, and that matters. Take it one step at a time 💙", icon: Heart, color: '#ec4899' }
}

const getTrendLabel = (trend) => {
  if (trend === 'improving') return { text: 'Improving trend 📈', color: '#10b981' }
  if (trend === 'declining') return { text: 'Take it easy 🤗', color: '#f59e0b' }
  return { text: 'Steady & stable 🌊', color: '#6366f1' }
}

// Skeleton Loader Components
const SkeletonStatCard = () => (
  <div className="stat-card card-3d skeleton-stat">
    <div className="skeleton skeleton-icon" />
    <div className="skeleton-stat-content">
      <div className="skeleton skeleton-text medium" />
      <div className="skeleton skeleton-text short" />
    </div>
  </div>
)

const SkeletonChartCard = () => (
  <div className="chart-card card-3d">
    <div className="skeleton skeleton-text medium" style={{ marginBottom: '1.5rem' }} />
    <div className="skeleton skeleton-chart" />
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [moodData, setMoodData] = useState([0])
  const [moodLabels, setMoodLabels] = useState(['No Data'])
  const [stats, setStats] = useState({
    currentStreak: 0,
    totalSessions: 0,
    moodAverage: '0.0',
    journalEntries: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [currentMoodLabel, setCurrentMoodLabel] = useState('No mood logged yet')
  const [moodTrend, setMoodTrend] = useState('steady')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        const [
          moodResult,
          journalResult,
          exerciseHistoryResult,
          chatHistoryResult
        ] = await Promise.all([
          apiRequest('/api/mood/history'),
          apiRequest('/api/journal'),
          apiRequest('/api/exercises/history'),
          apiRequest('/api/chatbot/history')
        ])

        const moods = moodResult.data.success ? moodResult.data.moods : []
        const journals = journalResult.data.success ? journalResult.data.entries : []
        const exerciseHistory = exerciseHistoryResult.data.success ? exerciseHistoryResult.data.history : []
        const chatMessages = chatHistoryResult.data.success ? chatHistoryResult.data.messages : []

        const moodsChronological = [...moods].sort(
          (left, right) => new Date(left.createdAt) - new Date(right.createdAt)
        )

        if (moodsChronological.length > 0) {
          const chartEntries = moodsChronological.slice(-7)
          const moodValues = moodsChronological.map((entry) => mapMoodToScore(entry.mood))
          const average = moodValues.reduce((total, value) => total + value, 0) / moodValues.length

          setMoodData(chartEntries.map((entry) => mapMoodToScore(entry.mood)))
          setMoodLabels(
            chartEntries.map((entry) =>
              new Date(entry.createdAt).toLocaleDateString([], { weekday: 'short' })
            )
          )
          setCurrentMoodLabel(moods[0]?.mood || 'No mood logged yet')
          setMoodTrend(getMoodTrend(moodValues))
          setStats({
            currentStreak: calculateMoodStreak(moods),
            totalSessions: exerciseHistory.length,
            moodAverage: average.toFixed(1),
            journalEntries: journals.length
          })
        } else {
          setMoodData([0])
          setMoodLabels(['No Data'])
          setCurrentMoodLabel('No mood logged yet')
          setMoodTrend('steady')
          setStats({
            currentStreak: 0,
            totalSessions: exerciseHistory.length,
            moodAverage: '0.0',
            journalEntries: journals.length
          })
        }

        const activityItems = [
          ...moods.map((entry) => ({
            id: `mood-${entry._id}`,
            title: 'Mood logged',
            description: entry.mood,
            createdAt: entry.createdAt,
            icon: Heart
          })),
          ...journals.map((entry) => ({
            id: `journal-${entry._id}`,
            title: 'Journal entry',
            description: entry.title,
            createdAt: entry.createdAt,
            icon: BookOpen
          })),
          ...exerciseHistory.map((entry) => ({
            id: `exercise-${entry._id}`,
            title: 'Exercise completed',
            description: entry.title,
            createdAt: entry.completedAt,
            icon: Activity
          })),
          ...chatMessages
            .filter((entry) => entry.sender === 'user')
            .map((entry) => ({
              id: `chat-${entry.id}`,
              title: 'Chat reflection',
              description: entry.text,
              createdAt: entry.createdAt,
              icon: MessageCircle
            }))
        ]
          .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
          .slice(0, 4)

        setRecentActivity(activityItems)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const chartData = {
    labels: moodLabels,
    datasets: [
      {
        label: 'Mood Level',
        data: moodData,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderWidth: 4,
        fill: true,
        tension: 0.5,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 3
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0,
        max: 10,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  }

  const quickActions = [
    {
      title: 'AI Chat Support',
      description: 'Talk to your AI companion',
      icon: MessageCircle,
      path: '/chat',
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.1)'
    },
    {
      title: 'Track Your Mood',
      description: 'Log how you feel and spot patterns',
      icon: Heart,
      path: '/mood',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)'
    },
    {
      title: 'Write in Journal',
      description: 'Capture a reflection or daily note',
      icon: BookOpen,
      path: '/journal',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Wellness Exercises',
      description: 'Practice mindfulness and breathing',
      icon: Activity,
      path: '/exercises',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    }
  ]

  const StatCard = ({ icon, title, value, color }) => (
    <motion.div
      className="stat-card card-3d"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, rotateY: 5 }}
    >
      <div className="stat-icon" style={{ backgroundColor: color }}>
        {createElement(icon, { size: 24 })}
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </motion.div>
  )

  const ActionCard = ({ title, description, icon, path, color, bgColor }) => (
    <motion.div
      className="action-card card-3d"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, rotateX: 5 }}
    >
      <Link to={path} className="action-link">
        <div className="action-icon" style={{ backgroundColor: bgColor, color }}>
          {createElement(icon, { size: 32 })}
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
      </Link>
    </motion.div>
  )

  const insight = getInsightMessage(moodTrend, stats.currentStreak, stats.moodAverage)
  const trendLabel = getTrendLabel(moodTrend)

  if (loading) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="dashboard-header skeleton-header">
            <div className="welcome-content">
              <div className="skeleton skeleton-text long" style={{ height: '2rem', marginBottom: '0.75rem' }} />
              <div className="skeleton skeleton-text medium" />
            </div>
          </div>
          <section className="stats-section">
            <div className="stats-grid">
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          </section>
          <section className="chart-section">
            <SkeletonChartCard />
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="container">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="welcome-content">
            <h1>Welcome back, {user.name}!</h1>
            <p>You&apos;re doing great today 💙</p>
          </div>
          <div className="user-mood">
            <Smile size={40} className="mood-icon" />
            <span>{currentMoodLabel}</span>
          </div>
        </motion.div>

        {/* Daily Insight Card */}
        <motion.div
          className="insight-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="insight-icon" style={{ color: insight.color }}>
            {createElement(insight.icon, { size: 28 })}
          </div>
          <div className="insight-content">
            <p className="insight-text">{insight.text}</p>
            <div className="mood-trend-badge" style={{ color: trendLabel.color, borderColor: trendLabel.color }}>
              {trendLabel.text}
            </div>
          </div>
        </motion.div>

        <section className="stats-section">
          <div className="stats-grid">
            <StatCard
              icon={Target}
              title="Current Streak"
              value={`${stats.currentStreak} day${stats.currentStreak === 1 ? '' : 's'}`}
              color="#10b981"
            />
            <StatCard
              icon={Brain}
              title="Exercise Sessions"
              value={stats.totalSessions}
              color="#6366f1"
            />
            <StatCard
              icon={Heart}
              title="Average Mood"
              value={`${stats.moodAverage}/10`}
              color="#ec4899"
            />
            <StatCard
              icon={BookOpen}
              title="Journal Entries"
              value={stats.journalEntries}
              color="#a855f7"
            />
          </div>
        </section>

        <section className="actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ActionCard {...action} />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="chart-section">
          <motion.div
            className="chart-card card-3d"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="chart-header">
              <h2>Your Mood This Week</h2>
              <div className="chart-legend">
                <span className="legend-item">
                  <div className="legend-color"></div>
                  Mood Level (1-10)
                </span>
              </div>
            </div>
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </motion.div>
        </section>

        <section className="activity-section">
          <motion.div
            className="activity-card card-3d"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.length > 0 ? recentActivity.map((item) => (
                <div key={item.id} className="activity-item">
                  {createElement(item.icon, { className: 'activity-icon' })}
                  <div className="activity-content">
                    <h4>{item.title}</h4>
                    <p>{item.description} · {formatRelativeTime(item.createdAt)}</p>
                  </div>
                </div>
              )) : (
                <div className="activity-item">
                  <Calendar className="activity-icon" />
                  <div className="activity-content">
                    <h4>No recent activity yet</h4>
                    <p>Start with a mood check-in, journal entry, or guided exercise.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
