package com.lavandus.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "estado_maquina")
public class EstadoMaquina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado")
    private Integer idEstado;

    @Column(name = "nombre", unique = true, nullable = false, length = 50)
    private String nombre;

    public EstadoMaquina() {}

    // Getters y Setters
    public Integer getIdEstado() { return idEstado; }
    public void setIdEstado(Integer idEstado) { this.idEstado = idEstado; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}