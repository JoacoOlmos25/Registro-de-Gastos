# 🚀 Plan de Despliegue a Producción — Fase 3 (Gestor de Gastos)

Este documento continúa la hoja de ruta de `Produccion-GG.md` (Sprints 5-9) y `Produccion-GG-Fase2.md` (Sprints 10-15), ambos ya completados y en producción. **Google Antigravity debe ejecutar un Sprint a la vez**, solicitando validación humana antes de avanzar al siguiente, y respetando el protocolo de `reglas_ejecucion_antigravity.md` (Diagnóstico → Plan de Arquitectura → Impacto y Modificaciones, antes de tocar código).

⚠️ **Nota de contexto para la IA:** Los datos actualmente cargados en la aplicación siguen siendo datos de **prueba**. Esto habilita a simplificar cualquier cambio de schema en esta fase (incluida la reducción de categorías del Sprint 18): no hace falta invertir esfuerzo en scripts de backup, rollback de datos históricos, ni migraciones cuidadosas pensadas para datos reales. Si en algún sprint resulta más simple limpiar una tabla que migrarla, priorizar la simplicidad.

---

## 🐛 Sprint 16: Correcciones Rápidas de UX
**Objetivo:** Resolver fricciones de uso detectadas en el día a día, sin tocar el esquema de base de datos.

### Tareas
* **Fecha por defecto en `ExpenseForm`:** el campo de fecha debe inicializarse automáticamente con la fecha actual del usuario al abrir el modal de carga, en lugar de quedar vacío. El usuario debe poder seguir editándola libremente para cargar movimientos retroactivos.
* **Resaltado visual de gastos en la tabla de movimientos:** en el listado de `movimientos` (Sprint 11), los registros con `tipo = 'gasto'` deben mostrarse con el monto (y opcionalmente el ícono/indicador de fila) en color rojo, para diferenciarlos visualmente de los ingresos de un vistazo rápido. Mantener buen contraste en ambos modos (Claro/Oscuro).
* **Edición de movimientos existentes:** actualmente solo se puede crear y borrar un movimiento (Sprint 11), pero no editarlo. Agregar acción "Editar" que reabra el `ExpenseForm` (modal) precargado con los datos del registro seleccionado, permitiendo modificar monto, categoría, fecha o descripción y guardarlo con `UPDATE` (la política RLS de `UPDATE` ya existe desde Sprint 5).
* **Edición de gastos fijos existentes:** mismo criterio — permitir editar nombre, monto estimado, categoría y día de vencimiento de un gasto fijo ya creado, sin necesidad de borrarlo y recrearlo.

### Impacto
* Sin cambios de schema. Cambios acotados a componentes de UI (`ExpenseForm`, tabla de movimientos, tarjetas de gastos fijos) y a las funciones de guardado (pasar de solo INSERT a INSERT/UPDATE según corresponda).

---

## 🗑️ Sprint 17: Soft-Delete de Gastos Fijos
**Objetivo:** Corregir el borrado de gastos fijos para que nunca afecte al historial de `movimientos`, usando borrado lógico en lugar de físico.

### Tareas
* **Auditoría previa (obligatoria antes de codear):** revisar cómo quedó implementada la acción de borrado actual sobre `gastos_fijos` — específicamente si existe alguna relación (FK, trigger, o lógica de la función de borrado) que esté eliminando también registros de `movimientos`. Documentar la causa encontrada antes de aplicar la corrección.
* **Uso de la columna `activo` existente:** la tabla `gastos_fijos` ya cuenta con `activo BOOLEAN NOT NULL DEFAULT true` desde el Sprint 12. El botón "Eliminar" debe dejar de ejecutar un `DELETE` físico y pasar a ejecutar un `UPDATE` que setee `activo = false`.
* **Filtrado por defecto:** la vista principal de "Gastos Fijos" debe mostrar únicamente los registros con `activo = true`.
* **Vista de inactivos y reactivación:** agregar un toggle o pestaña secundaria ("Ver inactivos") que liste los gastos fijos con `activo = false`, con una acción "Reactivar" que vuelva a setear `activo = true`, evitando que el usuario tenga que recrear desde cero un gasto fijo borrado por error.
* **Verificación de independencia:** confirmar que la relación entre "Marcar como pagado" (Sprint 12) y `movimientos` sigue siendo un registro completamente independiente (sin FK), de modo que desactivar un gasto fijo no borre ni modifique ningún movimiento ya generado a partir de él.

### Impacto
* No requiere nueva tabla ni columna (la columna `activo` ya existe). Cambio acotado a la lógica de borrado, a la query de listado, y a la nueva vista de inactivos.

---

## 🏷️ Sprint 18: Reducción y Gestión de Categorías
**Objetivo:** Simplificar el set de categorías predeterminadas y habilitar la creación de categorías propias desde más lugares de la app.

### Tareas
* **Definir el nuevo set reducido de categorías predeterminadas** (a acordar el listado final antes de codear, pero con la idea de dejar solo las de uso más frecuente en lugar de las 13 actuales).
* **Reasignación automática a "Otros":** cualquier categoría predeterminada que se elimine del nuevo set reducido, y que ya tenga movimientos, gastos fijos o presupuestos asociados, debe reasignar esos registros automáticamente a la categoría genérica "Otros" (ya existente) antes de eliminar la categoría vieja de la tabla `categorias`. Dado que los datos son de prueba, este paso puede resolverse de forma simple (un `UPDATE` masivo antes del `DELETE`), sin necesidad de scripts de migración elaborados.
* **Opción "Crear nueva categoría" en el desplegable de Presupuestos:** al definir un presupuesto por categoría (Sprint 13), el selector debe ofrecer la misma opción de creación rápida de categoría que ya existe en `ExpenseForm` (Sprint 10), sin obligar al usuario a salir del flujo.
* **Opción "Crear nueva categoría" en el desplegable de Gastos Fijos:** mismo criterio al crear o editar un gasto fijo (Sprint 12/16) — poder crear una categoría nueva sin abandonar el formulario.

### Impacto
* Cambios sobre la tabla `categorias` (reducción del set predeterminado) y sobre las tablas que la referencian (`movimientos`, `gastos_fijos`, `presupuestos`) vía reasignación a "Otros". Sin necesidad de resguardar datos históricos por tratarse de datos de prueba.

---

## 📈 Sprint 19: Acumuladores de Totales
**Objetivo:** Mostrar de un vistazo cuánto se lleva gastado en total dentro de Presupuestos y de Gastos Fijos.

### Tareas
* **Acumulador en Presupuestos:** mostrar un total general que sume lo efectivamente gastado (`movimientos` tipo `gasto`) en todas las categorías que tengan presupuesto definido para el mes/año actual, junto al total de los límites definidos (ej. "$45.000 gastados de $60.000 presupuestados").
* **Acumulador en Gastos Fijos:** mostrar la suma total de `monto_estimado` de todos los gastos fijos activos del mes, para que el usuario vea de un vistazo su compromiso fijo mensual total.
* **Ubicación:** encabezado o tarjeta resumen en la parte superior de cada una de las dos secciones (Presupuestos y Gastos Fijos), sin necesidad de una nueva pantalla.

### Impacto
* Sin cambios de schema. Son queries agregadas adicionales sobre datos ya existentes (`movimientos`, `presupuestos`, `gastos_fijos`).

---

## 🔔 Sprint 20: Notificaciones In-App por Presupuesto Excedido
**Objetivo:** Avisar al usuario, dentro del sitio, cuando esté cerca de superar o ya haya superado el presupuesto de alguna categoría.

### Tareas
* **Cálculo de estado por categoría con presupuesto:** reutilizando la lógica del Sprint 13 (gasto acumulado vs. `monto_limite`), calcular si una categoría está en estado normal, "por superar" (ej. ≥80% del límite) o "superada" (>100% del límite).
* **Notificación dentro del sitio (sin servicios externos):** al ingresar al Dashboard o a la sección de Presupuestos, mostrar un banner o notificación visual (no push, no email) listando las categorías en estado de alerta o excedidas, consistente con el enfoque de "sin complejizar con conectividad externa" ya usado en la semaforización de gastos fijos (Sprint 12).
* **No intrusivo:** la notificación debe poder cerrarse/descartarse por el usuario durante la sesión, y debe recalcularse en cada visita (sin necesidad de persistir el estado de "notificación vista").

### Impacto
* Sin cambios de schema. Lógica de cálculo reutilizada del Sprint 13, más un componente de banner/notificación nuevo.

---

## 🐷 Sprint 21: Frasco de Ahorro
**Objetivo:** Agregar un espacio para separar dinero del balance general, como una meta de ahorro independiente.

### Tareas
* **Nueva tabla `ahorros`:**
  * `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  * `user_id UUID REFERENCES auth.users(id) NOT NULL`
  * `nombre VARCHAR(100) NOT NULL` (ej. "Vacaciones", "Fondo de emergencia")
  * `monto_objetivo DECIMAL(12,2)` — **nullable**, la meta es opcional
  * `monto_actual DECIMAL(12,2) NOT NULL DEFAULT 0`
  * `creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL`
* **Nueva tabla `movimientos_ahorro`** (registro de aportes/retiros, para trazabilidad):
  * `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  * `ahorro_id UUID REFERENCES ahorros(id) NOT NULL`
  * `user_id UUID REFERENCES auth.users(id) NOT NULL`
  * `monto DECIMAL(12,2) NOT NULL`
  * `tipo VARCHAR(10) CHECK (tipo IN ('aporte', 'retiro')) NOT NULL`
  * `fecha DATE NOT NULL`
  * `creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL`
* **RLS en ambas tablas:** mismo patrón estándar del proyecto (CRUD atado a `auth.uid() = user_id`).
* **Independencia total del balance general:** los aportes y retiros de `ahorros` **no generan movimientos en la tabla `movimientos`** y no afectan el cálculo de ingresos/gastos ni ningún gráfico existente. Es un balance completamente aparte.
* **Ubicación en la interfaz:** implementar como subsección dentro de la vista de Presupuestos (mismo patrón usado para integrar la Comparativa mes a mes dentro de la sección de gráficos en la Fase 2).
* **Meta de ahorro opcional con barra de progreso:** si el usuario definió `monto_objetivo`, mostrar una barra de progreso (`monto_actual` / `monto_objetivo`), reutilizando el mismo componente visual ya usado para las barras de presupuesto por categoría (Sprint 13). Si no definió meta, mostrar solo el monto acumulado sin barra.
* **Acciones de aporte/retiro:** formulario simple para sumar o restar montos al frasco, cada acción genera una fila en `movimientos_ahorro` y actualiza `monto_actual` en `ahorros`.

### Impacto
* Dos tablas nuevas, totalmente desacopladas de `movimientos`. Sin impacto en RLS ni lógica ya existente de balance, presupuestos o gráficos.

---

## ✅ Orden de Ejecución Resumido
1. **Sprint 16** — Correcciones rápidas de UX (fecha por defecto, rojo en gastos, edición de movimientos y gastos fijos).
2. **Sprint 17** — Soft-delete de gastos fijos + vista de inactivos/reactivación.
3. **Sprint 18** — Reducción de categorías predeterminadas + reasignación a "Otros" + creación rápida de categoría en Presupuestos y Gastos Fijos.
4. **Sprint 19** — Acumuladores de totales en Presupuestos y Gastos Fijos.
5. **Sprint 20** — Notificaciones in-app por presupuesto excedido o próximo a excederse.
6. **Sprint 21** — Frasco de ahorro (nueva funcionalidad, independiente del balance general).

Cada sprint requiere validación humana antes de avanzar al siguiente, siguiendo el protocolo de `reglas_ejecucion_antigravity.md`.
