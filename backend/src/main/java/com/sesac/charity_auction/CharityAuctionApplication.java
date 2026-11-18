package com.sesac.charity_auction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class CharityAuctionApplication {
    public static void main(final String[] args) {
        // 경매 시간(LocalDateTime.now())이 서버 기기의 시간대와 상관없이 한국 시간으로 저장되고 비교돼요.
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
        SpringApplication.run(CharityAuctionApplication.class, args);
    }
}
