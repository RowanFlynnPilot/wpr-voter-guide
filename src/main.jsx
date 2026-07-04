import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { startHeightReporting } from './embed.js';
import './styles.css';

startHeightReporting();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
