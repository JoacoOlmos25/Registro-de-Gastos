"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DeleteConfirmModalProps {
  transactionId: string;
  transactionDesc: string;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export default function DeleteConfirmModal({
  transactionId,
  transactionDesc,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPin, setHasPin] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    async function checkUserPin() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.pin_borrado) {
          setHasPin(true);
        } else {
          setHasPin(false);
        }
      } catch (err) {
        console.error("Error al obtener PIN:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkUserPin();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.length !== 4 || isNaN(Number(pin))) {
      setError("El PIN debe ser un número de 4 dígitos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      if (!hasPin) {
        // Guardar el nuevo PIN
        const { error: updateError } = await supabase.auth.updateUser({
          data: { pin_borrado: pin }
        });
        
        if (updateError) throw updateError;
      } else {
        // Verificar PIN
        const storedPin = user.user_metadata?.pin_borrado;
        if (storedPin !== pin) {
          setError("PIN incorrecto.");
          setIsSubmitting(false);
          return;
        }
      }

      // Proceder al borrado si el PIN es correcto o se acaba de crear
      await onConfirm(transactionId);
      // El modal se cerrará desde afuera (en page o list) al completar onConfirm
    } catch (err: any) {
      console.error(err);
      setError("Ocurrió un error. Inténtalo de nuevo.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border p-6 relative animate-in zoom-in-95 duration-200 mx-4">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-muted hover:text-foreground bg-background hover:bg-border p-1 rounded-full transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
            <AlertTriangle size={24} />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Borrar Operación
          </h3>
          <p className="text-sm text-muted mb-4">
            Vas a eliminar: <span className="font-semibold text-foreground">{transactionDesc || "Operación sin descripción"}</span>. Esta acción no se puede deshacer.
          </p>

          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full">
              <div className="bg-background rounded-xl p-4 border border-border mb-4 text-left">
                {!hasPin ? (
                  <>
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <ShieldCheck size={16} />
                      <span className="text-sm font-semibold">Configura un PIN</span>
                    </div>
                    <p className="text-xs text-muted mb-3">
                      Parece que es tu primera vez borrando. Crea un PIN de 4 dígitos que se te pedirá en el futuro para evitar borrados accidentales.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted mb-3 text-center">
                    Ingresa tu PIN de seguridad para continuar.
                  </p>
                )}
                
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="****"
                  className="w-full text-center text-2xl tracking-[0.5em] bg-card border border-border rounded-lg py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors font-mono"
                  autoFocus
                />
                {error && (
                  <p className="text-rose-500 text-xs mt-2 text-center">{error}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-foreground bg-background border border-border hover:bg-muted/10 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || pin.length !== 4}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Borrando...
                    </>
                  ) : (
                    hasPin ? "Borrar" : "Crear y Borrar"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
