export type TransactionType = "ingreso" | "gasto";

export interface Categoria {
  id: string;
  nombre: string;
  tipo: TransactionType;
  user_id: string | null;
  es_predeterminada: boolean;
  activa: boolean;
  creado_en?: string;
}

export interface Transaction {
  id: string; // En DB es UUID
  monto: number;
  tipo: TransactionType;
  categoria: string; // Temporalmente string (nombre) hasta migrar backend
  categoria_id?: string; // Nuevo campo FK
  gasto_fijo_id?: string | null; // FK a gastos fijos
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  creado_en?: string;
}

export interface GastoFijo {
  id: string;
  user_id: string;
  nombre: string;
  monto_estimado: number;
  categoria_id: string;
  categoria_nombre?: string; // Auxiliar
  dia_vencimiento: number;
  activo: boolean;
  creado_en?: string;
}
export interface Presupuesto {
  id: string;
  user_id: string;
  categoria_id: string;
  categoria_nombre?: string; // Auxiliar
  monto_limite: number;
  mes: number;
  anio: number;
  creado_en?: string;
}

export interface BudgetStatus extends Presupuesto {
  consumed: number;
  percentage: number;
}

export interface Ahorro {
  id: string;
  user_id: string;
  nombre: string;
  monto_objetivo: number | null;
  monto_actual: number;
  creado_en?: string;
}

export interface MovimientoAhorro {
  id: string;
  ahorro_id: string;
  user_id: string;
  monto: number;
  tipo: "aporte" | "retiro";
  fecha: string; // YYYY-MM-DD
  creado_en?: string;
}
