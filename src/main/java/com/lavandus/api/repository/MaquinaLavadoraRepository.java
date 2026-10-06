package com.lavandus.api.repository;

import com.lavandus.api.model.MaquinaLavadora;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaquinaLavadoraRepository extends JpaRepository<MaquinaLavadora, Integer> {
    // Te agrego esta consulta útil para buscar máquinas por estado (ej. "OPERATIVA")
    List<MaquinaLavadora> findByEstado_Nombre(String nombreEstado);
}