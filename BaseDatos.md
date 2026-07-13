-- Habilitar la extensión para generar UUIDs automáticamente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Crear el tipo de dato ENUM con todas las categorías posibles
CREATE TYPE categoria_tipo AS ENUM (
    'Alimentación',
    'Transporte',
    'Servicios',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Compras',
    'Salario',
    'Inversiones',
    'Freelance',
    'Ventas',
    'Regalos/Bonos',
    'Otros'
);

-- 2. Crear la tabla principal de movimientos
CREATE TABLE movimientos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    monto DECIMAL(12, 2) NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('ingreso', 'gasto')) NOT NULL,
    categoria categoria_tipo NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    
    -- 3. Restricción estricta: Validar cruce entre tipo e ingreso/gasto
    CONSTRAINT chk_tipo_categoria CHECK (
        (tipo = 'gasto' AND categoria IN ('Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Compras', 'Otros')) OR
        (tipo = 'ingreso' AND categoria IN ('Salario', 'Inversiones', 'Freelance', 'Ventas', 'Regalos/Bonos', 'Otros'))
    )
);

-- Habilitar Row Level Security (Seguridad a Nivel de Fila)
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

-- ⚠️ Políticas de Producción (Sprint 5) ⚠️
-- Los usuarios solo pueden leer sus propios registros
CREATE POLICY "Lectura de datos propios" 
ON movimientos FOR SELECT 
USING (auth.uid() = user_id);

-- Los usuarios solo pueden insertar registros a su nombre
CREATE POLICY "Inserción de datos propios" 
ON movimientos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar/eliminar sus registros
CREATE POLICY "Modificación de datos propios" 
ON movimientos FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Eliminación de datos propios" 
ON movimientos FOR DELETE 
USING (auth.uid() = user_id);

---

## Migración Sprint 10: Categorías Relacionales

Ejecutar este script en el SQL Editor de Supabase para aplicar los cambios del Sprint 10:

```sql
-- 1. Crear la tabla de categorías
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('ingreso', 'gasto')) NOT NULL,
    user_id UUID REFERENCES auth.users(id), -- NULL para globales
    es_predeterminada BOOLEAN NOT NULL DEFAULT false,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, nombre, tipo)
);

-- 2. Habilitar RLS en categorías
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura de categorias (propias y globales)" 
ON categorias FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Inserción de categorias propias" 
ON categorias FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Modificación de categorias propias" 
ON categorias FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Eliminación de categorias propias" 
ON categorias FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Poblar categorías predeterminadas
INSERT INTO categorias (nombre, tipo, user_id, es_predeterminada) VALUES
('Alimentación', 'gasto', NULL, true),
('Transporte', 'gasto', NULL, true),
('Servicios', 'gasto', NULL, true),
('Entretenimiento', 'gasto', NULL, true),
('Salud', 'gasto', NULL, true),
('Educación', 'gasto', NULL, true),
('Compras', 'gasto', NULL, true),
('Otros', 'gasto', NULL, true),
('Salario', 'ingreso', NULL, true),
('Inversiones', 'ingreso', NULL, true),
('Freelance', 'ingreso', NULL, true),
('Ventas', 'ingreso', NULL, true),
('Regalos/Bonos', 'ingreso', NULL, true),
('Otros', 'ingreso', NULL, true);

-- 4. Truncar la tabla movimientos para limpiar datos de prueba viejos
TRUNCATE TABLE movimientos;

-- 5. Modificar la tabla movimientos (eliminar enum, agregar fk)
ALTER TABLE movimientos DROP CONSTRAINT chk_tipo_categoria;
ALTER TABLE movimientos DROP COLUMN categoria;
ALTER TABLE movimientos ADD COLUMN categoria_id UUID REFERENCES categorias(id) NOT NULL;

-- 6. Eliminar el tipo ENUM antiguo
DROP TYPE categoria_tipo;

-- 7. Crear el trigger para validar integridad de tipo
CREATE OR REPLACE FUNCTION validar_tipo_movimiento_categoria()
RETURNS TRIGGER AS $$
DECLARE
    cat_tipo VARCHAR;
BEGIN
    SELECT tipo INTO cat_tipo FROM categorias WHERE id = NEW.categoria_id;
    IF NEW.tipo != cat_tipo THEN
        RAISE EXCEPTION 'El tipo de movimiento (%) no coincide con el tipo de la categoría (%)', NEW.tipo, cat_tipo;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_tipo_categoria
BEFORE INSERT OR UPDATE ON movimientos
FOR EACH ROW
EXECUTE FUNCTION validar_tipo_movimiento_categoria();
```

---

## Migración Sprint 12: Gastos Fijos y Semaforización

Ejecutar este script en el SQL Editor de Supabase para aplicar los cambios de la Fase A del Sprint 12:

```sql
-- 1. Crear la tabla de gastos fijos
CREATE TABLE gastos_fijos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    monto_estimado DECIMAL(12,2) NOT NULL,
    categoria_id UUID REFERENCES categorias(id) NOT NULL,
    dia_vencimiento INTEGER NOT NULL CHECK (dia_vencimiento BETWEEN 1 AND 31),
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS en gastos fijos
ALTER TABLE gastos_fijos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura de gastos fijos propios" 
ON gastos_fijos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Inserción de gastos fijos propios" 
ON gastos_fijos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Modificación de gastos fijos propios" 
ON gastos_fijos FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Eliminación de gastos fijos propios" 
ON gastos_fijos FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Modificar la tabla movimientos (vincular con gastos fijos)
ALTER TABLE movimientos ADD COLUMN gasto_fijo_id UUID REFERENCES gastos_fijos(id);
```