package br.dev.mission.simplewallet.controller.runningcontroller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class RunningController {
    @GetMapping("/health")
    public Map<String, String> hello() {
        return Map.of("message", "Simple Wallet API is running");
    }

}
