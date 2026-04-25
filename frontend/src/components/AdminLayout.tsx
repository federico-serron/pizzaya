import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Menu, X, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-ember-500/10 text-ember-600 dark:text-ember-400 border border-ember-500/20'
      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
  }`;

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/products', icon: Package, label: 'Productos' },
    { to: '/admin/categories', icon: FolderTree, label: 'Categorias' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Ordenes' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)] sticky top-0 h-screen">
        <div className="p-6 border-b border-[var(--border)]">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <span className="font-display font-bold text-xl text-[var(--text-primary)]">
              Pizza<span className="text-ember-600 dark:text-ember-500">YA</span>
            </span>
          </Link>
          <p className="text-xs text-[var(--text-muted)] mt-1">Panel Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-ember-500/20 flex items-center justify-center text-xs font-bold text-ember-600 dark:text-ember-400">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.full_name}</p>
              <p className="text-xs text-[var(--text-muted)]">Admin</p>
            </div>
            <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
            <LogOut size={16} /> Cerrar sesion
          </button>
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ember-600 dark:text-ember-500 hover:bg-ember-500/10 transition-colors">
            <ArrowLeft size={16} /> Volver a la tienda
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-warm-950/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] animate-fade-up flex flex-col">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <span className="font-display font-bold text-xl text-[var(--text-primary)]">Pizza<span className="text-ember-600 dark:text-ember-500">YA</span></span>
              <button onClick={() => setSidebarOpen(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {links.map(({ to, icon: Icon, label, end }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} className={linkClass}>
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-[var(--border)] space-y-2">
              <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ember-600 dark:text-ember-500"><ArrowLeft size={16} /> Volver a la tienda</Link>
              <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] w-full"><LogOut size={16} /> Cerrar sesion</button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="btn-icon"><Menu size={20} /></button>
            <span className="font-display font-bold text-lg text-[var(--text-primary)]">
              Pizza<span className="text-ember-600 dark:text-ember-500">YA</span>
            </span>
          </div>
          <button onClick={toggleTheme} className="btn-icon">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
