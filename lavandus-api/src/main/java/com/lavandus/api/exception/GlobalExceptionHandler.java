package com.lavandus.api.exception;

import com.lavandus.api.dto.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 404: el recurso no existe
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ApiError> noEncontrado(RecursoNoEncontradoException ex, HttpServletRequest request) {
        return responder(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 401: credenciales inválidas en el login
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> credencialesInvalidas(BadCredentialsException ex, HttpServletRequest request) {
        return responder(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos", request);
    }

    // 400: datos inválidos (validaciones de negocio)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> argumentoInvalido(IllegalArgumentException ex, HttpServletRequest request) {
        return responder(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400: violación de unicidad u otra restricción de la base
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> integridad(DataIntegrityViolationException ex, HttpServletRequest request) {
        return responder(HttpStatus.BAD_REQUEST, "Los datos ingresados violan una restricción de la base", request);
    }

    // 500: cualquier otro error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> errorGeneral(Exception ex, HttpServletRequest request) {
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", request);
    }

    private ResponseEntity<ApiError> responder(HttpStatus estado, String mensaje, HttpServletRequest request) {
        ApiError error = new ApiError(estado.value(), mensaje, request.getRequestURI());
        return ResponseEntity.status(estado).body(error);
    }
}