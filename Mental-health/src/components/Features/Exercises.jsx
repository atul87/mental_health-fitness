import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, CheckCircle, Brain, Heart, Wind, Video, RotateCcw } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import './Exercises.css'

const formatTimer = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export default function Exercises() {
  const [activeExercise, setActiveExercise] = useState(null)
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const activeExerciseRef = useRef(null)

  useEffect(() => {
    if (!isRunning || !activeExercise) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setTimer((currentTimer) => currentTimer + 1)
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [activeExercise, isRunning])

  useEffect(() => {
    if (activeExercise && activeExerciseRef.current) {
      activeExerciseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeExercise])

  const exercises = [
    {
      id: 1,
      title: '4-7-8 Breathing',
      description: 'A calming breathing technique to reduce anxiety and promote relaxation',
      category: 'Breathing',
      duration: 4,
      icon: Wind,
      color: '#06b6d4',
      youtubeId: 'AI5KnFb926I',
      steps: [
        'Exhale completely through your mouth',
        'Close your mouth and inhale through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through your mouth for 8 counts'
      ]
    },
    {
      id: 2,
      title: 'Mindful Body Scan',
      description: 'Progressive relaxation technique to release tension and increase awareness',
      category: 'Mindfulness',
      duration: 10,
      icon: Heart,
      color: '#f093fb',
      youtubeId: 'q1J58G2V54Q',
      steps: [
        'Lie down comfortably and close your eyes',
        'Start from your toes and slowly move up',
        'Notice any tension or sensations',
        'Breathe into each body part as you scan'
      ]
    },
    {
      id: 3,
      title: 'Thought Challenging',
      description: 'CBT technique to identify and reframe negative thought patterns',
      category: 'CBT',
      duration: 15,
      icon: Brain,
      color: '#10b981',
      youtubeId: 'dJL1nA6w1q0',
      steps: [
        'Identify the negative thought',
        'What evidence supports this thought?',
        'What evidence contradicts it?',
        'Create a more balanced perspective'
      ]
    },
    {
      id: 4,
      title: 'Progressive Muscle Relaxation',
      description: 'Systematic tensing and relaxing of muscle groups to reduce stress',
      category: 'Relaxation',
      duration: 12,
      icon: Heart,
      color: '#8b5cf6',
      youtubeId: '10kRCUfLKEo',
      steps: [
        'Find a quiet, comfortable place',
        'Start with your feet and work up your body',
        'Tense each muscle group for 5 seconds',
        'Release and notice the relaxation'
      ]
    },
    {
      id: 5,
      title: 'Mindful Walking',
      description: 'Walking meditation to connect with the present moment',
      category: 'Mindfulness',
      duration: 8,
      icon: Wind,
      color: '#f59e0b',
      youtubeId: 'qE4w2j5w8sk',
      steps: [
        'Walk slowly and deliberately',
        'Focus on each step and your breathing',
        'Notice the sensations in your feet',
        'Observe your surroundings without judgment'
      ]
    },
    {
      id: 6,
      title: 'Gratitude Journaling',
      description: 'Practice gratitude to shift focus to positive aspects of life',
      category: 'Journaling',
      duration: 10,
      icon: Brain,
      color: '#ec4899',
      youtubeId: 'U67sLbzZi1o',
      steps: [
        'Set aside 10 minutes daily',
        'List 3 things you are grateful for',
        'Write a sentence about why you appreciate each',
        'Reflect on how gratitude affects your mood'
      ]
    }
  ]

  const startExercise = (exercise) => {
    setActiveExercise(exercise)
    setTimer(0)
    setIsRunning(true)
    setShowVideo(false)
  }

  const resetTimer = () => {
    setTimer(0)
    setIsRunning(false)
  }

  const handleComplete = async () => {
    if (!activeExercise) {
      return
    }

    try {
      const elapsedMinutes = Math.max(1, Math.round(timer / 60))
      const { response, data } = await apiRequest('/api/exercises/complete', {
        method: 'POST',
        body: {
          exerciseId: activeExercise.id,
          title: activeExercise.title,
          category: activeExercise.category,
          durationMinutes: elapsedMinutes || activeExercise.duration
        }
      })

      if (response.ok && data.success) {
        setActiveExercise(null)
        setIsRunning(false)
        setTimer(0)
      }
    } catch (error) {
      console.error('Failed to log exercise', error)
      setActiveExercise(null)
      setIsRunning(false)
      setTimer(0)
    }
  }

  return (
    <div className="exercises">
      <div className="container">
        <motion.div
          className="exercises-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Wellness Exercises</h1>
          <p>Practice mindfulness, breathing, and CBT techniques for better mental health</p>
        </motion.div>

        <div className="exercises-grid">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              className="exercise-card card-3d"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, rotateY: 5 }}
            >
              <div className="exercise-icon" style={{ backgroundColor: exercise.color }}>
                <exercise.icon size={32} />
              </div>
              <h3>{exercise.title}</h3>
              <p>{exercise.description}</p>
              <div className="exercise-meta">
                <span className="category">{exercise.category}</span>
                <span className="duration">{exercise.duration} minutes</span>
              </div>
              <div className="exercise-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => startExercise(exercise)}
                >
                  <Play size={16} />
                  Start Exercise
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setActiveExercise(exercise)
                    setShowVideo(true)
                    setIsRunning(false)
                  }}
                >
                  <Video size={16} />
                  Watch Video
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {activeExercise && (
          <motion.div
            ref={activeExerciseRef}
            className="active-exercise card-3d"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>{activeExercise.title}</h2>
            <p className="duration">Target duration: {activeExercise.duration} minutes</p>

            {showVideo && activeExercise.youtubeId && (
              <div className="video-container">
                <div className="video-wrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeExercise.youtubeId}`}
                    title={activeExercise.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            <div className="exercise-steps">
              {activeExercise.steps.map((step, index) => (
                <div key={step} className="step">
                  <span className="step-number">{index + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="exercise-controls">
              <div className="btn btn-secondary" style={{ cursor: 'default' }}>
                <CheckCircle size={16} />
                Timer {formatTimer(timer)}
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setShowVideo((current) => !current)}
              >
                <Video size={16} />
                {showVideo ? 'Hide Video' : 'Show Video'}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setIsRunning((current) => !current)}
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isRunning ? 'Pause' : 'Resume'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={resetTimer}
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={handleComplete}
              >
                <CheckCircle size={16} />
                Complete
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
