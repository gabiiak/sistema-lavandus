package com.lavandus.api.controller;

import com.lavandus.api.model.MaquinaLavadora;
import com.lavandus.api.service.MaquinaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maquinas") // Esta será la URL para todo lo de máquinas
public class MaquinaController {

    @Autowired
    private MaquinaService maquinaService;

    // Ruta para ver todas las máquinas (GET)
    @GetMapping
    public List<MaquinaLavadora> obtenerTodas() {
        return maquinaService.obtenerTodas();
    }

    // Ruta para guardar una nueva máquina (POST)
    // Recibimos un parámetro extra en la URL para saber qué estado ponerle
    @PostMapping("/registro")
    public ResponseEntity<MaquinaLavadora> registrarMaquina(
            @RequestBody MaquinaLavadora maquina,
            @RequestParam String estado) {
        
        MaquinaLavadora nuevaMaquina = maquinaService.registrarMaquina(maquina, estado);
        return ResponseEntity.ok(nuevaMaquina);
    }
}