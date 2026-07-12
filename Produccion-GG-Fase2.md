# 🚀 Plan de Despliegue a Producción — Fase 2 (Gestor de Gastos)

Este documento continúa la hoja de ruta de `Produccion-GG.md` (Sprints 5-9, ya completados y en producción). **Google Antigravity debe ejecutar un Sprint a la vez**, solicitando validación humana antes de avanzar al siguiente, y respetando el protocolo definido en `reglas_ejecucion_antigravity.md` (Diagnóstico → Plan de Arquitectura → Impacto y Modificaciones, antes de tocar código).

⚠️ **Nota de contexto para la IA:** Los datos actualmente cargados en la aplicación son datos de **prueba**, no productivos. Esto habilita al Sprint 10 a limpiar la tabla `movimientos` durante la migración en lugar de invertir esfuerzo en preservar/mapear registros existentes. No es necesario diseñar scripts de backfill complejos ni de rollback de datos históricos.

---

## 🗂️ Sprint 10: Migración de Categorías (ENUM → Tabla relacional)
**Objetivo:** Reemplazar el ENUM fijo `categoria_tipo` por un modelo relacional que permita categorías predeterminadas (globales) y categorías personalizadas (por usuario).

### Tareas
* **Nueva tabla `categorias`:**
  * `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  * `nombre VARCHAR(50) NOT NULL`
  * `tipo VARCHAR(10) CHECK (tipo IN ('ingreso', 'gasto')) NOT NULL`
  * `user_id UUID REFERENCES auth.users(id)` — **nullable**: `NULL` significa categoría predeterminada/global, visible para todos.
  * `es_predeterminada BOOLEAN NOT NULL DEFAULT false`
  * `creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL`
  * Constraint de unicidad: no permitir nombres duplicados para el mismo usuario y tipo (`UNIQUE(user_id, nombre, tipo)` considerando `NULL` como caso global).
* **Poblar categorías predeterminadas:** insertar las 13 categorías actuales del ENUM (`Alimentación`, `Transporte`, `Servicios`, `Entretenimiento`, `Salud`, `Educación`, `Compras`, `Salario`, `Inversiones`, `Freelance`, `Ventas`, `Regalos/Bonos`, `Otros`) con `user_id = NULL` y `es_predeterminada = true`.
* **Modificar tabla `movimientos`:**
  * Dado que los datos actuales son de prueba, **no es necesario migrar registros existentes**. Se puede truncar la tabla `movimientos` (`TRUNCATE TABLE movimientos;`) antes de aplicar el cambio de columna, dejando la app lista para datos reales desde cero.
  * Eliminar columna `categoria` (tipo ENUM).
  * Agregar columna `categoria_id UUID REFERENCES categorias(id) NOT NULL`.
  * Eliminar el `CONSTRAINT chk_tipo_categoria` (el cruce `tipo`/`categoria` ya no se puede validar con un CHECK estático contra un ENUM).
* **Validación de integridad tipo/categoría:** como reemplazo del CHECK eliminado, implementar un **trigger** en Postgres (`BEFORE INSERT OR UPDATE ON movimientos`) que valide que `movimientos.tipo` coincida con el `tipo` de la categoría referenciada en `categorias`. Esto evita que, por ejemplo, se cargue un "ingreso" con una categoría marcada como "gasto".
* **Eliminar el tipo ENUM** `categoria_tipo` una vez que ninguna columna lo referencie (`DROP TYPE categoria_tipo;`).
* **RLS de `categorias`:**
  * SELECT: el usuario ve las categorías donde `user_id = auth.uid()` **o** `user_id IS NULL` (predeterminadas).
  * INSERT: `WITH CHECK (auth.uid() = user_id)` — un usuario solo puede crear categorías propias, nunca globales.
  * UPDATE/DELETE: solo sobre categorías propias (`user_id = auth.uid()`); las predeterminadas no deben ser editables ni borrables por ningún usuario.
* **Frontend:**
  * Actualizar `ExpenseForm` para que el selector de categoría cargue dinámicamente desde la tabla `categorias` (predeterminadas + propias del usuario), filtrando por `tipo` (ingreso/gasto) según corresponda.
  * Agregar opción "Crear nueva categoría" dentro del mismo selector o como acción rápida adyacente.

### Impacto
* Se pierde el dataset de prueba actual (intencional, según lo acordado).
* Todo componente que hoy referencie el ENUM `categoria_tipo` en TypeScript debe actualizarse para tipar `categoria_id` y resolver el nombre de la categoría vía join/fetch.

---

## 🔍 Sprint 11: Buscar, Filtrar y Borrar Operaciones
**Objetivo:** Dar control total sobre el historial de movimientos ya cargados.

### Tareas
* **Buscador de texto libre:** input que filtre sobre `descripcion` (búsqueda parcial, case-insensitive, `ILIKE '%texto%'` o equivalente vía Supabase client).
* **Filtro por categoría:** selector (multi o single-select) que use la tabla `categorias` ya migrada en el Sprint 10.
* **Filtro por rango de fechas:** reutilizar el selector de Mes/Año existente (Sprint 6) y extenderlo a un rango libre (fecha desde / fecha hasta) como opción adicional.
* **Combinación de filtros:** todos los filtros (texto + categoría + fecha) deben poder aplicarse en simultáneo (AND lógico).
* **Borrado de movimientos:** botón de eliminar por fila, con modal/diálogo de confirmación antes de ejecutar el DELETE (la política RLS de eliminación ya existe desde Sprint 5, solo falta la UI y la llamada).
* **Feedback visual:** reusar el patrón de loading state (`lucide-react` spinner) del Sprint 6 mientras se aplican filtros o se borra un registro.

### Impacto
* No requiere cambios de schema. Cambios acotados a queries del cliente Supabase y componentes de UI del Dashboard/listado.

---

## 📌 Sprint 12: Gastos Fijos + Semaforización
**Objetivo:** Nueva sección para registrar gastos recurrentes mensuales (alquiler, servicios, suscripciones) con indicador visual de proximidad de vencimiento.

### Tareas
* **Nueva tabla `gastos_fijos`:**
  * `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  * `user_id UUID REFERENCES auth.users(id) NOT NULL`
  * `nombre VARCHAR(100) NOT NULL`
  * `monto_estimado DECIMAL(12,2) NOT NULL`
  * `categoria_id UUID REFERENCES categorias(id) NOT NULL`
  * `dia_vencimiento INTEGER NOT NULL CHECK (dia_vencimiento BETWEEN 1 AND 31)`
  * `activo BOOLEAN NOT NULL DEFAULT true`
  * `creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL`
* **RLS:** mismo patrón que `movimientos` (SELECT/INSERT/UPDATE/DELETE atados a `auth.uid() = user_id`).
* **Nueva vista/sección "Gastos Fijos":** listado de gastos fijos activos del usuario con tarjetas o filas, cada una mostrando nombre, monto estimado, categoría y el indicador de semáforo.
* **Función de cálculo de estado (semaforización):** función pura en TypeScript (reusable, sin guardar el color en base de datos) que reciba `dia_vencimiento` y la fecha actual, y devuelva uno de 4 estados:
  * 🟢 **Verde:** faltan más de 5 días para el vencimiento.
  * 🟡 **Amarillo:** faltan entre 3 y 5 días.
  * 🔴 **Rojo:** falta 1 o 2 días.
  * 🟤 **Bordo:** la fecha de vencimiento ya pasó este mes.
  * *(Umbrales ajustables en un único lugar del código, no hardcodeados en múltiples componentes.)*
* **Acción "Marcar como pagado":** botón que, al confirmarse, crea un registro real en `movimientos` (tipo `gasto`, mismo monto/categoría, fecha actual) — esto conecta el gasto fijo con el historial real sin duplicar lógica de carga.
* **Reinicio mensual:** el semáforo se recalcula automáticamente en cada carga de la vista según la fecha del sistema; no requiere jobs ni cron.

### Impacto
* Tabla nueva, sin modificar tablas existentes salvo la relación de FK hacia `categorias`.

---

## 💰 Sprint 13: Presupuestos por Categoría (Opcionales)
**Objetivo:** Permitir definir un límite de gasto mensual por categoría, sin que sea obligatorio.

### Tareas
* **Nueva tabla `presupuestos`:**
  * `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  * `user_id UUID REFERENCES auth.users(id) NOT NULL`
  * `categoria_id UUID REFERENCES categorias(id) NOT NULL`
  * `monto_limite DECIMAL(12,2) NOT NULL`
  * `mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12)`
  * `anio INTEGER NOT NULL`
  * `UNIQUE(user_id, categoria_id, mes, anio)` — un solo presupuesto por categoría/mes/usuario.
* **RLS:** mismo patrón estándar (CRUD atado a `auth.uid() = user_id`).
* **Comportamiento opcional:** si no existe fila de presupuesto para una categoría/mes dado, la categoría simplemente no muestra barra de progreso ni alerta — no se fuerza a cargar límites para todas las categorías.
* **Cálculo de progreso:** sumar `movimientos` del tipo `gasto` filtrados por `categoria_id`, `mes` y `anio` del usuario, y compararlo contra `monto_limite`.
* **Indicador visual:** barra de progreso (porcentaje consumido) con estado:
  * Normal: por debajo del 80% del límite.
  * Alerta (acercándose): entre 80% y 100%.
  * Excedido: por encima del 100% del límite.
* **UI de gestión:** pantalla o sección donde el usuario pueda crear/editar/eliminar presupuestos por categoría y mes, de forma completamente opcional.

### Impacto
* Depende de `categorias` (Sprint 10) para la FK. No modifica tablas existentes.

---

## 📊 Sprint 14: Comparativa Mes a Mes
**Objetivo:** Visualizar la evolución de gastos/ingresos entre el mes actual y el anterior, por categoría.

### Tareas
* **Query agregada:** obtener totales de `movimientos` agrupados por `categoria_id` y mes, para el mes actual y el mes inmediatamente anterior (respetando el usuario autenticado vía RLS).
* **Componente de gráfico:** usar `recharts` (ya integrado en el stack) para mostrar un gráfico de barras comparativo (mes actual vs. mes anterior) por categoría, o un gráfico de líneas de evolución si se prefiere una vista de tendencia.
* **Indicador de variación:** mostrar junto a cada categoría el porcentaje de aumento/disminución respecto al mes anterior (ej. "+15% vs. mes pasado" en rojo, "-8% vs. mes pasado" en verde).
* **Ubicación:** integrar como nueva sección dentro del Dashboard de gráficos existente (Sprint 6-8), sin duplicar la lógica de filtros ya implementada.

### Impacto
* No requiere cambios de schema. Cambios acotados a queries agregadas y un nuevo componente visual.

---

## 📤 Sprint 15: Exportación a CSV
**Objetivo:** Permitir descargar el historial de movimientos filtrado para uso externo (declaraciones, respaldo personal).

### Tareas
* **Botón "Exportar CSV"** ubicado en la vista de listado/filtros (Sprint 11), que exporte exactamente el resultado actual de los filtros aplicados (texto, categoría, fecha) — no todo el historial completo si hay filtros activos.
* **Generación del archivo:** serializar los movimientos visibles a formato `.csv` (columnas: fecha, tipo, categoría, monto, descripción) en el cliente, sin necesidad de una ruta API dedicada ni dependencias pesadas.
* **Nombre de archivo:** generar dinámicamente incluyendo el rango de fechas exportado (ej. `movimientos_2026-01-01_2026-01-31.csv`).
* **Codificación:** UTF-8 con separador de coma estándar, asegurando compatibilidad al abrir en Excel/Google Sheets aunque el foco sea CSV puro.

### Impacto
* Sin cambios de schema. Es la funcionalidad más autónoma y liviana de la fase, ideal como cierre de sprint.

---

## ✅ Orden de Ejecución Resumido
1. **Sprint 10** — Migración de categorías (base estructural, incluye limpieza de datos de prueba).
2. **Sprint 11** — Buscar / filtrar / borrar operaciones.
3. **Sprint 12** — Gastos fijos + semaforización por colores.
4. **Sprint 13** — Presupuestos por categoría (opcionales).
5. **Sprint 14** — Comparativa mes a mes.
6. **Sprint 15** — Exportación a CSV.

Cada sprint requiere validación humana antes de avanzar al siguiente, siguiendo el protocolo de `reglas_ejecucion_antigravity.md`.
