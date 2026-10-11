package com.lavandus.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "maquina_lavadora")
public class MaquinaLavadora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_maquina")
    private Integer idMaquina;

    // Marca de la máquina (obligatoria). De acá sale también la procedencia (marca.pais).
    @ManyToOne
    @JoinColumn(name = "id_marca", nullable = false)
    private Marca marca;

    @Column(name = "tamano", length = 50)
    private String tamano;

    @Column(name = "modelo", length = 100)
    private String modelo;

    @Column(name = "periodo_mant", length = 50)
    private String periodoMant;

    // Estado de la máquina: ver constantes en EstadoMaquina
    @Column(name = "estado", nullable = false)
    private int estado = EstadoMaquina.OPERATIVA;

    public MaquinaLavadora() {}

    // --- GETTERS Y SETTERS ---
    public Integer getIdMaquina() { return idMaquina; }
    public void setIdMaquina(Integer idMaquina) { this.idMaquina = idMaquina; }
    public Marca getMarca() { return marca; }
    public void setMarca(Marca marca) { this.marca = marca; }
    public String getTamano() { return tamano; }
    public void setTamano(String tamano) { this.tamano = tamano; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public String getPeriodoMant() { return periodoMant; }
    public void setPeriodoMant(String periodoMant) { this.periodoMant = periodoMant; }
    public int getEstado() { return estado; }
    public void setEstado(int estado) { this.estado = estado; }
}