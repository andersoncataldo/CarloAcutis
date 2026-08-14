package com.carloacutis.backend.controllers;

import com.carloacutis.backend.models.Liga;
import com.carloacutis.backend.models.Usuario;
import com.carloacutis.backend.services.LigaService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ligas")
public class LigaController {

    private final LigaService ligaService;

    public LigaController(LigaService ligaService) {
        this.ligaService = ligaService;
    }

    @PostMapping("/criar")
    public ResponseEntity<Liga> criarLiga(@RequestBody LigaRequest request) {
        Liga liga = ligaService.criarLiga(request.getNome());
        return ResponseEntity.ok(liga);
    }

    @PostMapping("/entrar")
    public ResponseEntity<Usuario> entrarLiga(@RequestBody JoinRequest request) {
        Usuario usuario = ligaService.entrarNaLiga(request.getUsuarioId(), request.getCodigoAcesso());
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/{id}/ranking")
    public List<Usuario> getRanking(@PathVariable Long id) {
        return ligaService.getRankingDaLiga(id);
    }

    @Data
    static class LigaRequest {
        private String nome;
    }

    @Data
    static class JoinRequest {
        private Long usuarioId;
        private String codigoAcesso;
    }
}
