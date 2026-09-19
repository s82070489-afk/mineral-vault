import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileProvider, useUserAgent } from '@toss/tds-mobile'
import './index.css'
import App from './App.tsx'

function Root() {
  const userAgent = useUserAgent()

  return (
    <TDSMobileProvider userAgent={userAgent}>
      <App />
    </TDSMobileProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
