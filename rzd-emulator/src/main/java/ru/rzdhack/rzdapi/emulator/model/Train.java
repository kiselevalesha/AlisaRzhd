package ru.rzdhack.rzdapi.emulator.model;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
public class Train {

	private String name;
	private BigDecimal price;
	private Date startDate;
	private Date endDate;
}
