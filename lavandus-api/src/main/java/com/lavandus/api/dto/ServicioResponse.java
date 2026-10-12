package com.lavandus.api.dto;

import com.lavandus.api.model.MaquinaLavadora;

import java.time.LocalDateTime;

// Respuesta de un servicio de lavado. Reutiliza los DTO de solicitud y empleado
// para no exponer las entidades con sus relaciones (evita recursión JSON).
public class ServicioResponse {

    private Integer idServicio;
    private SolicitudResponse solicitud;
    private EmpleadoResponse empleado;
    private MaquinaLavadora maquina;
    private int estado;
    private LocalDateTime fechaAlta;

    public ServicioResponse() {
    }

    public ServicioResponse(Integer idServicio, SolicitudResponse solicitud, EmpleadoResponse empleado,
                            MaquinaLavadora maquina, int estado, LocalDateTime fechaAlta) {
        this.idServicio = idServicio;
        this.solicitud = solicitud;
        this.empleado = empleado;
        this.maquina = maquina;
        this.estado = estado;
        this.fechaAlta = fechaAlta;
    }

    public Integer getIdServicio() {
        return idServicio;
    }

    public SolicitudResponse getSolicitud() {
        return solicitud;
    }

    public EmpleadoResponse getEmpleado() {
        return empleado;
    }

    public MaquinaLavadora getMaquina() {
        return maquina;
    }

    public int getEstado() {
        return estado;
    }

    public LocalDateTime getFechaAlta() {
        return fechaAlta;
    }
}
