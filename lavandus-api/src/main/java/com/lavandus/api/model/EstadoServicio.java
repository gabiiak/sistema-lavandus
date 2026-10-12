package com.lavandus.api.model;

// Estados posibles de un servicio de lavado.
// Se guardan como int en la columna "estado" de la tabla servicio.
// El orden refleja el avance secuencial del servicio.
public final class EstadoServicio {

    private EstadoServicio() {
    }

    public static final int PENDIENTE = 0;         // sin máquina asignada
    public static final int PROGRAMADA = 1;        // lavado programado en una máquina
    public static final int PROCESO_LAVADO = 2;
    public static final int PROCESO_SECADO = 3;
    public static final int PROCESO_PLANCHADO = 4;
    public static final int TERMINADO = 5;         // estado final
    public static final int CANCELADA = 6;         // estado final
}
