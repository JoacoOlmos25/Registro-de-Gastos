import { GastoFijo } from "@/types";
import { RefreshCw, Trash2, Wallet } from "lucide-react";

interface InactiveFixedExpensesProps {
  gastosInactivos: GastoFijo[];
  onReactivate: (id: string) => void;
  onDeletePermanent?: (id: string) => void;
}

export default function InactiveFixedExpenses({
  gastosInactivos,
  onReactivate,
  onDeletePermanent,
}: InactiveFixedExpensesProps) {
  if (gastosInactivos.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-muted animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Wallet className="mx-auto mb-4 opacity-50" size={48} />
        <p className="text-lg font-medium">No hay servicios cancelados</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {gastosInactivos.map((gasto) => (
        <div
          key={gasto.id}
          className="bg-card border-2 border-border rounded-xl p-5 shadow-sm opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all relative group"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-foreground text-lg line-through">{gasto.nombre}</h3>
              <span className="text-xs text-muted uppercase tracking-wider">{gasto.categoria_nombre}</span>
            </div>
            {onDeletePermanent && (
              <button
                onClick={() => onDeletePermanent(gasto.id)}
                className="text-muted hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                title="Eliminar permanentemente"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="mb-4">
            <span className="text-2xl font-bold text-foreground">
              ${gasto.monto_estimado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-end mt-auto pt-4 border-t border-border">
            <button
              onClick={() => onReactivate(gasto.id)}
              className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
            >
              <RefreshCw size={16} />
              Reactivar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
