package com.lavandus.api.service;

import com.lavandus.api.exception.RecursoNoEncontradoException;
import com.lavandus.api.model.MaquinaLavadora;
import com.lavandus.api.model.Marca;
import com.lavandus.api.repository.MaquinaLavadoraRepository;
import com.lavandus.api.repository.MarcaRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaquinaService {

    @Autowired
    private MaquinaLavadoraRepository maquinaRepository;

    @Autowired
    private MarcaRepository marcaRepository;

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    // Asegura al iniciar que la columna 'tamano' en la base sea INTEGER y sin nulos
    @PostConstruct
    public void migrarColumnaTamano() {
        if (jdbcTemplate == null) return;
        try {
            jdbcTemplate.execute("ALTER TABLE maquina_lavadora ADD COLUMN IF NOT EXISTS tamano INTEGER DEFAULT 25");
        } catch (Exception ignored) {
        }
        try {
            jdbcTemplate.execute("ALTER TABLE maquina_lavadora ALTER COLUMN tamano DROP DEFAULT");
        } catch (Exception ignored) {
        }
        try {
            jdbcTemplate.execute("""
                ALTER TABLE maquina_lavadora
                ALTER COLUMN tamano TYPE INTEGER
                USING (
                    CASE
                        WHEN tamano IS NULL THEN 25
                        WHEN tamano::text ~ '[0-9]+' THEN CAST(substring(tamano::text FROM '[0-9]+') AS INTEGER)
                        WHEN LOWER(tamano::text) LIKE '%chica%' OR LOWER(tamano::text) LIKE '%peque%' THEN 15
                        WHEN LOWER(tamano::text) LIKE '%mediana%' THEN 25
                        WHEN LOWER(tamano::text) LIKE '%grande%' OR LOWER(tamano::text) LIKE '%industrial%' THEN 50
                        ELSE 25
                    END
                )
                """);
        } catch (Exception ignored) {
        }
        try {
            jdbcTemplate.execute("UPDATE maquina_lavadora SET tamano = CAST(ROUND(capacidad) AS INTEGER) WHERE capacidad IS NOT NULL AND capacidad > 0");
        } catch (Exception ignored) {
        }
        try {
            jdbcTemplate.execute("UPDATE maquina_lavadora SET tamano = 25 WHERE tamano IS NULL OR tamano <= 0");
            jdbcTemplate.execute("ALTER TABLE maquina_lavadora ALTER COLUMN tamano SET DEFAULT 25");
            jdbcTemplate.execute("ALTER TABLE maquina_lavadora ALTER COLUMN tamano SET NOT NULL");
            jdbcTemplate.execute("ALTER TABLE maquina_lavadora DROP COLUMN IF EXISTS capacidad");
        } catch (Exception ignored) {
        }
    }

    // Listar todas las máquinas (ADMIN y encargados)
    public List<MaquinaLavadora> obtenerTodas() {
        return maquinaRepository.findAll();
    }

    // Consultar una máquina por id (ADMIN y encargados)
    public MaquinaLavadora obtenerPorId(Integer id) {
        return buscarOErro(id);
    }

    // Registrar una nueva máquina (solo ADMIN).
    // Si el body no trae estado, la entidad arranca en OPERATIVA por defecto.
    public MaquinaLavadora registrar(MaquinaLavadora maquina) {
        validarCapacidad(maquina);
        maquina.setMarca(resolverMarca(maquina.getMarca()));
        return maquinaRepository.save(maquina);
    }

    // Modificar una máquina existente (solo ADMIN)
    public MaquinaLavadora editar(Integer id, MaquinaLavadora datos) {
        MaquinaLavadora maquina = buscarOErro(id);
        validarCapacidad(datos);

        maquina.setMarca(resolverMarca(datos.getMarca()));
        maquina.setTamano(datos.getTamano());
        maquina.setModelo(datos.getModelo());
        maquina.setPeriodoMant(datos.getPeriodoMant());
        maquina.setEstado(datos.getEstado());

        return maquinaRepository.save(maquina);
    }

    private void validarCapacidad(MaquinaLavadora maquina) {
        if (maquina.getTamano() <= 0) {
            throw new IllegalArgumentException("La capacidad de la máquina debe ser mayor a 0 kg");
        }
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