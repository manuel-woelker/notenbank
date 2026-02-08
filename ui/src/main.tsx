import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'
import { router } from './routes/router'
import { ClassStoreProvider } from './features/administration/classes/ClassStore'

/* 📖 # Why wrap RouterProvider with ClassStoreProvider?
The ClassStoreProvider loads class data once at app startup so it is available
to all routes without needing per-page data fetching.
*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClassStoreProvider>
      <RouterProvider router={router} />
    </ClassStoreProvider>
  </StrictMode>
)
