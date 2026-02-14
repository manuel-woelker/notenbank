import React from 'react'
import { Button, Result } from 'antd'

type Props = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

/* 📖 # Why use a class component for error boundaries?
React only supports error boundaries via class components with
getDerivedStateFromError and componentDidCatch lifecycle methods.
Functional components cannot catch render-time errors.
*/
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Result
          status="error"
          title="Ein Fehler ist aufgetreten"
          subTitle="Die Seite konnte nicht geladen werden. Bitte versuchen Sie es erneut."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              Seite neu laden
            </Button>
          }
        />
      )
    }

    return this.props.children
  }
}
