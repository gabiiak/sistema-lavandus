package com.lavandus.api.repository;

import com.lavandus.api.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Repositorio de facturas de servicio.
public interface FacturaRepository extends JpaRepository<Factura, Integer> {

    // Factura de un servicio (a lo sumo una)
    Optional<Factura> findByServicioIdServicio(Integer idServicio);

    // true si el servicio ya fue facturado
    boolean existsByServicioIdServicio(Integer idServicio);
}
