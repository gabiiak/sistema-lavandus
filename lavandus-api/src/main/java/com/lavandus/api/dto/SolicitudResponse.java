package com.lavandus.api.dto;

import java.math.BigDecimal;
import java.util.List;

// Respuesta de una solicitud: datos del cliente, totales calculados y detalle.
public class SolicitudResponse {

    private Integer idSolicitud;
    private String nombreCliente;
    private String email;
    private String razonSocial;
    private double pesoTotal;
    private BigDecimal precioEstimado;
    private List<Detalle> detalles;

    public SolicitudResponse() {}

    public SolicitudResponse(Integer idSolicitud, String nombreCliente, String email, String razonSocial,
                             double pesoTotal, BigDecimal precioEstimado, List<Detalle> detalles) {
        this.idSolicitud = idSolicitud;
        this.nombreCliente = nombreCliente;
        this.email = email;
        this.razonSocial = razonSocial;
        this.pesoTotal = pesoTotal;
        this.precioEstimado = precioEstimado;
        this.detalles = detalles;
    }

    // Renglón de la respuesta con los datos del tipo de prenda y su subtotal
    public static class Detalle {
        private Integer idTipoPrenda;
        private String nombre;
        private double peso;
        private BigDecimal precio;
        private int cantidad;
        private BigDecimal subtotal;

        public Detalle(Integer idTipoPrenda, String nombre, double peso, BigDecimal precio,
                       int cantidad, BigDecimal subtotal) {
            this.idTipoPrenda = idTipoPrenda;
            this.nombre = nombre;
            this.peso = peso;
            this.precio = precio;
            this.cantidad = cantidad;
            this.subtotal = subtotal;
        }

        public Integer getIdTipoPrenda() { return idTipoPrenda; }
        public String getNombre() { return nombre; }
        public double getPeso() { return peso; }
        public BigDecimal getPrecio() { return precio; }
        public int getCantidad() { return cantidad; }
        public BigDecimal getSubtotal() { return subtotal; }
    }

    public Integer getIdSolicitud() { return idSolicitud; }
    public String getNombreCliente() { return nombreCliente; }
    public String getEmail() { return email; }
    public String getRazonSocial() { return razonSocial; }
    public double getPesoTotal() { return pesoTotal; }
    public BigDecimal getPrecioEstimado() { return precioEstimado; }
    public List<Detalle> getDetalles() { return detalles; }
}
