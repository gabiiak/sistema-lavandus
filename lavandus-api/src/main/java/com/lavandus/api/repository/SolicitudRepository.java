package com.lavandus.api.repository;

import com.lavandus.api.model.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio de solicitudes de lavado.
public interface SolicitudRepository extends JpaRepository<Solicitud, Integer> {
}
