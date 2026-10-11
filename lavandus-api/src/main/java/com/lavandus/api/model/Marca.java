package com.lavandus.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "marca")
public class Marca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_marca")
    private Integer idMarca;

    @Column(name = "nombre", nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "pais", nullable = false, length = 100)
    private String pais;

    // Constructor vacío requerido por Spring Boot
    public Marca() {}

    // --- GETTERS Y SETTERS ---

    public Integer getIdMarca() { return idMarca; }
    public void setIdMarca(Integer idMarca) { this.idMarca = idMarca; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }
}
