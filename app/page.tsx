"use client";

import { useState, useEffect } from "react";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import SummaryPanel from "@/components/SummaryPanel";
import AnalyticsView from "@/components/AnalyticsView";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Transaction, Categoria, GastoFijo, Presupuesto } from "@/types";
import { ListTodo, PieChart, LogOut, Loader2, Plus, Calendar, Settings, TrendingUp, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import TransactionFilters from "@/components/TransactionFilters";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import FixedExpensesList from "@/components/FixedExpensesList";
import AddFixedExpenseForm from "@/components/AddFixedExpenseForm";
import SettingsModal from "@/components/SettingsModal";
import BudgetPanel from "@/components/BudgetPanel";
import BudgetFormModal from "@/components/BudgetFormModal";
import { exportTransactionsToCSV } from "@/utils/csvExport";

type ViewMode = "operaciones" | "analisis" | "gastos_fijos" | "presupuestos";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>("operaciones");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Estado para los filtros de Operaciones
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<"ingreso" | "gasto" | null>(null);
  
  // Estados para Gastos Fijos
  const [gastosFijos, setGastosFijos] = useState<GastoFijo[]>([]);
  const [paidGastoFijoIds, setPaidGastoFijoIds] = useState<string[]>([]);
  const [isFixedExpenseModalOpen, setIsFixedExpenseModalOpen] = useState(false);
  const [isAddingFixedExpense, setIsAddingFixedExpense] = useState(false);

  // Estados para Presupuestos
  const [budgets, setBudgets] = useState<Presupuesto[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Presupuesto | null>(null);

  // Estado para el Modal de Ajustes
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Estado para el Modal de Operaciones
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<{id: string, desc: string} | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      const { data: categoriasData } = await supabase
        .from("categorias")
        .select("*")
        .order("nombre", { ascending: true });
      if (categoriasData) {
        setCategorias(categoriasData);
      }
    };
    fetchInitialData();
  }, [supabase]);

  // Fetch transactions (con filtros)
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("movimientos")
          .select("*, categorias(nombre)")
          .order("fecha", { ascending: false });

        if (debouncedSearchQuery) {
          query = query.ilike("descripcion", `%${debouncedSearchQuery}%`);
        }

        if (selectedCategories.length > 0) {
          query = query.in("categoria_id", selectedCategories);
        }

        if (selectedTipo) {
          query = query.eq("tipo", selectedTipo);
        }

        if (selectedYear !== null) {
          const m = selectedMonth !== null ? selectedMonth : null;
          if (m !== null) {
            const startDate = new Date(selectedYear, m - 1, 1).toISOString().split('T')[0];
            const endDate = new Date(selectedYear, m, 0).toISOString().split('T')[0];
            query = query.gte("fecha", startDate).lte("fecha", endDate);
          } else {
            const startDate = new Date(selectedYear, 0, 1).toISOString().split('T')[0];
            const endDate = new Date(selectedYear, 11, 31).toISOString().split('T')[0];
            query = query.gte("fecha", startDate).lte("fecha", endDate);
          }
        } else if (selectedMonth !== null) {
          const currentYear = new Date().getFullYear();
          const startDate = new Date(currentYear, selectedMonth - 1, 1).toISOString().split('T')[0];
          const endDate = new Date(currentYear, selectedMonth, 0).toISOString().split('T')[0];
          query = query.gte("fecha", startDate).lte("fecha", endDate);
        }

        const { data, error } = await query;

        if (error) {
          setTransactions([]);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedData = data?.map((t: any) => ({
            ...t,
            categoria: t.categorias?.nombre || "Desconocida"
          })) || [];
          setTransactions(mappedData);
        }
      } catch {
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [supabase, debouncedSearchQuery, selectedCategories, selectedMonth, selectedYear, selectedTipo]);

  // Fetch Gastos Fijos y su estado de pago
  useEffect(() => {
    if (currentView !== "gastos_fijos") return;

    const fetchGastosFijos = async () => {
      try {
        const { data: gastosData, error } = await supabase
          .from("gastos_fijos")
          .select("*, categorias(nombre)")
          .order("dia_vencimiento", { ascending: true });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedData = gastosData?.map((g: any) => ({
          ...g,
          categoria_nombre: g.categorias?.nombre || "Desconocida"
        })) || [];
        setGastosFijos(mappedData);

        // Fetch pagados del mes actual
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

        const { data: pagadosData, error: errPagados } = await supabase
          .from("movimientos")
          .select("gasto_fijo_id")
          .not("gasto_fijo_id", "is", null)
          .gte("fecha", startOfMonth)
          .lte("fecha", endOfMonth);

        if (errPagados) throw errPagados;

        const paidIds = pagadosData?.map(p => p.gasto_fijo_id as string) || [];
        setPaidGastoFijoIds(paidIds);
      } catch (err) {
        console.error("Error fetching gastos fijos:", err);
      }
    };

    fetchGastosFijos();
  }, [supabase, currentView]);

  // Fetch Presupuestos
  useEffect(() => {
    if (currentView !== "presupuestos") return;

    const fetchBudgets = async () => {
      try {
        const today = new Date();
        const activeMonth = selectedMonth !== null ? selectedMonth : today.getMonth() + 1;
        const activeYear = selectedYear !== null ? selectedYear : today.getFullYear();

        const { data: budgetsData, error } = await supabase
          .from("presupuestos")
          .select("*, categorias(nombre)")
          .eq("mes", activeMonth)
          .eq("anio", activeYear);

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedBudgets = budgetsData?.map((b: any) => ({
          ...b,
          categoria_nombre: b.categorias?.nombre || "Desconocida"
        })) || [];
        setBudgets(mappedBudgets);
      } catch (err) {
        console.error("Error fetching presupuestos:", err);
      }
    };

    fetchBudgets();
  }, [supabase, currentView, selectedMonth, selectedYear]);

  const handleAddTransaction = async (newTransaction: Partial<Transaction> & { categoria_id: string, monto: number, fecha: string, descripcion: string, tipo: "ingreso" | "gasto" }) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("movimientos")
        .insert([{ ...newTransaction, user_id: userId }])
        .select();

      if (error) {
        alert("Hubo un error al guardar el movimiento.");
        return;
      }

      if (data && data.length > 0) {
        const catNombre = categorias.find(c => c.id === newTransaction.categoria_id)?.nombre || "Desconocida";
        const optimista = {
          ...(data[0] as Transaction),
          categoria: catNombre,
        };
        setTransactions((prev) => [optimista, ...prev]);
        setIsModalOpen(false);
      }
    } catch {
      alert("Hubo un error al guardar el movimiento.");
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("movimientos").delete().eq("id", id);
      if (error) throw error;
      
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setTransactionToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Hubo un error al borrar el movimiento.");
    }
  };

  const handleAddFixedExpense = async (expense: { nombre: string, monto_estimado: number, categoria_id: string, dia_vencimiento: number }) => {
    if (!userId) return;
    setIsAddingFixedExpense(true);
    try {
      const { data, error } = await supabase
        .from("gastos_fijos")
        .insert([{ ...expense, user_id: userId }])
        .select("*, categorias(nombre)");
      
      if (error) throw error;

      if (data && data.length > 0) {
        const mappedData = {
          ...(data[0] as GastoFijo),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          categoria_nombre: (data[0] as any).categorias?.nombre || "Desconocida"
        };
        setGastosFijos((prev) => [...prev, mappedData].sort((a, b) => a.dia_vencimiento - b.dia_vencimiento));
        setIsFixedExpenseModalOpen(false);
      }
    } catch (err) {
      alert("Error al agregar gasto fijo.");
    } finally {
      setIsAddingFixedExpense(false);
    }
  };

  const handleDeleteFixedExpense = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este gasto fijo? Los pagos ya realizados no se borrarán.")) return;
    try {
      const { error } = await supabase.from("gastos_fijos").delete().eq("id", id);
      if (error) throw error;
      setGastosFijos((prev) => prev.filter(g => g.id !== id));
    } catch (err) {
      alert("Error al eliminar gasto fijo.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categorias').update({ activa: false }).eq('id', id);
      if (error) throw error;
      
      // Actualizamos estado local
      setCategorias(prev => prev.map(c => c.id === id ? { ...c, activa: false } : c));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la categoría.");
    }
  };

  const handlePayFixedExpense = async (gasto: GastoFijo) => {
    if (!userId) return;
    
    // Obtener la fecha en formato YYYY-MM-DD ajustada a la zona horaria local
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 10);
    
    try {
      const { data, error } = await supabase
        .from("movimientos")
        .insert([{
          monto: gasto.monto_estimado,
          tipo: "gasto",
          categoria_id: gasto.categoria_id,
          fecha: localISOTime,
          descripcion: `Pago de ${gasto.nombre}`,
          user_id: userId,
          gasto_fijo_id: gasto.id
        }])
        .select();

      if (error) throw error;

      // Actualizar estado local para marcar como pagado (semáforo a Azul)
      setPaidGastoFijoIds((prev) => [...prev, gasto.id]);

      // Actualizar estado local de transacciones para que aparezca en Operaciones inmediatamente
      if (data && data.length > 0) {
        const catNombre = categorias.find(c => c.id === gasto.categoria_id)?.nombre || "Desconocida";
        const newTransaction = {
          ...(data[0] as Transaction),
          categoria: catNombre,
        };
        setTransactions((prev) => [newTransaction, ...prev]);
      }
      
      // Mostrar feedback
      alert(`¡${gasto.nombre} marcado como pagado exitosamente!`);
    } catch (err) {
      alert("Error al registrar el pago.");
    }
  };

  const handleSaveBudget = async (budgetInput: Partial<Presupuesto>) => {
    if (!userId) return;
    
    const today = new Date();
    const activeMonth = selectedMonth !== null ? selectedMonth : today.getMonth() + 1;
    const activeYear = selectedYear !== null ? selectedYear : today.getFullYear();

    try {
      if (editingBudget) {
        // Update
        const { data, error } = await supabase
          .from("presupuestos")
          .update({ monto_limite: budgetInput.monto_limite })
          .eq("id", editingBudget.id)
          .select("*, categorias(nombre)");
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped = { ...data[0], categoria_nombre: (data[0] as any).categorias?.nombre };
          setBudgets(prev => prev.map(b => b.id === editingBudget.id ? mapped as Presupuesto : b));
        }
      } else {
        // Insert
        const { data, error } = await supabase
          .from("presupuestos")
          .insert([{ 
            ...budgetInput, 
            user_id: userId,
            mes: activeMonth,
            anio: activeYear
          }])
          .select("*, categorias(nombre)");
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped = { ...data[0], categoria_nombre: (data[0] as any).categorias?.nombre };
          setBudgets(prev => [...prev, mapped as Presupuesto]);
        }
      }
      setIsBudgetModalOpen(false);
      setEditingBudget(null);
    } catch (err) {
      alert("Error al guardar presupuesto.");
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      const { error } = await supabase.from("presupuestos").delete().eq("id", id);
      if (error) throw error;
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert("Error al eliminar presupuesto.");
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
            <div className="flex bg-card rounded-lg p-1 border border-border flex-wrap">
              <button
                onClick={() => setCurrentView("operaciones")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "operaciones"
                    ? "bg-background text-foreground border border-border shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <ListTodo size={16} />
                <span className="hidden sm:inline">Operaciones</span>
              </button>
              <button
                onClick={() => setCurrentView("gastos_fijos")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "gastos_fijos"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Calendar size={16} />
                <span className="hidden sm:inline">Fijos</span>
              </button>
              <button
                onClick={() => setCurrentView("presupuestos")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "presupuestos"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <TrendingUp size={16} />
                <span className="hidden sm:inline">Presupuestos</span>
              </button>
              <button
                onClick={() => setCurrentView("analisis")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "analisis"
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <PieChart size={16} />
                <span className="hidden sm:inline">Gráficos</span>
              </button>
            </div>

            <ThemeSwitcher />

            <div className="flex gap-2">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 rounded-lg bg-card text-muted border border-border hover:bg-background hover:text-foreground transition-colors"
                title="Ajustes"
              >
                <Settings size={18} />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-muted border border-border hover:bg-background hover:text-foreground transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-in fade-in duration-500">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium">Sincronizando con la base de datos...</p>
          </div>
        ) : (
          <>
            {currentView !== "gastos_fijos" && (
              <section>
                <SummaryPanel transactions={transactions} />
              </section>
            )}

            {currentView === "operaciones" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 mt-6">
                <div className="flex justify-start mb-4 gap-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary/20"
                  >
                    <Plus size={18} />
                    Nuevo Movimiento
                  </button>
                  <button
                    onClick={() => exportTransactionsToCSV(transactions)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-background border border-border hover:bg-muted text-foreground font-semibold rounded-lg transition-colors"
                    title="Exportar movimientos filtrados"
                  >
                    <Download size={18} />
                    Exportar CSV
                  </button>
                </div>
                
                <section>
                  <TransactionFilters 
                    categorias={categorias}
                    selectedCategories={selectedCategories}
                    onCategoryChange={setSelectedCategories}
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedTipo={selectedTipo}
                    onTipoChange={setSelectedTipo}
                  />
                  <ExpenseList 
                    transactions={transactions} 
                    onDeleteRequest={(id, desc) => setTransactionToDelete({id, desc})}
                  />
                </section>
              </div>
            ) : currentView === "gastos_fijos" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Suscripciones y Servicios</h2>
                    <p className="text-sm text-muted mt-1">Lleva el control de tus pagos recurrentes mes a mes.</p>
                  </div>
                  <button
                    onClick={() => setIsFixedExpenseModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-rose-600/20 whitespace-nowrap"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Nuevo Gasto Fijo</span>
                  </button>
                </div>

                <FixedExpensesList 
                  gastosFijos={gastosFijos}
                  paidGastoFijoIds={paidGastoFijoIds}
                  onPay={handlePayFixedExpense}
                  onDelete={handleDeleteFixedExpense}
                />
              </div>
            ) : currentView === "presupuestos" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Presupuestos por Categoría</h2>
                    <p className="text-sm text-muted mt-1">
                      {selectedMonth !== null && selectedYear !== null 
                        ? `Límites de gasto para el mes ${selectedMonth}/${selectedYear}` 
                        : "Límites de gasto para el mes actual"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBudget(null);
                      setIsBudgetModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-600/20 whitespace-nowrap"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Nuevo Presupuesto</span>
                  </button>
                </div>
                
                <BudgetPanel 
                  budgets={budgets} 
                  transactions={transactions} 
                  categorias={categorias}
                  onEdit={(b) => {
                    setEditingBudget(b);
                    setIsBudgetModalOpen(true);
                  }}
                  onDelete={handleDeleteBudget}
                />
              </div>
            ) : (
              <section>
                <AnalyticsView transactions={transactions} />
              </section>
            )}
          </>
        )}
      </div>

      {/* Contenedores de Modal */}
      
      {/* Modal Nueva Operación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl">
            <ExpenseForm 
              categorias={categorias.filter(c => c.activa)}
              userId={userId}
              onCategoryAdded={(cat) => setCategorias((prev) => [...prev, cat])}
              onAddTransaction={handleAddTransaction} 
              onClose={() => setIsModalOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Modal Nuevo Gasto Fijo */}
      {isFixedExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsFixedExpenseModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl">
            <AddFixedExpenseForm 
              categorias={categorias.filter(c => c.activa)}
              onAdd={handleAddFixedExpense}
              onCancel={() => setIsFixedExpenseModalOpen(false)}
              isSubmitting={isAddingFixedExpense}
            />
          </div>
        </div>
      )}

      {/* Modal Borrar Transacción */}
      {transactionToDelete && (
        <DeleteConfirmModal
          transactionId={transactionToDelete.id}
          transactionDesc={transactionToDelete.desc}
          onClose={() => setTransactionToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Modal Presupuesto */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              setIsBudgetModalOpen(false);
              setEditingBudget(null);
            }}
          />
          <div className="relative z-10 w-full max-w-2xl flex justify-center">
            <BudgetFormModal 
              categorias={categorias}
              existingBudgets={budgets}
              editingBudget={editingBudget}
              onSave={handleSaveBudget}
              onClose={() => {
                setIsBudgetModalOpen(false);
                setEditingBudget(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Ajustes */}
      {isSettingsModalOpen && (
        <SettingsModal
          categorias={categorias}
          userId={userId}
          onClose={() => setIsSettingsModalOpen(false)}
          onDeleteCategory={handleDeleteCategory}
        />
      )}
    </main>
  );
}
