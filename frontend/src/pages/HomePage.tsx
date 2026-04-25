import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, MapPin, Phone, Star, UtensilsCrossed } from 'lucide-react';
import { getFeaturedProducts } from '../services/products';
import { getCategories } from '../services/categories';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const { data: featured, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => getFeaturedProducts(8),
    staleTime: 60_000,
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 120_000,
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-warm-950 dark:bg-warm-950 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8 L33 25 L50 28 L33 31 L30 48 L27 31 L10 28 L27 25 Z' fill='white'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-ember-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-ember-700/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 mb-6 border border-white/10">
                <MapPin size={14} className="text-ember-400" />
                <span className="text-xs font-medium text-warm-200 tracking-wide">Montevideo, Uruguay</span>
              </div>

              <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mb-6 text-white">
                Pizza<span className="text-ember-500">YA</span>
              </h1>

              <p className="text-lg sm:text-xl text-warm-300 mb-3 font-body max-w-md">
                Almuerzos que saben a Montevideo
              </p>
              <p className="text-warm-400/80 leading-relaxed mb-8 max-w-lg text-sm sm:text-base">
                Las mejores pizzas al horno de barro, empanadas criollas y minutas de la ciudad.
                Pedi online y retira en nuestro local sin esperas.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link to="/menu" className="btn-primary !bg-ember-600 !text-white hover:!bg-ember-500 !shadow-lg !shadow-ember-600/40 gap-2 text-base !py-3.5 !px-8">
                  Ver menu <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn-secondary !bg-white/5 !text-white !border-white/20 hover:!bg-white/10 gap-2 text-base !py-3.5 !px-8">
                  Registrarme
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-ember-400" />
                  <span className="text-xs text-warm-400">Lun-Vie 11:00 - 15:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-ember-400" />
                  <span className="text-xs text-warm-400">Pedidos online 24/7</span>
                </div>
              </div>
            </div>

            {/* Hero visual — desktop only */}
            <div className="hidden lg:block relative animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-ember-600/30 to-ember-900/50 rounded-[3rem] rotate-3" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[180px] select-none drop-shadow-2xl">🍕</span>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold-500/20 rounded-3xl backdrop-blur border border-gold-500/30 flex items-center justify-center">
                  <UtensilsCrossed size={32} className="text-gold-400" />
                </div>
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-ember-500/20 rounded-2xl backdrop-blur border border-ember-500/30 flex items-center justify-center text-2xl">
                  ⭐
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="h-1 bg-gradient-to-r from-ember-600 via-gold-500 to-ember-600 opacity-80" />
      </section>

      {/* Featured Products */}
      <section className="container-page section-padding">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-ember-600 dark:text-ember-500 mb-2">Lo mas pedido</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] flex items-center gap-3">
              <Star size={28} className="text-gold-500" />
              Destacados
            </h2>
          </div>
          <Link to="/menu" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-ember-600 dark:text-ember-500 hover:underline underline-offset-4">
            Ver menu completo <ArrowRight size={15} />
          </Link>
        </div>

        {loadingFeatured ? (
          <LoadingSpinner label="Cargando productos..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 stagger-children">
            {featured?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Link to="/menu" className="btn-secondary text-sm">Ver todos los productos <ArrowRight size={15} /></Link>
        </div>
      </section>

      {/* Categories section */}
      <section className="bg-[var(--bg-tertiary)] border-y border-[var(--border)]">
        <div className="container-page section-padding">
          <div className="text-center mb-10 animate-fade-up">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-ember-600 dark:text-ember-500 mb-2">Nuestro menu</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">Categorias</h2>
          </div>
          {loadingCategories ? (
            <LoadingSpinner label="Cargando categorias..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 stagger-children">
              {categories?.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA — Pickup info */}
      <section className="container-page section-padding">
        <div className="relative bg-gradient-to-br from-ember-600 to-ember-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 lg:p-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='white'/%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="text-center lg:text-left animate-fade-up">
              <span className="text-5xl sm:text-6xl mb-4 block">🍕</span>
              <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-3">
                ¿Listo para pedir?
              </h2>
              <p className="text-white/70 text-base sm:text-lg mb-0 max-w-md">
                Elegi, paga online y retira sin esperas en nuestro local de 18 de Julio y Ejido.
              </p>
            </div>
            <div className="flex-shrink-0 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <Link to="/menu" className="btn-primary !bg-white !text-ember-700 hover:!bg-warm-50 !shadow-xl text-base !py-4 !px-10 inline-flex items-center gap-2">
                Pedir ahora <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info cards */}
      <section className="bg-[var(--bg-tertiary)] border-y border-[var(--border)]">
        <div className="container-page py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 stagger-children">
            {[
              { icon: MapPin, title: 'Montevideo', desc: 'Retira en nuestro local de 18 de Julio y Ejido. Sin delivery, solo pickup.' },
              { icon: Clock, title: 'Almuerzos', desc: 'Lunes a Viernes de 11:00 a 15:00. Sabados y domingos cerrado.' },
              { icon: Phone, title: 'Pedi Online', desc: 'Paga con dlocalgo desde la web y pasa a buscar tu pedido sin esperas.' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 sm:p-8">
                <div className="w-14 h-14 mx-auto mb-4 bg-ember-500/10 dark:bg-ember-500/20 rounded-2xl flex items-center justify-center">
                  <item.icon size={26} className="text-ember-600 dark:text-ember-500" />
                </div>
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
