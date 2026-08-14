package com.carloacutis.backend.services;

import com.carloacutis.backend.models.Pergunta;
import com.carloacutis.backend.models.Usuario;
import com.carloacutis.backend.repositories.PerguntaRepository;
import com.carloacutis.backend.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuizService {

    private final UsuarioRepository usuarioRepository;
    private final PerguntaRepository perguntaRepository;

    private static final int XP_POR_RESPOSTA_CORRETA = 100;
    private static final int XP_PARA_PROXIMO_NIVEL = 1000;

    public QuizService(UsuarioRepository usuarioRepository, PerguntaRepository perguntaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.perguntaRepository = perguntaRepository;
    }

    @Transactional
    public Usuario processarResposta(Long usuarioId, Long perguntaId, String respostaUsuario) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Pergunta pergunta = perguntaRepository.findById(perguntaId)
                .orElseThrow(() -> new RuntimeException("Pergunta não encontrada"));

        // Validação Real da Resposta
        if (pergunta.getRespostaCorreta().equalsIgnoreCase(respostaUsuario)) {
            int novoXpTotal = usuario.getXp() + XP_POR_RESPOSTA_CORRETA;
            usuario.setXp(novoXpTotal);

            int novoNivelNum = (novoXpTotal / XP_PARA_PROXIMO_NIVEL) + 1;
            String novoNivelTitulo = calcularTitulo(novoNivelNum);

            usuario.setNivel(novoNivelTitulo);
        }

        return usuarioRepository.save(usuario);
    }

    private String calcularTitulo(int nivel) {
        if (nivel < 5) return "Peregrino";
        if (nivel < 10) return "Discípulo";
        if (nivel < 20) return "Missionário";
        if (nivel < 50) return "Apóstolo Digital";
        return "Ciberapóstolo da Eucaristia";
    }
}
