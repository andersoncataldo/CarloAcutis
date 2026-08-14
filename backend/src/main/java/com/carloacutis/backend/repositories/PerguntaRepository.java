package com.carloacutis.backend.repositories;

import com.carloacutis.backend.models.Pergunta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerguntaRepository extends JpaRepository<Pergunta, Long> {
    List<Pergunta> findByTemporadaId(Long temporadaId);
}
