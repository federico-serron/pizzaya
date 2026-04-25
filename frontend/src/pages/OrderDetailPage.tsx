import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, FileText, MapPin } from 'lucide-react';
import { getOrder } from '../services/orders';
import LoadingSpinner from '../components/LoadingSpinner';

const statusBadge: Record<string, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  preparing: 'badge-preparing',
  ready: 'badge-ready',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const paymentBadge: Record<string, string> = {
  paid: 'badge-paid',
  pending: 'badge-unpaid',
  failed: 'badge-cancelled',
};

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo para retirar',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
    staleTime: 10_000,
  });

  const order = data;

  if (isLoading) return <div className="min-h-[60vh]"><LoadingSpinner label="Cargando pedido..." /></div>;
  if (error || !order) return (
    <div className="container-page section-padding text-center">
      <span className="text-6xl block mb-4">📋</span>
      <h1 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">Pedido no encontrado</h1>
      <Link to="/orders" className="btn-primary mt-4">Ver mis pedidos</Link>
    </div>
  );

  const totalFormatted = Number(order.total).toLocaleString('es-UY', { style: 'currency', currency: 'UYU' });

  return (
    <div className="container-page section-padding animate-fade-up">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors">
        <ArrowLeft size={16} /> Mis pedidos
      </Link>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Pedido</p>
              <h1 className="font-mono text-sm sm:text-base font-semibold text-[var(--text-primary)] break-all">#{order.id}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={statusBadge[order.status] || 'badge'}>{statusLabel[order.status] || order.status}</span>
              <span className={paymentBadge[order.payment_status] || 'badge'}>
                {order.payment_status === 'paid' ? 'Pagado' : order.payment_status === 'failed' ? 'Rechazado' : 'Pendiente'}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <Clock size={20} className="text-ember-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Fecha</p>
              <p className="font-medium text-sm text-[var(--text-primary)]">{new Date(order.created_at).toLocaleDateString('es-UY', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <FileText size={20} className="text-ember-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Items</p>
              <p className="font-medium text-sm text-[var(--text-primary)]">{order.items?.length || 0} productos</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <MapPin size={20} className="text-ember-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Retiro</p>
              <p className="font-medium text-sm text-[var(--text-primary)]">18 de Julio y Ejido</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card p-5 sm:p-6">
          <h2 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">Productos</h2>
          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🍕</span>
                  <div>
                    <p className="font-medium text-sm text-[var(--text-primary)]">{item.product_name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.quantity} x ${Number(item.unit_price).toLocaleString('es-UY')}</p>
                  </div>
                </div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">${Number(item.subtotal).toLocaleString('es-UY')}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-[var(--border)]">
            <span className="font-bold text-[var(--text-primary)]">Total</span>
            <span className="font-display font-bold text-xl text-ember-600 dark:text-ember-500">{totalFormatted}</span>
          </div>
        </div>

        {order.notes && (
          <div className="card p-5 sm:p-6">
            <h3 className="font-semibold text-sm text-[var(--text-secondary)] mb-1">Notas</h3>
            <p className="text-sm text-[var(--text-primary)]">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
