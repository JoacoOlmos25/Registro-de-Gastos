"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Transaction, TransactionType } from "@/types";

interface AnalyticsViewProps {
  transactions: Transaction[];
}

type TimeFilter = "hoy" | "semana" | "mes" | "ano" | "todo";

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6'];

export default function AnalyticsView({ transactions }: AnalyticsViewProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("todo");
  const [chartType, setChartType] = useState<TransactionType>("gasto");

  // Filtrado temporal
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    // Normalizamos la fecha actual para comparar solo días, meses, años locales
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions.filter((t) => {
      // Las fechas vienen como "YYYY-MM-DD"
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
        case "todo":
        default:
          return true;
      }
    });
  }, [transactions, timeFilter]);

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
      .sort((a, b) => b.value - a.value); // Ordenar de mayor a menor
  }, [filteredTransactions, chartType]);

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Análisis Gráfico</h2>
          <p className="text-sm text-slate-400 mt-1">Distribución de tus finanzas</p>
        </div>

        {/* Filtros de tiempo */}
        <div className="flex flex-wrap gap-2">
          {(["hoy", "semana", "mes", "ano", "todo"] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                timeFilter === filter
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-700"
              }`}
            >
              {filter === "ano" ? "año" : filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Toggle Gasto/Ingreso */}
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 mb-6">
          <button
            type="button"
            onClick={() => setChartType("ingreso")}
            className={`px-6 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === "ingreso"
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Ingresos
          </button>
          <button
            type="button"
            onClick={() => setChartType("gasto")}
            className={`px-6 py-1.5 rounded-md text-sm font-medium transition-colors ${
              chartType === "gasto"
                ? "bg-slate-700 text-slate-100 border border-slate-600"
                : "text-slate-400 hover:text-slate-300"
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
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Total"]}
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc", borderRadius: "0.5rem" }}
                  itemStyle={{ color: "#34d399", textTransform: "capitalize" }}
                />
                <Legend formatter={(value) => <span className="text-slate-300 capitalize">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 italic">
              No hay {chartType}s para el periodo seleccionado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
