package com.lavandus.api.repository;

import com.lavandus.api.model.MaquinaLavadora;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaquinaLavadoraRepository extends JpaRepository<MaquinaLavadora, Integer> {
}