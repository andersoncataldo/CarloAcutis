package com.carloacutis.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "ligas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Liga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String codigoAcesso;

    @OneToMany(mappedBy = "liga")
    private List<Usuario> membros;
}
