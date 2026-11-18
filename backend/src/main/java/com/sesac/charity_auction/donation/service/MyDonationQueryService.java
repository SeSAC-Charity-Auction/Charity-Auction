package com.sesac.charity_auction.donation.service;

import com.sesac.charity_auction.donation.domain.Donation;
import com.sesac.charity_auction.donation.dto.MyDonationPageResponse;
import com.sesac.charity_auction.donation.dto.MyDonationResponse;
import com.sesac.charity_auction.donation.repository.DonationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 마이페이지의 "내 기부 이력" 조회예요. 데이터를 바꾸지 않아요. */
@Service
@Transactional(readOnly = true)
public class MyDonationQueryService {
    private static final int MAX_PAGE_SIZE = 50;

    private final DonationRepository donationRepository;

    public MyDonationQueryService(final DonationRepository donationRepository) {
        this.donationRepository = donationRepository;
    }

    public MyDonationPageResponse getMyDonations(final long userId, final int page, final int size) {
        final int safePage = Math.max(0, page);
        final int safeSize = Math.clamp(size, 1, MAX_PAGE_SIZE);
        final Page<Donation> result = donationRepository.findMine(userId, PageRequest.of(safePage, safeSize));
        return new MyDonationPageResponse(
                result.getContent().stream().map(MyDonationResponse::from).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                donationRepository.sumAmountByUserId(userId));
    }
}
