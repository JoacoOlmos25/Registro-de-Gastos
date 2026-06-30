"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Transaction, TransactionType } from "@/types";

interface ExpenseFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id" | "creado_en">) => void;
}

export default function ExpenseForm({ onAddTransaction }: ExpenseFormProps) {
  const [tipo, setTipo] = useState<TransactionType>("gasto");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTransaction = {
      monto: parseFloat(formData.get("monto") as string),
      categoria: formData.get("categoria") as string,
      fecha: formData.get("fecha") as string,
      descripcion: formData.get("descripcion") as string,
      tipo: tipo,
    };

    onAddTransaction(newTransaction);
    e.currentTarget.reset();
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8 border border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
          <PlusCircle size={24} />
          Registrar Movimiento
        </h2>
        
        {/* Toggle Ingreso / Gasto */}
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button
            type="button"
            onClick={() => setTipo("ingreso")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tipo === "ingreso" 
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" 
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => setTipo("gasto")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tipo === "gasto" 
                ? "bg-slate-700 text-slate-100 border border-slate-600" 
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Gasto
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="monto" className="block text-sm font-medium text-slate-300">
              Monto
            </label>
            <input
              type="number"
              id="monto"
              name="monto"
              step="0.01"
              required
              placeholder="0.00"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="categoria" className="block text-sm font-medium text-slate-300">
              Categoría
            </label>
            <select
              id="categoria"
              name="categoria"
              required
              defaultValue=""
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors appearance-none"
            >
              <option value="" disabled>Selecciona una categoría</option>
              {tipo === "gasto" ? (
                <>
                  <option value="Alimentación">Alimentación</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Salud">Salud</option>
                  <option value="Educación">Educación</option>
                  <option value="Compras">Compras</option>
                  <option value="Otros">Otros</option>
                </>
              ) : (
                <>
                  <option value="Salario">Salario</option>
                  <option value="Inversiones">Inversiones</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Regalos/Bonos">Regalos/Bonos</option>
                  <option value="Otros">Otros</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="fecha" className="block text-sm font-medium text-slate-300">
              Fecha
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="descripcion" className="block text-sm font-medium text-slate-300">
              Descripción
            </label>
            <input
              type="text"
              id="descripcion"
              name="descripcion"
              required
              placeholder={tipo === "gasto" ? "Ej. Cena con amigos" : "Ej. Pago de quincena"}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20"
          >
            Agregar Movimiento
          </button>
        </div>
      </form>
    </div>
  );
}
