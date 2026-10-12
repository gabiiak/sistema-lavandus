-- Seed reproducible: usuarios de prueba del sistema.
-- Corre en cada arranque; ON CONFLICT (email) DO NOTHING evita duplicar o pisar datos existentes.
-- Las claves son hashes BCrypt: admin123 (ADMIN), empleado123 (EMPLEADO) y encargado123 (ENCARGADO_SERVICIO).
INSERT INTO empleado (nombre, apellido, email, clave, genero, rol) VALUES
    ('Admin', 'Lavandus', 'admin@lavandus.com', '$2a$10$pKN2hUHVGRRuyHA36SyAGuPrWeUupCvqNHrOBFTij0nYx65Qw7PDO', NULL, 'ADMIN'),
    ('Empleado', 'Prueba', 'empleado@lavandus.com', '$2a$10$CE8uKRK7mrp1Kh0WFwrH6.4uRHIhvQbCg1qpQpC4lZv.LDQFp1Gr.', NULL, 'EMPLEADO'),
    ('Encargado', 'Servicio', 'encargado@lavandus.com', '$2a$10$ubTH2lz1iusVkelACnO4I.2FZI4N3p5RY4it72d6PgDSZLWskXHnO', NULL, 'ENCARGADO_SERVICIO')
ON CONFLICT (email) DO NOTHING;

-- No se siembran máquinas: la tabla no tiene una restricción de unicidad y
-- se duplicarían en cada arranque. Las máquinas se crean desde la app (solo ADMIN).

-- Tipos de prenda de ejemplo (peso por unidad en kg y precio unitario en ARS).
INSERT INTO tipo_prenda (nombre, peso, precio) VALUES
    ('Camisa', 0.5, 1000.00),
    ('Sábana doble', 5.0, 5000.00),
    ('Toalla', 7.0, 3000.00)
ON CONFLICT (nombre) DO NOTHING;