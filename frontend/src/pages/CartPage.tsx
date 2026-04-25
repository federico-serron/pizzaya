import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CartPage() {
  const { items, totalItems, totalPrice, isLoading, updateItem, removeItem, emptyCart } = useCart();

  const totalFormatted = totalPrice.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' });

  if (isLoading) return <LoadingSpinner label="Cargando carrito..." />;

  return (
    <div className="container-page section-padding">
      <Link to="/menu" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors">
        <ArrowLeft size={16} /> Seguir comprando
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)]">Tu Carrito</h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">{totalItems} productos</p>
          </div>
          {items.length > 0 && (
            <button onClick={emptyCart} className="btn-ghost text-sm text-rose-600 dark:text-rose-400 gap-1.5">
              <Trash2 size={15} /> Vaciar
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 card animate-fade-up">
            <ShoppingBag size={64} className="mx-auto text-[var(--text-muted)] mb-6" />
            <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">Carrito vacio</h2>
            <p className="text-[var(--text-muted)] mb-6">Agrega productos desde el menu para empezar tu pedido</p>
            <Link to="/menu" className="btn-primary">Ver menu</Link>
          </div>
        ) : (
          <div className="space-y-6 stagger-children">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="card p-4 sm:p-5 flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-ember-500/10 dark:bg-ember-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    🍕
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate text-sm sm:text-base">{item.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      ${Number(item.price).toLocaleString('es-UY')} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateItem(item.product_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-[var(--text-primary)]">{item.quantity}</span>
                    <button onClick={() => updateItem(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right flex-shrink-0 w-24 sm:w-28">
                    <p className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base">
                      ${(Number(item.price) * item.quantity).toLocaleString('es-UY')}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.product_id)} className="btn-icon text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="card p-6 space-y-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-[var(--text-primary)]">Total</span>
                <span className="font-display font-bold text-2xl text-ember-600 dark:text-ember-500">{totalFormatted}</span>
              </div>
              <Link to="/checkout" className="btn-primary w-full !py-3.5 text-base gap-2">
                Ir a pagar <ArrowRight size={18} />
              </Link>
              <p className="text-xs text-[var(--text-muted)] text-center">Paga seguro con dlocalgo. Retira en nuestro local.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
