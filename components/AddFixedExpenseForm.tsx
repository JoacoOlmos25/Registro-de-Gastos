"use client";

import { useState } from "react";
import { Categoria } from "@/types";

interface AddFixedExpenseFormProps {
  categorias: Categoria[];
  onAdd: (expense: {
    nombre: string;
    monto_estimado: number;
    categoria_id: string;
    dia_vencimiento: number;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function AddFixedExpenseForm({
  categorias,
  onAdd,
  onCancel,
  isSubmitting,
}: AddFixedExpenseFormProps) {
  const [nombre, setNombre] = useState("");
  const [montoEstimado, setMontoEstimado] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [diaVencimiento, setDiaVencimiento] = useState("");

  const gastosCategorias = categorias.filter((c) => c.tipo === "gasto");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !montoEstimado || !categoriaId || !diaVencimiento) return;

    onAdd({
      nombre,
      monto_estimado: parseFloat(montoEstimado),
      categoria_id: categoriaId,
      dia_vencimiento: parseInt(diaVencimiento),
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">Nuevo Gasto Fijo</h2>
        <button
          onClick={onCancel}
          className="text-muted hover:text-foreground transition-colors"
        >
          Cerrar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Nombre del Servicio</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Alquiler, Luz, Internet..."
              className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Monto Estimado</label>
            <input
              type="number"
              step="0.01"
              required
              value={montoEstimado}
              onChange={(e) => setMontoEstimado(e.target.value)}
              placeholder="0.00"
              className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Categoría</label>
            <select
              required
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors appearance-none"
            >
              <option value="" disabled>Seleccione una categoría</option>
              {gastosCategorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Día de Vencimiento (1-31)</label>
            <input
              type="number"
              min="1"
              max="31"
              required
              value={diaVencimiento}
              onChange={(e) => setDiaVencimiento(e.target.value)}
              placeholder="Día del mes"
              className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Guardando...</span>
            ) : (
              "Crear Gasto Fijo"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
