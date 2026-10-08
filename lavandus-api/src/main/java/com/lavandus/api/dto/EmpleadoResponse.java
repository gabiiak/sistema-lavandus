package com.lavandus.api.dto;

// Información de un empleado para la API (NUNCA incluye la clave)
public class EmpleadoResponse {

    private Integer idEmpleado;
    private String nombre;
    private String apellido;
    private String email;
    private String genero;
    private String rol;

    public EmpleadoResponse() {
    }

    public EmpleadoResponse(Integer idEmpleado, String nombre, String apellido, String email, String genero, String rol) {
        this.idEmpleado = idEmpleado;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.genero = genero;
        this.rol = rol;
    }

    public Integer getIdEmpleado() { return idEmpleado; }
    public void setIdEmpleado(Integer idEmpleado) { this.idEmpleado = idEmpleado; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}