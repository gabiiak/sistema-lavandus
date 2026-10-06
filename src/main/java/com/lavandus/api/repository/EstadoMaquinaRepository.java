package com.lavandus.api.repository;

import com.lavandus.api.model.EstadoMaquina;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EstadoMaquinaRepository extends JpaRepository<EstadoMaquina, Integer> {
    Optional<EstadoMaquina> findByNombre(String nombre);
}