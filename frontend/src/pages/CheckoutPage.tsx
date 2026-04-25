import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orders';
import { createPayment } from '../services/payments';
import { ArrowLeft, ArrowRight, Clock, FileText, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalFormatted = totalPrice.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' });

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setError('');
    setLoading(true);
    try {
      const order = await createOrder({ notes: notes || undefined });

      try {
        await createPayment(order.id, 'UYU');
      } catch {
        // Payment creation may fail in sandbox, still redirect to order
      }

      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page section-padding text-center">
        <span className="text-5xl sm:text-6xl block mb-4">🛒</span>
        <h1 className="font-display font-bold text-xl sm:text-2xl text-[var(--text-primary)] mb-2">Carrito vacio</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">Agrega productos antes de hacer el pedido</p>
        <Link to="/menu" className="btn-primary">Ver menu</Link>
      </div>
    );
  }

  return (
    <div className="container-page section-padding">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 sm:mb-8 transition-colors">
        <ArrowLeft size={16} /> Volver al carrito
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-[var(--text-primary)] mb-2 animate-fade-up">Confirmar Pedido</h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-6 sm:mb-8 animate-fade-up">Revisa tu pedido antes de pagar</p>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
        )}

        {/* Stack vertically on mobile, side-by-side on md+ */}
        <div className="flex flex-col md:grid md:grid-cols-5 gap-4 sm:gap-6 stagger-children">
          {/* Order summary */}
          <div className="md:col-span-3 space-y-3 sm:space-y-4 order-2 md:order-1">
            <div className="card p-4 sm:p-6">
              <h2 className="font-display font-bold text-base sm:text-lg text-[var(--text-primary)] mb-3 sm:mb-4 flex items-center gap-2">
                <FileText size={18} className="sm:size-5 text-ember-500" /> Resumen del pedido
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-base sm:text-lg">🍕</span>
                      <div>
                        <p className="font-medium text-xs sm:text-sm text-[var(--text-primary)]">{item.name}</p>
                        <p className="text-[10px] sm:text-xs text-[var(--text-muted)]">{item.quantity} x ${Number(item.price).toLocaleString('es-UY')}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">${(Number(item.price) * item.quantity).toLocaleString('es-UY')}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-[var(--border)]">
                <span className="font-bold text-[var(--text-primary)] text-sm sm:text-base">Total</span>
                <span className="font-display font-bold text-lg sm:text-xl text-ember-600 dark:text-ember-500">{totalFormatted}</span>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <h2 className="font-display font-bold text-base sm:text-lg text-[var(--text-primary)] mb-3 sm:mb-4 flex items-center gap-2">
                <Clock size={18} className="sm:size-5 text-ember-500" /> Notas
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones especiales para tu pedido..."
                className="input-field !h-20 sm:!h-24 resize-none text-sm"
              />
            </div>
          </div>

          {/* Payment sidebar — on mobile, shows first to be immediately visible */}
          <div className="md:col-span-2 space-y-3 sm:space-y-4 order-1 md:order-2">
            <div className="card p-4 sm:p-6">
              <h2 className="font-display font-bold text-base sm:text-lg text-[var(--text-primary)] mb-3 sm:mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="sm:size-5 text-ember-500" /> Pago
              </h2>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] mb-4 sm:mb-6">
                <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Pago seguro con dlocalgo</div>
                <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Retira en nuestro local</div>
                <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> 18 de Julio y Ejido, Montevideo</div>
              </div>
              <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full !py-3 sm:!py-3.5 text-sm sm:text-base gap-2 touch-target">
                {loading ? 'Procesando...' : <><ShieldCheck size={18} /> Pagar con dlocalgo <ArrowRight size={18} /></>}
              </button>
              <p className="text-[10px] sm:text-xs text-[var(--text-muted)] text-center mt-2 sm:mt-3">Modo sandbox — no se realizaran cobros reales</p>
            </div>

            <div className="card p-3 sm:p-4 bg-[var(--bg-tertiary)] border-[var(--border)] text-[10px] sm:text-xs text-[var(--text-muted)]">
              <strong className="text-[var(--text-primary)]">Importante:</strong> Los pedidos son solo para retirar en nuestro local. No hacemos envios a domicilio.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
