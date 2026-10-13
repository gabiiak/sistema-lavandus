package com.lavandus.api.service;

import com.lavandus.api.exception.RecursoDuplicadoException;
import com.lavandus.api.exception.RecursoNoEncontradoException;
import com.lavandus.api.model.TipoPrenda;
import com.lavandus.api.repository.TipoPrendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TipoPrendaService {

    @Autowired
    private TipoPrendaRepository tipoPrendaRepository;

    // Listar los tipos de prenda (público: lo usa la vista de cliente)
    public List<TipoPrenda> listar() {
        return tipoPrendaRepository.findAll();
    }

    // Registrar un tipo de prenda (solo ADMIN). El nombre es único.
    public TipoPrenda registrar(TipoPrenda tipoPrenda) {
        String nombre = normalizar(tipoPrenda.getNombre(), "El nombre del tipo de prenda es obligatorio");
        validarNumeros(tipoPrenda);

        if (tipoPrendaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new RecursoDuplicadoException("Ya existe un tipo de prenda con ese nombre");
        }

        tipoPrenda.setNombre(nombre);
        return tipoPrendaRepository.save(tipoPrenda);
    }

    // Modificar un tipo de prenda existente (solo ADMIN). El nombre sigue siendo único.
    public TipoPrenda editar(Integer id, TipoPrenda datos) {
        TipoPrenda tipoPrenda = buscarOErro(id);

        String nombre = normalizar(datos.getNombre(), "El nombre del tipo de prenda es obligatorio");
        validarNumeros(datos);

        if (tipoPrendaRepository.existsByNombreIgnoreCaseAndIdTipoPrendaNot(nombre, id)) {
            throw new RecursoDuplicadoException("Ya existe un tipo de prenda con ese nombre");
        }

        tipoPrenda.setNombre(nombre);
        tipoPrenda.setPeso(datos.getPeso());
        tipoPrenda.setPrecio(datos.getPrecio());
        return tipoPrendaRepository.save(tipoPrenda);
    }

    private TipoPrenda buscarOErro(Integer id) {
        return tipoPrendaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("El tipo de prenda con id " + id + " no existe"));
    }

    // El peso (kg) y la tarifa (precio unitario) deben ser mayores a 0.
    private void validarNumeros(TipoPrenda tipoPrenda) {
        if (tipoPrenda.getPeso() <= 0) {
            throw new IllegalArgumentException("El peso debe ser mayor a 0");
        }
        BigDecimal precio = tipoPrenda.getPrecio();
        if (precio == null || precio.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("La tarifa debe ser mayor a 0");
        }
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
