package com.lavandus.api.dto;

// Datos para crear o modificar un empleado.
// La clave solo se recibe (al modificar es opcional); nunca se devuelve.
public class EmpleadoRequest {

    private String nombre;
    private String apellido;
    private String email;
    private String genero;
    private String rol;
    private String clave;

    public EmpleadoRequest() {
    }

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
    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }
}