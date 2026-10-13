package com.lavandus.api.repository;

import com.lavandus.api.model.TipoPrenda;
import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio de tipos de prenda. Hay tipos sembrados por data.sql.
// Los existsBy...IgnoreCase validan duplicados sin distinguir mayúsculas.
public interface TipoPrendaRepository extends JpaRepository<TipoPrenda, Integer> {
    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdTipoPrendaNot(String nombre, Integer idTipoPrenda);
}
