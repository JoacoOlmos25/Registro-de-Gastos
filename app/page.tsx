"use client";

import { useState, useEffect } from "react";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import SummaryPanel from "@/components/SummaryPanel";
import AnalyticsView from "@/components/AnalyticsView";
import { Transaction } from "@/types";
import { ListTodo, PieChart } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ViewMode = "operaciones" | "analisis";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>("operaciones");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("movimientos")
          .select("*")
          .order("fecha", { ascending: false });

        if (error) {
          console.error("Error fetching transactions:", error);
        } else {
          setTransactions(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id" | "creado_en">) => {
    try {
      // 1. Insert into Supabase
      const { data, error } = await supabase
        .from("movimientos")
        .insert([newTransaction])
        .select();

      if (error) {
        console.error("Error inserting transaction:", error);
        alert("Hubo un error al guardar el movimiento.");
        return;
      }

      // 2. Optimistic Update (or updating with the returned DB object)
      if (data && data.length > 0) {
        setTransactions((prev) => [data[0] as Transaction, ...prev]);
      }
    } catch (err) {
      console.error("Unexpected error during insert:", err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
              Gestor de <span className="text-emerald-500">Gastos</span>
            </h1>
            <p className="text-slate-400 mt-2">
              Registra y controla tus finanzas personales de forma rápida y sencilla.
            </p>
          </div>

          {/* Selector de Vista (Tabs) */}
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 self-center md:self-auto">
            <button
              onClick={() => setCurrentView("operaciones")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "operaciones"
                  ? "bg-slate-700 text-slate-100 border border-slate-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <ListTodo size={16} />
              Operaciones
            </button>
            <button
              onClick={() => setCurrentView("analisis")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "analisis"
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <PieChart size={16} />
              Análisis Gráfico
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-slate-400 animate-pulse">Cargando base de datos...</p>
          </div>
        ) : (
          <>
            {/* Panel de Resumen siempre visible */}
            <section>
              <SummaryPanel transactions={transactions} />
            </section>

            {/* Vistas Condicionales */}
            {currentView === "operaciones" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <section>
                  <ExpenseForm onAddTransaction={handleAddTransaction} />
                </section>
                <section>
                  <ExpenseList transactions={transactions} />
                </section>
              </div>
            ) : (
              <section>
                <AnalyticsView transactions={transactions} />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
