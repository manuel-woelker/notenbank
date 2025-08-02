import {createHashHistory, createRootRoute, createRoute, createRouter, Outlet, redirect,} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools'
import {Layout} from "./layout/Layout.tsx";
import {KlassenMenu} from './views/klasse/KlassenMenu.tsx';
import {NotFoundComponent} from "./layout/NotFoundComponent.tsx";
import {ErrorComponent} from "./util/ErrorComponent.tsx";
import {FachView} from "./views/fach/FachView.tsx";
import {SchülerView} from "./views/klasse/SchülerView.tsx";
import {FachLayout} from "./views/fach/FachLayout.tsx";
import {NotenfeststellungView} from "./views/notenfeststellung/NotenfeststellungView.tsx";
import {setNotenStoreRouteParams} from "./store/useNotenStore.ts";

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
      to: '/schuljahr/2023-2024/klasse/2a',
    })
  },
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'about',
  component: function About() {
    return <div className="p-2">Hello from About!</div>
  },
});

export const schuljahrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'schuljahr/$schuljahrId',
})

export const klasseRoute = createRoute({
  getParentRoute: () => schuljahrRoute,
  path: 'klasse/$klassenId',
  component: function Klasse() {
    return (<div className="columns">
      <div className="column is-3 ">
        <KlassenMenu />
      </div>
      <div className="column is-9">
        <Outlet />
      </div>
    </div>);
  }
});


export const schülerRoute = createRoute({
  getParentRoute: () => klasseRoute,
  path: '/',
  component: SchülerView,
})



export const fachRoute = createRoute({
  getParentRoute: () => klasseRoute,
  path: 'fach/$fachId',
  component: FachLayout,
})

export const fachÜbersichtRoute = createRoute({
  getParentRoute: () => fachRoute,
  path: '/',
  component: FachView,
})

export const notenFeststellungRoute = createRoute({
  getParentRoute: () => fachRoute,
  path: 'noten/$notenfeststellungId',
  component: NotenfeststellungView,
})


const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, schuljahrRoute, klasseRoute, schülerRoute, fachRoute, fachÜbersichtRoute, notenFeststellungRoute]);

const hashHistory = createHashHistory();

export const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultNotFoundComponent: NotFoundComponent,
  defaultErrorComponent: ErrorComponent,
});

export const getRouteParams = ():{
  schuljahrId: string,
  klassenId: string,
  fachId: string,
  notenfeststellungId: string,
} => {
  return router.__store.state.matches.at(-1)?.params ?? {};
}

router.subscribe("onLoad", () => {
  const routeParams = getRouteParams();
  setNotenStoreRouteParams(routeParams);
})