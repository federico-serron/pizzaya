import { useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, User, LogOut, Package, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CartDrawer from './CartDrawer';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'text-ember-500'
      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
  }`;

function NavUnderline({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  return <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-ember-500 rounded-full" />;
}

function MobileNavLink({ to, onClick, icon, label, delay }: { to: string; onClick: () => void; icon?: React.ReactNode; label: string; delay: number }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors touch-target"
      style={{ opacity: 0, animation: `staggerFade 0.5s ease-out ${delay}s forwards` }}
    >
      {icon}
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <span className="text-lg sm:text-2xl md:text-3xl transition-transform duration-300 group-hover:scale-110">🍕</span>
            <span className="font-display font-bold text-lg sm:text-xl md:text-2xl text-[var(--text-primary)] tracking-tight">
              Pizza<span className="text-ember-600 dark:text-ember-500">YA</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/menu" className={navLinkClass}>
              {({ isActive }) => <><NavUnderline isActive={isActive} />Menu</>}
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/orders" className={navLinkClass}>
                {({ isActive }) => <><NavUnderline isActive={isActive} /><Package size={15} className="inline mr-1.5" />Mis Pedidos</>}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                {({ isActive }) => <><NavUnderline isActive={isActive} /><Settings size={15} className="inline mr-1.5" />Admin</>}
              </NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn-icon"
              aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <CartDrawer />

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] rounded-xl px-3 py-1.5 border border-[var(--border)]">
                  <User size={14} className="text-ember-500" />
                  <span className="text-[var(--text-primary)] text-sm font-medium truncate max-w-[120px]">
                    {user?.full_name}
                  </span>
                </div>
                <button onClick={logout} className="btn-icon" aria-label="Cerrar sesion">
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Ingresar</Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">Registrarse</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn-icon touch-target"
              aria-label={mobileOpen ? 'Cerrar menu' : 'Abrir menu'}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu — slides down with staggered reveal */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="pb-6 pt-2 border-t border-[var(--border)]">
            <div className="space-y-1">
              <MobileNavLink to="/menu" onClick={() => setMobileOpen(false)} label="Menu" delay={0.08} />
              {isAuthenticated && (
                <MobileNavLink to="/orders" onClick={() => setMobileOpen(false)} icon={<Package size={16} />} label="Mis Pedidos" delay={0.13} />
              )}
              {isAdmin && (
                <MobileNavLink to="/admin" onClick={() => setMobileOpen(false)} icon={<Settings size={16} />} label="Admin" delay={0.18} />
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border)] px-4" style={{ opacity: 0, animation: `fadeIn 0.4s ease-out 0.23s forwards` }}>
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} className="text-ember-500" />
                    <span className="font-medium text-[var(--text-primary)]">{user?.full_name}</span>
                  </div>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-ember-600 dark:hover:text-ember-500 transition-colors py-2 touch-target">
                    <LogOut size={16} /> Cerrar sesion
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 !py-2.5 text-sm text-center touch-target">Ingresar</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 !py-2.5 text-sm text-center touch-target">Registrarse</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
