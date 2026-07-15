import { useState } from "react";
import { X, Trash2, Settings } from "lucide-react";
import { Categoria, GastoFijo } from "@/types";
import DeleteConfirmModal from "./DeleteConfirmModal";
import InactiveFixedExpenses from "./InactiveFixedExpenses";

interface SettingsModalProps {
  categorias: Categoria[];
  onClose: () => void;
  onDeleteCategory: (id: string) => void;
  userId: string | null;
  gastosInactivos: GastoFijo[];
  onReactivateFixedExpense: (id: string) => void;
  onDeleteFixedExpensePermanent: (id: string) => void;
}

export default function SettingsModal({ categorias, onClose, onDeleteCategory, userId, gastosInactivos, onReactivateFixedExpense, onDeleteFixedExpensePermanent }: SettingsModalProps) {
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string, name: string } | null>(null);

  // Solo mostrar categorías personalizadas (user_id !== null) y activas
  const customCategories = categorias.filter(c => c.user_id === userId && c.activa);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl bg-card rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2 text-foreground">
            <Settings size={20} />
            <h2 className="text-lg font-bold">Ajustes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto">
          <section>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
              Mis Categorías Personalizadas
            </h3>
            
            {customCategories.length === 0 ? (
              <p className="text-sm text-muted text-center py-6 bg-muted/30 rounded-lg border border-border border-dashed">
                No tienes categorías personalizadas activas.
              </p>
            ) : (
              <ul className="space-y-2">
                {customCategories.map(cat => (
                  <li key={cat.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border group">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">{cat.nombre}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${cat.tipo === 'ingreso' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                        {cat.tipo}
                      </span>
                    </div>
                    <button
                      onClick={() => setCategoryToDelete({ id: cat.id, name: cat.nombre })}
                      className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
              Suscripciones Canceladas
            </h3>
            <InactiveFixedExpenses
              gastosInactivos={gastosInactivos}
              onReactivate={onReactivateFixedExpense}
              onDeletePermanent={onDeleteFixedExpensePermanent}
            />
          </section>
        </div>
      </div>

      {categoryToDelete && (
        <DeleteConfirmModal
          transactionId={categoryToDelete.id}
          transactionDesc={`Categoría: ${categoryToDelete.name}`}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={async (id) => {
            await onDeleteCategory(id);
            setCategoryToDelete(null);
          }}
        />
      )}
    </div>
  );
}
