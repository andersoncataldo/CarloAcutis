package com.carloacutis.backend.controllers;

import com.carloacutis.backend.models.Pergunta;
import com.carloacutis.backend.models.Temporada;
import com.carloacutis.backend.models.Usuario;
import com.carloacutis.backend.repositories.TemporadaRepository;
import com.carloacutis.backend.services.QuizService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final TemporadaRepository temporadaRepository;
    private final QuizService quizService;

    public QuizController(TemporadaRepository temporadaRepository, QuizService quizService) {
        this.temporadaRepository = temporadaRepository;
        this.quizService = quizService;
    }

    @GetMapping("/temporadas")
    public List<Temporada> getTemporadas() {
        return temporadaRepository.findAll();
    }

    @GetMapping("/temporada/{id}/perguntas")
    public List<Pergunta> getPerguntas(@PathVariable Long id) {
        Temporada temporada = temporadaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Temporada não encontrada."));
        return temporada.getPerguntas();
    }

    @PostMapping("/responder")
    public ResponseEntity<Usuario> responder(@RequestBody AnswerRequest request) {
        // Agora passando a resposta selecionada para validação real no banco
        Usuario usuario = quizService.processarResposta(
                request.getUsuarioId(), 
                request.getPerguntaId(), 
                request.getRespostaSelecionada()
        );
        return ResponseEntity.ok(usuario);
    }

    @Data
    static class AnswerRequest {
        private Long usuarioId;
        private Long perguntaId;
        private String respostaSelecionada;
    }
}
