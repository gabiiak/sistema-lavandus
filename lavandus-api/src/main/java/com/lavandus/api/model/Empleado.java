package com.lavandus.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "empleado")
public class Empleado {

  
   @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Integer idEmpleado; // <-- Cambiado a Integer

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "apellido", nullable = false, length = 100)
    private String apellido;

    @Column(name = "email", unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "clave", nullable = false, length = 255)
    private String clave;

    @Column(name = "genero", length = 50)
    private String genero;

    @Column(name = "rol", nullable = false, length = 50)
    private String rol;

    // Constructor vacío requerido por Spring Boot
    public Empleado() {
    }

    // --- GETTERS Y SETTERS ---

    public Integer getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Integer idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}