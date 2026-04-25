import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await register({ email, password, full_name: fullName, phone: phone || undefined });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Error al registrarse');
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
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">Crear Cuenta</h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">Unite a PizzaYA y pedi online</p>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Nombre completo</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input-field !pl-9 !py-2.5 text-sm" placeholder="Juan Perez" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field !pl-9 !py-2.5 text-sm" placeholder="tu@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Telefono (opcional)</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field !pl-9 !py-2.5 text-sm" placeholder="099123456" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Contrasena</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-field !pl-9 !py-2.5 text-sm" placeholder="Minimo 6 caracteres" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5 text-sm">
              {loading ? 'Creando cuenta...' : <><UserPlus size={17} /> Crear cuenta</>}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-5">
            ¿Ya tenes cuenta?{' '}
            <Link to="/login" className="text-ember-600 dark:text-ember-500 font-semibold hover:underline">Ingresa</Link>
          </p>
        </div>

        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mt-5 w-full justify-center transition-colors">
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
