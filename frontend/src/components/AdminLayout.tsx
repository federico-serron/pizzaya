import { useState, useCallback, useEffect } from 'react';
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
  const [sidebarClosing, setSidebarClosing] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const closeSidebar = useCallback(() => {
    setSidebarClosing(true);
    setTimeout(() => {
      setSidebarOpen(false);
      setSidebarClosing(false);
    }, 300);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarClosing(false);
    setSidebarOpen(true);
  }, []);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

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
        <div className="p-5 lg:p-6 border-b border-[var(--border)]">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-xl lg:text-2xl">🍕</span>
            <span className="font-display font-bold text-lg lg:text-xl text-[var(--text-primary)]">
              Pizza<span className="text-ember-600 dark:text-ember-500">YA</span>
            </span>
          </Link>
          <p className="text-[10px] lg:text-xs text-[var(--text-muted)] mt-1">Panel Admin</p>
        </div>

        <nav className="flex-1 p-3 lg:p-4 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} style={{ minHeight: 44 }}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 lg:p-4 border-t border-[var(--border)] space-y-2 lg:space-y-3">
          <div className="flex items-center gap-2 lg:gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-ember-500/20 flex items-center justify-center text-xs font-bold text-ember-600 dark:text-ember-400">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.full_name}</p>
              <p className="text-[10px] lg:text-xs text-[var(--text-muted)]">Admin</p>
            </div>
            <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors touch-target">
            <LogOut size={16} /> Cerrar sesion
          </button>
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ember-600 dark:text-ember-500 hover:bg-ember-500/10 transition-colors touch-target">
            <ArrowLeft size={16} /> Volver a la tienda
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {(sidebarOpen || sidebarClosing) && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-warm-950/60 backdrop-blur-sm backdrop-base ${sidebarClosing ? 'opacity-0' : 'opacity-100 animate-backdrop-in'}`}
            onClick={closeSidebar}
          />
          {/* Sidebar slides from left */}
          <div
            className={`absolute left-0 top-0 h-full w-64 max-w-[85vw] bg-[var(--bg-secondary)] border-r border-[var(--border)] shadow-2xl flex flex-col drawer-base ${
              sidebarClosing ? '-translate-x-full' : 'translate-x-0 animate-slide-in-left'
            }`}
          >
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <span className="font-display font-bold text-lg text-[var(--text-primary)]">Pizza<span className="text-ember-600 dark:text-ember-500">YA</span></span>
              <button onClick={closeSidebar} className="btn-icon touch-target"><X size={18} /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {links.map(({ to, icon: Icon, label, end }) => (
                <NavLink key={to} to={to} end={end} onClick={closeSidebar} className={linkClass} style={{ minHeight: 44 }}>
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-[var(--border)] space-y-2">
              <Link to="/" onClick={closeSidebar} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ember-600 dark:text-ember-500 touch-target"><ArrowLeft size={16} /> Volver a la tienda</Link>
              <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] w-full touch-target"><LogOut size={16} /> Cerrar sesion</button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={openSidebar} className="btn-icon touch-target"><Menu size={20} /></button>
            <span className="font-display font-bold text-base sm:text-lg text-[var(--text-primary)]">
              Pizza<span className="text-ember-600 dark:text-ember-500">YA</span>
            </span>
          </div>
          <button onClick={toggleTheme} className="btn-icon touch-target">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
