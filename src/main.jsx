import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { route } from './routes'
import { AppProvider } from './context/AppContext'
import { LanguageProvider } from './i18n/LanguageContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AppProvider>
        <RouterProvider router={route} />
      </AppProvider>
    </LanguageProvider>
  </StrictMode>,
)
