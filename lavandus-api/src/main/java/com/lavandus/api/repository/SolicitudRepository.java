package com.lavandus.api.repository;

import com.lavandus.api.model.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

// Repositorio de solicitudes de lavado.
public interface SolicitudRepository extends JpaRepository<Solicitud, Integer> {

    // Solicitudes que todavía no fueron convertidas en un servicio
    @Query("select s from Solicitud s where not exists "
            + "(select sv from Servicio sv where sv.solicitud = s)")
    List<Solicitud> findDisponibles();
}
