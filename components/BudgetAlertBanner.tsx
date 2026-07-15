import { useState, useEffect } from "react";
import { BudgetStatus } from "@/types";
import { AlertTriangle, X, ArrowRight } from "lucide-react";

interface BudgetAlertBannerProps {
  budgetStatuses: BudgetStatus[];
  onViewDetails: () => void;
}

export default function BudgetAlertBanner({ budgetStatuses, onViewDetails }: BudgetAlertBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  const excedidos = budgetStatuses.filter(b => b.percentage >= 100).length;
  const enAlerta = budgetStatuses.filter(b => b.percentage >= 80 && b.percentage < 100).length;

  useEffect(() => {
    // Check sessionStorage only on client side
    const isDismissed = sessionStorage.getItem("budgetAlertDismissed");
    if (!isDismissed && (excedidos > 0 || enAlerta > 0)) {
      // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      setIsVisible(true);
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    setHasCheckedStorage(true);
  }, [excedidos, enAlerta]);

  const handleDismiss = () => {
    sessionStorage.setItem("budgetAlertDismissed", "true");
    setIsVisible(false);
  };

  if (!hasCheckedStorage || !isVisible || (excedidos === 0 && enAlerta === 0)) {
    return null;
  }

  const isSevere = excedidos > 0;
  
  let message = "";
  if (excedidos > 0 && enAlerta > 0) {
    message = `Tienes ${excedidos} ${excedidos === 1 ? 'presupuesto excedido' : 'presupuestos excedidos'} y ${enAlerta} en alerta.`;
  } else if (excedidos > 0) {
    message = `Tienes ${excedidos} ${excedidos === 1 ? 'presupuesto excedido' : 'presupuestos excedidos'}.`;
  } else if (enAlerta > 0) {
    message = `Tienes ${enAlerta} ${enAlerta === 1 ? 'presupuesto' : 'presupuestos'} próximo(s) a excederse.`;
  }

  return (
    <div className={`w-full p-4 rounded-xl shadow-md border animate-in slide-in-from-top-4 duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
      isSevere 
        ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" 
        : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
    }`}>
      <div className="flex items-center gap-3">
        <AlertTriangle size={24} className="shrink-0" />
        <div>
          <h3 className="font-bold text-sm sm:text-base">
            Alerta de Presupuestos
          </h3>
          <p className="text-sm opacity-90 mt-0.5">
            {message}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <button 
          onClick={onViewDetails}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            isSevere 
              ? "bg-red-500/20 hover:bg-red-500/30" 
              : "bg-amber-500/20 hover:bg-amber-500/30"
          }`}
        >
          Ver detalles
          <ArrowRight size={16} />
        </button>
        <button 
          onClick={handleDismiss}
          className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Ocultar alerta por esta sesión"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
