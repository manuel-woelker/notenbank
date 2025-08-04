import "bulma/css/bulma.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {App} from './App.tsx'
import {VERSION} from "./util/version.ts";
import {DebugConsole} from "./views/debug/DebugConsole.tsx";


console.log("Starting Notenbank "+VERSION);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
      <DebugConsole />
    </StrictMode>,
)

