package com.lavandus.api.repository;

import com.lavandus.api.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

// Cambiamos Long por Integer aquí al final -----------------v
public interface EmpleadoRepository extends JpaRepository<Empleado, Integer> {
    Optional<Empleado> findByEmail(String email);

    // Empleados por rol (ej: ENCARGADO_SERVICIO)
    List<Empleado> findByRol(String rol);
}