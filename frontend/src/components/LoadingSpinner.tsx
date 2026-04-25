export default function LoadingSpinner({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-[var(--border)] rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-ember-500 rounded-full animate-spin" />
      </div>
      <p className="text-sm text-[var(--text-muted)] font-medium">{label}</p>
    </div>
  );
}
