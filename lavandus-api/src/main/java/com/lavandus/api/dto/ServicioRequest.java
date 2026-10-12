package com.lavandus.api.dto;

// Datos para crear (POST) o actualizar (PUT) un servicio de lavado.
public class ServicioRequest {

    // Solo se usa en el alta
    private Integer idSolicitud;

    // Empleado a cargo (debe tener rol ENCARGADO_SERVICIO)
    private Integer idEmpleado;

    // Máquina asignada. Opcional en el alta (si falta, el servicio queda PENDIENTE).
    private Integer idMaquina;

    // En el PUT indica el estado destino
    private Integer estado;

    public ServicioRequest() {
    }

    public Integer getIdSolicitud() {
        return idSolicitud;
    }

    public void setIdSolicitud(Integer idSolicitud) {
        this.idSolicitud = idSolicitud;
    }

    public Integer getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Integer idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public Integer getIdMaquina() {
        return idMaquina;
    }

    public void setIdMaquina(Integer idMaquina) {
        this.idMaquina = idMaquina;
    }

    public Integer getEstado() {
        return estado;
    }

    public void setEstado(Integer estado) {
        this.estado = estado;
    }
}
