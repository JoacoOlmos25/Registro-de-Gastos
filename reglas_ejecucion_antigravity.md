# 🛠️ Reglas de Ejecución y Co-Piloto para Vibecoding

Este documento establece las directrices de interacción para el agente de IA durante la sesión de desarrollo interactivo (*vibecoding*). El objetivo es mantener el control total del flujo de trabajo, comprender cada modificación antes de que ocurra y asegurar un código limpio y estructurado.

---

## 📋 Protocolo de Comunicación Pre-Ejecución

Antes de realizar cualquier modificación en el sistema de archivos, escribir código nuevo o refactorizar bloques existentes, la IA **debe** responder con el siguiente esquema de tres pasos:

1. **📍 Diagnóstico y Alcance:** Qué archivos o módulos se verán afectados y por qué es necesario el cambio.
2. **📐 Plan de Arquitectura:** Una explicación breve (máximo un párrafo) de la lógica o estructura que se va a implementar (ej. el flujo de datos entre la base de datos y la interfaz, o la lógica de una función).
3. **⚠️ Impacto y Modificaciones:** Detallar exactamente qué se va a insertar, borrar o reescribir para evitar efectos colaterales inesperados.

> 🛑 **Regla de Oro:** Si hay un concepto complejo o un cambio estructural que no quede claro en la explicación previa, el desarrollo se detiene hasta que se resuelvan las dudas de diseño.

---

## 💻 Estándares de Código y Desarrollo

Para garantizar que el proyecto mantenga una calidad de nivel de ingeniería y sea fácilmente mantenible, la IA seguirá estas reglas técnicas:

* **Modularidad Estricta:** Dividir el código en funciones y componentes con una única responsabilidad. Evitar archivos monolíticos o funciones gigantes.
* **Código Limpio y Autoexplicativo:** El código debe hablar por sí mismo a través de una lógica clara y una nomenclatura precisa.
* **Cero Comentarios Redundantes:** Queda prohibido el uso de comentarios obvios o excesivos (ej. `// incrementar i en 1`). Los comentarios solo se permiten para explicar decisiones de diseño arquitectónico complejas o algoritmos no triviales.
* **Consistencia en Nombres:** Utilizar convenciones de nombres de variables coherentes con el contexto del proyecto, manteniendo un estilo compacto pero altamente legible.
* **Progreso Incremental:** No intentar resolver múltiples características a la vez. Avanzar mediante pequeños hitos funcionales que se puedan probar de inmediato de forma aislada.

---

## 🎯 Consejos para Exprimir Google Antigravity en Vibecoding

Para aprovechar al máximo el entorno de desarrollo y la velocidad de ejecución de Google Antigravity este fin de semana, apliquen las siguientes prácticas:

### 1. Mantengan el Contexto Limpio (`Context Hygiene`)
Antigravity procesa el espacio de trabajo en tiempo real. Si el árbol de archivos se llena de dependencias basura, código muerto o carpetas temporales pesadas, la IA puede confundirse o volverse más lenta al indexar. Mantengan solo lo esencial en el directorio de trabajo.

### 2. Usen este Archivo como Ancla (`System Prompting`)
Al iniciar la sesión en Antigravity, referencien directamente este archivo Markdown o dejen el documento abierto en el entorno. Díganle explícitamente al entorno: *"Leé las reglas de ejecución de `reglas_ejecucion_antigravity.md` y aplícalas estrictamente para cada interacción de este fin de semana"*.

### 3. Soliciten Prototipos Estáticos Antes de Conectar la Base de Datos
No pinchen la base de datos (sea SQLite, Supabase o Firebase) en la primera línea de código. Usen la velocidad de Antigravity para levantar primero una interfaz simple con datos estáticos (*mock data*) estructurados en memoria. Una vez que el flujo visual y la lógica local funcionen a la perfección, den la orden de migrar esos almacenes a tablas persistentes.

### 4. Sesiones de Refactorización Explicadas
Cuando terminen una función o vista compleja, no pasen al siguiente módulo de inmediato. Pídanle a Antigravity: *"Analizá el módulo que acabamos de escribir y explicame dos mejoras posibles de rendimiento o legibilidad antes de aplicarlas"*. Esto convierte el *vibecoding* en una sesión de code review interactiva de alto valor.
