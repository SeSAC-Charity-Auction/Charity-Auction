package com.sesac.charity_auction.global.common;

import java.time.LocalDateTime;
import java.time.ZoneId;

public final class LocalTimes {
    private LocalTimes() {
    }

    /**
     * 경매·입찰 시간은 서버 현지 시간(LocalDateTime.now(), DB의 CURRENT_TIMESTAMP)으로 저장돼요.
     * (기부 쪽 시간은 UTC로 저장해서 따로 처리해요.) 브라우저가 시간대를 헷갈리지 않도록
     * 서버 시간대를 붙여 UTC 표시가 있는 ISO 8601로 바꿔 줘요. (예: 2026-11-17T03:49:20Z)
     */
    public static String toIsoInstant(final LocalDateTime time) {
        return time.atZone(ZoneId.systemDefault()).toInstant().toString();
    }
}
