-- Seed reproducible: usuarios de prueba del sistema.
-- Corre en cada arranque; ON CONFLICT (email) DO NOTHING evita duplicar o pisar datos existentes.
-- Las claves son hashes BCrypt: admin123 (ADMIN) y empleado123 (EMPLEADO).
INSERT INTO empleado (nombre, apellido, email, clave, genero, rol) VALUES
    ('Admin', 'Lavandus', 'admin@lavandus.com', '$2a$10$pKN2hUHVGRRuyHA36SyAGuPrWeUupCvqNHrOBFTij0nYx65Qw7PDO', NULL, 'ADMIN'),
    ('Empleado', 'Prueba', 'empleado@lavandus.com', '$2a$10$CE8uKRK7mrp1Kh0WFwrH6.4uRHIhvQbCg1qpQpC4lZv.LDQFp1Gr.', NULL, 'EMPLEADO')
ON CONFLICT (email) DO NOTHING;

-- No se siembran máquinas: la tabla no tiene una restricción de unicidad y
-- se duplicarían en cada arranque. Las máquinas se crean desde la app (solo ADMIN).