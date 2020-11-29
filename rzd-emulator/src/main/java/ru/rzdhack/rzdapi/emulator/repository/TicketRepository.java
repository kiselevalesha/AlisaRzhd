package ru.rzdhack.rzdapi.emulator.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import ru.rzdhack.rzdapi.emulator.entity.TicketEntity;

@Repository
public interface TicketRepository extends CrudRepository<TicketEntity, String> {
}
