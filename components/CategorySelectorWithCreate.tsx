import { useState, useImperativeHandle, forwardRef } from "react";
import { Categoria, TransactionType } from "@/types";
import { createClient } from "@/lib/supabase/client";

export interface CategorySelectorRef {
  getSelectedCategoryId: () => Promise<string | null>;
}

interface CategorySelectorWithCreateProps {
  categorias: Categoria[];
  tipo: TransactionType;
  userId: string | null;
  onCategoryAdded: (cat: Categoria) => void;
  defaultCategoryId?: string;
  required?: boolean;
}

const CategorySelectorWithCreate = forwardRef<CategorySelectorRef, CategorySelectorWithCreateProps>(
  ({ categorias, tipo, userId, onCategoryAdded, defaultCategoryId, required = true }, ref) => {
    const [selectedId, setSelectedId] = useState(defaultCategoryId || "");
    const [isNueva, setIsNueva] = useState(false);
    const [nuevaNombre, setNuevaNombre] = useState("");
    
    const supabase = createClient();

    useImperativeHandle(ref, () => ({
      getSelectedCategoryId: async () => {
        if (!isNueva) {
          if (required && !selectedId) throw new Error("Debes seleccionar una categoría.");
          return selectedId;
        }
        
        if (!nuevaNombre) throw new Error("Debes ingresar un nombre para la nueva categoría.");
        if (!userId) throw new Error("Usuario no autenticado.");
        if (!tipo) throw new Error("Tipo de movimiento no definido.");
        
        const { data: catData, error } = await supabase
          .from("categorias")
          .insert([{
            nombre: nuevaNombre,
            tipo: tipo,
            user_id: userId,
            es_predeterminada: false
          }])
          .select();
          
        if (error) throw error;
        
        if (!catData || catData.length === 0) {
          throw new Error("Error: No se devolvió la categoría creada.");
        }
        
        const newCat = catData[0];
        
        onCategoryAdded(newCat);
        // Actualizamos estado interno por si hay re-renders
        setIsNueva(false);
        setSelectedId(newCat.id);
        
        return newCat.id;
      }
    }));

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted">
          Categoría
        </label>
        <select
          required={required && !isNueva}
          value={isNueva ? "nueva" : selectedId}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "nueva") {
              setIsNueva(true);
            } else {
              setIsNueva(false);
              setSelectedId(val);
            }
          }}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none"
        >
          <option value="" disabled>Selecciona una categoría</option>
          {categorias.filter(c => c.tipo === tipo && c.activa).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
          <option value="nueva" className="text-primary font-semibold">
            + Crear nueva categoría...
          </option>
        </select>
        
        {isNueva && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <input
              type="text"
              required={required && isNueva}
              placeholder="Nombre de la nueva categoría"
              value={nuevaNombre}
              onChange={(e) => setNuevaNombre(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
          </div>
        )}
      </div>
    );
  }
);

CategorySelectorWithCreate.displayName = "CategorySelectorWithCreate";
export default CategorySelectorWithCreate;
