package com.lavandus.api.dto;

// Cuerpo estándar para responder errores de la API
public class ApiError {

    private int status;
    private String mensaje;
    private String ruta;

    public ApiError(int status, String mensaje, String ruta) {
        this.status = status;
        this.mensaje = mensaje;
        this.ruta = ruta;
    }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public String getRuta() { return ruta; }
    public void setRuta(String ruta) { this.ruta = ruta; }
}