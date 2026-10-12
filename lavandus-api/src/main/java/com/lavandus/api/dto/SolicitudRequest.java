package com.lavandus.api.dto;

import java.util.List;

// Datos que envía la vista de cliente para registrar una solicitud de lavado.
public class SolicitudRequest {

    private String nombreCliente;
    private String email;
    private String razonSocial;
    private List<Detalle> detalles;

    public SolicitudRequest() {}

    // Un renglón: tipo de prenda y cantidad de unidades
    public static class Detalle {
        private Integer idTipoPrenda;
        private Integer cantidad;

        public Detalle() {}

        public Integer getIdTipoPrenda() { return idTipoPrenda; }
        public void setIdTipoPrenda(Integer idTipoPrenda) { this.idTipoPrenda = idTipoPrenda; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }
    public List<Detalle> getDetalles() { return detalles; }
    public void setDetalles(List<Detalle> detalles) { this.detalles = detalles; }
}
