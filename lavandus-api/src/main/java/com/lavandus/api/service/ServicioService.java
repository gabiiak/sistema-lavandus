package com.lavandus.api.service;

import com.lavandus.api.dto.EmpleadoResponse;
import com.lavandus.api.dto.ServicioRequest;
import com.lavandus.api.dto.ServicioResponse;
import com.lavandus.api.exception.RecursoDuplicadoException;
import com.lavandus.api.exception.RecursoNoEncontradoException;
import com.lavandus.api.model.Empleado;
import com.lavandus.api.model.EstadoMaquina;
import com.lavandus.api.model.EstadoServicio;
import com.lavandus.api.model.MaquinaLavadora;
import com.lavandus.api.model.Servicio;
import com.lavandus.api.model.Solicitud;
import com.lavandus.api.repository.EmpleadoRepository;
import com.lavandus.api.repository.MaquinaLavadoraRepository;
import com.lavandus.api.repository.ServicioRepository;
import com.lavandus.api.repository.SolicitudRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServicioService {

    // Único rol que puede quedar a cargo de un servicio
    private static final String ROL_SERVICIO = "ENCARGADO_SERVICIO";

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private SolicitudRepository solicitudRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private MaquinaLavadoraRepository maquinaRepository;

    @Autowired
    private SolicitudService solicitudService;

    @Autowired
    private FacturaService facturaService;

    // Listar servicios (ADMIN y encargados)
    @Transactional(readOnly = true)
    public List<ServicioResponse> listar() {
        return servicioRepository.findAll().stream()
                .map(this::aRespuesta)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServicioResponse obtenerPorId(Integer id) {
        return aRespuesta(buscarOErro(id));
    }

    // Registrar un servicio a partir de una solicitud.
    // Con máquina OPERATIVA queda PROGRAMADA; sin máquina queda PENDIENTE.
    @Transactional
    public ServicioResponse registrar(ServicioRequest request) {
        if (request.getIdSolicitud() == null) {
            throw new IllegalArgumentException("La solicitud es obligatoria");
        }

        Solicitud solicitud = solicitudRepository.findById(request.getIdSolicitud())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "La solicitud con id " + request.getIdSolicitud() + " no existe"));

        // Una misma solicitud no puede tener más de un servicio
        if (servicioRepository.existsBySolicitudIdSolicitud(solicitud.getIdSolicitud())) {
            throw new RecursoDuplicadoException(
                    "La solicitud " + solicitud.getIdSolicitud() + " ya tiene un servicio registrado");
        }

        Servicio servicio = new Servicio();
        servicio.setSolicitud(solicitud);
        servicio.setEmpleado(resolverEmpleado(request.getIdEmpleado()));

        // Si viene máquina, se programa y se ocupa; si no, queda pendiente.
        if (request.getIdMaquina() != null) {
            MaquinaLavadora maquina = resolverMaquinaOperativa(request.getIdMaquina());
            ocupar(maquina);
            servicio.setMaquina(maquina);
            servicio.setEstado(EstadoServicio.PROGRAMADA);
        } else {
            servicio.setEstado(EstadoServicio.PENDIENTE);
        }

        return aRespuesta(servicioRepository.save(servicio));
    }

    // Actualizar un servicio: cambia de estado siguiendo la secuencia estricta
    // y reasigna el empleado a cargo. Cancelar es válido desde cualquier estado activo.
    @Transactional
    public ServicioResponse actualizar(Integer id, ServicioRequest request) {
        Servicio servicio = buscarOErro(id);
        int actual = servicio.getEstado();

        if (actual == EstadoServicio.TERMINADO || actual == EstadoServicio.CANCELADA) {
            throw new IllegalArgumentException("El servicio ya está finalizado y no se puede modificar");
        }
        if (request.getEstado() == null) {
            throw new IllegalArgumentException("El estado es obligatorio");
        }
        int nuevo = request.getEstado();

        servicio.setEmpleado(resolverEmpleado(request.getIdEmpleado()));

        if (nuevo == EstadoServicio.CANCELADA) {
            liberar(servicio);
            servicio.setEstado(EstadoServicio.CANCELADA);
        } else if (nuevo == siguiente(actual)) {
            if (nuevo == EstadoServicio.PROGRAMADA) {
                // Programar: requiere asignar una máquina operativa
                MaquinaLavadora maquina = resolverMaquinaOperativa(request.getIdMaquina());
                ocupar(maquina);
                servicio.setMaquina(maquina);
            }
            servicio.setEstado(nuevo);
            if (nuevo == EstadoServicio.TERMINADO) {
                liberar(servicio);
            }
        } else {
            throw new IllegalArgumentException(
                    "No se puede pasar del estado " + actual + " al estado " + nuevo);
        }

        Servicio guardado = servicioRepository.save(servicio);
        // Al terminar el servicio se emite la factura (una sola vez)
        if (guardado.getEstado() == EstadoServicio.TERMINADO) {
            facturaService.emitirPorTerminado(guardado);
        }
        return aRespuesta(guardado);
    }

    // Siguiente estado en la secuencia (null si es terminal o cancelada)
    private Integer siguiente(int estado) {
        return switch (estado) {
            case EstadoServicio.PENDIENTE -> EstadoServicio.PROGRAMADA;
            case EstadoServicio.PROGRAMADA -> EstadoServicio.PROCESO_LAVADO;
            case EstadoServicio.PROCESO_LAVADO -> EstadoServicio.PROCESO_SECADO;
            case EstadoServicio.PROCESO_SECADO -> EstadoServicio.PROCESO_PLANCHADO;
            case EstadoServicio.PROCESO_PLANCHADO -> EstadoServicio.TERMINADO;
            default -> null;
        };
    }

    private Servicio buscarOErro(Integer id) {
        return servicioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("El servicio con id " + id + " no existe"));
    }

    // Resuelve el empleado a cargo y valida que tenga el rol de servicio
    private Empleado resolverEmpleado(Integer idEmpleado) {
        if (idEmpleado == null) {
            throw new IllegalArgumentException("El empleado a cargo es obligatorio");
        }
        Empleado empleado = empleadoRepository.findById(idEmpleado)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "El empleado con id " + idEmpleado + " no existe"));
        if (!ROL_SERVICIO.equals(empleado.getRol())) {
            throw new IllegalArgumentException("El empleado a cargo debe tener rol " + ROL_SERVICIO);
        }
        return empleado;
    }

    // Resuelve la máquina y valida que esté OPERATIVA
    private MaquinaLavadora resolverMaquinaOperativa(Integer idMaquina) {
        if (idMaquina == null) {
            throw new IllegalArgumentException("La máquina es obligatoria para programar el servicio");
        }
        MaquinaLavadora maquina = maquinaRepository.findById(idMaquina)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "La máquina con id " + idMaquina + " no existe"));
        if (maquina.getEstado() != EstadoMaquina.OPERATIVA) {
            throw new IllegalArgumentException("La máquina " + idMaquina + " no está operativa");
        }
        return maquina;
    }

    private void ocupar(MaquinaLavadora maquina) {
        maquina.setEstado(EstadoMaquina.OCUPADA);
        maquinaRepository.save(maquina);
    }

    // Libera la máquina del servicio (si tiene) y la deja operativa
    private void liberar(Servicio servicio) {
        if (servicio.getMaquina() != null) {
            MaquinaLavadora maquina = servicio.getMaquina();
            maquina.setEstado(EstadoMaquina.OPERATIVA);
            maquinaRepository.save(maquina);
        }
    }

    // Convertimos la entidad en el DTO reutilizando los mapeos de solicitud y empleado
    private ServicioResponse aRespuesta(Servicio servicio) {
        Empleado emp = servicio.getEmpleado();
        EmpleadoResponse empleado = new EmpleadoResponse(
                emp.getIdEmpleado(), emp.getNombre(), emp.getApellido(),
                emp.getEmail(), emp.getGenero(), emp.getRol());

        return new ServicioResponse(
                servicio.getIdServicio(),
                solicitudService.aRespuesta(servicio.getSolicitud()),
                empleado,
                servicio.getMaquina(),
                servicio.getEstado(),
                servicio.getFechaAlta());
    }
}