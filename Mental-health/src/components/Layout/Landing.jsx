import { createElement } from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import { Link } from 'react-router-dom'
import { Brain, Heart, Shield, Zap, Star, NotebookPen } from 'lucide-react'
import './Landing.css'

const AnimatedSphere = () => {
  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={3}>
      <Sphere args={[1, 128, 128]} scale={2.5}>
        <MeshDistortMaterial
          color="#a855f7"
          emissive="#6366f1"
          emissiveIntensity={0.5}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
        />
      </Sphere>
      <Sphere args={[1, 64, 64]} scale={2.4}>
        <MeshDistortMaterial
          color="#ec4899"
          attach="material"
          distort={0.5}
          speed={1.5}
          roughness={0}
          transparent={true}
          opacity={0.8}
        />
      </Sphere>
    </Float>
  )
}

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
                Your Mental Wellness
                <span className="text-gradient"> Journey Starts Here</span>
              </motion.h1>
              
              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <strong>Your AI Companion for Mental Clarity.</strong> Track your mood, practice CBT exercises, and build resilience with an intelligent, fault-tolerant platform.
              </motion.p>
              
              <motion.div
                className="hero-buttons"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Link to="/login" className="btn btn-primary btn-large">
                  Start Your Journey
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Continue Anonymously
                </Link>
              </motion.div>
            </div>
            
            <div className="hero-visual">
              <Canvas>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <AnimatedSphere />
                <OrbitControls enableZoom={false} enablePan={false} />
              </Canvas>
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
            <h2>Ready to Transform Your Mental Health?</h2>
            <p>Join thousands of users who have found peace and clarity through our platform</p>
            <Link to="/login" className="btn btn-accent btn-large">
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
