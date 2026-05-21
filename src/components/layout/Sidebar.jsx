import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  LayoutDashboard, Users, ArrowLeftRight, TrendingUp,
  Settings, Bell, LogOut, ShieldCheck, DollarSign,
} from 'lucide-react'

const NAV = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/users',         icon: Users,           label: 'Users'         },
  { to: '/transactions',  icon: ArrowLeftRight,  label: 'Transactions'  },
  { to: '/analytics',     icon: TrendingUp,      label: 'Analytics'     },
  { to: '/rates',         icon: DollarSign,      label: 'Exchange Rates'},
  { to: '/notifications', icon: Bell,            label: 'Notifications' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-navy-card border-r border-navy-border flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-navy-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
          <span className="text-navy font-black text-sm">S</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">Sendra</p>
          <p className="text-gold text-xs font-semibold tracking-wider mt-0.5">PRO ADMIN</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-navy-border space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
            <ShieldCheck size={15} className="text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.email}</p>
            <p className="text-slate-500 text-xs">Super Admin</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
