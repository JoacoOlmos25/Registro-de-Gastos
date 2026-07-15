import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Ahorro } from "@/types";

interface AhorroFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ahorro: Partial<Ahorro>) => void;
  initialData?: Ahorro | null;
}

export default function AhorroFormModal({ isOpen, onClose, onSave, initialData }: AhorroFormModalProps) {
  const [nombre, setNombre] = useState("");
  const [montoObjetivo, setMontoObjetivo] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
        setNombre(initialData.nombre);
        // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
        setMontoObjetivo(initialData.monto_objetivo ? initialData.monto_objetivo.toString() : "");
      } else {
        // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
        setNombre("");
        // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
        setMontoObjetivo("");
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    onSave({
      nombre: nombre.trim(),
      monto_objetivo: montoObjetivo ? parseFloat(montoObjetivo) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border shrink-0">
          <h2 className="text-xl font-bold text-foreground">
            {initialData ? "Editar Meta de Ahorro" : "Nueva Meta de Ahorro"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-secondary rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="ahorro-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nombre de la meta
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                placeholder="Ej. Vacaciones, Fondo de emergencia..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Monto objetivo (Opcional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={montoObjetivo}
                  onChange={(e) => setMontoObjetivo(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-muted mt-1.5">
                Si defines un objetivo, verás una barra de progreso. Si no, solo se acumulará el saldo.
              </p>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border shrink-0 bg-card/50 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="ahorro-form"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-emerald-500 rounded-xl transition-colors shadow-lg shadow-primary/20"
          >
            Guardar Meta
          </button>
        </div>
      </div>
    </div>
  );
}
