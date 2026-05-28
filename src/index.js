import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App';

// Find the target anchor container in public/index.html
const container = document.getElementById('root');
const root = createRoot(container);

// Render the premium Oversight Sentinel control panel
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);