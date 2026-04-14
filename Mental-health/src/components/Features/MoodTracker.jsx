import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, BarChart3, Calendar, Heart, Smile, TrendingUp } from 'lucide-react'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { apiRequest } from '../../lib/api'
import { getMoodColor, getMoodEmoji, getMoodScore } from '../../lib/moods'
import './MoodTracker.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
)

function getFilteredMoodHistory(moodHistory, timeRange) {
  const sortedHistory = [...moodHistory].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  if (timeRange === 'all') {
    return sortedHistory
  }

  const durationInDays = timeRange === 'month' ? 30 : 7
  const cutoffDate = new Date(Date.now() - durationInDays * 24 * 60 * 60 * 1000)

  return sortedHistory.filter((mood) => new Date(mood.createdAt) >= cutoffDate)
}

function getChartData(filteredMoodHistory) {
  if (filteredMoodHistory.length === 0) {
    return null
  }

  const moodCounts = filteredMoodHistory.reduce((counts, mood) => {
    counts[mood.mood] = (counts[mood.mood] || 0) + 1
    return counts
  }, {})

  return {
    barChartData: {
      labels: Object.keys(moodCounts),
      datasets: [
        {
          label: 'Mood Distribution',
          data: Object.values(moodCounts),
          backgroundColor: Object.keys(moodCounts).map((mood) => getMoodColor(mood)),
          borderColor: Object.keys(moodCounts).map((mood) => getMoodColor(mood)),
          borderWidth: 1
        }
      ]
    },
    lineChartData: {
      labels: filteredMoodHistory.map((mood) =>
        new Date(mood.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Mood Score',
          data: filteredMoodHistory.map((mood) => getMoodScore(mood.mood)),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    }
  }
}

function getMoodInsights(moodHistory) {
  if (moodHistory.length === 0) {
    return null
  }

  const moodCounts = moodHistory.reduce((counts, mood) => {
    counts[mood.mood] = (counts[mood.mood] || 0) + 1
    return counts
  }, {})

  const totalMoods = moodHistory.length
  const totalScore = moodHistory.reduce((sum, mood) => sum + getMoodScore(mood.mood), 0)
  const averageScore = totalScore / totalMoods

  let moodTrend = 'Neutral'
  if (averageScore >= 4.5) moodTrend = 'Very Positive'
  else if (averageScore >= 3.5) moodTrend = 'Positive'
  else if (averageScore < 1.5) moodTrend = 'Very Negative'
  else if (averageScore < 2.5) moodTrend = 'Negative'

  const mostFrequentMood = Object.keys(moodCounts).reduce((current, next) =>
    moodCounts[current] > moodCounts[next] ? current : next
  )

  return {
    averageScore: averageScore.toFixed(1),
    moodTrend,
    mostFrequentMood,
    totalMoods
  }
}

const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      callbacks: {
        label(context) {
          const moodScore = context.parsed.y
          const moodLabel = ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative']
            .find((mood) => getMoodScore(mood) === moodScore) || 'Neutral'
          return `Mood: ${moodLabel}`
        }
      }
    }
  },
  scales: {
    y: {
      min: 0,
      max: 5,
      ticks: {
        stepSize: 1,
        callback(value) {
          const moodLabel = ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative']
            .find((mood) => getMoodScore(mood) === value) || 'Neutral'
          return getMoodEmoji(moodLabel)
        }
      }
    }
  }
}

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    }
  }
}

export default function MoodTracker() {
  const [moodHistory, setMoodHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('week')

  useEffect(() => {
    const fetchMoodHistory = async () => {
      try {
        setLoading(true)
        const { response, data } = await apiRequest('/api/mood/history')

        if (response.ok && data.success) {
          setMoodHistory(data.moods)
          setError(null)
          return
        }

        setError(data.error || 'Failed to fetch mood history')
      } catch (fetchError) {
        console.error('Error fetching mood history:', fetchError)
        setError('Failed to connect to server')
      } finally {
        setLoading(false)
      }
    }

    fetchMoodHistory()
  }, [])

  const filteredMoodHistory = getFilteredMoodHistory(moodHistory, timeRange)
  const chartData = getChartData(filteredMoodHistory)
  const moodInsights = getMoodInsights(moodHistory)

  if (loading) {
    return (
      <div className="mood-tracker">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your mood history...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mood-tracker">
        <div className="container">
          <div className="error-container">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mood-tracker">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>
            <Heart className="header-icon" />
            Mood Tracker
          </h1>
          <p>Track and understand your emotional journey</p>
        </motion.div>

        {moodInsights && (
          <motion.div
            className="mood-insights card-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2>
              <TrendingUp size={24} />
              Your Mood Insights
            </h2>
            <div className="insights-grid">
              <div className="insight-card">
                <div
                  className="insight-icon"
                  style={{ backgroundColor: getMoodColor(moodInsights.mostFrequentMood) }}
                >
                  {getMoodEmoji(moodInsights.mostFrequentMood)}
                </div>
                <div className="insight-content">
                  <h3>Most Common Mood</h3>
                  <p>{moodInsights.mostFrequentMood}</p>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon" style={{ backgroundColor: '#667eea' }}>
                  <BarChart3 size={24} />
                </div>
                <div className="insight-content">
                  <h3>Total Entries</h3>
                  <p>{moodInsights.totalMoods}</p>
                </div>
              </div>

              <div className="insight-card">
                <div
                  className="insight-icon"
                  style={{ backgroundColor: getMoodColor(moodInsights.moodTrend) }}
                >
                  <Activity size={24} />
                </div>
                <div className="insight-content">
                  <h3>Overall Trend</h3>
                  <p>{moodInsights.moodTrend}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="chart-controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="time-range-selector">
            <button
              className={timeRange === 'week' ? 'active' : ''}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button
              className={timeRange === 'month' ? 'active' : ''}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button
              className={timeRange === 'all' ? 'active' : ''}
              onClick={() => setTimeRange('all')}
            >
              All Time
            </button>
          </div>
        </motion.div>

        {chartData && (
          <div className="charts-container">
            <motion.div
              className="chart-card card-3d"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3>
                <Activity size={20} />
                Mood Trend
              </h3>
              <Line data={chartData.lineChartData} options={lineChartOptions} />
            </motion.div>

            <motion.div
              className="chart-card card-3d"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3>
                <BarChart3 size={20} />
                Mood Distribution
              </h3>
              <Bar data={chartData.barChartData} options={barChartOptions} />
            </motion.div>
          </div>
        )}

        {filteredMoodHistory.length > 0 && (
          <motion.div
            className="mood-history card-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3>
              <Calendar size={20} />
              Recent Mood Entries
            </h3>
            <div className="mood-list">
              {filteredMoodHistory.map((mood, index) => (
                <motion.div
                  key={mood._id || index}
                  className="mood-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <div className="mood-header">
                    <div className="mood-emoji">
                      {getMoodEmoji(mood.mood)}
                    </div>
                    <div className="mood-info">
                      <h4>{mood.mood}</h4>
                      <p className="mood-date">
                        {new Date(mood.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mood-keywords">
                    {mood.keywords?.map((keyword) => (
                      <span key={keyword} className="keyword-tag">
                        {keyword}
                      </span>
                    ))}
                  </div>

                  {mood.message && (
                    <p className="mood-message">
                      "{mood.message}"
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {moodHistory.length === 0 && (
          <motion.div
            className="empty-state card-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Smile size={48} />
            <h3>No Mood Entries Yet</h3>
            <p>Start chatting with the AI companion to track your moods!</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
