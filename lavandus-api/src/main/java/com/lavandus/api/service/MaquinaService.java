package com.lavandus.api.service;

import com.lavandus.api.exception.RecursoNoEncontradoException;
import com.lavandus.api.model.MaquinaLavadora;
import com.lavandus.api.model.Marca;
import com.lavandus.api.repository.MaquinaLavadoraRepository;
import com.lavandus.api.repository.MarcaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaquinaService {

    @Autowired
    private MaquinaLavadoraRepository maquinaRepository;

    @Autowired
    private MarcaRepository marcaRepository;

    // Listar todas las máquinas (ADMIN y EMPLEADO)
    public List<MaquinaLavadora> obtenerTodas() {
        return maquinaRepository.findAll();
    }

    // Consultar una máquina por id (ADMIN y EMPLEADO)
    public MaquinaLavadora obtenerPorId(Integer id) {
        return buscarOErro(id);
    }

    // Registrar una nueva máquina (solo ADMIN).
    // Si el body no trae estado, la entidad arranca en OPERATIVA por defecto.
    public MaquinaLavadora registrar(MaquinaLavadora maquina) {
        maquina.setMarca(resolverMarca(maquina.getMarca()));
        return maquinaRepository.save(maquina);
    }

    // Modificar una máquina existente (solo ADMIN)
    public MaquinaLavadora editar(Integer id, MaquinaLavadora datos) {
        MaquinaLavadora maquina = buscarOErro(id);

        maquina.setMarca(resolverMarca(datos.getMarca()));
        maquina.setTamano(datos.getTamano());
        maquina.setModelo(datos.getModelo());
        maquina.setPeriodoMant(datos.getPeriodoMant());
        maquina.setEstado(datos.getEstado());

        return maquinaRepository.save(maquina);
    }

    // Eliminar una máquina (solo ADMIN)
    public void eliminar(Integer id) {
        MaquinaLavadora maquina = buscarOErro(id);
        maquinaRepository.delete(maquina);
    }

    private MaquinaLavadora buscarOErro(Integer id) {
        return maquinaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("La máquina con id " + id + " no existe"));
    }

    // Resuelve la marca que llega en el body (solo trae el id) contra la base.
    private Marca resolverMarca(Marca marca) {
        if (marca == null || marca.getIdMarca() == null) {
            throw new IllegalArgumentException("La marca de la máquina es obligatoria");
        }
        return marcaRepository.findById(marca.getIdMarca())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "La marca con id " + marca.getIdMarca() + " no existe"));
    }
}