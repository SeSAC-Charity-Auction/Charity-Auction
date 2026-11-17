package com.sesac.charity_auction.donation.service;

import com.sesac.charity_auction.donation.dto.DonationRankingResponse;
import com.sesac.charity_auction.point.domain.PointType;
import com.sesac.charity_auction.point.repository.DonationRankingProjection;
import com.sesac.charity_auction.point.repository.PointHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DonationRankingService {
    private final PointHistoryRepository pointHistoryRepository;

    public DonationRankingService(PointHistoryRepository pointHistoryRepository) {
        this.pointHistoryRepository = pointHistoryRepository;
    }

    public List<DonationRankingResponse> getRanking() {
        List<DonationRankingProjection> totals = pointHistoryRepository.findDonationRanking(PointType.USE);
        List<DonationRankingResponse> ranking = new ArrayList<>(totals.size());

        Long previousTotal = null;
        long currentRank = 0;

        for (int index = 0; index < totals.size(); index++) {
            DonationRankingProjection member = totals.get(index);
            long totalDonation = member.getTotalDonation();

            if (previousTotal == null || totalDonation != previousTotal) {
                currentRank = (long) index + 1;
            }

            ranking.add(new DonationRankingResponse(
                    currentRank,
                    member.getUserId(),
                    member.getNickname(),
                    member.getUserImage(),
                    totalDonation,
                    member.getDonationCount()
            ));
            previousTotal = totalDonation;
        }

        return ranking;
    }
}
