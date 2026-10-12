package com.lavandus.api.controller;

import com.lavandus.api.model.TipoPrenda;
import com.lavandus.api.service.TipoPrendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Endpoints REST de tipos de prenda. La autorización está en SecurityConfig (GET público).
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
}
