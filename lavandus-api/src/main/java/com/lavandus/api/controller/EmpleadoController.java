package com.lavandus.api.controller;

import com.lavandus.api.dto.EmpleadoRequest;
import com.lavandus.api.dto.EmpleadoResponse;
import com.lavandus.api.service.EmpleadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Solo el ADMIN puede usar estos endpoints (ver SecurityConfig)
@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping
    public List<EmpleadoResponse> listar() {
        return empleadoService.listar();
    }

    @GetMapping("/{id}")
    public EmpleadoResponse obtener(@PathVariable Integer id) {
        return empleadoService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<EmpleadoResponse> registrar(@RequestBody EmpleadoRequest request) {
        EmpleadoResponse creado = empleadoService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public EmpleadoResponse editar(@PathVariable Integer id, @RequestBody EmpleadoRequest request) {
        return empleadoService.editar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        empleadoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}