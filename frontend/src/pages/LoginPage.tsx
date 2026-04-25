import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="card p-6 sm:p-7">
          <div className="text-center mb-5">
            <span className="text-4xl block mb-2">🍕</span>
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">Iniciar Sesion</h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">Bienvenido de vuelta a PizzaYA</p>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field !pl-9 !py-2.5 text-sm" placeholder="tu@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Contrasena</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field !pl-9 !py-2.5 text-sm" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5 text-sm">
              {loading ? 'Ingresando...' : <><LogIn size={17} /> Ingresar</>}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-5">
            ¿No tenes cuenta?{' '}
            <Link to="/register" className="text-ember-600 dark:text-ember-500 font-semibold hover:underline">Registrate</Link>
          </p>
        </div>

        <div className="mt-5 p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-muted)] mb-2.5 text-center font-semibold uppercase tracking-wider">Datos de prueba</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center bg-[var(--bg-secondary)] rounded-xl py-2 px-2 border border-[var(--border)]">
              <p className="font-bold text-[var(--text-primary)]">Admin</p>
              <p className="text-[var(--text-muted)] break-all">admin@pizzaya.com.uy</p>
              <p className="text-[var(--text-muted)]">Admin123!</p>
            </div>
            <div className="text-center bg-[var(--bg-secondary)] rounded-xl py-2 px-2 border border-[var(--border)]">
              <p className="font-bold text-[var(--text-primary)]">Cliente</p>
              <p className="text-[var(--text-muted)] break-all">cliente@test.com</p>
              <p className="text-[var(--text-muted)]">Cliente123!</p>
            </div>
          </div>
        </div>

        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mt-5 w-full justify-center transition-colors">
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
