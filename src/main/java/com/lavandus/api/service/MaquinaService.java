package com.lavandus.api.service;

import com.lavandus.api.model.EstadoMaquina;
import com.lavandus.api.model.MaquinaLavadora;
import com.lavandus.api.repository.EstadoMaquinaRepository;
import com.lavandus.api.repository.MaquinaLavadoraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MaquinaService {

    @Autowired
    private MaquinaLavadoraRepository maquinaRepository;
    
    @Autowired
    private EstadoMaquinaRepository estadoRepository;

    // Listar todas las máquinas
    public List<MaquinaLavadora> obtenerTodas() {
        return maquinaRepository.findAll();
    }

    // Registrar una nueva máquina
    public MaquinaLavadora registrarMaquina(MaquinaLavadora maquina, String nombreEstadoInicial) {
        // Buscamos el estado (si no existe, lo deberíamos crear o devolver error)
        Optional<EstadoMaquina> estadoOpt = estadoRepository.findByNombre(nombreEstadoInicial);
        
        if (estadoOpt.isPresent()) {
            maquina.setEstado(estadoOpt.get());
        }
        
        return maquinaRepository.save(maquina);
    }
}