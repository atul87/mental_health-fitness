import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Sparkles, Send } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { QUICK_MOODS } from '../../lib/moods'
import './DailyCheckIn.css'

export default function DailyCheckIn({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(0)
  const [mood, setMood] = useState(null)
  const [reflection, setReflection] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiResponse, setAiResponse] = useState(null)

  const handleNextStep = () => setStep((s) => s + 1)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Create a message that represents the check-in context
      const message = `I am feeling ${mood} today. ${reflection ? "Here's why: " + reflection : "I don't have much else to say."}`;
      
      const { response, data } = await apiRequest('/api/mood/analyze', {
        method: 'POST',
        body: { message }
      })

      if (response.ok && data.success) {
        setAiResponse(data.mood)
        handleNextStep() // go to success/AI reflection step
      }
    } catch (err) {
      console.error(err)
      // gracefully fail and close
      handleClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep(0)
    setMood(null)
    setReflection('')
    setAiResponse(null)
    onClose()
    if (onComplete) onComplete()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="daily-checkin-overlay">
        <motion.div 
          className="daily-checkin-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close daily check-in">
            <X size={20} />
          </button>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="step-content"
              >
                <div className="checkin-header">
                  <div className="icon-wrapper glass">
                    <Heart size={32} className="heart-icon" />
                  </div>
                  <h2>Daily Check-in</h2>
                  <p>How are you feeling right now?</p>
                </div>
                
                <div className="mood-grid">
                  {QUICK_MOODS.map((m) => (
                    <motion.button
                      key={m.label}
                      type="button"
                      className={`mood-select-btn ${mood === m.value ? 'selected' : ''}`}
                      style={{ '--ring-color': m.color }}
                      onClick={() => setMood(m.value)}
                      aria-pressed={mood === m.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="mood-emoji-large">{m.icon}</span>
                      <span className="mood-label">{m.label}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="action-row">
                  <button 
                    type="button"
                    className="primary-btn" 
                    disabled={!mood}
                    onClick={handleNextStep}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="step-content"
              >
                <div className="checkin-header">
                  <h2>Would you like to elaborate?</h2>
                  <p>Sometimes translating feelings to words helps (optional).</p>
                </div>

                <textarea 
                  className="reflection-input"
                  placeholder="I'm feeling this way because..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={4}
                />

                <div className="action-row space-between">
                  <button type="button" className="secondary-btn" onClick={() => setStep(0)}>Back</button>
                  <button 
                    type="button"
                    className="primary-btn" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Reflecting...' : 'Save Check-in'}
                    {!isSubmitting && <Send size={16} style={{ marginLeft: 8 }} />}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="step-content success-step"
              >
                <div className="icon-wrapper glass success-icon">
                  <Sparkles size={40} className="sparkle-svg" />
                </div>
                <h2>Check-in Complete</h2>
                <p className="ai-insight-text">
                  "{aiResponse?.keywords ? `We logged that you're feeling ${aiResponse?.keywords.join(', ')}. ` : ''} 
                  Thank you for taking a moment for yourself today."
                </p>
                <button type="button" className="primary-btn pulse" onClick={handleClose}>
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
