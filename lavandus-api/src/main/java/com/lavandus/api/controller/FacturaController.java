package com.lavandus.api.controller;

import com.lavandus.api.dto.FacturaResponse;
import com.lavandus.api.service.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Endpoints REST de facturas. Todas las rutas son solo ADMIN (ver SecurityConfig).
@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    @Autowired
    private FacturaService facturaService;

    // GET /api/facturas/servicio/{idServicio} -> estado de la factura del servicio
    @GetMapping("/servicio/{idServicio}")
    public FacturaResponse obtener(@PathVariable Integer idServicio) {
        return facturaService.obtenerPorServicio(idServicio);
    }

    // GET /api/facturas/servicio/{idServicio}/pdf -> descarga el PDF
    @GetMapping("/servicio/{idServicio}/pdf")
    public ResponseEntity<Resource> descargar(@PathVariable Integer idServicio) {
        Resource pdf = facturaService.obtenerPdf(idServicio);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"factura-" + idServicio + ".pdf\"")
                .body(pdf);
    }

    // POST /api/facturas/servicio/{idServicio}/enviar -> reintenta el envío del correo
    @PostMapping("/servicio/{idServicio}/enviar")
    public FacturaResponse enviar(@PathVariable Integer idServicio) {
        return facturaService.enviar(idServicio);
    }
}
