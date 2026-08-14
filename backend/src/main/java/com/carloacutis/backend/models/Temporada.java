package com.carloacutis.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "temporadas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Temporada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 500)
    private String descricao;

    @OneToMany(mappedBy = "temporada", cascade = CascadeType.ALL)
    private List<Pergunta> perguntas;
}
