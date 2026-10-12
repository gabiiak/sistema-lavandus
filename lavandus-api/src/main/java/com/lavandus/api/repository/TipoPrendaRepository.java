package com.lavandus.api.repository;

import com.lavandus.api.model.TipoPrenda;
import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio de tipos de prenda. Se cargan por seed (data.sql).
public interface TipoPrendaRepository extends JpaRepository<TipoPrenda, Integer> {
}
