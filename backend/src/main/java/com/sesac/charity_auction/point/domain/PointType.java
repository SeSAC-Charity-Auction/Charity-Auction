package com.sesac.charity_auction.point.domain;

/**
 * DB에는 EARN/USE로 저장하고, API 응답에서만 "적립"/"사용"으로 바꿔요.
 */
public enum PointType {
    EARN("적립"),
    USE("사용");

    private final String label;

    PointType(final String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
