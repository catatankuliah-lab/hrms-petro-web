import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Registrasi Service Worker PWA
registerSW({ immediate: true })

const originalConsoleLog = console.log;
console.log = (...args) => {
  const isSpam = args.some(arg => 
    typeof arg === 'string' && (arg === 'light' || arg === 'dark' || arg.includes('My Menu item classname'))
  );
  if (isSpam) return;
  originalConsoleLog(...args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)