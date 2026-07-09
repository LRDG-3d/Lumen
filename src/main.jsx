import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { LibraryProvider } from './context/LibraryContext.jsx'
import { ContinueWatchingProvider } from './context/ContinueWatchingContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <LibraryProvider>
          <ContinueWatchingProvider>
            <App />
          </ContinueWatchingProvider>
        </LibraryProvider>
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>
)
