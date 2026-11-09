-- Seed reproducible: usuarios de prueba del sistema.
-- Corre en cada arranque; ON CONFLICT (email) DO NOTHING evita duplicar o pisar datos existentes.
-- Las claves son hashes BCrypt: admin123 (ADMIN), encargado123 (ENCARGADO_SERVICIO)
-- y operaciones123 (ENCARGADO_OPERACIONES).
INSERT INTO empleado (nombre, apellido, email, clave, genero, rol) VALUES
    ('Admin', 'Lavandus', 'admin@lavandus.com', '$2a$10$pKN2hUHVGRRuyHA36SyAGuPrWeUupCvqNHrOBFTij0nYx65Qw7PDO', NULL, 'ADMIN'),
    ('Encargado', 'Servicio', 'encargado@lavandus.com', '$2a$10$ubTH2lz1iusVkelACnO4I.2FZI4N3p5RY4it72d6PgDSZLWskXHnO', NULL, 'ENCARGADO_SERVICIO'),
    ('Encargado', 'Operaciones', 'operaciones@lavandus.com', '$2a$10$pjJMqWK0o6rSV8q0tAOZLucbb0wfx/pmgKBOCpQm3z1o.K3C.RvRi', NULL, 'ENCARGADO_OPERACIONES')
ON CONFLICT (email) DO NOTHING;

-- No se siembran máquinas: la tabla no tiene una restricción de unicidad y
-- se duplicarían en cada arranque. Las máquinas se crean desde la app (solo ADMIN).

-- Migración de registros existentes de maquina_lavadora:
-- Convierte la columna 'tamano' de texto a entero (capacidad en kg) sin perder registros existentes
-- y rellena cualquier valor nulo previo para evitar errores al leer la entidad.
ALTER TABLE maquina_lavadora ADD COLUMN IF NOT EXISTS tamano INTEGER DEFAULT 25;
ALTER TABLE maquina_lavadora ADD COLUMN IF NOT EXISTS capacidad DOUBLE PRECISION DEFAULT 0;
ALTER TABLE maquina_lavadora ALTER COLUMN tamano DROP DEFAULT;

ALTER TABLE maquina_lavadora
ALTER COLUMN tamano TYPE INTEGER
USING (
    CASE
        WHEN tamano IS NULL THEN 25
        WHEN tamano::text ~ '[0-9]+' THEN CAST(substring(tamano::text FROM '[0-9]+') AS INTEGER)
        WHEN LOWER(tamano::text) LIKE '%chica%' OR LOWER(tamano::text) LIKE '%peque%' THEN 15
        WHEN LOWER(tamano::text) LIKE '%mediana%' THEN 25
        WHEN LOWER(tamano::text) LIKE '%grande%' OR LOWER(tamano::text) LIKE '%industrial%' THEN 50
        ELSE 25
    END
);

UPDATE maquina_lavadora SET tamano = CAST(ROUND(capacidad) AS INTEGER) WHERE capacidad > 0;
UPDATE maquina_lavadora SET tamano = 25 WHERE tamano IS NULL OR tamano <= 0;
ALTER TABLE maquina_lavadora ALTER COLUMN tamano SET DEFAULT 25;
ALTER TABLE maquina_lavadora ALTER COLUMN tamano SET NOT NULL;
ALTER TABLE maquina_lavadora DROP COLUMN IF EXISTS capacidad;

-- Tipos de prenda de ejemplo (peso por unidad en kg y precio unitario en ARS).
INSERT INTO tipo_prenda (nombre, peso, precio) VALUES
    ('Camisa', 0.5, 1000.00),
    ('Sábana doble', 5.0, 5000.00),
    ('Toalla', 7.0, 3000.00)
ON CONFLICT (nombre) DO NOTHING;