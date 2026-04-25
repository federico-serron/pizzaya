import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { ProductResponse } from '../types';

const foodEmojis: Record<string, string> = {
  pizza: '🍕',
  empanada: '🥟',
  bebida: '🥤',
  postre: '🍰',
  cerveza: '🍺',
  coca: '🥤',
  agua: '💧',
  limonada: '🍋',
  flan: '🍮',
  chaja: '🍰',
  volcan: '🧁',
  arroz: '🥣',
  docena: '📦',
};

function getEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(foodEmojis)) {
    if (lower.includes(key)) return emoji;
  }
  return '🍽️';
}

function getBgColor(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colors = [
    'from-ember-500/20 to-ember-700/20',
    'from-gold-500/20 to-gold-700/20',
    'from-rose-500/20 to-rose-700/20',
    'from-sky-500/20 to-sky-700/20',
    'from-emerald-500/20 to-emerald-700/20',
    'from-violet-500/20 to-violet-700/20',
  ];
  return colors[hash % colors.length];
}

export default function ProductCard({ product }: { product: ProductResponse }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAdd = () => {
    if (!isAuthenticated) return;
    addItem(product.id, product.name, Number(product.price), quantity);
    setQuantity(1);
  };

  const price = Number(product.price).toLocaleString('es-UY', { style: 'currency', currency: 'UYU' });

  return (
    <div className="card-interactive group relative flex flex-col">
      <Link to={`/menu/${product.slug}`} className="block">
        <div className={`relative h-32 sm:h-40 md:h-44 bg-gradient-to-br ${getBgColor(product.name)} flex items-center justify-center overflow-hidden`}>
          <span className="text-[2.5rem] sm:text-5xl md:text-6xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
            {getEmoji(product.name)}
          </span>
          {product.is_featured && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gold-400 text-gold-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
              <span className="text-xs">⭐</span> TOP
            </span>
          )}
          {!product.is_available && (
            <div className="absolute inset-0 bg-warm-950/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-warm-800 text-warm-200 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">No disponible</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link to={`/menu/${product.slug}`} className="block">
          <h3 className="font-semibold text-[var(--text-primary)] leading-snug group-hover:text-ember-600 dark:group-hover:text-ember-400 transition-colors line-clamp-1 text-sm sm:text-base">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-[var(--text-muted)] text-xs mt-1 line-clamp-2">{product.description}</p>
          )}
        </Link>

        <div className="mt-auto pt-2 sm:pt-3 flex items-center justify-between flex-wrap gap-2">
          <span className="font-display font-bold text-lg sm:text-xl text-ember-600 dark:text-ember-500">
            {price}
          </span>

          {isAuthenticated && product.is_available && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors touch-target"
                aria-label="Reducir cantidad"
              >
                <Minus size={11} />
              </button>
              <span className="text-xs font-semibold w-5 text-center text-[var(--text-primary)]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors touch-target"
                aria-label="Aumentar cantidad"
              >
                <Plus size={11} />
              </button>
              <button
                onClick={handleAdd}
                className="ml-1 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl bg-ember-600 hover:bg-ember-700 text-white transition-all duration-200 active:scale-90 shadow-lg shadow-ember-600/30 touch-target"
                aria-label="Agregar al carrito"
              >
                <ShoppingCart size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
