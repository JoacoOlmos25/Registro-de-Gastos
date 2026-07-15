import { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { Categoria, Presupuesto } from "@/types";
import CategorySelectorWithCreate, { CategorySelectorRef } from "./CategorySelectorWithCreate";

interface BudgetFormModalProps {
  categorias: Categoria[];
  existingBudgets: Presupuesto[];
  editingBudget?: Presupuesto | null;
  onSave: (budget: Partial<Presupuesto>) => Promise<void>;
  onClose: () => void;
  userId: string | null;
  onCategoryAdded: (cat: Categoria) => void;
}

export default function BudgetFormModal({
  categorias,
  existingBudgets,
  editingBudget,
  onSave,
  onClose,
  userId,
  onCategoryAdded,
}: BudgetFormModalProps) {
  const [montoLimite, setMontoLimite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categorySelectorRef = useRef<CategorySelectorRef>(null);

  useEffect(() => {
    if (editingBudget) {
      const updateState = () => {
        setMontoLimite(editingBudget.monto_limite.toString());
      };
      updateState();
    }
  }, [editingBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!montoLimite) return;

    setIsSubmitting(true);
    try {
      // Si estamos editando, mantenemos la categoría existente (está bloqueada en la UI).
      // Si estamos creando, usamos el componente CategorySelectorWithCreate.
      const catId = editingBudget 
        ? editingBudget.categoria_id 
        : await categorySelectorRef.current?.getSelectedCategoryId();

      if (!catId) return;

      await onSave({
        categoria_id: catId,
        monto_limite: parseFloat(montoLimite),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Borrado Lógico: Solo categorías activas
  // 2. Prevención de Duplicados: Excluir categorías que ya tienen presupuesto (a menos que estemos editando ESE presupuesto)
  const existingCategoryIds = existingBudgets.map(b => b.categoria_id);
  const availableCategorias = categorias.filter(c => 
    c.activa && 
    (c.tipo === 'gasto') && 
    (!existingCategoryIds.includes(c.id) || (editingBudget && editingBudget.categoria_id === c.id))
  );

  return (
    <div className="bg-card rounded-2xl shadow-xl overflow-hidden w-full max-w-md animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">
          {editingBudget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted text-muted transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className={editingBudget ? "opacity-50 pointer-events-none" : ""}>
          {editingBudget ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Categoría
              </label>
              <select disabled className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none appearance-none">
                <option>{categorias.find(c => c.id === editingBudget.categoria_id)?.nombre}</option>
              </select>
            </div>
          ) : (
            <CategorySelectorWithCreate
              ref={categorySelectorRef}
              categorias={availableCategorias}
              tipo="gasto"
              userId={userId}
              onCategoryAdded={onCategoryAdded}
            />
          )}
          {availableCategorias.length === 0 && !editingBudget && (
            <p className="text-xs text-amber-500 mt-1">
              No hay categorías de gasto disponibles para asignar presupuesto.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Monto Límite
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={montoLimite}
              onChange={(e) => setMontoLimite(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-lg pl-8 pr-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="Ej: 50000"
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!editingBudget && availableCategorias.length === 0)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
