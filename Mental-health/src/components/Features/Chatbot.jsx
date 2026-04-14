import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Bot,
  Heart,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Users,
  MapPin
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../lib/api'
import { getMoodEmoji } from '../../lib/moods'
import './Chatbot.css'

const quickResponses = [
  "I'm feeling anxious",
  'I had a good day',
  "I'm stressed about work",
  'I feel lonely',
  "I'm grateful for...",
  'I need motivation',
  'Can you recommend a therapist?',
  'I need professional help'
]

const formatMessageTime = (dateValue) => new Date(dateValue).toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit'
})

export default function Chatbot() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentMood, setCurrentMood] = useState(null)
  const [isFetchingHistory, setIsFetchingHistory] = useState(true)
  const [chatMode, setChatMode] = useState('online')

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceSupported(false)
      return undefined
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim()
      if (transcript) {
        setInput((currentValue) => (currentValue ? `${currentValue} ${transcript}` : transcript))
        inputRef.current?.focus()
      }
    }

    recognitionRef.current = recognition
    setVoiceSupported(true)

    return () => {
      recognition.stop()
    }
  }, [])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { response, data } = await apiRequest('/api/chatbot/history')

        if (response.ok && data.success && data.messages.length > 0) {
          setMessages(data.messages.map((message) => ({
            ...message,
            timestamp: message.createdAt
          })))
        } else {
          setMessages([{
            id: 'initial_hello',
            text: `Hello ${user.name}! I'm your AI mental health companion. How are you feeling today?`,
            sender: 'bot',
            timestamp: new Date().toISOString(),
            emotion: 'supportive'
          }])
        }
      } catch (error) {
        console.error('Error fetching chat history:', error)
        setMessages([{
          id: 'initial_hello',
          text: `Hello ${user.name}! I'm your AI mental health companion. How are you feeling today?`,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          emotion: 'supportive'
        }])
      } finally {
        setIsFetchingHistory(false)
      }
    }

    if (user?.id) {
      fetchHistory()
    }
  }, [user])

  const speakText = (text) => {
    if (!soundEnabled || !window.speechSynthesis) {
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }

  const analyzeMood = async (message) => {
    try {
      const { response, data } = await apiRequest('/api/mood/analyze', {
        method: 'POST',
        body: { message }
      })

      if (response.ok && data.success) {
        return data.mood
      }
    } catch (error) {
      console.error('Error analyzing mood:', error)
    }

    return null
  }

  const getBotResponse = async (userMessage, history) => {
    const { response, data } = await apiRequest('/api/chatbot/chat', {
      method: 'POST',
      body: { message: userMessage, history }
    })

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to connect to backend')
    }

    return data
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!input.trim() || isFetchingHistory) {
      return
    }

    const currentInput = input.trim()
    const userMessage = {
      id: `local-${Date.now()}`,
      text: currentInput,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages((previousMessages) => [...previousMessages, userMessage])
    setInput('')
    setIsTyping(true)

    analyzeMood(currentInput)
      .then((moodData) => {
        if (moodData) {
          setCurrentMood(moodData)
        }
      })
      .catch((error) => {
        console.error('Error in mood analysis:', error)
      })

    try {
      const botResponseData = await getBotResponse(currentInput, messages)
      setChatMode(botResponseData.mode || 'online')

      const botResponse = {
        id: botResponseData.botMessageId,
        text: botResponseData.response,
        doctors: botResponseData.doctors,
        sender: 'bot',
        timestamp: botResponseData.botMessageCreatedAt || new Date().toISOString(),
        emotion: botResponseData.emotion || 'supportive'
      }

      // Small delay for a more natural, human-like feel
      await new Promise((resolve) => setTimeout(resolve, 400))

      setMessages((previousMessages) => [...previousMessages, botResponse])
      speakText(botResponse.text)
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setChatMode('offline')

      await new Promise((resolve) => setTimeout(resolve, 300))

      const fallbackResponse = {
        id: `fallback-${Date.now()}`,
        text: "I'm here to support you. Could you share a bit more about what you're feeling?",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        emotion: 'supportive'
      }
      setMessages((previousMessages) => [...previousMessages, fallbackResponse])
      speakText(fallbackResponse.text)
    } finally {
      setIsTyping(false)
    }
  }

  const toggleListening = () => {
    if (!voiceSupported || !recognitionRef.current) {
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      return
    }

    recognitionRef.current.start()
  }

  const SocialNudge = ({ nudge }) => (
    <motion.div 
      className="social-nudge card-3d"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="nudge-header">
        <Sparkles size={18} className="nudge-icon" />
        <span>Self-Connection Suggestion</span>
      </div>
      <h4>{nudge.title}</h4>
      <p>{nudge.description}</p>
      <div className="nudge-actions">
        <button className="nudge-btn primary" onClick={() => setInput(nudge.actionText)}>
          {nudge.actionLabel}
        </button>
      </div>
    </motion.div>
  )

  const SafetyAlert = () => (
    <div className="safety-alert">
      <div className="safety-header">
        <Heart size={20} fill="#ef4444" color="#ef4444" />
        <span>You're not alone</span>
      </div>
      <p>It sounds like you're carrying a lot right now. Please know there are people who want to support you.</p>
      <div className="safety-links">
        <a href="tel:988" className="safety-link">Call 988 (Crisis Line)</a>
        <a href="sms:741741" className="safety-link">Text HOME to 741741</a>
      </div>
    </div>
  )

  const DoctorRecommendation = ({ doctors }) => (
    <div className="doctor-recommendations">
      <h4>Recommended Support Options</h4>
      <div className="doctors-list">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-header">
              <div className="doctor-avatar">
                <Users size={24} />
              </div>
              <div className="doctor-info">
                <h5>{doctor.name}</h5>
                <p className="doctor-specialty">{doctor.specialty}</p>
              </div>
            </div>
            <div className="doctor-details">
              <div className="detail-item">
                <MapPin size={16} />
                <span>{doctor.available || 'Search local providers'}</span>
              </div>
            </div>
            <div className="doctor-meta">
              <span className="rating">★ {doctor.rating || '4.8'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const MessageBubble = ({ message }) => {
    const isBot = message.sender === 'bot'
    const isCrisis = message.emotion === 'crisis' || (message.text && /help|suicide|kill|die/i.test(message.text) && isBot)

    return (
      <motion.div
        className={`message-bubble ${isBot ? 'bot-message' : 'user-message'} ${isCrisis ? 'crisis-message' : ''}`}
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="message-avatar">
          {isBot ? (
            <div className="bot-avatar">
              <Bot size={20} />
            </div>
          ) : (
            <img src={user?.avatar} alt={user?.name || 'User'} className="user-avatar" />
          )}
        </div>
        <div className="message-content">
          <p>{message.text}</p>
          {isBot && isCrisis && <SafetyAlert />}
          {message.nudge && <SocialNudge nudge={message.nudge} />}
          {message.doctors && message.doctors.length > 0 && <DoctorRecommendation doctors={message.doctors} />}
          <span className="message-time">
            {formatMessageTime(message.timestamp)}
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="chatbot-page">
      <div className="chat-container">
        <div className="chat-header">
          <div className="ai-companion-info">
            <div className="companion-visual">
              <div className={`css-orb ${isListening ? 'listening' : ''}`} />
            </div>
            <div className="companion-details">
              <h2>AI Companion</h2>
              {chatMode === 'offline' ? (
                <p className="status offline-status">
                  <span className="status-dot offline-dot"></span>
                  AI offline mode
                </p>
              ) : (
                <p className="status">
                  <span className="status-dot"></span>
                  Online and ready to help
                </p>
              )}
            </div>
          </div>
          <div className="chat-controls">
            <button
              className={`control-btn ${soundEnabled ? 'active' : ''}`}
              onClick={() => {
                if (soundEnabled && window.speechSynthesis) {
                  window.speechSynthesis.cancel()
                }
                setSoundEnabled((current) => !current)
              }}
              title={soundEnabled ? 'Disable spoken replies' : 'Enable spoken replies'}
              aria-label={soundEnabled ? 'Disable spoken replies' : 'Enable spoken replies'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>

        {/* Offline Banner */}
        {chatMode === 'offline' && (
          <motion.div
            className="offline-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span className="offline-banner-icon">🌙</span>
            <span>AI Offline Mode — I&apos;m still here with you</span>
          </motion.div>
        )}

        <div className="messages-container">
          {isFetchingHistory ? (
            <div className="loading-state" style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              Loading your conversation history...
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>
          )}

          {isTyping && (
            <motion.div
              className="typing-indicator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bot-avatar">
                <Bot size={20} />
              </div>
              <div className="typing-wrapper">
                <div className="typing-animation">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="thinking-label">AI is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-responses">
          <AnimatePresence>
            {messages.length <= 2 && !isFetchingHistory && (
              <motion.div
                className="quick-responses-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p>Quick responses:</p>
                <div className="quick-buttons">
                  {quickResponses.map((response, index) => (
                    <motion.button
                      key={response}
                      className="quick-btn"
                      onClick={() => setInput(response)}
                      aria-label={`Insert quick response: ${response}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {response}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="chat-input-container">
          <form onSubmit={handleSubmit} className="chat-form">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Share your thoughts or feelings..."
                className="chat-input"
                disabled={isTyping || isFetchingHistory}
              />
              <button
                type="button"
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                disabled={!voiceSupported}
                title={voiceSupported ? 'Use voice input' : 'Voice input is not supported in this browser'}
                aria-label={voiceSupported ? 'Use voice input' : 'Voice input is not supported in this browser'}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                type="submit"
                className="send-btn"
                disabled={!input.trim() || isTyping || isFetchingHistory}
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mood-sidebar">
        <h3>How you&apos;re feeling</h3>
        <div className="mood-indicators">
          {currentMood ? (
            <motion.div
              className="mood-item"
              key={currentMood.mood}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="mood-emoji">{getMoodEmoji(currentMood.mood)}</span>
              <span>{currentMood.mood}</span>
            </motion.div>
          ) : (
            <motion.div
              className="mood-item"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Heart className="mood-icon" />
              <span>Share your thoughts</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
