import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Electron loads the app via file://, where the History API doesn't work —
// use HashRouter in that build. The web build still uses BrowserRouter.
const Router = import.meta.env.VITE_DESKTOP === '1' ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
