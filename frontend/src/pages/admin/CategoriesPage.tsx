import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategories } from '../../services/categories';
import { adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../services/admin';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; category?: any }>({ open: false });
  const [form, setForm] = useState({ name: '', slug: '', description: '', display_order: '0' });

  const { data, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: getCategories });

  const categories = data || [];

  const createMut = useMutation({
    mutationFn: (d: any) => adminCreateCategory(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setModal({ open: false }); resetForm(); toast.success('Categoria creada'); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || 'Error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminUpdateCategory(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setModal({ open: false }); resetForm(); toast.success('Categoria actualizada'); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || 'Error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminDeleteCategory(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Categoria eliminada'); },
    onError: (e: any) => toast.error(e?.response?.data?.detail || 'No se pudo eliminar'),
  });

  const resetForm = () => setForm({ name: '', slug: '', description: '', display_order: '0' });
  const openCreate = () => { resetForm(); setModal({ open: true }); };
  const openEdit = (cat: any) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', display_order: String(cat.display_order) });
    setModal({ open: true, category: cat });
  };

  const handleSubmit = () => {
    const payload = { ...form, display_order: parseInt(form.display_order) };
    if (modal.category) updateMut.mutate({ id: modal.category.id, data: payload });
    else createMut.mutate(payload);
  };

  if (isLoading) return <LoadingSpinner />;

  const catIcons: Record<string, string> = { Pizzas: '🍕', Empanadas: '🥟', Bebidas: '🥤', Postres: '🍰' };

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)]">Categorias</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{categories.length} categorias</p>
        </div>
        <button onClick={openCreate} className="btn-primary !py-2.5 text-sm gap-2"><Plus size={16} /> Nueva categoria</button>
      </div>

      <div className="space-y-3">
        {categories.map((cat: any) => (
          <div key={cat.id} className="card p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 bg-ember-500/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                {catIcons[cat.name] || '📁'}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)]">{cat.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">{cat.slug} · Orden: {cat.display_order}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => openEdit(cat)} className="btn-icon"><Edit3 size={14} /></button>
              <button onClick={() => { if (confirm('Eliminar categoria?')) deleteMut.mutate(cat.id); }} className="btn-icon text-rose-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-warm-950/60 backdrop-blur-sm" onClick={() => setModal({ open: false })} />
          <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">{modal.category ? 'Editar categoria' : 'Nueva categoria'}</h2>
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
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field !h-16 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Orden</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className="input-field" />
              </div>
              <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending} className="btn-primary w-full">
                {createMut.isPending || updateMut.isPending ? 'Guardando...' : modal.category ? 'Actualizar' : 'Crear categoria'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
