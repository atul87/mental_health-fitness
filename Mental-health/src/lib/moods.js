export const MOOD_OPTIONS = [
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

export const QUICK_MOODS = [
  { label: 'Great', value: 'Very Positive', icon: '✨', color: '#10b981' },
  { label: 'Good', value: 'Positive', icon: '🌱', color: '#3b82f6' },
  { label: 'Okay', value: 'Neutral', icon: '☁️', color: '#6366f1' },
  { label: 'Low', value: 'Negative', icon: '🌧️', color: '#f59e0b' },
  { label: 'Awful', value: 'Very Negative', icon: '🌪️', color: '#ef4444' }
]

export const MOOD_EMOJI_MAP = {
  'Very Positive': '\u{1F60A}',
  Positive: '\u{1F642}',
  Neutral: '\u{1F610}',
  Negative: '\u{1F641}',
  'Very Negative': '\u{1F622}'
}

export const MOOD_COLOR_MAP = {
  'Very Positive': '#10b981',
  Positive: '#3b82f6',
  Neutral: '#6b7280',
  Negative: '#f59e0b',
  'Very Negative': '#ef4444'
}

export const MOOD_SCORE_MAP = {
  'Very Positive': 5,
  Positive: 4,
  Neutral: 3,
  Negative: 2,
  'Very Negative': 1
}

export const getMoodEmoji = (mood) => MOOD_EMOJI_MAP[mood] || MOOD_EMOJI_MAP.Neutral

export const getMoodColor = (mood) => MOOD_COLOR_MAP[mood] || MOOD_COLOR_MAP.Neutral

export const getMoodScore = (mood) => MOOD_SCORE_MAP[mood] || MOOD_SCORE_MAP.Neutral

export const mapMoodToScore = (mood) => {
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