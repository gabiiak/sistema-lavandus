package com.lavandus.api.controller;

import com.lavandus.api.model.Marca;
import com.lavandus.api.service.MarcaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Endpoints REST de marcas. La autorización por rol está en SecurityConfig.
@RestController
@RequestMapping("/api/marcas")
public class MarcaController {

    @Autowired
    private MarcaService marcaService;

    // GET /api/marcas -> todas las marcas
    @GetMapping
    public List<Marca> listar() {
        return marcaService.listar();
    }

    // POST /api/marcas -> crear marca (solo ADMIN)
    @PostMapping
    public ResponseEntity<Marca> registrar(@RequestBody Marca marca) {
        Marca creada = marcaService.registrar(marca);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    // PUT /api/marcas/{id} -> modificar marca (solo ADMIN)
    @PutMapping("/{id}")
    public Marca editar(@PathVariable Integer id, @RequestBody Marca marca) {
        return marcaService.editar(id, marca);
    }
}
