import {RouterProvider} from "@tanstack/react-router";
import {router} from "./routing.tsx";



export function App() {

  return (
      <>
        <RouterProvider router={router} />
      </>
  )
}