export type TransactionType = "ingreso" | "gasto";

export interface Transaction {
  id: string; // En DB es UUID
  monto: number;
  tipo: TransactionType;
  categoria: string;
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  creado_en?: string;
}
