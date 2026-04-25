import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Clock, ChevronRight } from 'lucide-react';
import { getOrders } from '../services/orders';
import LoadingSpinner from '../components/LoadingSpinner';

const statusBadge: Record<string, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  preparing: 'badge-preparing',
  ready: 'badge-ready',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => getOrders(1, 50),
    staleTime: 15_000,
  });

  const orders = data?.data || [];

  return (
    <div className="container-page section-padding animate-fade-up">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)] mb-2">Mis Pedidos</h1>
      <p className="text-[var(--text-secondary)] mb-8">Historial de tus pedidos en PizzaYA</p>

      {isLoading ? (
        <LoadingSpinner label="Cargando pedidos..." />
      ) : orders.length === 0 ? (
        <div className="text-center py-20 card">
          <Package size={64} className="mx-auto text-[var(--text-muted)] mb-6" />
          <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">Sin pedidos</h2>
          <p className="text-[var(--text-muted)] mb-6">Todavia no hiciste ningun pedido</p>
          <Link to="/menu" className="btn-primary">Ver menu</Link>
        </div>
      ) : (
        <div className="space-y-3 stagger-children max-w-3xl">
          {orders.map((order: any) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card-interactive p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-ember-500/10 dark:bg-ember-500/20 flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-ember-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xs text-[var(--text-muted)] truncate">#{order.id.slice(0, 8)}</p>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">
                    ${Number(order.total).toLocaleString('es-UY')} · {order.items?.length || 0} items
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={12} className="text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">{new Date(order.created_at).toLocaleDateString('es-UY', { dateStyle: 'medium' })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`${statusBadge[order.status] || 'badge'} hidden sm:inline-flex`}>{statusLabel[order.status] || order.status}</span>
                <ChevronRight size={18} className="text-[var(--text-muted)]" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
