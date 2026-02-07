/* 📖 # Why re-export RootLayout instead of deleting App.tsx?
The original App component has been replaced by TanStack Router infrastructure.
This file now simply re-exports RootLayout for backwards compatibility in case
there are any direct imports of App elsewhere in the codebase.
*/

export { RootLayout as default } from './routes/layouts/RootLayout'
