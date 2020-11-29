package ru.rzdhack.rzdapi.emulator.controller;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.rzdhack.rzdapi.emulator.model.Train;
import ru.rzdhack.rzdapi.emulator.service.TrainService;

import java.util.Map;

@Slf4j
@RestController
@AllArgsConstructor
public class TrainController {

    private final TrainService trainService;

    @GetMapping("/api/train")
    public Train getTrain(@RequestParam Map<String, String> parameters) {
        return trainService.getTrain(parameters);
    }

}
