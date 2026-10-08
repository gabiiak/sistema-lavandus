package com.lavandus.api.model;

// Estados posibles de una máquina de lavandería.
// Se guardan como int en la columna "estado" de la tabla maquina_lavadora.
public final class EstadoMaquina {

    private EstadoMaquina() {
    }

    public static final int FUERA_SERVICIO = 0;
    public static final int OPERATIVA = 1;
    public static final int OCUPADA = 2;
}