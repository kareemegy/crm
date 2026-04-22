import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import './index.css';

// Electron loads the app via file://, where the History API doesn't work —
// use HashRouter in that build. The web build still uses BrowserRouter.
const Router = import.meta.env.VITE_DESKTOP === '1' ? HashRouter : BrowserRouter;

// Global handlers so runtime errors never leak a minified SDK message to the UI.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    console.error('[global:error]', e.error || e.message);
    window.dispatchEvent(new CustomEvent('toast:show', {
      detail: { kind: 'error', message: 'Something went wrong. Please try again.' }
    }));
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[global:unhandledrejection]', e.reason);
    const msg = e.reason?.message && e.reason.message.length < 160
      ? e.reason.message
      : 'Something went wrong. Please try again.';
    window.dispatchEvent(new CustomEvent('toast:show', { detail: { kind: 'error', message: msg } }));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <App />
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
);
