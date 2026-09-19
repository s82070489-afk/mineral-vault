import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileProvider, useUserAgent } from '@toss/tds-mobile'
import { GameStateProvider } from './state/GameStateContext'
import './index.css'
import App from './App.tsx'

function Root() {
  const userAgent = useUserAgent()

  return (
    <TDSMobileProvider userAgent={userAgent}>
      <GameStateProvider>
        <App />
      </GameStateProvider>
    </TDSMobileProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
