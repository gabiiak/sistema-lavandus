package com.lavandus.api.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

// Tipo de prenda que el cliente puede cargar en una solicitud de lavado.
// Define el peso (kg) y el precio por unidad.
@Entity
@Table(name = "tipo_prenda")
public class TipoPrenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_prenda")
    private Integer idTipoPrenda;

    @Column(name = "nombre", nullable = false, unique = true, length = 100)
    private String nombre;

    // Peso en kilogramos de una unidad
    @Column(name = "peso", nullable = false)
    private double peso;

    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    public TipoPrenda() {}

    // --- GETTERS Y SETTERS ---

    public Integer getIdTipoPrenda() { return idTipoPrenda; }
    public void setIdTipoPrenda(Integer idTipoPrenda) { this.idTipoPrenda = idTipoPrenda; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public double getPeso() { return peso; }
    public void setPeso(double peso) { this.peso = peso; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }
}
