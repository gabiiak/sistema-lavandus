package com.lavandus.api.service;

import com.lavandus.api.exception.RecursoDuplicadoException;
import com.lavandus.api.exception.RecursoNoEncontradoException;
import com.lavandus.api.model.Marca;
import com.lavandus.api.repository.MarcaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarcaService {

    @Autowired
    private MarcaRepository marcaRepository;

    // Listar todas las marcas (solo ADMIN)
    public List<Marca> listar() {
        return marcaRepository.findAll();
    }

    // Registrar una marca (solo ADMIN). El nombre es único.
    public Marca registrar(Marca marca) {
        String nombre = normalizar(marca.getNombre(), "El nombre de la marca es obligatorio");
        String pais = normalizar(marca.getPais(), "El país de la marca es obligatorio");

        if (marcaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new RecursoDuplicadoException("Ya existe una marca con ese nombre");
        }

        marca.setNombre(nombre);
        marca.setPais(pais);
        return marcaRepository.save(marca);
    }

    // Modificar una marca existente (solo ADMIN). El nombre sigue siendo único.
    public Marca editar(Integer id, Marca datos) {
        Marca marca = buscarOErro(id);

        String nombre = normalizar(datos.getNombre(), "El nombre de la marca es obligatorio");
        String pais = normalizar(datos.getPais(), "El país de la marca es obligatorio");

        if (marcaRepository.existsByNombreIgnoreCaseAndIdMarcaNot(nombre, id)) {
            throw new RecursoDuplicadoException("Ya existe una marca con ese nombre");
        }

        marca.setNombre(nombre);
        marca.setPais(pais);
        return marcaRepository.save(marca);
    }

    private Marca buscarOErro(Integer id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("La marca con id " + id + " no existe"));
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
