import { Ahorro } from "@/types";
import { Edit2, Trash2, PiggyBank, Plus, Minus } from "lucide-react";

interface AhorrosPanelProps {
  ahorros: Ahorro[];
  onEdit: (ahorro: Ahorro) => void;
  onDelete: (id: string) => void;
  onAporte: (ahorro: Ahorro) => void;
  onRetiro: (ahorro: Ahorro) => void;
}

export default function AhorrosPanel({ ahorros, onEdit, onDelete, onAporte, onRetiro }: AhorrosPanelProps) {
  if (ahorros.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-muted animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PiggyBank className="mx-auto mb-4 opacity-50" size={48} />
        <p className="text-lg font-medium">No tienes metas de ahorro</p>
        <p className="text-sm mt-2">Crea frascos separados para tus vacaciones, fondo de emergencia o compras especiales.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ahorros.map((ahorro) => {
        const hasObjetivo = ahorro.monto_objetivo && ahorro.monto_objetivo > 0;
        const percentage = hasObjetivo ? (ahorro.monto_actual / (ahorro.monto_objetivo as number)) * 100 : 0;
        const clampedPercentage = Math.min(percentage, 100);

        let barBg = "bg-primary";
        if (percentage >= 100) {
          barBg = "bg-emerald-500";
        }

        return (
          <div key={ahorro.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                  <PiggyBank size={18} className="text-primary" />
                  {ahorro.nombre}
                </h3>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(ahorro)}
                  className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  title="Editar meta"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Estás seguro de eliminar el frasco "${ahorro.nombre}"? Esto también borrará su historial de aportes y retiros.`)) {
                      onDelete(ahorro.id);
                    }
                  }}
                  className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  title="Eliminar frasco"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mb-4 flex-grow">
              {hasObjetivo ? (
                <>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold text-foreground">
                      ${ahorro.monto_actual.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm font-medium text-muted mb-1">
                      meta ${ahorro.monto_objetivo?.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${barBg}`} 
                      style={{ width: `${clampedPercentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className={`text-xs font-semibold ${percentage >= 100 ? 'text-emerald-500' : 'text-primary'}`}>
                      {percentage >= 100 ? '¡Meta alcanzada!' : `${percentage.toFixed(1)}% completado`}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full justify-center py-4">
                  <span className="text-sm font-medium text-muted mb-1">Monto acumulado</span>
                  <span className="text-3xl font-bold text-foreground">
                    ${ahorro.monto_actual.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border">
              <button
                onClick={() => onRetiro(ahorro)}
                className="flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors"
              >
                <Minus size={16} />
                Retirar
              </button>
              <button
                onClick={() => onAporte(ahorro)}
                className="flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Aportar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
