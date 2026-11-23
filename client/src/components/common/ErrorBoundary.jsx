import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Button from './Button'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-card border border-slate-200/80 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-red-50/50">
              <AlertTriangle size={28} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              An unexpected error occurred while rendering this section. The application remains running.
            </p>

            {this.state.error?.message && (
              <div className="mt-4 p-3 bg-red-50/60 rounded-xl border border-red-100 text-left overflow-x-auto text-xs font-mono text-red-700">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw size={14} />}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <a href="/">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Home size={14} />}
                >
                  Return to Dashboard
                </Button>
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

