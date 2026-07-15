import { Transaction, Presupuesto, Categoria } from "@/types";
import { Edit2, Trash2, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

interface BudgetPanelProps {
  budgets: Presupuesto[];
  transactions: Transaction[];
  categorias: Categoria[];
  onEdit: (budget: Presupuesto) => void;
  onDelete: (id: string) => void;
}

export default function BudgetPanel({ budgets, transactions, categorias, onEdit, onDelete }: BudgetPanelProps) {
  if (budgets.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-muted animate-in fade-in slide-in-from-bottom-4 duration-500">
        <TrendingUp className="mx-auto mb-4 opacity-50" size={48} />
        <p className="text-lg font-medium">No hay presupuestos definidos</p>
        <p className="text-sm mt-2">Crea presupuestos para controlar tus gastos por categoría.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {budgets.map((budget) => {
        // Calcular lo gastado
        const consumed = transactions
          .filter(t => t.tipo === "gasto" && t.categoria_id === budget.categoria_id)
          .reduce((acc, t) => acc + Number(t.monto), 0);
        
        const percentage = budget.monto_limite > 0 ? (consumed / budget.monto_limite) * 100 : 0;
        
        let statusText = "Normal";
        let statusIcon = <CheckCircle2 size={16} className="text-emerald-500" />;
        let textColor = "text-emerald-600 dark:text-emerald-400";
        let barBg = "bg-emerald-500";

        // Umbrales exactos:
        // Menor al 80% consumido: Verde (Normal).
        // Entre 80% y 99% consumido: Amarillo (Alerta).
        // 100% o más: Rojo (Excedido).
        if (percentage >= 100) {
          statusText = "Excedido";
          statusIcon = <AlertCircle size={16} className="text-red-500" />;
          textColor = "text-red-600 dark:text-red-400";
          barBg = "bg-red-500";
        } else if (percentage >= 80) {
          statusText = "Alerta";
          statusIcon = <AlertCircle size={16} className="text-amber-500" />;
          textColor = "text-amber-600 dark:text-amber-400";
          barBg = "bg-amber-500";
        }

        const clampedPercentage = Math.min(percentage, 100);

        return (
          <div key={budget.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-foreground text-lg">{budget.categoria_nombre}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  {statusIcon}
                  <span className={`text-xs font-semibold uppercase tracking-wider ${textColor}`}>
                    {statusText}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(budget)}
                  className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  title="Editar presupuesto"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Estás seguro de eliminar este presupuesto?")) {
                      onDelete(budget.id);
                    }
                  }}
                  className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  title="Eliminar presupuesto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mb-2 flex justify-between items-end">
              <span className="text-2xl font-bold text-foreground">
                ${consumed.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-medium text-muted mb-1">
                de ${budget.monto_limite.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${barBg}`} 
                style={{ width: `${clampedPercentage}%` }}
              ></div>
            </div>
            <div className="mt-2 text-right">
              <span className={`text-xs font-medium ${textColor}`}>
                {percentage.toFixed(1)}% consumido
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
