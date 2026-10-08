package com.lavandus.api.exception;

// Se lanza cuando un recurso (máquina, empleado) no existe en la base
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}