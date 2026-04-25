import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts } from '../../services/products';
import { getCategories } from '../../services/categories';
import { adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '../../services/admin';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; product?: any }>({ open: false });
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', category_id: '', is_featured: false, is_available: true, image_url: '' });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => getProducts({ limit: 200 }),
  });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const products = productsData?.data || [];

  const createMut = useMutation({
    mutationFn: (data: any) => adminCreateProduct(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setModal({ open: false }); resetForm(); toast.success('Producto creado'); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || 'Error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminUpdateProduct(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setModal({ open: false }); resetForm(); toast.success('Producto actualizado'); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || 'Error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminDeleteProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Producto eliminado'); },
  });

  const resetForm = () => setForm({ name: '', slug: '', description: '', price: '', category_id: '', is_featured: false, is_available: true, image_url: '' });

  const openCreate = () => { resetForm(); setModal({ open: true }); };
  const openEdit = (product: any) => {
    setForm({ name: product.name, slug: product.slug, description: product.description || '', price: String(product.price), category_id: product.category_id, is_featured: product.is_featured, is_available: product.is_available, image_url: product.image_url || '' });
    setModal({ open: true, product });
  };

  const handleSubmit = () => {
    const payload = { ...form, price: parseFloat(form.price), is_featured: form.is_featured, is_available: form.is_available };
    if (modal.product) updateMut.mutate({ id: modal.product.id, data: payload });
    else createMut.mutate(payload);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)]">Productos</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{products.length} productos</p>
        </div>
        <button onClick={openCreate} className="btn-primary !py-2.5 text-sm gap-2"><Plus size={16} /> Nuevo producto</button>
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="pb-3 font-semibold text-[var(--text-secondary)]">Nombre</th>
              <th className="pb-3 font-semibold text-[var(--text-secondary)]">Categoria</th>
              <th className="pb-3 font-semibold text-[var(--text-secondary)]">Precio</th>
              <th className="pb-3 font-semibold text-[var(--text-secondary)]">Estado</th>
              <th className="pb-3 font-semibold text-[var(--text-secondary)] w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                <td className="py-3 font-medium text-[var(--text-primary)]">{p.name}</td>
                <td className="py-3 text-[var(--text-muted)]">{(categories || []).find((c: any) => c.id === p.category_id)?.name || '—'}</td>
                <td className="py-3 font-semibold text-[var(--text-primary)]">${Number(p.price).toLocaleString('es-UY')}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${p.is_available ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'}`}>
                      {p.is_available ? 'Disponible' : 'Agotado'}
                    </span>
                    {p.is_featured && <span className="text-[10px] bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300 px-2 py-0.5 rounded-full">⭐</span>}
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)} className="btn-icon"><Edit3 size={14} /></button>
                    <button onClick={() => { if (confirm('Eliminar producto?')) deleteMut.mutate(p.id); }} className="btn-icon text-rose-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-3">
        {products.map((p: any) => (
          <div key={p.id} className="card p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{p.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{(categories || []).find((c: any) => c.id === p.category_id)?.name} · ${Number(p.price).toLocaleString('es-UY')}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => openEdit(p)} className="btn-icon"><Edit3 size={14} /></button>
              <button onClick={() => { if (confirm('Eliminar?')) deleteMut.mutate(p.id); }} className="btn-icon text-rose-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-warm-950/60 backdrop-blur-sm" onClick={() => setModal({ open: false })} />
          <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">{modal.product ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={() => setModal({ open: false })} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Descripcion</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field !h-20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Precio (UYU)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Categoria</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
                    <option value="">Seleccionar...</option>
                    {(categories || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-ember-500 w-4 h-4" />
                  <span className="text-sm text-[var(--text-primary)]">Destacado ⭐</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="accent-ember-500 w-4 h-4" />
                  <span className="text-sm text-[var(--text-primary)]">Disponible</span>
                </label>
              </div>
              <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending} className="btn-primary w-full">
                {createMut.isPending || updateMut.isPending ? 'Guardando...' : modal.product ? 'Actualizar' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
