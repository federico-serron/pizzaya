import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, totalItems, totalPrice, updateItem, removeItem, emptyCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  if (!isAuthenticated) return null;

  const formattedTotal = totalPrice.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' });

  const overlay = open && (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-warm-950/70"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 h-full w-full sm:max-w-sm bg-[var(--bg-secondary)] border-l border-[var(--border)] shadow-2xl flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-ember-500" />
            <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">Carrito</h2>
            {totalItems > 0 && (
              <span className="text-xs text-[var(--text-muted)]">({totalItems})</span>
            )}
          </div>
          <button onClick={() => setOpen(false)} className="btn-icon" aria-label="Cerrar carrito">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <span className="text-5xl sm:text-6xl">🛒</span>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Tu carrito esta vacio</p>
                <p className="text-[var(--text-muted)] text-sm mt-1">Agrega productos desde el menu</p>
              </div>
              <Link to="/menu" onClick={() => setOpen(false)} className="btn-primary text-sm">
                Ver menu
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--text-primary)] truncate">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      ${Number(item.price).toLocaleString('es-UY')} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateItem(item.product_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors">
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold text-[var(--text-primary)]">{item.quantity}</span>
                    <button onClick={() => updateItem(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors">
                      <Plus size={13} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.product_id)} className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-[var(--text-muted)] hover:text-rose-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--border)] p-4 sm:p-5 space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Total</span>
              <span className="font-display font-bold text-xl text-[var(--text-primary)]">{formattedTotal}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={emptyCart} className="btn-secondary !py-2.5 text-xs flex-1">Vaciar</button>
              <Link to="/checkout" onClick={() => setOpen(false)} className="btn-primary !py-2.5 text-sm flex-1 text-center">
                Ir a pagar
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative btn-icon"
        aria-label="Abrir carrito"
      >
        <ShoppingCart size={18} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-ember-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in shadow-lg shadow-ember-600/40">
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </button>

      {createPortal(overlay, document.body)}
    </>
  );
}
