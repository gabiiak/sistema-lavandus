package com.lavandus.api.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Servicio de lavado: se registra a partir de una solicitud y le asigna
// un empleado a cargo y, opcionalmente, una máquina.
@Entity
@Table(name = "servicio")
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Integer idServicio;

    // Una solicitud se puede convertir en un único servicio
    @OneToOne
    @JoinColumn(name = "id_solicitud", nullable = false, unique = true)
    private Solicitud solicitud;

    // Empleado a cargo del servicio (rol ENCARGADO_SERVICIO)
    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    // Puede ser null mientras el servicio está PENDIENTE (sin máquina asignada)
    @ManyToOne
    @JoinColumn(name = "id_maquina")
    private MaquinaLavadora maquina;

    // Estado del servicio: ver constantes en EstadoServicio
    @Column(name = "estado", nullable = false)
    private int estado = EstadoServicio.PENDIENTE;

    @Column(name = "fecha_alta", nullable = false)
    private LocalDateTime fechaAlta = LocalDateTime.now();

    public Servicio() {}

    // --- GETTERS Y SETTERS ---

    public Integer getIdServicio() { return idServicio; }
    public void setIdServicio(Integer idServicio) { this.idServicio = idServicio; }
    public Solicitud getSolicitud() { return solicitud; }
    public void setSolicitud(Solicitud solicitud) { this.solicitud = solicitud; }
    public Empleado getEmpleado() { return empleado; }
    public void setEmpleado(Empleado empleado) { this.empleado = empleado; }
    public MaquinaLavadora getMaquina() { return maquina; }
    public void setMaquina(MaquinaLavadora maquina) { this.maquina = maquina; }
    public int getEstado() { return estado; }
    public void setEstado(int estado) { this.estado = estado; }
    public LocalDateTime getFechaAlta() { return fechaAlta; }
    public void setFechaAlta(LocalDateTime fechaAlta) { this.fechaAlta = fechaAlta; }
}
