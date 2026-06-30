"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, ChevronDown } from "lucide-react";
import { Transaction } from "@/types";

interface SummaryPanelProps {
  transactions: Transaction[];
}

export default function SummaryPanel({ transactions }: SummaryPanelProps) {
  const [showIncomeDetails, setShowIncomeDetails] = useState(false);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);

  // Totales
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.tipo === "ingreso")
      .reduce((acc, t) => acc + Number(t.monto), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.tipo === "gasto")
      .reduce((acc, t) => acc + Number(t.monto), 0);
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  // Agrupaciones
  const incomeByCategory = useMemo(() => {
    return transactions
      .filter((t) => t.tipo === "ingreso")
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.monto);
        return acc;
      }, {} as Record<string, number>);
  }, [transactions]);

  const expensesByCategory = useMemo(() => {
    return transactions
      .filter((t) => t.tipo === "gasto")
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.monto);
        return acc;
      }, {} as Record<string, number>);
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Tarjeta de Ingresos */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-400">Total Ingresos</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              ${totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-900 p-3 rounded-full border border-slate-700">
            <TrendingUp className="text-emerald-400" size={24} />
          </div>
        </div>

        {/* Botón Ver Detalle */}
        <button 
          onClick={() => setShowIncomeDetails(!showIncomeDetails)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors self-start mt-2"
        >
          Ver detalle
          <ChevronDown size={14} className={`transition-transform duration-200 ${showIncomeDetails ? "rotate-180" : ""}`} />
        </button>

        {/* Acordeón de Detalles (Ingresos) */}
        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${showIncomeDetails ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-2">
              {Object.entries(incomeByCategory).length > 0 ? (
                Object.entries(incomeByCategory).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 capitalize">{cat}</span>
                    <span className="text-emerald-400 font-medium">${amount.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No hay ingresos registrados</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de Gastos */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-400">Total Gastos</p>
            <p className="text-2xl font-bold text-slate-300 mt-1">
              ${totalExpense.toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-900 p-3 rounded-full border border-slate-700">
            <TrendingDown className="text-slate-400" size={24} />
          </div>
        </div>

        {/* Botón Ver Detalle */}
        <button 
          onClick={() => setShowExpenseDetails(!showExpenseDetails)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors self-start mt-2"
        >
          Ver detalle
          <ChevronDown size={14} className={`transition-transform duration-200 ${showExpenseDetails ? "rotate-180" : ""}`} />
        </button>

        {/* Acordeón de Detalles (Gastos) */}
        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${showExpenseDetails ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-2">
              {Object.entries(expensesByCategory).length > 0 ? (
                Object.entries(expensesByCategory).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 capitalize">{cat}</span>
                    <span className="text-slate-200 font-medium">${amount.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No hay gastos registrados</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de Balance */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Balance Actual</p>
            <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-emerald-400" : "text-slate-100"}`}>
              ${balance.toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-900 p-3 rounded-full border border-slate-700">
            <Wallet className="text-emerald-500" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
