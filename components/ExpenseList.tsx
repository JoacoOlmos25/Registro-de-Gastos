import { ReceiptText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Transaction } from "@/types";

interface ExpenseListProps {
  transactions: Transaction[];
}

export default function ExpenseList({ transactions }: ExpenseListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 text-center">
        <p className="text-slate-400">No hay movimientos registrados.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-xl font-semibold text-emerald-400 mb-6 flex items-center gap-2">
        <ReceiptText size={24} />
        Últimos Movimientos
      </h2>

      <div className="space-y-4">
        {transactions.map((transaction) => {
          const isIncome = transaction.tipo === "ingreso";
          return (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-slate-200 font-medium flex items-center gap-2">
                  {transaction.descripcion}
                  {isIncome ? (
                    <ArrowUpRight size={16} className="text-emerald-400" />
                  ) : (
                    <ArrowDownRight size={16} className="text-slate-400" />
                  )}
                </span>
                <span className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs border border-slate-700 ${
                    isIncome ? "bg-emerald-900/30 text-emerald-300" : "bg-slate-800 text-slate-300"
                  }`}>
                    {transaction.categoria}
                  </span>
                  {transaction.fecha}
                </span>
              </div>
              
              <div className={`text-lg font-bold ${isIncome ? "text-emerald-400" : "text-slate-100"}`}>
                {isIncome ? "+" : "-"}${Number(transaction.monto).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
