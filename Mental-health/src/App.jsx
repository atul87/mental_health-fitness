import { lazy, Suspense } from 'react'
import { BrowserRouter as RouterComp, Routes as RoutesComp, Route as RouteComp, Navigate as NavigateComp } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import './App.css'

// Import context
import { AuthProvider, useAuth } from './context/AuthContext'

// Import components
import Navbar from './components/Layout/Navbar'

const Landing = lazy(() => import('./components/Layout/Landing'))
const Login = lazy(() => import('./components/Auth/Login'))
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'))
const Chatbot = lazy(() => import('./components/Features/Chatbot'))
const MoodTracker = lazy(() => import('./components/Features/MoodTracker'))
const Journal = lazy(() => import('./components/Features/Journal'))
const Exercises = lazy(() => import('./components/Features/Exercises'))
const Profile = lazy(() => import('./components/Features/Profile'))

const AppLoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner"></div>
    <p>Loading your wellness journey...</p>
  </div>
)

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <AppLoadingScreen />;
  }
  
  return user ? children : <NavigateComp to="/login" />;
}

// App Content wrapped inside AuthProvider context so we can consume useAuth
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoadingScreen />
  }

  return (
    <RouterComp>
      <div className="app">
        <AnimatePresence mode="wait">
          {user && <Navbar />}
          <Suspense fallback={<AppLoadingScreen />}>
            <RoutesComp>
              <RouteComp 
                path="/" 
                element={user ? <NavigateComp to="/dashboard" /> : <Landing />} 
              />
              <RouteComp 
                path="/login" 
                element={user ? <NavigateComp to="/dashboard" /> : <Login />} 
              />
              <RouteComp 
                path="/dashboard" 
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
              />
              <RouteComp 
                path="/chat" 
                element={<ProtectedRoute><Chatbot /></ProtectedRoute>} 
              />
              <RouteComp 
                path="/mood" 
                element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} 
              />
              <RouteComp 
                path="/journal" 
                element={<ProtectedRoute><Journal /></ProtectedRoute>} 
              />
              <RouteComp 
                path="/exercises" 
                element={<ProtectedRoute><Exercises /></ProtectedRoute>} 
              />
              <RouteComp 
                path="/profile" 
                element={<ProtectedRoute><Profile /></ProtectedRoute>} 
              />
            </RoutesComp>
          </Suspense>
        </AnimatePresence>
      </div>
    </RouterComp>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
