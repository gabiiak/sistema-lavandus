package com.lavandus.api.service;

import com.lavandus.api.model.Empleado;
import com.lavandus.api.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Inyectamos la herramienta BCrypt

    public String validarLogin(String email, String clave) {
        Optional<Empleado> empleadoOpt = empleadoRepository.findByEmail(email);

        if (empleadoOpt.isPresent()) {
            Empleado empleado = empleadoOpt.get();
            // passwordEncoder.matches desencripta y compara de forma segura
            if (passwordEncoder.matches(clave, empleado.getClave())) {
                return "Login exitoso. Bienvenido, rol: " + empleado.getRol();
            } else {
                return "Contraseña incorrecta";
            }
        }
        return "El usuario no existe";
    }

    public String registrarEmpleado(Empleado empleado) {
        if (empleadoRepository.findByEmail(empleado.getEmail()).isPresent()) {
            return "Error: El email ya está registrado";
        }
        
        // ¡La magia ocurre aquí! Encriptamos la clave antes de guardar
        String claveEncriptada = passwordEncoder.encode(empleado.getClave());
        empleado.setClave(claveEncriptada);
        
        empleadoRepository.save(empleado);
        return "Empleado registrado correctamente";
    }
}