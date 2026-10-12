package com.lavandus.api.repository;

import com.lavandus.api.model.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio de servicios de lavado.
public interface ServicioRepository extends JpaRepository<Servicio, Integer> {

    // true si la solicitud ya fue convertida en un servicio
    boolean existsBySolicitudIdSolicitud(Integer idSolicitud);
}
