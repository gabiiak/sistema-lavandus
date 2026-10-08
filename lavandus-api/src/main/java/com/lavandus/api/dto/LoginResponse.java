package com.lavandus.api.dto;

// Respuesta del login con los datos del usuario logueado (nunca la clave)
public class LoginResponse {

    private Integer idEmpleado;
    private String nombre;
    private String apellido;
    private String email;
    private String rol;

    public LoginResponse() {
    }

    public LoginResponse(Integer idEmpleado, String nombre, String apellido, String email, String rol) {
        this.idEmpleado = idEmpleado;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
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
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}