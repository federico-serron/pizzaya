import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGetOrders, adminUpdateOrderStatus } from '../../services/admin';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusLabel: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'Preparando', ready: 'Listo', completed: 'Completado', cancelled: 'Cancelado' };

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', filter],
    queryFn: () => adminGetOrders(filter || undefined),
    staleTime: 10_000,
  });

  const orders = data?.data || [];

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminUpdateOrderStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Estado actualizado'); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || 'Error'),
  });

  if (isLoading) return <LoadingSpinner />;

  const filters = ['', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)]">Ordenes</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{orders.length} ordenes</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((f) => (
            <button key={f || 'all'} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filter === f ? 'bg-ember-500 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border)]'}`}>
              {f ? statusLabel[f] : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 card">
          <span className="text-5xl block mb-3">📋</span>
          <p className="text-[var(--text-muted)]">No hay ordenes con ese estado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="card p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-mono text-xs text-[var(--text-muted)]">#{order.id.slice(0, 8)}</p>
                    <span className="badge-pending" style={{ fontSize: '11px' }}>{statusLabel[order.status]}</span>
                    <span className={order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'} style={{ fontSize: '11px' }}>
                      {order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    ${Number(order.total).toLocaleString('es-UY')} · {order.items?.length || 0} items
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{new Date(order.created_at).toLocaleDateString('es-UY', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setSelected(selected?.id === order.id ? null : order)} className="btn-ghost text-xs"><Eye size={14} /> Ver</button>
                  {order.status === 'pending' && (
                    <button onClick={() => statusMut.mutate({ id: order.id, status: 'confirmed' })} className="btn-primary !py-1.5 !px-3 text-xs">Confirmar</button>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => statusMut.mutate({ id: order.id, status: 'preparing' })} className="btn-primary !py-1.5 !px-3 text-xs">Preparar</button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => statusMut.mutate({ id: order.id, status: 'ready' })} className="btn-primary !py-1.5 !px-3 text-xs">Listo</button>
                  )}
                  {order.status === 'ready' && (
                    <button onClick={() => statusMut.mutate({ id: order.id, status: 'completed' })} className="btn-primary !py-1.5 !px-3 text-xs">Completar</button>
                  )}
                  {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing') && (
                    <button onClick={() => { if (confirm('Cancelar orden?')) statusMut.mutate({ id: order.id, status: 'cancelled' }); }} className="btn-secondary !py-1.5 !px-3 text-xs !text-rose-600 dark:!text-rose-400">Cancelar</button>
                  )}
                </div>
              </div>

              {selected?.id === order.id && (
                <div className="mt-4 pt-4 border-t border-[var(--border)] animate-fade-in">
                  <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">{item.product_name} x{item.quantity}</span>
                        <span className="font-medium text-[var(--text-primary)]">${Number(item.subtotal).toLocaleString('es-UY')}</span>
                      </div>
                    ))}
                  </div>
                  {order.notes && <p className="text-xs text-[var(--text-muted)] mt-3"><strong>Notas:</strong> {order.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
