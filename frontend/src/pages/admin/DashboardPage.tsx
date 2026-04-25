import { useQuery } from '@tanstack/react-query';
import { Package, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { getDashboardStats } from '../../services/admin';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getDashboardStats,
    staleTime: 15_000,
  });

  const cards = [
    { label: 'Pedidos hoy', value: stats?.orders_today ?? '-', icon: Package, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Ingresos hoy', value: stats?.revenue_today != null ? `$UYU ${Number(stats.revenue_today).toLocaleString('es-UY')}` : '-', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pendientes', value: stats?.pending_orders ?? '-', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Productos', value: '—', icon: TrendingUp, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="animate-fade-up">
      <h1 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-[var(--text-primary)] mb-2">Dashboard</h1>
      <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-6 sm:mb-8">Resumen del dia en PizzaYA</p>

      {isLoading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
          {cards.map(({ label, value, icon: Icon, color, bg }, i) => (
            <div key={i} className="card p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={18} className={`sm:size-5 ${color}`} />
                </div>
              </div>
              <p className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-[var(--text-primary)]">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
