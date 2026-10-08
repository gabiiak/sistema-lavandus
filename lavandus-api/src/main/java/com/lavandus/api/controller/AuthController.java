package com.lavandus.api.controller;

import com.lavandus.api.dto.LoginRequest;
import com.lavandus.api.dto.LoginResponse;
import com.lavandus.api.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Login: valida credenciales y crea la sesión
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest,
                                               HttpServletResponse httpResponse) {
        LoginResponse respuesta = authService.login(request.getEmail(), request.getClave(), httpRequest, httpResponse);
        return ResponseEntity.ok(respuesta);
    }

    // Cierre de sesión
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        return ResponseEntity.ok(authService.logout(request));
    }
}