package com.lavandus.api.exception;

import com.lavandus.api.dto.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.exc.InvalidFormatException;

import java.util.Objects;
import java.util.stream.Collectors;

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

    // 409: el recurso ya existe (ej: marca con nombre repetido)
    @ExceptionHandler(RecursoDuplicadoException.class)
    public ResponseEntity<ApiError> duplicado(RecursoDuplicadoException ex, HttpServletRequest request) {
        return responder(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    // 400: el cuerpo no se pudo convertir (tipo incorrecto o JSON malformado)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> mensajeIlegible(HttpMessageNotReadableException ex, HttpServletRequest request) {
        InvalidFormatException formato = buscarFormatoInvalido(ex);
        String mensaje = "El cuerpo de la solicitud no es un JSON válido";
        if (formato != null) {
            String campo = formato.getPath().stream()
                    .map(JacksonException.Reference::getPropertyName)
                    .filter(Objects::nonNull)
                    .collect(Collectors.joining("."));
            String valor = formato.getValue() != null ? formato.getValue().toString() : "";
            mensaje = "Valor inválido para el campo '" + campo + "': '" + valor
                    + "' (se esperaba " + describirTipo(formato.getTargetType()) + ")";
        }
        return responder(HttpStatus.BAD_REQUEST, mensaje, request);
    }

    // 400: un parámetro de la URL no tiene el tipo esperado (ej: id no numérico)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> parametroInvalido(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String valor = ex.getValue() != null ? ex.getValue().toString() : "";
        String mensaje = "El parámetro '" + ex.getName() + "' tiene un valor inválido: '" + valor + "'";
        return responder(HttpStatus.BAD_REQUEST, mensaje, request);
    }

    // 500: cualquier otro error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> errorGeneral(Exception ex, HttpServletRequest request) {
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", request);
    }

    // Busca en la cadena de causas el error de formato de Jackson (si está).
    private InvalidFormatException buscarFormatoInvalido(Throwable error) {
        Throwable actual = error;
        while (actual != null) {
            if (actual instanceof InvalidFormatException formato) {
                return formato;
            }
            actual = actual.getCause();
        }
        return null;
    }

    // Nombre amigable del tipo que esperaba Jackson.
    private String describirTipo(Class<?> tipo) {
        if (tipo == null) {
            return "un valor válido";
        }
        return switch (tipo.getSimpleName().toLowerCase()) {
            case "double", "float", "bigdecimal" -> "un número";
            case "int", "integer", "long", "short", "byte" -> "un número entero";
            case "boolean" -> "un booleano";
            default -> "un valor de tipo " + tipo.getSimpleName();
        };
    }

    private ResponseEntity<ApiError> responder(HttpStatus estado, String mensaje, HttpServletRequest request) {
        ApiError error = new ApiError(estado.value(), mensaje, request.getRequestURI());
        return ResponseEntity.status(estado).body(error);
    }
}