export type ExpenseStatusColor = "verde" | "amarillo" | "rojo" | "bordo" | "azul";

export interface ExpenseStatus {
  color: ExpenseStatusColor;
  texto: string;
}

/**
 * Calcula el estado de un gasto fijo basándose en su día de vencimiento,
 * la fecha actual y si ya fue pagado en el mes corriente.
 */
export function getExpirationStatus(
  diaVencimiento: number,
  isPaidThisMonth: boolean
): ExpenseStatus {
  if (isPaidThisMonth) {
    return { color: "azul", texto: "Pagado este mes" };
  }

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Fecha de vencimiento exacta de este mes
  // Se asume que el gasto vence en el mes corriente.
  // Si el día de vencimiento es mayor a los días del mes actual, se capa al último día del mes (ej: 31 feb -> 28 feb)
  const expirationDate = new Date(currentYear, currentMonth, diaVencimiento);
  if (expirationDate.getMonth() !== currentMonth) {
    expirationDate.setDate(0); // Último día del mes actual
  }
  
  const expirationDay = expirationDate.getDate();

  // Diferencia en días
  const daysDiff = expirationDay - currentDay;

  if (daysDiff < 0) {
    return { color: "bordo", texto: "Vencido" };
  } else if (daysDiff <= 2) {
    return { color: "rojo", texto: `Vence en ${daysDiff} día${daysDiff === 1 ? '' : 's'}` };
  } else if (daysDiff <= 5) {
    return { color: "amarillo", texto: `Vence en ${daysDiff} días` };
  } else {
    return { color: "verde", texto: `Vence en ${daysDiff} días` };
  }
}
