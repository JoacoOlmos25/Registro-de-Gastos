import { GastoFijo } from "@/types";
import { getExpirationStatus } from "@/utils/expenseStatus";
import { CheckCircle2, CircleDashed, Clock, Trash2, Wallet, Edit2 } from "lucide-react";
import { useState } from "react";

interface FixedExpensesListProps {
  gastosFijos: GastoFijo[];
  paidGastoFijoIds: string[];
  onPay: (gasto: GastoFijo) => void;
  onDelete: (id: string) => void;
  onEdit?: (gasto: GastoFijo) => void;
}

export default function FixedExpensesList({
  gastosFijos,
  paidGastoFijoIds,
  onPay,
  onDelete,
  onEdit,
}: FixedExpensesListProps) {
  const [payingId, setPayingId] = useState<string | null>(null);

  const handlePay = async (gasto: GastoFijo) => {
    setPayingId(gasto.id);
    try {
      await onPay(gasto);
    } finally {
      setPayingId(null);
    }
  };

  if (gastosFijos.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-muted animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Wallet className="mx-auto mb-4 opacity-50" size={48} />
        <p className="text-lg font-medium">No hay gastos fijos registrados</p>
        <p className="text-sm mt-2">Agrega tus suscripciones y servicios para llevar un mejor control.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {gastosFijos.map((gasto) => {
        const isPaid = paidGastoFijoIds.includes(gasto.id);
        const status = getExpirationStatus(gasto.dia_vencimiento, isPaid);

        // Clases dinámicas según estado
        const borderColors = {
          verde: "border-emerald-500/50",
          amarillo: "border-amber-500/50",
          rojo: "border-red-500/50",
          bordo: "border-rose-800/50",
          azul: "border-blue-500/50",
        };

        const bgColors = {
          verde: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          amarillo: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          rojo: "bg-red-500/10 text-red-600 dark:text-red-400",
          bordo: "bg-rose-800/10 text-rose-800 dark:text-rose-400",
          azul: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        };

        return (
          <div
            key={gasto.id}
            className={`bg-card border-2 ${borderColors[status.color]} rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-foreground text-lg">{gasto.nombre}</h3>
                <span className="text-xs text-muted uppercase tracking-wider">{gasto.categoria_nombre}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(gasto)}
                    className="text-muted hover:text-primary transition-colors p-1"
                    title="Editar gasto fijo"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => onDelete(gasto.id)}
                  className="text-muted hover:text-red-500 transition-colors p-1"
                  title="Eliminar gasto fijo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-2xl font-bold text-foreground">
                ${gasto.monto_estimado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bgColors[status.color]}`}>
                {isPaid ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                {status.texto}
              </div>

              {!isPaid && (
                <button
                  onClick={() => handlePay(gasto)}
                  disabled={payingId === gasto.id}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {payingId === gasto.id ? (
                    <>
                      <CircleDashed className="animate-spin" size={16} />
                      Pagando...
                    </>
                  ) : (
                    <>
                      <Wallet size={16} />
                      Pagar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
