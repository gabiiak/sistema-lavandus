package com.lavandus.api.service;

import com.lavandus.api.dto.SolicitudRequest;
import com.lavandus.api.dto.SolicitudResponse;
import com.lavandus.api.exception.RecursoNoEncontradoException;
import com.lavandus.api.model.DetalleSolicitud;
import com.lavandus.api.model.Solicitud;
import com.lavandus.api.model.TipoPrenda;
import com.lavandus.api.repository.SolicitudRepository;
import com.lavandus.api.repository.TipoPrendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class SolicitudService {

    // Tope de peso por solicitud (kg)
    private static final double PESO_MAXIMO = 400.0;

    // Validación mínima de email (texto@texto.algo)
    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    @Autowired
    private SolicitudRepository solicitudRepository;

    @Autowired
    private TipoPrendaRepository tipoPrendaRepository;

    // Registrar una solicitud (público). El peso y el precio los calcula el backend,
    // ignorando cualquier valor que el cliente intente enviar.
    public SolicitudResponse registrar(SolicitudRequest request) {
        String nombreCliente = normalizar(request.getNombreCliente(), "El nombre del cliente es obligatorio");
        String email = normalizar(request.getEmail(), "El email es obligatorio").toLowerCase();
        String razonSocial = normalizar(request.getRazonSocial(), "La razón social es obligatoria");

        if (!EMAIL.matcher(email).matches()) {
            throw new IllegalArgumentException("El email no tiene un formato válido");
        }
        if (request.getDetalles() == null || request.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("La solicitud debe tener al menos una prenda");
        }

        Solicitud solicitud = new Solicitud();
        solicitud.setNombreCliente(nombreCliente);
        solicitud.setEmail(email);
        solicitud.setRazonSocial(razonSocial);

        double pesoTotal = 0;
        BigDecimal precioEstimado = BigDecimal.ZERO;

        for (SolicitudRequest.Detalle pedido : request.getDetalles()) {
            if (pedido.getIdTipoPrenda() == null) {
                throw new IllegalArgumentException("Cada prenda debe indicar su tipo");
            }
            if (pedido.getCantidad() == null || pedido.getCantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad de cada prenda debe ser mayor a 0");
            }

            TipoPrenda tipo = tipoPrendaRepository.findById(pedido.getIdTipoPrenda())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "El tipo de prenda con id " + pedido.getIdTipoPrenda() + " no existe"));

            pesoTotal += tipo.getPeso() * pedido.getCantidad();
            precioEstimado = precioEstimado.add(
                    tipo.getPrecio().multiply(BigDecimal.valueOf(pedido.getCantidad())));

            DetalleSolicitud detalle = new DetalleSolicitud();
            detalle.setTipoPrenda(tipo);
            detalle.setCantidad(pedido.getCantidad());
            solicitud.agregarDetalle(detalle);
        }

        if (pesoTotal > PESO_MAXIMO) {
            throw new IllegalArgumentException(
                    "El peso total de la solicitud no puede superar los " + (int) PESO_MAXIMO + " kg");
        }

        solicitud.setPesoTotal(pesoTotal);
        solicitud.setPrecioEstimado(precioEstimado);

        return aRespuesta(solicitudRepository.save(solicitud));
    }

    // Listar solicitudes (ADMIN y ENCARGADO_SERVICIO)
    @Transactional(readOnly = true)
    public List<SolicitudResponse> listar() {
        return solicitudRepository.findAll().stream()
                .map(this::aRespuesta)
                .toList();
    }

    // Listar solo las solicitudes que todavía no tienen servicio (RF-1)
    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarDisponibles() {
        return solicitudRepository.findDisponibles().stream()
                .map(this::aRespuesta)
                .toList();
    }

    // Convertimos la entidad en el DTO (evita la recursión del @OneToMany).
    // Es público para que ServicioService reutilice el mismo formato.
    public SolicitudResponse aRespuesta(Solicitud solicitud) {
        List<SolicitudResponse.Detalle> detalles = solicitud.getDetalles().stream()
                .map(d -> {
                    TipoPrenda tipo = d.getTipoPrenda();
                    BigDecimal subtotal = tipo.getPrecio().multiply(BigDecimal.valueOf(d.getCantidad()));
                    return new SolicitudResponse.Detalle(
                            tipo.getIdTipoPrenda(), tipo.getNombre(), tipo.getPeso(),
                            tipo.getPrecio(), d.getCantidad(), subtotal);
                })
                .toList();

        return new SolicitudResponse(
                solicitud.getIdSolicitud(),
                solicitud.getNombreCliente(),
                solicitud.getEmail(),
                solicitud.getRazonSocial(),
                solicitud.getPesoTotal(),
                solicitud.getPrecioEstimado(),
                detalles);
    }

    // Recorta el valor y valida que no quede vacío.
    private String normalizar(String valor, String mensaje) {
        String limpio = valor != null ? valor.trim() : null;
        if (limpio == null || limpio.isEmpty()) {
            throw new IllegalArgumentException(mensaje);
        }
        return limpio;
    }
}
