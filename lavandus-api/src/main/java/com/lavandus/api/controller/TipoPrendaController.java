package com.lavandus.api.controller;

import com.lavandus.api.model.TipoPrenda;
import com.lavandus.api.service.TipoPrendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Endpoints REST de tipos de prenda. La autorización está en SecurityConfig
// (GET público para la vista de cliente; alta/edición solo ADMIN).
@RestController
@RequestMapping("/api/tipos-prenda")
public class TipoPrendaController {

    @Autowired
    private TipoPrendaService tipoPrendaService;

    // GET /api/tipos-prenda -> todos los tipos (público)
    @GetMapping
    public List<TipoPrenda> listar() {
        return tipoPrendaService.listar();
    }

    // POST /api/tipos-prenda -> crear tipo de prenda (solo ADMIN)
    @PostMapping
    public ResponseEntity<TipoPrenda> registrar(@RequestBody TipoPrenda tipoPrenda) {
        TipoPrenda creada = tipoPrendaService.registrar(tipoPrenda);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    // PUT /api/tipos-prenda/{id} -> modificar tipo de prenda (solo ADMIN)
    @PutMapping("/{id}")
    public TipoPrenda editar(@PathVariable Integer id, @RequestBody TipoPrenda tipoPrenda) {
        return tipoPrendaService.editar(id, tipoPrenda);
    }
}
