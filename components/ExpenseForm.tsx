"use client";

import { PlusCircle, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { Transaction, TransactionType, Categoria } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface ExpenseFormProps {
  categorias: Categoria[];
  userId: string | null;
  onCategoryAdded: (cat: Categoria) => void;
  onAddTransaction: (transaction: Partial<Transaction> & { categoria_id: string, monto: number, fecha: string, descripcion: string, tipo: TransactionType }) => void;
  onClose: () => void;
}

export default function ExpenseForm({ categorias, userId, onCategoryAdded, onAddTransaction, onClose }: ExpenseFormProps) {
  const [tipo, setTipo] = useState<TransactionType | null>(null);
  const [isNuevaCategoria, setIsNuevaCategoria] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let catId = formData.get("categoria_id") as string;
      
      if (catId === "nueva") {
        const { data: newCat, error: catError } = await supabase
          .from("categorias")
          .insert({
            nombre: nuevaCategoriaNombre,
            tipo: tipo,
            user_id: userId,
            es_predeterminada: false
          })
          .select()
          .single();
          
        if (catError) throw catError;
        
        catId = newCat.id;
        onCategoryAdded(newCat);
      }

      const newTransaction = {
        monto: parseFloat(formData.get("monto") as string),
        categoria_id: catId,
        fecha: formData.get("fecha") as string,
        descripcion: formData.get("descripcion") as string,
        tipo: tipo!,
      };

      await onAddTransaction(newTransaction);
    } catch (error) {
      console.error("Error en submit:", error);
      alert("Hubo un error al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-2xl border border-border w-full max-w-2xl mx-auto relative animate-in fade-in zoom-in-95 duration-200">
      {/* Botón Cerrar (X) */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1 text-muted hover:text-foreground bg-background hover:bg-border rounded-full transition-colors"
      >
        <X size={20} />
      </button>

      {tipo === null ? (
        <div className="flex flex-col gap-6 py-8 animate-in fade-in zoom-in-95 duration-300">
          <h3 className="text-xl md:text-2xl font-semibold text-center text-foreground mb-2">
            ¿Qué deseas registrar?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
            <button
              type="button"
              onClick={() => setTipo("ingreso")}
              className="flex flex-col items-center justify-center p-6 border border-border bg-card text-foreground rounded-xl hover:bg-background transition-colors shadow-sm"
            >
              <span className="font-semibold text-lg">Ingreso</span>
            </button>
            <button
              type="button"
              onClick={() => setTipo("gasto")}
              className="flex flex-col items-center justify-center p-6 border border-border bg-card text-foreground rounded-xl hover:bg-background transition-colors shadow-sm"
            >
              <span className="font-semibold text-lg">Gasto</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 pr-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                <PlusCircle size={24} />
                {tipo === "ingreso" ? "Registrar Ingreso" : "Registrar Gasto"}
              </h2>
              <button 
                type="button" 
                onClick={() => {
                  setTipo(null);
                  setIsNuevaCategoria(false);
                }} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card text-muted border border-border hover:bg-background hover:text-foreground transition-colors text-sm font-medium mt-2"
              >
                Volver
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="monto" className="block text-sm font-medium text-muted">
                  Monto
                </label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="categoria_id" className="block text-sm font-medium text-muted">
                  Categoría
                </label>
                <select
                  id="categoria_id"
                  name="categoria_id"
                  required
                  defaultValue=""
                  onChange={(e) => setIsNuevaCategoria(e.target.value === "nueva")}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none"
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  {categorias.filter((c) => c.tipo === tipo).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                  <option value="nueva" className="text-primary font-semibold">
                    + Crear nueva categoría...
                  </option>
                </select>
                {isNuevaCategoria && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                      type="text"
                      required
                      placeholder="Nombre de la nueva categoría"
                      value={nuevaCategoriaNombre}
                      onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="fecha" className="block text-sm font-medium text-muted">
                  Fecha
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  required
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-muted">
                  Descripción <span className="text-muted/60 text-xs font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  id="descripcion"
                  name="descripcion"
                  placeholder={tipo === "gasto" ? "Ej. Cena con amigos" : "Ej. Pago de quincena"}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Guardando...
                  </>
                ) : (
                  "Guardar Movimiento"
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
