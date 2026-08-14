package com.carloacutis.backend.services;

import com.carloacutis.backend.models.Liga;
import com.carloacutis.backend.models.Usuario;
import com.carloacutis.backend.repositories.LigaRepository;
import com.carloacutis.backend.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LigaService {

    private final LigaRepository ligaRepository;
    private final UsuarioRepository usuarioRepository;

    public LigaService(LigaRepository ligaRepository, UsuarioRepository usuarioRepository) {
        this.ligaRepository = ligaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Liga criarLiga(String nome) {
        Liga liga = new Liga();
        liga.setNome(nome);
        liga.setCodigoAcesso(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return ligaRepository.save(liga);
    }

    @Transactional
    public Usuario entrarNaLiga(Long usuarioId, String codigoAcesso) {
        Liga liga = ligaRepository.findByCodigoAcesso(codigoAcesso)
                .orElseThrow(() -> new RuntimeException("Liga não encontrada com o código informado."));
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        
        usuario.setLiga(liga);
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> getRankingDaLiga(Long ligaId) {
        Liga liga = ligaRepository.findById(ligaId)
                .orElseThrow(() -> new RuntimeException("Liga não encontrada."));
        
        return liga.getMembros().stream()
                .sorted(Comparator.comparing(Usuario::getXp).reversed())
                .collect(Collectors.toList());
    }
}
