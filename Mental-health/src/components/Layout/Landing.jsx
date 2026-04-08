import { createElement, useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Brain, Heart, Shield, Zap, Star, NotebookPen, Lock, Bot, Wifi } from 'lucide-react'
import './Landing.css'

// Lazy-load the entire 3D hero to keep @react-three out of the main bundle
const HeroVisual3D = lazy(() => import('./HeroVisual3D'))

const HeroFallback = () => (
  <div className="hero-3d-fallback">
    <div className="fallback-orb" />
    <p className="fallback-text">Loading experience...</p>
  </div>
)

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  return (
    <motion.div
      className="card-3d feature-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, rotateY: 5 }}
    >
      <div className="feature-icon">
        {createElement(Icon, { size: 40 })}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  )
}

const StatCard = ({ number, label, delay }) => {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      <h3 className="stat-number text-gradient">{number}</h3>
      <p className="stat-label">{label}</p>
    </motion.div>
  )
}

export default function Landing() {
  const [show3D, setShow3D] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow3D(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI Mental Health Companion",
      description: "24/7 empathetic AI chatbot trained to provide emotional support and guidance"
    },
    {
      icon: Heart,
      title: "Mood Tracking",
      description: "Track your daily emotions and discover patterns in your mental wellness journey"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data stays behind authenticated sessions with protected backend APIs"
    },
    {
      icon: NotebookPen,
      title: "Private Journaling",
      description: "Capture reflections, revisit your entries, and track how your emotions evolve over time"
    },
    {
      icon: Zap,
      title: "Personalized Exercises",
      description: "CBT, mindfulness, and breathing exercises tailored to your needs"
    },
    {
      icon: Star,
      title: "Progress Insights",
      description: "Comprehensive dashboard showing your mental health progress over time"
    }
  ]

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Your AI Companion for
                <span className="text-gradient"> Mental Clarity</span>
              </motion.h1>
              
              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Reflect, track, and feel better — every day. Private, secure, and always here for you.
              </motion.p>

              {/* Trust Signals */}
              <motion.div
                className="trust-signals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                <div className="trust-pill">
                  <Lock size={14} />
                  <span>Private & Secure</span>
                </div>
                <div className="trust-pill">
                  <Bot size={14} />
                  <span>AI Powered</span>
                </div>
                <div className="trust-pill">
                  <Wifi size={14} />
                  <span>Works Offline</span>
                </div>
              </motion.div>
              
              <motion.div
                className="hero-buttons"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Link to="/login" className="btn btn-primary btn-large">
                  Start Feeling Better
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Try Anonymously
                </Link>
              </motion.div>
            </div>
            
            <div className="hero-visual">
              {show3D && (
                <Suspense fallback={<HeroFallback />}>
                  <HeroVisual3D />
                </Suspense>
              )}
              {!show3D && <HeroFallback />}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <StatCard number="10K+" label="Active Users" delay={0.1} />
            <StatCard number="95%" label="Feel Better" delay={0.2} />
            <StatCard number="24/7" label="Support Available" delay={0.3} />
            <StatCard number="50+" label="Guided Exercises" delay={0.4} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Everything You Need for Mental Wellness</h2>
            <p>Comprehensive tools and support designed by mental health professionals</p>
          </motion.div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-content glass"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Every Step Counts 💙</h2>
            <p>Join thousands finding peace and clarity through our platform</p>
            <Link to="/login" className="btn btn-accent btn-large">
              Start Feeling Better
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
