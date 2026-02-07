import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClassProvider } from './features/administration/classes/ClassContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClassProvider>
      <App />
    </ClassProvider>
  </StrictMode>
)
