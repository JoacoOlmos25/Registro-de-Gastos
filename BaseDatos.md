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
    
    -- 3. Restricción estricta: Validar cruce entre tipo e ingreso/gasto
    CONSTRAINT chk_tipo_categoria CHECK (
        (tipo = 'gasto' AND categoria IN ('Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Compras', 'Otros')) OR
        (tipo = 'ingreso' AND categoria IN ('Salario', 'Inversiones', 'Freelance', 'Ventas', 'Regalos/Bonos', 'Otros'))
    )
);

-- Habilitar Row Level Security (Seguridad a Nivel de Fila)
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

-- ⚠️ Políticas de Desarrollo (Temporales) ⚠️
-- Como aún no tenemos usuarios registrados, permitimos leer y escribir a todos
CREATE POLICY "Permitir lectura anónima (Desarrollo)" 
ON movimientos FOR SELECT USING (true);

CREATE POLICY "Permitir inserción anónima (Desarrollo)" 
ON movimientos FOR INSERT WITH CHECK (true);