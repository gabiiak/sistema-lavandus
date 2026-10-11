package com.lavandus.api.repository;

import com.lavandus.api.model.Marca;
import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio de marcas. Los existsBy...IgnoreCase validan duplicados sin distinguir mayúsculas.
public interface MarcaRepository extends JpaRepository<Marca, Integer> {
    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdMarcaNot(String nombre, Integer idMarca);
}
