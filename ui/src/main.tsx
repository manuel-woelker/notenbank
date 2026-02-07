import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'
import { router } from './routes/router'
import { ClassProvider } from './features/administration/classes/ClassContext'

/* 📖 # Why wrap RouterProvider with ClassProvider?
The ClassProvider needs to wrap the entire application to make class data
available to all routes. This maintains the existing context pattern while
adding routing capabilities.
*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClassProvider>
      <RouterProvider router={router} />
    </ClassProvider>
  </StrictMode>
)
