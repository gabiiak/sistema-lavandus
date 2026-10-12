package com.lavandus.api.controller;

import com.lavandus.api.dto.SolicitudRequest;
import com.lavandus.api.dto.SolicitudResponse;
import com.lavandus.api.service.SolicitudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Endpoints REST de solicitudes de lavado. La autorización está en SecurityConfig.
@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    @Autowired
    private SolicitudService solicitudService;

    // POST /api/solicitudes -> registrar solicitud (público, vista de cliente)
    @PostMapping
    public ResponseEntity<SolicitudResponse> registrar(@RequestBody SolicitudRequest request) {
        SolicitudResponse creada = solicitudService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    // GET /api/solicitudes -> listar solicitudes (ADMIN y ENCARGADO_SERVICIO)
    @GetMapping
    public List<SolicitudResponse> listar() {
        return solicitudService.listar();
    }

    // GET /api/solicitudes/disponibles -> solicitudes sin servicio (RF-1)
    @GetMapping("/disponibles")
    public List<SolicitudResponse> listarDisponibles() {
        return solicitudService.listarDisponibles();
    }
}
