import { useState, useEffect } from 'react'
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  BarChart3,
  Activity
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { apiRequest } from '../../lib/api';
import './MoodTracker.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

export default function MoodTracker() {
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

  // Function to get mood emoji based on mood text
  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'Very Positive': return '😊';
      case 'Positive': return '🙂';
      case 'Neutral': return '😐';
      case 'Negative': return '🙁';
      case 'Very Negative': return '😢';
      default: return '😐';
    }
  };

  // Function to get mood color based on mood text
  const getMoodColor = (mood) => {
    switch (mood) {
      case 'Very Positive': return '#10b981'; // green
      case 'Positive': return '#3b82f6'; // blue
      case 'Neutral': return '#6b7280'; // gray
      case 'Negative': return '#f59e0b'; // amber
      case 'Very Negative': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  // Function to get mood score for charting
  const getMoodScore = (mood) => {
    switch (mood) {
      case 'Very Positive': return 5;
      case 'Positive': return 4;
      case 'Neutral': return 3;
      case 'Negative': return 2;
      case 'Very Negative': return 1;
      default: return 3;
    }
  };

  // Fetch mood history from backend
  useEffect(() => {
    const fetchMoodHistory = async () => {
      try {
        setLoading(true);
        const { response, data } = await apiRequest('/api/mood/history');
        
        if (response.ok && data.success) {
          setMoodHistory(data.moods);
        } else {
          setError(data.error || 'Failed to fetch mood history');
        }
      } catch (err) {
        setError('Failed to connect to server');
        console.error('Error fetching mood history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodHistory();
  }, []);

  // Prepare data for charts
  const getChartData = () => {
    if (moodHistory.length === 0) return null;

    // Filter data based on time range
    let filteredData = [...moodHistory];
    const now = new Date();
    
    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = moodHistory.filter(mood => new Date(mood.createdAt) >= weekAgo);
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredData = moodHistory.filter(mood => new Date(mood.createdAt) >= monthAgo);
    }

    // Sort by date
    filteredData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Line chart data
    const lineChartData = {
      labels: filteredData.map(mood => 
        new Date(mood.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Mood Score',
          data: filteredData.map(mood => getMoodScore(mood.mood)),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ]
    };

    // Bar chart data - mood distribution
    const moodCounts = {};
    filteredData.forEach(mood => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
    });

    const barChartData = {
      labels: Object.keys(moodCounts),
      datasets: [
        {
          label: 'Mood Distribution',
          data: Object.values(moodCounts),
          backgroundColor: Object.keys(moodCounts).map(mood => getMoodColor(mood)),
          borderColor: Object.keys(moodCounts).map(mood => getMoodColor(mood)),
          borderWidth: 1,
        }
      ]
    };

    return { lineChartData, barChartData, filteredData };
  };

  const chartData = getChartData();

  // Calculate mood insights
  const getMoodInsights = () => {
    if (moodHistory.length === 0) return null;

    const moodCounts = {};
    moodHistory.forEach(mood => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
    });

    const totalMoods = moodHistory.length;
    const mostFrequentMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    // Calculate average mood score
    const totalScore = moodHistory.reduce((sum, mood) => sum + getMoodScore(mood.mood), 0);
    const averageScore = totalScore / totalMoods;

    let moodTrend = 'Neutral';
    if (averageScore >= 4.5) moodTrend = 'Very Positive';
    else if (averageScore >= 3.5) moodTrend = 'Positive';
    else if (averageScore >= 2.5) moodTrend = 'Neutral';
    else if (averageScore >= 1.5) moodTrend = 'Negative';
    else moodTrend = 'Very Negative';

    return {
      totalMoods,
      mostFrequentMood,
      moodTrend,
      averageScore: averageScore.toFixed(1)
    };
  };

  const moodInsights = getMoodInsights();

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
    );
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
    );
  }

  return (
    <div className="mood-tracker">
      <div className="container">
        {/* Header */}
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

        {/* Mood Insights */}
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
                <div className="insight-icon" style={{ backgroundColor: getMoodColor(moodInsights.mostFrequentMood) }}>
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
                <div className="insight-icon" style={{ backgroundColor: getMoodColor(moodInsights.moodTrend) }}>
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

        {/* Chart Controls */}
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

        {/* Charts */}
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
              <Line 
                data={chartData.lineChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let moodScore = context.parsed.y;
                          let moodLabel = '';
                          if (moodScore === 5) moodLabel = 'Very Positive';
                          else if (moodScore === 4) moodLabel = 'Positive';
                          else if (moodScore === 3) moodLabel = 'Neutral';
                          else if (moodScore === 2) moodLabel = 'Negative';
                          else if (moodScore === 1) moodLabel = 'Very Negative';
                          return `Mood: ${moodLabel}`;
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
                        callback: function(value) {
                          if (value === 5) return '😊';
                          if (value === 4) return '🙂';
                          if (value === 3) return '😐';
                          if (value === 2) return '🙁';
                          if (value === 1) return '😢';
                          return '';
                        }
                      }
                    }
                  }
                }} 
              />
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
              <Bar 
                data={chartData.barChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  }
                }} 
              />
            </motion.div>
          </div>
        )}

        {/* Mood History List */}
        {chartData && chartData.filteredData.length > 0 && (
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
              {chartData.filteredData.map((mood, index) => (
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
                    {mood.keywords && mood.keywords.map((keyword, idx) => (
                      <span key={idx} className="keyword-tag">
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
  );
}
