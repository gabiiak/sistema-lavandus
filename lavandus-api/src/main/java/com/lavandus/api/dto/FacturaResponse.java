package com.lavandus.api.dto;

import java.time.LocalDateTime;

// Respuesta con el estado de la factura de un servicio.
public class FacturaResponse {

    private Integer idFactura;
    private Integer idServicio;
    private int estado;
    private String emailDestino;
    private LocalDateTime fechaEmision;
    private LocalDateTime fechaEnvio;
    private String mensajeError;

    public FacturaResponse() {
    }

    public FacturaResponse(Integer idFactura, Integer idServicio, int estado, String emailDestino,
                           LocalDateTime fechaEmision, LocalDateTime fechaEnvio, String mensajeError) {
        this.idFactura = idFactura;
        this.idServicio = idServicio;
        this.estado = estado;
        this.emailDestino = emailDestino;
        this.fechaEmision = fechaEmision;
        this.fechaEnvio = fechaEnvio;
        this.mensajeError = mensajeError;
    }

    public Integer getIdFactura() { return idFactura; }
    public Integer getIdServicio() { return idServicio; }
    public int getEstado() { return estado; }
    public String getEmailDestino() { return emailDestino; }
    public LocalDateTime getFechaEmision() { return fechaEmision; }
    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public String getMensajeError() { return mensajeError; }
}
