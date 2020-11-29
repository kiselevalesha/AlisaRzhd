package ru.rzdhack.rzdapi.emulator.controller;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import ru.rzdhack.rzdapi.emulator.model.Ticket;
import ru.rzdhack.rzdapi.emulator.service.TicketService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@AllArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/api/ticket/buy")
    public String buyTicket(@RequestParam Map<String, String> parameters, @RequestBody Ticket ticket) {
        return ticketService.buyTicket(ticket);
    }

    @GetMapping("/api/ticket")
    public List<Ticket> getTickets() {
        return ticketService.getTickets();
    }

}
