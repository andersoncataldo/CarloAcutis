package com.carloacutis.backend.repositories;

import com.carloacutis.backend.models.Liga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LigaRepository extends JpaRepository<Liga, Long> {
    Optional<Liga> findByCodigoAcesso(String codigoAcesso);
}
