"use client";

import { Categoria } from "@/types";
import { Search, X, Calendar, Tags, ChevronDown, Filter } from "lucide-react";
import { useState } from "react";

interface TransactionFiltersProps {
  categorias: Categoria[];
  selectedCategories: string[];
  onCategoryChange: (cats: string[]) => void;
  selectedMonth: number | null;
  onMonthChange: (month: number | null) => void;
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTipo: "ingreso" | "gasto" | null;
  onTipoChange: (tipo: "ingreso" | "gasto" | null) => void;
}

const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

const ANIOS = [2024, 2025, 2026, 2027, 2028];

export default function TransactionFilters({
  categorias,
  selectedCategories,
  onCategoryChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  searchQuery,
  onSearchChange,
  selectedTipo,
  onTipoChange,
}: TransactionFiltersProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== catId));
    } else {
      onCategoryChange([...selectedCategories, catId]);
    }
  };

  const clearFilters = () => {
    onCategoryChange([]);
    onMonthChange(null);
    onYearChange(null);
    onSearchChange("");
    onTipoChange(null);
  };

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedMonth !== null ||
    selectedYear !== null ||
    searchQuery !== "" ||
    selectedTipo !== null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
      
      {/* Buscador libre */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar por descripción..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        />
      </div>

      {/* Fila de Filtros Selectores */}
      <div className="flex flex-wrap gap-3 items-center">
        
        {/* Tipo */}
        <div className="relative flex items-center bg-background border border-border rounded-lg px-3 focus-within:ring-2 focus-within:ring-primary transition-colors h-10">
          <Filter className="text-muted mr-2" size={16} />
          <select
            value={selectedTipo || ""}
            onChange={(e) => onTipoChange((e.target.value as "ingreso" | "gasto") || null)}
            className="bg-transparent text-foreground py-1 outline-none appearance-none pr-4 text-sm"
          >
            <option value="">Tipo (Todos)</option>
            <option value="ingreso">Ingresos</option>
            <option value="gasto">Gastos</option>
          </select>
        </div>

        {/* Categorías Multi-select */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 h-10 text-foreground hover:bg-border transition-colors text-sm"
          >
            <Tags className="text-muted" size={16} />
            <span className="whitespace-nowrap">
              Categorías {selectedCategories.length > 0 && `(${selectedCategories.length})`}
            </span>
            <ChevronDown size={14} className="text-muted ml-1" />
          </button>
          
          {showCategoryDropdown && (
            <>
              {/* Overlay invisible para cerrar al hacer click fuera */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowCategoryDropdown(false)} 
              />
              <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
                {categorias.length === 0 ? (
                  <span className="text-xs text-muted p-2">No hay categorías</span>
                ) : (
                  categorias.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 p-2 hover:bg-background rounded-md cursor-pointer transition-colors group">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-sm text-foreground capitalize truncate group-hover:text-primary transition-colors">
                        {cat.nombre}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Mes */}
        <div className="relative flex items-center bg-background border border-border rounded-lg px-3 focus-within:ring-2 focus-within:ring-primary transition-colors h-10">
          <Calendar className="text-muted mr-2" size={16} />
          <select
            value={selectedMonth || ""}
            onChange={(e) =>
              onMonthChange(e.target.value ? parseInt(e.target.value) : null)
            }
            className="bg-transparent text-foreground py-1 outline-none appearance-none pr-4 text-sm"
          >
            <option value="">Mes (Todos)</option>
            {MESES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Año */}
        <div className="relative flex items-center bg-background border border-border rounded-lg px-3 focus-within:ring-2 focus-within:ring-primary transition-colors h-10">
          <select
            value={selectedYear || ""}
            onChange={(e) =>
              onYearChange(e.target.value ? parseInt(e.target.value) : null)
            }
            className="bg-transparent text-foreground py-1 outline-none appearance-none pr-4 text-sm"
          >
            <option value="">Año (Todos)</option>
            {ANIOS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Limpiar */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors px-3 py-2 ml-auto"
          >
            <X size={14} />
            Limpiar filtros
          </button>
        )}
      </div>

    </div>
  );
}
