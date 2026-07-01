# 🚀 Plan de Despliegue a Producción (Gestor de Gastos)

Este documento detalla los Sprints finales para preparar la aplicación antes de su despliegue en Vercel. **Google Antigravity debe ejecutar un Sprint a la vez**, solicitando validación humana antes de avanzar al siguiente.

---

## 🔒 Sprint 5: Autenticación (Supabase + Google Auth)
**Objetivo:** Proteger la aplicación e implementar inicio de sesión.
* **Auth UI:** Crear una pantalla de Login (`/login`).
* **Proveedores:** Configurar Supabase Auth con Email/Contraseña y el proveedor de Google. (Nota para la IA: No crear tabla de usuarios personalizada, usar `auth.users` de Supabase).
* **Base de Datos (RLS):** Modificar la tabla `movimientos` para agregar la columna `user_id` vinculada al usuario autenticado. Actualizar las Políticas de Seguridad (RLS) para que los usuarios solo puedan hacer CRUD sobre sus propios registros.
* **Protección de Rutas:** Asegurar que el Dashboard principal redirija al `/login` si no hay sesión activa (usar middleware de Next.js).

## ⚡ Sprint 6: Optimización de Carga y Filtros Avanzados
**Objetivo:** Mejorar la experiencia de usuario (UX) al consultar la base de datos.
* **Navegación Fluida:** Modificar la lógica de carga para que las transiciones de página sean instantáneas. 
* **Feedback Visual:** Implementar un estado de carga (`loading state` con un spinner de `lucide-react`) que se muestre *mientras* se consultan los datos de Supabase, simulando mayor velocidad.
* **Filtros Mejorados:** Actualizar el selector de fechas. Además de los filtros rápidos (Hoy, Semana, Mes actual), agregar selectores (dropdowns) para elegir Meses y Años históricos específicos.

## 🗔 Sprint 7: Interfaz del Formulario (Modal)
**Objetivo:** Limpiar el Dashboard visualmente.
* **Componente Modal:** Mover el `ExpenseForm` (formulario de carga de ingresos/gastos) que actualmente está fijo en la pantalla hacia una ventana flotante (Modal / Dialog).
* **Trigger:** Agregar un Botón Flotante (FAB) o un botón principal destacado en el Dashboard llamado "Nuevo Movimiento" que dispare la apertura de este Modal.

## 🎨 Sprint 8: Theming (Modo Claro / Oscuro)
**Objetivo:** Implementar un `Theme Switcher` global.
* **Dependencia:** Instalar y configurar `next-themes`.
* **Modo Claro:** Configurar el fondo principal estrictamente con el color `#FAFAFA`. Generar colores secundarios (tarjetas, bordes) que mantengan un alto contraste y sean cómodos a la vista.
* **Modo Oscuro:** Inspirarse en la paleta de **Obsidian**. Usar grises profundos casi negros para el fondo (ej. `#1e1e1e`) y grises un poco más claros para las tarjetas (ej. `#2d2d2d`), manteniendo los acentos verdes/azules que ya existían para los datos.

## 🧹 Sprint 9: Refactorización y Control de Tipos (TypeScript)
**Objetivo:** Preparar código sólido para el build de Vercel.
* **Type-checking:** Revisar todos los componentes e interfaces de TypeScript. Eliminar cualquier tipado `any` implícito y corregir errores de tipos.
* **Limpieza de Consola:** Eliminar todos los `console.log()`, `console.error()` de prueba o código comentado innecesario.
* **Auditoría Final:** Asegurar que no haya advertencias de ESLint críticas antes del `git push` final a producción.