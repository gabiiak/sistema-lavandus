package com.lavandus.api.controller;

import com.lavandus.api.model.MaquinaLavadora;
import com.lavandus.api.service.MaquinaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Endpoints REST de máquinas. La autorización por rol está en SecurityConfig.
@RestController
@RequestMapping("/api/maquinas")
public class MaquinaController {

    @Autowired
    private MaquinaService maquinaService;

    // GET /api/maquinas -> todas las máquinas
    @GetMapping
    public List<MaquinaLavadora> listar() {
        return maquinaService.obtenerTodas();
    }

    // GET /api/maquinas/{id} -> consulta una máquina
    @GetMapping("/{id}")
    public MaquinaLavadora obtener(@PathVariable Integer id) {
        return maquinaService.obtenerPorId(id);
    }

    // POST /api/maquinas -> crear máquina (estado default OPERATIVA = 1)
    @PostMapping
    public ResponseEntity<MaquinaLavadora> registrar(@RequestBody MaquinaLavadora maquina) {
        MaquinaLavadora creada = maquinaService.registrar(maquina);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    // PUT /api/maquinas/{id} -> modificar máquina
    @PutMapping("/{id}")
    public MaquinaLavadora editar(@PathVariable Integer id, @RequestBody MaquinaLavadora maquina) {
        return maquinaService.editar(id, maquina);
    }

    // DELETE /api/maquinas/{id} -> eliminar máquina
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        maquinaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}