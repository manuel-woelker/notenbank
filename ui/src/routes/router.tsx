import { createRouter, createHashHistory } from '@tanstack/react-router'
import {
  rootRoute,
  dashboardRoute,
  classesRoute,
  classStudentsRoute,
  subjectOverviewRoute,
  assessmentRoute,
  contentRoute,
  uploadRoute,
} from './routes'

/* 📖 # Why use hash-based routing?
Hash routing is requested for environments where server-side rewrites
to index.html may not be available. This allows the application to work
in various deployment scenarios without server configuration.
*/

const hashHistory = createHashHistory()

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  classesRoute,
  classStudentsRoute,
  subjectOverviewRoute,
  assessmentRoute,
  contentRoute,
  uploadRoute,
])

export const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
