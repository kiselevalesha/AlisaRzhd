package ru.rzdhack.rzdapi.emulator.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.rzdhack.rzdapi.emulator.repository.TicketRepository;
import ru.rzdhack.rzdapi.emulator.entity.TicketEntity;
import ru.rzdhack.rzdapi.emulator.model.Price;
import ru.rzdhack.rzdapi.emulator.model.Ticket;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    public String buyTicket(Ticket ticket) {
        return ticketRepository.save(fromDto(ticket)).getId();
    }

    public List<Ticket> getTickets() {
        return ((List<TicketEntity>) ticketRepository.findAll()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private Ticket toDto(TicketEntity ticketEntity) {
        Ticket ticket = new Ticket();
        ticket.setCurrency(ticketEntity.getCurrency());
        ticket.setPlace(ticketEntity.getPlace());
        ticket.setName(ticketEntity.getName());
        ticket.setUser(ticketEntity.getUserId());
        Price price = new Price();
        price.setCents(ticketEntity.getPriceCents());
        price.setWhole(ticketEntity.getPriceWhole());
        ticket.setPrice(price);
        ticket.setTrainName(ticketEntity.getTrainName());
        ticket.setCarNumber(ticketEntity.getCarNumber());
        ticket.setDepartureTime(ticketEntity.getDepartureTime());
        return ticket;

    }

    private TicketEntity fromDto(Ticket ticket) {
        TicketEntity ticketEntity = new TicketEntity();
        ticketEntity.setId(String.valueOf(UUID.randomUUID()));
        ticketEntity.setCurrency(ticket.getCurrency());
        ticketEntity.setName(ticket.getName());
        ticketEntity.setPlace(ticket.getPlace());
        ticketEntity.setTrainName(ticket.getTrainName());
        Optional.ofNullable(ticket.getPrice()).map(Price::getCents).ifPresent(ticketEntity::setPriceCents);
        Optional.ofNullable(ticket.getPrice()).map(Price::getWhole).ifPresent(ticketEntity::setPriceWhole);
        ticketEntity.setUserId(ticket.getUser());
        ticketEntity.setDepartureTime(ticket.getDepartureTime());
        ticketEntity.setCarNumber(ticket.getCarNumber());
        return ticketEntity;
    }

}
