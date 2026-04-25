import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-warm-900 dark:bg-warm-950 border-t border-warm-800/50 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">🍕</span>
                <span className="font-display font-bold text-2xl text-white tracking-tight">
                  Pizza<span className="text-ember-500">YA</span>
                </span>
              </div>
              <p className="text-warm-400 text-sm leading-relaxed">
                Almuerzos en Montevideo, Uruguay. Las mejores pizzas y empanadas de la ciudad.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Navegar</h4>
              <ul className="space-y-2 text-sm text-warm-400">
                <li><a href="/menu" className="hover:text-ember-400 transition-colors">Menu</a></li>
                <li><a href="/login" className="hover:text-ember-400 transition-colors">Ingresar</a></li>
                <li><a href="/register" className="hover:text-ember-400 transition-colors">Registrarse</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Horarios</h4>
              <ul className="space-y-2 text-sm text-warm-400">
                <li>Lunes a Viernes</li>
                <li className="text-white font-medium">11:00 - 15:00</li>
                <li className="text-warm-500 text-xs mt-1">Sabados y Domingos cerrado</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contacto</h4>
              <ul className="space-y-2 text-sm text-warm-400">
                <li>Montevideo, Uruguay</li>
                <li>18 de Julio y Ejido</li>
                <li className="text-ember-400 font-medium">099 123 456</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-warm-800/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-warm-500 text-xs">
              &copy; {new Date().getFullYear()} PizzaYA. Todos los derechos reservados.
            </p>
            <p className="text-warm-600 text-xs">
              Hecho con 🍕 en Montevideo
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
