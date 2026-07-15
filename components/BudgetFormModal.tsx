import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Categoria, Presupuesto } from "@/types";

interface BudgetFormModalProps {
  categorias: Categoria[];
  existingBudgets: Presupuesto[];
  editingBudget?: Presupuesto | null;
  onSave: (budget: Partial<Presupuesto>) => Promise<void>;
  onClose: () => void;
}

export default function BudgetFormModal({
  categorias,
  existingBudgets,
  editingBudget,
  onSave,
  onClose,
}: BudgetFormModalProps) {
  const [categoriaId, setCategoriaId] = useState("");
  const [montoLimite, setMontoLimite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingBudget) {
      const updateState = () => {
        setCategoriaId(editingBudget.categoria_id);
        setMontoLimite(editingBudget.monto_limite.toString());
      };
      updateState();
    }
  }, [editingBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaId || !montoLimite) return;

    setIsSubmitting(true);
    try {
      await onSave({
        categoria_id: categoriaId,
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
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Categoría
          </label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            disabled={!!editingBudget} // No se puede cambiar la categoría editando
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow disabled:opacity-50"
          >
            <option value="" disabled>Selecciona una categoría de gasto</option>
            {availableCategorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
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
            disabled={isSubmitting || (!categoriaId && !editingBudget)}
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
