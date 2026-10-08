package com.lavandus.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "maquina_lavadora")
public class MaquinaLavadora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_maquina")
    private Integer idMaquina;

    @Column(name = "marca", length = 100)
    private String marca;

    @Column(name = "tamano", length = 50)
    private String tamano;

    @Column(name = "modelo", length = 100)
    private String modelo;

    @Column(name = "procedencia", length = 100)
    private String procedencia;

    @Column(name = "periodo_mant", length = 50)
    private String periodoMant;

    // Estado de la máquina: ver constantes en EstadoMaquina
    @Column(name = "estado", nullable = false)
    private int estado = EstadoMaquina.OPERATIVA;

    public MaquinaLavadora() {}

    // --- GETTERS Y SETTERS ---
    public Integer getIdMaquina() { return idMaquina; }
    public void setIdMaquina(Integer idMaquina) { this.idMaquina = idMaquina; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    public String getTamano() { return tamano; }
    public void setTamano(String tamano) { this.tamano = tamano; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public String getProcedencia() { return procedencia; }
    public void setProcedencia(String procedencia) { this.procedencia = procedencia; }
    public String getPeriodoMant() { return periodoMant; }
    public void setPeriodoMant(String periodoMant) { this.periodoMant = periodoMant; }
    public int getEstado() { return estado; }
    public void setEstado(int estado) { this.estado = estado; }
}