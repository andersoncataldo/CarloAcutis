package com.carloacutis.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "perguntas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Pergunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String textoPergunta;

    @Column(nullable = false)
    private String opcaoA;

    @Column(nullable = false)
    private String opcaoB;

    @Column(nullable = false)
    private String opcaoC;

    @Column(nullable = false)
    private String opcaoD;

    @Column(nullable = false)
    private String respostaCorreta;

    @ManyToOne
    @JoinColumn(name = "temporada_id", nullable = false)
    private Temporada temporada;
}
