import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './components/sections/AdminDashboard.jsx'
import PropertyDetailPage from './components/sections/PropertyDetailPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
