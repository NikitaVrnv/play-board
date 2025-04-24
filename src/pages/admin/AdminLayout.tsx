// src/pages/admin/AdminLayout.tsx
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  Gamepad2,
  Star,
  Users,
  BarChart,
  Settings,
} from 'lucide-react'

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  /* ──────────────── guard-rails ──────────────── */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const isAdmin = user?.role === 'admin'
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  /* ──────────────── nav links ──────────────── */
  const navLinks = [
    { to: '/admin',          label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/admin/games',    label: 'Games',     icon: <Gamepad2        className="h-5 w-5" /> },
    { to: '/admin/reviews',  label: 'Reviews',   icon: <Star            className="h-5 w-5" /> },
    { to: '/admin/users',    label: 'Users',     icon: <Users           className="h-5 w-5" /> },
    { to: '/admin/analytics',label: 'Analytics', icon: <BarChart        className="h-5 w-5" /> },
    { to: '/admin/settings', label: 'Settings',  icon: <Settings        className="h-5 w-5" /> },
  ]

  /* ──────────────── layout ──────────────── */
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* sidebar */}
      <aside className="w-64 bg-card border-r p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-1">
          {navLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
