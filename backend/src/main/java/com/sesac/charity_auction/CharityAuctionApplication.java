package com.sesac.charity_auction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CharityAuctionApplication {
    public static void main(final String[] args) {
        SpringApplication.run(CharityAuctionApplication.class, args);
    }
}
