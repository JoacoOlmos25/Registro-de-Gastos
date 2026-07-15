"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { TransactionType } from "@/types";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Helper para generar los últimos 5 años
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

interface ScenarioState {
  type: TransactionType;
  month: number;
  year: number;
}

interface ChartDataPoint {
  categoria: string;
  escenarioA: number;
  escenarioB: number;
  diffPercent: number;
  isNew: boolean;
  isLost: boolean;
  trendColor: string;
  trendText: string;
}

const formatScenarioName = (s: ScenarioState) => {
  const typeLabel = s.type === "gasto" ? "Gastos" : "Ingresos";
  return `${typeLabel} ${MONTHS[s.month]} ${s.year}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label, scenarioA, scenarioB }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as ChartDataPoint;
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-xl">
        <p className="font-bold text-foreground mb-2">{label}</p>
        <div className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--color-a)", fontWeight: 500 }}>
            {formatScenarioName(scenarioA)}: ${dataPoint.escenarioA.toFixed(2)}
          </span>
          <span style={{ color: "var(--color-b)", fontWeight: 500 }}>
            {formatScenarioName(scenarioB)}: ${dataPoint.escenarioB.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function MonthlyComparison() {
  const supabase = createClient();
  const today = new Date();
  
  // Por defecto: Escenario A = Mes Anterior, Escenario B = Mes Actual
  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const [scenarioA, setScenarioA] = useState<ScenarioState>({
    type: "gasto",
    month: prevMonthDate.getMonth(),
    year: prevMonthDate.getFullYear()
  });

  const [scenarioB, setScenarioB] = useState<ScenarioState>({
    type: "gasto",
    month: today.getMonth(),
    year: today.getFullYear()
  });

  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const getRange = (month: number, year: number) => {
          const start = new Date(year, month, 1).toISOString().split('T')[0];
          const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
          return { start, end };
        };

        const rangeA = getRange(scenarioA.month, scenarioA.year);
        const rangeB = getRange(scenarioB.month, scenarioB.year);

        const [resA, resB] = await Promise.all([
          supabase
            .from("movimientos")
            .select("monto, categorias(nombre)")
            .eq("tipo", scenarioA.type)
            .gte("fecha", rangeA.start)
            .lte("fecha", rangeA.end),
          supabase
            .from("movimientos")
            .select("monto, categorias(nombre)")
            .eq("tipo", scenarioB.type)
            .gte("fecha", rangeB.start)
            .lte("fecha", rangeB.end)
        ]);

        if (resA.error) throw resA.error;
        if (resB.error) throw resB.error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const groupData = (records: any[]) => {
          return records.reduce((acc, curr) => {
            const catName = curr.categorias?.nombre || "Desconocida";
            acc[catName] = (acc[catName] || 0) + Number(curr.monto);
            return acc;
          }, {} as Record<string, number>);
        };

        const dictA = groupData(resA.data || []);
        const dictB = groupData(resB.data || []);

        const allCategories = Array.from(new Set([...Object.keys(dictA), ...Object.keys(dictB)]));

        const chartData = allCategories.map(cat => {
          const valA = dictA[cat] || 0;
          const valB = dictB[cat] || 0;
          
          let diffPercent = 0;
          let isNew = false;
          let isLost = false;

          if (valA === 0 && valB > 0) {
            isNew = true;
          } else if (valA > 0 && valB === 0) {
            isLost = true;
            diffPercent = -100;
          } else if (valA > 0 && valB > 0) {
            diffPercent = ((valB - valA) / valA) * 100;
          }

          // Lógica de colores invertidos
          let trendColor = "text-muted-foreground"; // neutral si cruzan peras con manzanas
          if (scenarioA.type === scenarioB.type) {
            if (scenarioB.type === "gasto") {
              if (valB > valA) trendColor = "text-red-500";
              else if (valB < valA) trendColor = "text-emerald-500";
            } else { // ingreso
              if (valB > valA) trendColor = "text-emerald-500";
              else if (valB < valA) trendColor = "text-red-500";
            }
          }

          let trendText = "0%";
          if (isNew) trendText = "Nuevo (+100%)";
          else if (isLost) trendText = "-100%";
          else {
            const sign = diffPercent > 0 ? "+" : "";
            trendText = `${sign}${diffPercent.toFixed(1)}%`;
          }

          return {
            categoria: cat,
            escenarioA: valA,
            escenarioB: valB,
            diffPercent,
            isNew,
            isLost,
            trendColor,
            trendText
          };
        });

        // Ordenar de mayor a menor según el Escenario B
        chartData.sort((a, b) => b.escenarioB - a.escenarioB);
        setData(chartData);
      } catch (err) {
        console.error("Error fetching comparativa:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, scenarioA, scenarioB]);

  const { totalA, totalB, globalTrendColor, globalTrendText } = useMemo(() => {
    const totals = data.reduce((acc, curr) => {
      acc.totalA += curr.escenarioA;
      acc.totalB += curr.escenarioB;
      return acc;
    }, { totalA: 0, totalB: 0 });

    let diffPercent = 0;
    let isNew = false;
    let isLost = false;

    if (totals.totalA === 0 && totals.totalB > 0) isNew = true;
    else if (totals.totalA > 0 && totals.totalB === 0) {
      isLost = true;
      diffPercent = -100;
    } else if (totals.totalA > 0 && totals.totalB > 0) {
      diffPercent = ((totals.totalB - totals.totalA) / totals.totalA) * 100;
    }

    let trendColor = "text-muted-foreground";
    if (scenarioA.type === scenarioB.type) {
      if (scenarioB.type === "gasto") {
        if (totals.totalB > totals.totalA) trendColor = "text-red-500";
        else if (totals.totalB < totals.totalA) trendColor = "text-emerald-500";
      } else {
        if (totals.totalB > totals.totalA) trendColor = "text-emerald-500";
        else if (totals.totalB < totals.totalA) trendColor = "text-red-500";
      }
    } else {
      const totalGasto = scenarioA.type === "gasto" ? totals.totalA : totals.totalB;
      const totalIngreso = scenarioA.type === "ingreso" ? totals.totalA : totals.totalB;
      if (totalGasto > totalIngreso) trendColor = "text-red-500";
      else if (totalGasto < totalIngreso) trendColor = "text-emerald-500";
    }

    let trendText = "0%";
    if (isNew) trendText = "Nuevo (+100%)";
    else if (isLost) trendText = "-100%";
    else {
      const sign = diffPercent > 0 ? "+" : "";
      trendText = `${sign}${diffPercent.toFixed(1)}%`;
    }

    return { ...totals, globalTrendColor: trendColor, globalTrendText: trendText };
  }, [data, scenarioA.type, scenarioB.type]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      
      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Escenario A */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-a)" }}></div>
            Escenario A (Base)
          </h3>
          <div className="flex flex-wrap gap-2">
            <select
              value={scenarioA.type}
              onChange={(e) => setScenarioA({ ...scenarioA, type: e.target.value as TransactionType })}
              className="bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none"
            >
              <option value="gasto">Gastos</option>
              <option value="ingreso">Ingresos</option>
            </select>
            <select
              value={scenarioA.month}
              onChange={(e) => setScenarioA({ ...scenarioA, month: Number(e.target.value) })}
              className="bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select
              value={scenarioA.year}
              onChange={(e) => setScenarioA({ ...scenarioA, year: Number(e.target.value) })}
              className="bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Escenario B */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-b)" }}></div>
            Escenario B (Comparado)
          </h3>
          <div className="flex flex-wrap gap-2">
            <select
              value={scenarioB.type}
              onChange={(e) => setScenarioB({ ...scenarioB, type: e.target.value as TransactionType })}
              className="bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none"
            >
              <option value="gasto">Gastos</option>
              <option value="ingreso">Ingresos</option>
            </select>
            <select
              value={scenarioB.month}
              onChange={(e) => setScenarioB({ ...scenarioB, month: Number(e.target.value) })}
              className="bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select
              value={scenarioB.year}
              onChange={(e) => setScenarioB({ ...scenarioB, year: Number(e.target.value) })}
              className="bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Totales */}
      {!isLoading && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 text-center">
              {formatScenarioName(scenarioA)}
            </span>
            <span className="text-2xl font-bold" style={{ color: "var(--color-a)" }}>
              ${totalA.toFixed(2)}
            </span>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 text-center">
              {formatScenarioName(scenarioB)}
            </span>
            <span className="text-2xl font-bold" style={{ color: "var(--color-b)" }}>
              ${totalB.toFixed(2)}
            </span>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 text-center">
              Diferencia Neta
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${globalTrendColor}`}>
                ${Math.abs(totalB - totalA).toFixed(2)}
              </span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full bg-background border border-border ${globalTrendColor}`}>
                {globalTrendText}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-lg min-h-[400px] flex-1 relative" style={{ '--color-a': '#6366f1', '--color-b': '#a855f7' } as React.CSSProperties}>
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm z-10 rounded-xl">
            <Loader2 className="animate-spin text-primary mb-2" size={32} />
            <p className="text-muted font-medium">Calculando cruce de datos...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted italic">
            No hay datos para comparar en estos periodos.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey="categoria" 
                tick={{ fill: 'var(--foreground)' }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis tick={{ fill: 'var(--foreground)' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              <Bar dataKey="escenarioA" name={formatScenarioName(scenarioA)} fill="var(--color-a)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="escenarioB" name={formatScenarioName(scenarioB)} fill="var(--color-b)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
