package com.lavandus.api.service;

import com.lavandus.api.dto.LoginResponse;
import com.lavandus.api.exception.RecursoNoEncontradoException;
import com.lavandus.api.model.Empleado;
import com.lavandus.api.repository.EmpleadoRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    // Valida las credenciales (BCrypt) y crea la sesión con Spring Security.
    // Si las credenciales son malas, lanza BadCredentialsException -> 401.
    public LoginResponse login(String email, String clave, HttpServletRequest request, HttpServletResponse response) {
        Authentication autenticacion = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, clave));

        // Guardamos la autenticación en la sesión (cookie JSESSIONID)
        SecurityContext contexto = SecurityContextHolder.createEmptyContext();
        contexto.setAuthentication(autenticacion);
        SecurityContextHolder.setContext(contexto);

        SecurityContextRepository repositorio = new HttpSessionSecurityContextRepository();
        repositorio.saveContext(contexto, request, response);

        Empleado empleado = empleadoRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("El usuario no existe"));

        return new LoginResponse(
                empleado.getIdEmpleado(),
                empleado.getNombre(),
                empleado.getApellido(),
                empleado.getEmail(),
                empleado.getRol());
    }

    // Cierra la sesión del usuario
    public String logout(HttpServletRequest request) {
        HttpSession sesion = request.getSession(false);
        if (sesion != null) {
            sesion.invalidate();
        }
        SecurityContextHolder.clearContext();
        return "Sesión cerrada correctamente";
    }
}