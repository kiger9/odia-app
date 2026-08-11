import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { requestPersistentStorage } from './db.ts'

// Turn on offline support (the service worker) and ask iOS to keep our data.
registerSW({ immediate: true })
void requestPersistentStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
