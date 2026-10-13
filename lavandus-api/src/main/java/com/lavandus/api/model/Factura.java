package com.lavandus.api.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Factura de un servicio de lavado. Se genera una sola vez, cuando el servicio
// pasa a TERMINADO. Guarda el PDF en disco (ruta_archivo) y el estado del envío.
@Entity
@Table(name = "factura")
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_factura")
    private Integer idFactura;

    // Un servicio se factura una sola vez
    @OneToOne
    @JoinColumn(name = "id_servicio", nullable = false, unique = true)
    private Servicio servicio;

    // Estado del envío: ver constantes en FacturaEstado
    @Column(name = "estado", nullable = false)
    private int estado = FacturaEstado.NO_ENVIADA;

    @Column(name = "email_destino", nullable = false, length = 150)
    private String emailDestino;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision = LocalDateTime.now();

    // Se completa solo si el envío fue exitoso
    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    // Motivo por el que la factura quedó NO_ENVIADA (dominio no permitido, SMTP, etc.)
    @Column(name = "mensaje_error", length = 500)
    private String mensajeError;

    // Ruta del PDF generado en disco
    @Column(name = "ruta_archivo", nullable = false, length = 300)
    private String rutaArchivo;

    public Factura() {}

    // --- GETTERS Y SETTERS ---

    public Integer getIdFactura() { return idFactura; }
    public void setIdFactura(Integer idFactura) { this.idFactura = idFactura; }
    public Servicio getServicio() { return servicio; }
    public void setServicio(Servicio servicio) { this.servicio = servicio; }
    public int getEstado() { return estado; }
    public void setEstado(int estado) { this.estado = estado; }
    public String getEmailDestino() { return emailDestino; }
    public void setEmailDestino(String emailDestino) { this.emailDestino = emailDestino; }
    public LocalDateTime getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDateTime fechaEmision) { this.fechaEmision = fechaEmision; }
    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
    public String getMensajeError() { return mensajeError; }
    public void setMensajeError(String mensajeError) { this.mensajeError = mensajeError; }
    public String getRutaArchivo() { return rutaArchivo; }
    public void setRutaArchivo(String rutaArchivo) { this.rutaArchivo = rutaArchivo; }
}
