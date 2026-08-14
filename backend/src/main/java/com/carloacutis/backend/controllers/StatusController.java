package com.carloacutis.backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class StatusController {

    @GetMapping("/status")
    public String checarStatus() {
        return "Backend do projeto Carlo Acutis rodando perfeitamente e pronto para evangelizar! 🚀";
    }
}
