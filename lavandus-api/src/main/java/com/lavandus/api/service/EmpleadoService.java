package com.lavandus.api.service;

import com.lavandus.api.dto.EmpleadoRequest;
import com.lavandus.api.dto.EmpleadoResponse;
import com.lavandus.api.exception.RecursoNoEncontradoException;
import com.lavandus.api.model.Empleado;
import com.lavandus.api.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class EmpleadoService {

    // Únicos roles permitidos por ahora
    private static final Set<String> ROLES_VALIDOS = Set.of("ADMIN", "EMPLEADO");

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<EmpleadoResponse> listar() {
        return empleadoRepository.findAll().stream()
                .map(this::aRespuesta)
                .toList();
    }

    public EmpleadoResponse obtenerPorId(Integer id) {
        return aRespuesta(buscarOErro(id));
    }

    public EmpleadoResponse registrar(EmpleadoRequest request) {
        if (empleadoRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        validarRol(request.getRol());

        Empleado empleado = new Empleado();
        empleado.setNombre(request.getNombre());
        empleado.setApellido(request.getApellido());
        empleado.setEmail(request.getEmail());
        empleado.setGenero(request.getGenero());
        empleado.setRol(request.getRol());
        empleado.setClave(passwordEncoder.encode(request.getClave()));

        return aRespuesta(empleadoRepository.save(empleado));
    }

    public EmpleadoResponse editar(Integer id, EmpleadoRequest request) {
        Empleado empleado = buscarOErro(id);

        // Si cambia el email, que no choque con otro empleado
        if (!empleado.getEmail().equals(request.getEmail())
                && empleadoRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        validarRol(request.getRol());

        empleado.setNombre(request.getNombre());
        empleado.setApellido(request.getApellido());
        empleado.setEmail(request.getEmail());
        empleado.setGenero(request.getGenero());
        empleado.setRol(request.getRol());

        // La clave es opcional al modificar: si viene, se encripta de nuevo
        if (request.getClave() != null && !request.getClave().isBlank()) {
            empleado.setClave(passwordEncoder.encode(request.getClave()));
        }

        return aRespuesta(empleadoRepository.save(empleado));
    }

    public void eliminar(Integer id) {
        Empleado empleado = buscarOErro(id);
        empleadoRepository.delete(empleado);
    }

    private Empleado buscarOErro(Integer id) {
        return empleadoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("El empleado con id " + id + " no existe"));
    }

    private void validarRol(String rol) {
        if (rol == null || !ROLES_VALIDOS.contains(rol)) {
            throw new IllegalArgumentException("El rol debe ser ADMIN o EMPLEADO");
        }
    }

    // Convertimos la entidad en la respuesta segura (sin clave)
    private EmpleadoResponse aRespuesta(Empleado empleado) {
        return new EmpleadoResponse(
                empleado.getIdEmpleado(),
                empleado.getNombre(),
                empleado.getApellido(),
                empleado.getEmail(),
                empleado.getGenero(),
                empleado.getRol());
    }
}