package com.lavandus.api.controller;

import com.lavandus.api.dto.ServicioRequest;
import com.lavandus.api.dto.ServicioResponse;
import com.lavandus.api.service.ServicioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Endpoints REST de servicios de lavado. La autorización está en SecurityConfig.
@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    @Autowired
    private ServicioService servicioService;

    // GET /api/servicios -> listar servicios (ADMIN y ENCARGADO_SERVICIO)
    @GetMapping
    public List<ServicioResponse> listar() {
        return servicioService.listar();
    }

    // GET /api/servicios/{id} -> consultar servicio
    @GetMapping("/{id}")
    public ServicioResponse obtener(@PathVariable Integer id) {
        return servicioService.obtenerPorId(id);
    }

    // POST /api/servicios -> registrar servicio a partir de una solicitud
    @PostMapping
    public ResponseEntity<ServicioResponse> registrar(@RequestBody ServicioRequest request) {
        ServicioResponse creado = servicioService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // PUT /api/servicios/{id} -> cambiar de estado y/o reasignar el empleado
    @PutMapping("/{id}")
    public ServicioResponse actualizar(@PathVariable Integer id, @RequestBody ServicioRequest request) {
        return servicioService.actualizar(id, request);
    }
}
