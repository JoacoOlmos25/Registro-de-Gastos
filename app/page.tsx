"use client";

import { useState, useEffect } from "react";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import SummaryPanel from "@/components/SummaryPanel";
import AnalyticsView from "@/components/AnalyticsView";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Transaction } from "@/types";
import { ListTodo, PieChart, LogOut, Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type ViewMode = "operaciones" | "analisis";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>("operaciones");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Estado para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }

        const { data, error } = await supabase
          .from("movimientos")
          .select("*")
          .order("fecha", { ascending: false });

        if (error) {
          setTransactions([]);
        } else {
          setTransactions(data || []);
        }
      } catch {
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [supabase]);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id" | "creado_en">) => {
    if (!userId) return;

    try {
      // 1. Insert into Supabase with user_id
      const { data, error } = await supabase
        .from("movimientos")
        .insert([{ ...newTransaction, user_id: userId }])
        .select();

      if (error) {
        alert("Hubo un error al guardar el movimiento.");
        return;
      }

      // 2. Optimistic Update
      if (data && data.length > 0) {
        setTransactions((prev) => [data[0] as Transaction, ...prev]);
        // Cierra el modal automáticamente al éxito
        setIsModalOpen(false);
      }
    } catch {
      alert("Hubo un error al guardar el movimiento.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 relative transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Gestor de <span className="text-primary">Gastos</span>
            </h1>
            <p className="text-muted mt-2">
              Registra y controla tus finanzas personales de forma rápida y sencilla.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Selector de Vista (Tabs) */}
            <div className="flex bg-card rounded-lg p-1 border border-border">
              <button
                onClick={() => setCurrentView("operaciones")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "operaciones"
                    ? "bg-background text-foreground border border-border shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <ListTodo size={16} />
                Operaciones
              </button>
              <button
                onClick={() => setCurrentView("analisis")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "analisis"
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <PieChart size={16} />
                Análisis Gráfico
              </button>
            </div>

            <ThemeSwitcher />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-muted border border-border hover:bg-background hover:text-foreground transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-in fade-in duration-500">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium">Sincronizando con la base de datos...</p>
          </div>
        ) : (
          <>
            {/* Cabecera del área central (Trigger del Modal) */}
            {currentView === "operaciones" && (
              <div className="flex justify-start mb-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary/20"
                >
                  <Plus size={18} />
                  Nuevo Movimiento
                </button>
              </div>
            )}

            <section>
              <SummaryPanel transactions={transactions} />
            </section>

            {currentView === "operaciones" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 mt-6">
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

      {/* Contenedor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />
          {/* Formulario envuelto */}
          <div className="relative z-10 w-full max-w-2xl">
            <ExpenseForm 
              onAddTransaction={handleAddTransaction} 
              onClose={() => setIsModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </main>
  );
}
