package ru.rzdhack.rzdapi.emulator.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.rzdhack.rzdapi.emulator.model.Train;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Map;

@Slf4j
@Service
@AllArgsConstructor
public class TrainService {

    public Train getTrain(Map<String, String> parameters) {
        logParameters(parameters);
        Train train = new Train();
        train.setName("049Й Самара — Москва");
        train.setPrice(new BigDecimal("999.00"));
        Date currentDate = new Date();
        train.setStartDate(currentDate);
        train.setEndDate(new Date(currentDate.getTime() + 999999999));
        return train;
    }

    private void logParameters(Map<String, String> parameters) {
        for (Map.Entry<String, String> entry : parameters.entrySet()) {
            log.info(entry.getKey() + " " + entry.getValue());
        }
    }

}
