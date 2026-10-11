package com.lavandus.api.service;

import com.lavandus.api.exception.RecursoDuplicadoException;
import com.lavandus.api.model.Marca;
import com.lavandus.api.repository.MarcaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarcaService {

    @Autowired
    private MarcaRepository marcaRepository;

    // Listar todas las marcas (ADMIN y EMPLEADO)
    public List<Marca> listar() {
        return marcaRepository.findAll();
    }

    // Registrar una marca (solo ADMIN). El nombre es único.
    public Marca registrar(Marca marca) {
        String nombre = marca.getNombre() != null ? marca.getNombre().trim() : null;
        String pais = marca.getPais() != null ? marca.getPais().trim() : null;

        if (nombre == null || nombre.isEmpty()) {
            throw new IllegalArgumentException("El nombre de la marca es obligatorio");
        }
        if (pais == null || pais.isEmpty()) {
            throw new IllegalArgumentException("El país de la marca es obligatorio");
        }
        if (marcaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new RecursoDuplicadoException("Ya existe una marca con ese nombre");
        }

        marca.setNombre(nombre);
        marca.setPais(pais);
        return marcaRepository.save(marca);
    }
}
