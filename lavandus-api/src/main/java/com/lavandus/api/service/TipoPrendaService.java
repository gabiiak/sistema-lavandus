package com.lavandus.api.service;

import com.lavandus.api.model.TipoPrenda;
import com.lavandus.api.repository.TipoPrendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipoPrendaService {

    @Autowired
    private TipoPrendaRepository tipoPrendaRepository;

    // Listar los tipos de prenda (público: lo usa la vista de cliente)
    public List<TipoPrenda> listar() {
        return tipoPrendaRepository.findAll();
    }
}
