package com.lavandus.api.exception;

// Se lanza cuando se intenta crear un recurso con un valor que ya existe (ej: nombre de marca)
public class RecursoDuplicadoException extends RuntimeException {

    public RecursoDuplicadoException(String mensaje) {
        super(mensaje);
    }
}
