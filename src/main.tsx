import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppWithTheme } from './AppWithTheme'
import { ErrorBoundary } from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppWithTheme />
    </ErrorBoundary>
  </React.StrictMode>,
)