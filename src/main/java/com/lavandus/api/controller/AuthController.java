package com.lavandus.api.controller;

import com.lavandus.api.dto.LoginRequest;
import com.lavandus.api.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        String resultado = authService.validarLogin(request.getEmail(), request.getClave());
        
        if (resultado.contains("exitoso")) {
            return ResponseEntity.ok(resultado);
        } else {
            return ResponseEntity.badRequest().body(resultado);
        }
    }
    @PostMapping("/registro")
    public ResponseEntity<String> registro(@RequestBody com.lavandus.api.model.Empleado empleado) {
        String resultado = authService.registrarEmpleado(empleado);
        
        if (resultado.contains("correctamente")) {
            return ResponseEntity.ok(resultado);
        } else {
            return ResponseEntity.badRequest().body(resultado);
        }
    }
}