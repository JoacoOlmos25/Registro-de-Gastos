import { useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { Ahorro, MovimientoAhorro } from "@/types";

interface MovimientoAhorroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movimiento: Partial<MovimientoAhorro>) => void;
  ahorro: Ahorro | null;
  tipoForm: "aporte" | "retiro" | null;
}

export default function MovimientoAhorroModal({ isOpen, onClose, onSave, ahorro, tipoForm }: MovimientoAhorroModalProps) {
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      setMonto("");
      // Default to today in local timezone
      const today = new Date();
      const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
      // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      setFecha(localDate);
    }
  }, [isOpen]);

  if (!isOpen || !ahorro || !tipoForm) return null;

  const isAporte = tipoForm === "aporte";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || parseFloat(monto) <= 0) return;
    if (!fecha) return;

    onSave({
      ahorro_id: ahorro.id,
      monto: parseFloat(monto),
      tipo: tipoForm,
      fecha,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`flex justify-between items-center p-6 border-b border-border shrink-0 ${isAporte ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          <div className="flex items-center gap-2">
            {isAporte ? (
              <TrendingUp className="text-emerald-500" size={24} />
            ) : (
              <TrendingDown className="text-red-500" size={24} />
            )}
            <h2 className="text-xl font-bold text-foreground">
              {isAporte ? "Ingresar Aporte" : "Registrar Retiro"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <p className="text-sm text-muted mb-6 text-center">
            {isAporte ? 'Sumarás' : 'Restarás'} fondos al frasco <strong>{ahorro.nombre}</strong>.
          </p>

          <form id="movimiento-ahorro-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Monto
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-medium ${isAporte ? 'text-emerald-500' : 'text-red-500'}`}>
                  $
                </span>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2.5 bg-background border rounded-xl focus:ring-2 transition-all text-foreground text-lg font-semibold ${
                    isAporte 
                      ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/20' 
                      : 'border-red-500/30 focus:border-red-500 focus:ring-red-500/20'
                  }`}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fecha
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
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
            form="movimiento-ahorro-form"
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors shadow-lg ${
              isAporte
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
            }`}
          >
            {isAporte ? "Confirmar Aporte" : "Confirmar Retiro"}
          </button>
        </div>
      </div>
    </div>
  );
}
