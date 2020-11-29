package ru.rzdhack.rzdapi.emulator.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "ticket")
public class TicketEntity {

    @Id
    private String id;

    private String currency;

    private Integer place;

    private String name;

    private Long userId;

    private Long priceWhole;

    private Long priceCents;

    private String trainName;

    private Integer carNumber;

    private Date departureTime;

}
