package com.lavandus.api.model;

import jakarta.persistence.*;

// Renglón de una solicitud: un tipo de prenda y cuántas unidades pidió el cliente.
@Entity
@Table(name = "detalle_solicitud")
public class DetalleSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Integer idDetalle;

    @ManyToOne
    @JoinColumn(name = "id_solicitud", nullable = false)
    private Solicitud solicitud;

    @ManyToOne
    @JoinColumn(name = "id_tipo_prenda", nullable = false)
    private TipoPrenda tipoPrenda;

    @Column(name = "cantidad", nullable = false)
    private int cantidad;

    public DetalleSolicitud() {}

    // --- GETTERS Y SETTERS ---

    public Integer getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Integer idDetalle) { this.idDetalle = idDetalle; }
    public Solicitud getSolicitud() { return solicitud; }
    public void setSolicitud(Solicitud solicitud) { this.solicitud = solicitud; }
    public TipoPrenda getTipoPrenda() { return tipoPrenda; }
    public void setTipoPrenda(TipoPrenda tipoPrenda) { this.tipoPrenda = tipoPrenda; }
    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }
}
