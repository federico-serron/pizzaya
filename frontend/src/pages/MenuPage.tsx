import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getProducts } from '../services/products';
import { getCategories } from '../services/categories';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const categoryEmojis: Record<string, string> = {
  pizzas: '🍕',
  empanadas: '🥟',
  bebidas: '🥤',
  postres: '🍰',
};

export default function MenuPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 120_000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, search],
    queryFn: () => getProducts({ category_slug: selectedCategory || undefined, search: search || undefined, limit: 100 }),
    staleTime: 30_000,
  });

  const products = data?.data || [];

  const closeDrawer = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setDrawerOpen(false);
      setDrawerClosing(false);
    }, 300);
  }, []);

  const selectCategory = useCallback((slug: string) => {
    setSelectedCategory(slug);
    closeDrawer();
  }, [closeDrawer]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close drawer on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && drawerOpen) closeDrawer(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [drawerOpen, closeDrawer]);

  const renderFilterButton = (slug: string, label: string, emoji?: string) => (
    <button
      key={slug}
      onClick={() => setSelectedCategory(slug)}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 touch-target ${
        selectedCategory === slug
          ? 'bg-ember-500 text-white shadow-lg shadow-ember-500/25'
          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)]'
      }`}
    >
      {emoji && <span className="text-sm">{emoji}</span>}
      {label}
    </button>
  );

  return (
    <div className="container-page section-padding">
      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-fade-up">
        <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-ember-600 dark:text-ember-500 mb-2">Nuestro menu</p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[var(--text-primary)] mb-3 sm:mb-4">Todos los productos</h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-lg">Explora nuestras pizzas, empanadas, bebidas y postres. Todo hecho en el dia.</p>
      </div>

      {/* Search + Filters toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <Search size={16} className="sm:size-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pizzas, empanadas..."
            className="input-field !pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] touch-target">
              <X size={16} />
            </button>
          )}
        </div>
        {/* Mobile filter toggle button */}
        <button onClick={() => setDrawerOpen(true)} className="lg:hidden btn-secondary text-sm gap-2 touch-target">
          <SlidersHorizontal size={16} /> Categorias
        </button>
      </div>

      {/* === TABLET: Horizontal scrollable filter bar (md: 768px to lg: 1024px) === */}
      <div className="hidden md:flex lg:hidden scroll-container scrollbar-hide mb-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        {renderFilterButton('', 'Todos')}
        {categories?.map((cat) => renderFilterButton(cat.slug, cat.name, categoryEmojis[cat.slug]))}
      </div>

      <div className="flex gap-6 lg:gap-8">
        {/* === DESKTOP: Category sidebar (lg: 1024px+) === */}
        <aside className="hidden lg:block w-48 xl:w-56 flex-shrink-0 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="sticky top-24 space-y-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                !selectedCategory
                  ? 'bg-ember-500/10 text-ember-600 dark:text-ember-400 border border-ember-500/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              Todos
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.slug
                    ? 'bg-ember-500/10 text-ember-600 dark:text-ember-400 border border-ember-500/20'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <span className="mr-2">{categoryEmojis[cat.slug] || '🍽️'}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* === MOBILE: Slide-in drawer overlay (below md) === */}
        {(drawerOpen || drawerClosing) && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className={`absolute inset-0 bg-warm-950/60 backdrop-blur-sm backdrop-base ${drawerClosing ? 'opacity-0' : 'opacity-100 animate-backdrop-in'}`}
              onClick={closeDrawer}
            />

            {/* Drawer slides from left */}
            <div
              className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-[var(--bg-secondary)] border-r border-[var(--border)] shadow-2xl overflow-y-auto drawer-base ${
                drawerClosing ? '-translate-x-full' : 'translate-x-0 animate-slide-in-left'
              }`}
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">Categorias</h3>
                <button onClick={closeDrawer} className="btn-icon touch-target"><X size={18} /></button>
              </div>
              <div className="p-4 space-y-1">
                <button
                  onClick={() => selectCategory('')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 touch-target ${
                    !selectedCategory
                      ? 'bg-ember-500/10 text-ember-600 dark:text-ember-400 border border-ember-500/20'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  Todos
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.slug)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 touch-target ${
                      selectedCategory === cat.slug
                        ? 'bg-ember-500/10 text-ember-600 dark:text-ember-400 border border-ember-500/20'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <span className="mr-2">{categoryEmojis[cat.slug] || '🍽️'}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <LoadingSpinner label="Cargando menu..." />
          ) : products.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <span className="text-5xl sm:text-6xl block mb-4">🔍</span>
              <h3 className="font-display font-bold text-lg sm:text-xl text-[var(--text-primary)] mb-2">Sin resultados</h3>
              <p className="text-[var(--text-muted)] text-sm">No encontramos productos con esos filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 stagger-children">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
