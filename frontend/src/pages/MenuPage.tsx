import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getProducts } from '../services/products';
import { getCategories } from '../services/categories';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MenuPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div className="container-page section-padding">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-ember-600 dark:text-ember-500 mb-2">Nuestro menu</p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] mb-4">Todos los productos</h1>
        <p className="text-[var(--text-secondary)] max-w-lg">Explora nuestras pizzas, empanadas, bebidas y postres. Todo hecho en el dia.</p>
      </div>

      {/* Search + Filters toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pizzas, empanadas..."
            className="input-field !pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X size={16} />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="sm:hidden btn-secondary text-sm gap-2">
          <SlidersHorizontal size={16} /> Categorias
        </button>
      </div>

      <div className="flex gap-8">
        {/* Category sidebar */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-[var(--bg-primary)] p-6' : 'hidden'} sm:relative sm:block sm:w-48 lg:w-56 flex-shrink-0 animate-fade-up`} style={{ animationDelay: '0.15s' }}>
          {showFilters && (
            <div className="flex items-center justify-between mb-6 sm:hidden">
              <h3 className="font-bold text-lg">Categorias</h3>
              <button onClick={() => setShowFilters(false)} className="btn-icon"><X size={20} /></button>
            </div>
          )}
          <div className={`space-y-1 ${showFilters ? '' : 'sticky top-24'}`}>
            <button
              onClick={() => { setSelectedCategory(''); setShowFilters(false); }}
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
                onClick={() => { setSelectedCategory(cat.slug); setShowFilters(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.slug
                    ? 'bg-ember-500/10 text-ember-600 dark:text-ember-400 border border-ember-500/20'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {isLoading ? (
            <LoadingSpinner label="Cargando menu..." />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🔍</span>
              <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">Sin resultados</h3>
              <p className="text-[var(--text-muted)]">No encontramos productos con esos filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 stagger-children">
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
