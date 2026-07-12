export type TransactionType = "ingreso" | "gasto";

export interface Categoria {
  id: string;
  nombre: string;
  tipo: TransactionType;
  user_id: string | null;
  es_predeterminada: boolean;
  creado_en?: string;
}

export interface Transaction {
  id: string; // En DB es UUID
  monto: number;
  tipo: TransactionType;
  categoria: string; // Temporalmente string (nombre) hasta migrar backend
  categoria_id?: string; // Nuevo campo FK
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  creado_en?: string;
}
