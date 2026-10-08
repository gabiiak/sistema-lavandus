package com.lavandus.api.service;

import com.lavandus.api.model.Empleado;
import com.lavandus.api.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UsuarioDetailsService implements UserDetailsService {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    // Spring Security usa esto para validar el login. El email es nuestro "username".
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Empleado empleado = empleadoRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("El usuario no existe"));

        return User.withUsername(empleado.getEmail())
                .password(empleado.getClave())
                // "ADMIN" -> ROLE_ADMIN, "EMPLEADO" -> ROLE_EMPLEADO
                .roles(empleado.getRol())
                .build();
    }
}