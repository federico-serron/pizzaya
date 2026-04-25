import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { getProductBySlug } from '../services/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const foodEmojis: Record<string, string> = {
  pizza: '🍕', empanada: '🥟', bebida: '🥤', postre: '🍰',
  cerveza: '🍺', coca: '🥤', agua: '💧', limonada: '🍋',
  flan: '🍮', chaja: '🍰', volcan: '🧁', arroz: '🥣', docena: '📦',
};

function getEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [k, e] of Object.entries(foodEmojis)) { if (lower.includes(k)) return e; }
  return '🍽️';
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <div className="min-h-[60vh]"><LoadingSpinner label="Cargando producto..." /></div>;
  if (error || !product) return (
    <div className="container-page section-padding text-center">
      <span className="text-6xl block mb-4">🔍</span>
      <h1 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">Producto no encontrado</h1>
      <Link to="/menu" className="btn-primary mt-4">Ver menu</Link>
    </div>
  );

  const price = Number(product.price).toLocaleString('es-UY', { style: 'currency', currency: 'UYU' });
  const emoji = getEmoji(product.name);

  const handleAdd = () => {
    if (!isAuthenticated) return;
    addItem(product.id, product.name, Number(product.price), quantity);
  };

  return (
    <div className="container-page section-padding animate-fade-up">
      <Link to="/menu" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors">
        <ArrowLeft size={16} /> Volver al menu
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image area */}
          <div className="aspect-square bg-gradient-to-br from-ember-500/20 to-ember-700/20 rounded-[2rem] flex items-center justify-center">
            <span className="text-[120px] sm:text-[160px] select-none">{emoji}</span>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <div>
              {product.is_featured && (
                <span className="inline-flex items-center gap-1 bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  ⭐ Destacado
                </span>
              )}
              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--text-primary)] leading-tight mb-3">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-[var(--text-secondary)] leading-relaxed mb-6">{product.description}</p>
              )}
            </div>

            <div className="mb-8">
              <p className="text-xs text-[var(--text-muted)] mb-1">Precio</p>
              <p className="font-display font-black text-4xl sm:text-5xl text-ember-600 dark:text-ember-500">{price}</p>
            </div>

            {!product.is_available ? (
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-2xl p-4 text-center">
                <p className="font-semibold text-[var(--text-muted)]">Producto no disponible</p>
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Cantidad</span>
                  <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] rounded-xl p-1">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold text-[var(--text-primary)]">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <button onClick={handleAdd} className="btn-primary w-full !py-4 text-base gap-2">
                  <ShoppingCart size={20} /> Agregar al carrito — {(Number(product.price) * quantity).toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}
                </button>
              </div>
            ) : (
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-2xl p-5 text-center space-y-3">
                <p className="font-medium text-[var(--text-primary)]">Inicia sesion para pedir</p>
                <div className="flex gap-2 justify-center">
                  <Link to="/login" className="btn-ghost text-sm">Ingresar</Link>
                  <Link to="/register" className="btn-primary text-sm !py-2.5">Registrarse</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
