import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
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

export default function CartPage() {
  const { items, totalItems, totalPrice, isLoading, updateItem, removeItem, emptyCart } = useCart();

  const totalFormatted = totalPrice.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' });

  if (isLoading) return <LoadingSpinner label="Cargando carrito..." />;

  return (
    <div className="container-page section-padding">
      <Link to="/menu" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 sm:mb-8 transition-colors">
        <ArrowLeft size={16} /> Seguir comprando
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-up">
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-[var(--text-primary)]">Tu Carrito</h1>
            <p className="text-[var(--text-muted)] text-xs sm:text-sm mt-1">{totalItems} productos</p>
          </div>
          {items.length > 0 && (
            <button onClick={emptyCart} className="btn-ghost text-xs sm:text-sm text-rose-600 dark:text-rose-400 gap-1.5 touch-target">
              <Trash2 size={15} /> Vaciar
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 sm:py-20 card animate-fade-up">
            <ShoppingBag size={48} className="sm:size-16 mx-auto text-[var(--text-muted)] mb-4 sm:mb-6" />
            <h2 className="font-display font-bold text-lg sm:text-xl text-[var(--text-primary)] mb-2">Carrito vacio</h2>
            <p className="text-[var(--text-muted)] text-sm mb-6">Agrega productos desde el menu para empezar tu pedido</p>
            <Link to="/menu" className="btn-primary">Ver menu</Link>
          </div>
        ) : (
          <div className="space-y-6 stagger-children">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="card p-3 sm:p-5 flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 md:w-14 sm:h-12 md:h-14 bg-ember-500/10 dark:bg-ember-500/20 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                    {getEmoji(item.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate text-sm sm:text-base">{item.name}</h3>
                    <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5">
                      ${Number(item.price).toLocaleString('es-UY')} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 order-last sm:order-none w-full sm:w-auto justify-between sm:justify-start mt-1 sm:mt-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button onClick={() => updateItem(item.product_id, item.quantity - 1)} className="w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors touch-target">
                        <Minus size={14} />
                      </button>
                      <span className="w-6 sm:w-8 text-center text-sm font-semibold text-[var(--text-primary)]">{item.quantity}</span>
                      <button onClick={() => updateItem(item.product_id, item.quantity + 1)} className="w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors touch-target">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right sm:text-right sm:w-20 md:w-28">
                      <p className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base">
                        ${(Number(item.price) * item.quantity).toLocaleString('es-UY')}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.product_id)} className="btn-icon text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 flex-shrink-0 touch-target">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="card p-5 sm:p-6 space-y-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between text-base sm:text-lg">
                <span className="font-semibold text-[var(--text-primary)]">Total</span>
                <span className="font-display font-bold text-xl sm:text-2xl text-ember-600 dark:text-ember-500">{totalFormatted}</span>
              </div>
              <Link to="/checkout" className="btn-primary w-full !py-3 sm:!py-3.5 text-sm sm:text-base gap-2 touch-target">
                Ir a pagar <ArrowRight size={18} />
              </Link>
              <p className="text-[10px] sm:text-xs text-[var(--text-muted)] text-center">Paga seguro con dlocalgo. Retira en nuestro local.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
