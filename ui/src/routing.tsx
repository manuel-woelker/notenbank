import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute, createHashHistory,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {Layout} from "./layout/Layout.tsx";

const rootRoute = createRootRoute({
  component: () => (
      <>
        <Layout />
        <Outlet />
        <TanStackRouterDevtools />
      </>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return (
        <div className="p-2">
          <h3>Welcome Home!</h3>
        </div>
    )
  },
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: function About() {
    return <div className="p-2">Hello from About!</div>
  },
})

export const fachRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/fach/$fachName',
  component: function About() {
    const { fachName } = fachRoute.useParams();
    return <div className="p-2">Hello {fachName} </div>
  },
})


const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, fachRoute])

const hashHistory = createHashHistory();

export const router = createRouter({ routeTree, history: hashHistory })