import { Link } from 'react-router-dom';
import type { CategoryResponse } from '../types';

const categoryIcons: Record<string, string> = {
  pizzas: '🍕',
  empanadas: '🥟',
  bebidas: '🥤',
  postres: '🍰',
};

export default function CategoryCard({ category }: { category: CategoryResponse }) {
  const icon = categoryIcons[category.slug] || '🍽️';

  return (
    <Link
      to={`/menu?category=${category.slug}`}
      className="card-interactive flex flex-col items-center justify-center p-4 sm:p-6 gap-2 sm:gap-3 text-center group"
    >
      <div className="text-2xl sm:text-3xl md:text-4xl transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-ember-600 dark:group-hover:text-ember-400 transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-[var(--text-muted)] text-[10px] sm:text-xs mt-0.5 line-clamp-1">{category.description}</p>
        )}
      </div>
    </Link>
  );
}
