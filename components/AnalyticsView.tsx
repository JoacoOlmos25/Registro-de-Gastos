"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Transaction, TransactionType } from "@/types";

interface AnalyticsViewProps {
  transactions: Transaction[];
}

type TimeFilter = "hoy" | "semana" | "mes" | "ano" | "todo" | "personalizado";

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6'];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function AnalyticsView({ transactions }: AnalyticsViewProps) {
  const initialDate = new Date();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("personalizado");
  const [chartType, setChartType] = useState<TransactionType>("gasto");
  
  // Estados para filtro histórico aislados
  const [selectedMonth, setSelectedMonth] = useState<number | "todos">(initialDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number | "todos">(initialDate.getFullYear());

  // Extraer dinámicamente los años disponibles
  const availableYears = useMemo(() => {
    const years = new Set(
      transactions.map((t) => {
        const [year] = t.fecha.split("-").map(Number);
        return year;
      })
    );
    // Si está vacío, por defecto el año actual
    if (years.size === 0) years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  // Manejar el cambio en los dropdowns
  const handleHistoricalChange = (type: "month" | "year", value: string) => {
    setTimeFilter("personalizado");
    if (type === "month") {
      setSelectedMonth(value === "todos" ? "todos" : Number(value));
    }
    if (type === "year") {
      setSelectedYear(value === "todos" ? "todos" : Number(value));
    }
  };

  // Manejar click en filtros rápidos (resetea los selects)
  const handleQuickFilter = (filter: TimeFilter) => {
    setTimeFilter(filter);
    if (filter !== "personalizado") {
      setSelectedMonth("todos");
      setSelectedYear("todos");
    }
  };

  // Filtrado temporal
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions.filter((t) => {
      const [year, month, day] = t.fecha.split("-").map(Number);
      const tDate = new Date(year, month - 1, day);

      switch (timeFilter) {
        case "hoy":
          return tDate.getTime() === today.getTime();
        case "semana": {
          const firstDayOfWeek = new Date(today);
          firstDayOfWeek.setDate(today.getDate() - today.getDay());
          return tDate >= firstDayOfWeek && tDate <= today;
        }
        case "mes":
          return tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear();
        case "ano":
          return tDate.getFullYear() === today.getFullYear();
        case "personalizado": {
          const tMonth = tDate.getMonth();
          const tYear = tDate.getFullYear();

          const matchesMonth = selectedMonth === "todos" || selectedMonth === tMonth;
          const matchesYear = selectedYear === "todos" || selectedYear === tYear;

          return matchesMonth && matchesYear;
        }
        case "todo":
        default:
          return true;
      }
    });
  }, [transactions, timeFilter, selectedMonth, selectedYear]);

  // Agrupación para el gráfico
  const chartData = useMemo(() => {
    const dataObj = filteredTransactions
      .filter((t) => t.tipo === chartType)
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.monto);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(dataObj)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); 
  }, [filteredTransactions, chartType]);

  return (
    <div className="bg-card p-6 rounded-xl shadow-lg border border-border animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Análisis Gráfico</h2>
          <p className="text-sm text-muted mt-1">Distribución de tus finanzas</p>
        </div>

        {/* Sección de Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2">
            {(["hoy", "semana", "mes", "ano", "todo"] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => handleQuickFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  timeFilter === filter
                    ? "bg-primary text-white"
                    : "bg-background text-muted hover:text-foreground border border-border"
                }`}
              >
                {filter === "ano" ? "año" : filter}
              </button>
            ))}
          </div>

          <div className="hidden sm:block w-px h-8 bg-border mx-2"></div>

          {/* Filtros Históricos (Personalizados e Independientes) */}
          <div className={`flex items-center gap-2 p-1.5 rounded-lg border transition-colors ${timeFilter === 'personalizado' ? 'bg-background/50 border-primary/30' : 'bg-transparent border-border'}`}>
            <select
              value={selectedMonth}
              onChange={(e) => handleHistoricalChange("month", e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none min-w-[120px]"
            >
              <option value="todos">Todos los meses</option>
              {MONTHS.map((m, index) => (
                <option key={index} value={index}>{m}</option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => handleHistoricalChange("year", e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none min-w-[120px]"
            >
              <option value="todos">Todos los años</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Toggle Gasto/Ingreso */}
        <div className="flex bg-background rounded-lg p-1 border border-border mb-6">
          <button
            type="button"
            onClick={() => setChartType("ingreso")}
            className={`px-6 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === "ingreso"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted hover:text-foreground"
            }`}
          >
            Ingresos
          </button>
          <button
            type="button"
            onClick={() => setChartType("gasto")}
            className={`px-6 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === "gasto"
                ? "bg-card text-foreground border border-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            Gastos
          </button>
        </div>

        {/* Contenedor del Gráfico */}
        <div className="w-full h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {/* Nota: En modo oscuro esto se podría estilizar un poco mejor dependiendo del theme actual de next-themes, pero lo dejamos estático por ahora o usamos tailwind clases en content */}
                <Tooltip 
                  formatter={(value: unknown) => {
                    const numValue = typeof value === 'number' ? value : Number(value || 0);
                    return [`$${numValue.toFixed(2)}`, "Total"];
                  }}
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)", borderRadius: "0.5rem" }}
                  itemStyle={{ color: "var(--primary)", textTransform: "capitalize" }}
                />
                <Legend formatter={(value) => <span className="text-foreground capitalize">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted italic">
              No hay {chartType}s para el periodo seleccionado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
