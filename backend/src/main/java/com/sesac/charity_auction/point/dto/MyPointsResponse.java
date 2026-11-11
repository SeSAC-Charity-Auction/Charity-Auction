package com.sesac.charity_auction.point.dto;

import java.util.List;

public record MyPointsResponse(long balance, List<PointEntryResponse> recent) {
}
