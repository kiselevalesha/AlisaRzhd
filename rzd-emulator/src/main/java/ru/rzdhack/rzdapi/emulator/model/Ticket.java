package ru.rzdhack.rzdapi.emulator.model;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class Ticket {

    private String currency;
    private String name;
    private Long user;
    private Integer place;

    private Price price;

    private String trainName;

    private Integer carNumber;

    private Date departureTime;

}
