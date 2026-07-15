import { Transaction } from "@/types";

export function exportTransactionsToCSV(transactions: Transaction[]) {
  if (!transactions || transactions.length === 0) return;

  // Cabeceras del CSV
  const headers = ["Fecha", "Tipo", "Categoría", "Monto", "Descripción"];

  // Mapear transacciones a filas CSV
  const rows = transactions.map((t) => {
    const fecha = t.fecha; // YYYY-MM-DD
    const tipo = t.tipo.toUpperCase();
    const categoria = `"${t.categoria}"`; // Envolver en comillas por si tiene comas
    const monto = t.monto.toFixed(2);
    // Escapar comillas dobles en la descripción y envolver en comillas
    const desc = `"${t.descripcion.replace(/"/g, '""')}"`;
    return [fecha, tipo, categoria, monto, desc].join(",");
  });

  // Unir cabeceras y filas, incluyendo el BOM (\uFEFF) para forzar UTF-8 en Excel
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");

  // Crear un Blob y generar la URL de descarga
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Generar nombre de archivo dinámico basado en la fecha de hoy
  const today = new Date();
  const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const filename = `movimientos_${dateString}.csv`;

  // Simular un clic para gatillar la descarga
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();

  // Limpieza
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
