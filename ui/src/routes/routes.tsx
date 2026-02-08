import { createRootRoute, createRoute } from '@tanstack/react-router'
import { RootLayout } from './layouts/RootLayout'
import { Dashboard } from '../features/dashboard/Dashboard'
import { ClassList } from '../features/administration/classes/ClassList'
import { ClassStudentsRoute } from './components/ClassStudentsRoute'
import { ContentPage } from '../features/content/ContentPage'
import { UploadPage } from '../features/upload/UploadPage'

/* 📖 # Why use code-based routing instead of file-based?
The project follows a use-case-based folder structure (features/administration/classes/)
rather than a route-centric structure. Code-based routing provides explicit control
and better alignment with our existing architecture.
*/

export const rootRoute = createRootRoute({
  component: RootLayout,
})

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
})

export const classesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/classes',
  component: ClassList,
})

export const classStudentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/classes/$classId/students',
  component: ClassStudentsRoute,
})

export const contentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content',
  component: ContentPage,
})

export const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: UploadPage,
})
