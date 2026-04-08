import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Home, 
  MessageCircle, 
  Heart, 
  BookOpen, 
  Activity, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout: onLogout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/chat', icon: MessageCircle, label: 'AI Chat' },
    { path: '/mood', icon: Heart, label: 'Mood Tracker' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/exercises', icon: Activity, label: 'Exercises' },
    { path: '/profile', icon: User, label: 'Profile' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="nav-container">
        {/* Logo */}
        <Link to="/dashboard" className="nav-logo">
          <Heart className="logo-icon" />
          <span className="logo-text">SoulCare</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-menu desktop-menu">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="nav-user desktop-menu">
          <div className="user-avatar">
            <img src={user.avatar} alt={user.name} />
          </div>
          <span className="user-name">{user.name}</span>
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={20} />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <motion.div 
        className={`mobile-menu ${isOpen ? 'open' : ''}`}
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mobile-menu-content">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
          
          <div className="mobile-user-section">
            <div className="mobile-user-info">
              <img src={user.avatar} alt={user.name} className="mobile-avatar" />
              <span>{user.name}</span>
            </div>
            <button onClick={onLogout} className="mobile-logout">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  )
}