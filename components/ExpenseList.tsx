import { ReceiptText, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import { Transaction } from "@/types";

interface ExpenseListProps {
  transactions: Transaction[];
  onDeleteRequest?: (id: string, desc: string) => void;
}

export default function ExpenseList({ transactions, onDeleteRequest }: ExpenseListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl shadow-lg border border-border text-center">
        <p className="text-muted">No hay movimientos registrados.</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
      <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
        <ReceiptText size={24} />
        Últimos Movimientos
      </h2>

      <div className="space-y-4">
        {transactions.map((transaction) => {
          const isIncome = transaction.tipo === "ingreso";
          return (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-foreground font-medium flex items-center gap-2">
                  {transaction.descripcion}
                  {isIncome ? (
                    <ArrowUpRight size={16} className="text-primary" />
                  ) : (
                    <ArrowDownRight size={16} className="text-muted" />
                  )}
                </span>
                <span className="text-sm text-muted flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs border border-border ${
                    isIncome ? "bg-primary/10 text-primary" : "bg-card text-muted"
                  }`}>
                    {transaction.categoria}
                  </span>
                  {transaction.fecha}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`text-lg font-bold ${isIncome ? "text-primary" : "text-foreground"}`}>
                  {isIncome ? "+" : "-"}${Number(transaction.monto).toFixed(2)}
                </div>
                {onDeleteRequest && (
                  <button
                    onClick={() => onDeleteRequest(transaction.id, transaction.descripcion || "Movimiento sin descripción")}
                    className="p-2 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Borrar movimiento"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
