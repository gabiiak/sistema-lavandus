package com.lavandus.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Encriptamos las claves con BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Admin puede hacer todo; Empleado solo consultar máquinas.
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(withDefaults()) // usa el bean corsConfigurationSource
            .authorizeHttpRequests(auth -> auth
                // Login y Logout son públicos
                .requestMatchers("/api/auth/**").permitAll()
                // Permitimos el /error para ver los errores reales (no enmascarados como 403)
                .requestMatchers("/error").permitAll()
                // Cualquiera logueado puede LISTAR y CONSULTAR máquinas
                .requestMatchers(HttpMethod.GET, "/api/maquinas/**").hasAnyRole("ADMIN", "EMPLEADO", "ENCARGADO_SERVICIO")
                // Crear, modificar y eliminar máquinas: solo ADMIN
                .requestMatchers("/api/maquinas/**").hasRole("ADMIN")
                // Cualquiera logueado puede LISTAR y CONSULTAR marcas
                .requestMatchers(HttpMethod.GET, "/api/marcas/**").hasAnyRole("ADMIN", "EMPLEADO")
                // Crear marcas: solo ADMIN
                .requestMatchers("/api/marcas/**").hasRole("ADMIN")
                // Registrar solicitudes de lavado: público (vista de cliente, sin login)
                .requestMatchers(HttpMethod.POST, "/api/solicitudes").permitAll()
                // Tipos de prenda: público (los usa la vista de cliente)
                .requestMatchers(HttpMethod.GET, "/api/tipos-prenda").permitAll()
                // Alta y edición de tipos de prenda: solo ADMIN
                .requestMatchers("/api/tipos-prenda/**").hasRole("ADMIN")
                // Consultar solicitudes: ADMIN o encargado de servicio
                .requestMatchers(HttpMethod.GET, "/api/solicitudes", "/api/solicitudes/**")
                    .hasAnyRole("ADMIN", "ENCARGADO_SERVICIO")
                // Servicios de lavado: ADMIN o encargado de servicio
                .requestMatchers("/api/servicios", "/api/servicios/**")
                    .hasAnyRole("ADMIN", "ENCARGADO_SERVICIO")
                // Listar empleados (con filtro ?rol=): ADMIN o encargado de servicio
                .requestMatchers(HttpMethod.GET, "/api/empleados")
                    .hasAnyRole("ADMIN", "ENCARGADO_SERVICIO")
                // Resto de usuarios (empleados): solo ADMIN
                .requestMatchers("/api/empleados/**").hasRole("ADMIN")
                // Facturas (consultar, descargar PDF y reenviar): solo ADMIN
                .requestMatchers("/api/facturas/**").hasRole("ADMIN")
                // Cualquier otra ruta exige estar logueado
                .anyRequest().authenticated()
            );
        return http.build();
    }

    // AuthenticationManager: usa el UsuarioDetailsService + PasswordEncoder,
    // y lo utilizamos en el login para crear la sesión.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // CORS: permite que el front de Vite (http://localhost:5173) use la API.
    // allowCredentials(true) es necesario para la cookie de sesión.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}