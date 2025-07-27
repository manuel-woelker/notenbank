import {
  createRouter,
  createRoute,
  createRootRoute, createHashHistory, redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {Layout} from "./layout/Layout.tsx";
import {SchülerTable} from "./schüler/SchülerTable.tsx";

const rootRoute = createRootRoute({
  component: () => (
      <>
        <Layout />
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
  loader: async () => {
    throw redirect({
      to: '/schuljahr/2023-2024/klasse/2a/fach/Deutsch',
    })
  },
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: function About() {
    return <div className="p-2">Hello from About!</div>
  },
});

export const schuljahrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schuljahr/$schuljahrId',
})

export const klasseRoute = createRoute({
  getParentRoute: () => schuljahrRoute,
  path: '/klasse/$klassenId',
})


export const fachRoute = createRoute({
  getParentRoute: () => klasseRoute,
  path: '/fach/$fachId',
  component: function About() {
    return <SchülerTable />;
  },
})


const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, schuljahrRoute, klasseRoute, fachRoute])

const hashHistory = createHashHistory();

export const router = createRouter({ routeTree, history: hashHistory })