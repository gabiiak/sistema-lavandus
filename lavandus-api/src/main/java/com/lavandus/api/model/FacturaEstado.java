package com.lavandus.api.model;

// Estados posibles de una factura de servicio.
// Se guardan como int en la columna "estado" de la tabla factura.
public final class FacturaEstado {

    private FacturaEstado() {
    }

    public static final int NO_ENVIADA = 0; // el PDF existe pero el correo no se pudo enviar
    public static final int ENVIADA = 1;    // el correo se envió correctamente
}
