import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppShell } from './components/AppShell'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ModulePage } from './pages/ModulePage'
import { GalleryPage } from './pages/GalleryPage'
import { AIPage } from './pages/AIPage'
import { SettingsPage } from './pages/SettingsPage'
import { ReviewPage } from './pages/ReviewPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { MusicPage } from './pages/MusicPage'
import { moduleRoutes } from './data/adminData'
import { useAdminStore } from './store/useAdminStore'

function PrivateRoutes() {
  const location = useLocation()
  const authed = useAdminStore((state) => state.authed)

  if (!authed) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/albums" element={<GalleryPage kind="albums" />} />
            <Route path="/files" element={<GalleryPage kind="files" />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            {moduleRoutes.map((item) => (
              <Route key={item.path} path={item.path} element={<ModulePage module={item} />} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<PrivateRoutes />} />
    </Routes>
  )
}
