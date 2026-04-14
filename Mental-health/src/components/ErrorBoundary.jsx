import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  handleRetry = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-shell">
          <div className="app-error-card glass card-3d">
            <AlertTriangle size={40} className="app-error-icon" />
            <h1>Something went wrong</h1>
            <p>
              SoulCare hit an unexpected error. Refresh the page to recover and continue your session.
            </p>
            <button className="btn btn-primary" onClick={this.handleRetry}>
              <RotateCcw size={18} />
              Reload app
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary