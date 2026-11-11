package com.sesac.charity_auction.donation.service;

import com.sesac.charity_auction.donation.domain.DonationTarget;
import com.sesac.charity_auction.donation.dto.DonationRecordResponse;
import com.sesac.charity_auction.donation.dto.DonationSummaryResponse;
import com.sesac.charity_auction.donation.dto.DonationTargetDetailResponse;
import com.sesac.charity_auction.donation.dto.DonationTargetResponse;
import com.sesac.charity_auction.donation.repository.DonationRepository;
import com.sesac.charity_auction.donation.repository.DonationTargetRepository;
import com.sesac.charity_auction.global.error.BusinessException;
import com.sesac.charity_auction.global.error.ErrorCode;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 기부 조회 전용 서비스예요. 데이터를 바꾸지 않아서 readOnly 트랜잭션을 써요. */
@Service
@Transactional(readOnly = true)
public class DonationQueryService {

    private static final int SUMMARY_RECENT_SIZE = 5;
    private static final int DETAIL_RECENT_SIZE = 8;

    private final DonationRepository donationRepository;
    private final DonationTargetRepository targetRepository;

    public DonationQueryService(DonationRepository donationRepository,
                                DonationTargetRepository targetRepository) {
        this.donationRepository = donationRepository;
        this.targetRepository = targetRepository;
    }

    public DonationSummaryResponse getSummary() {
        List<DonationTargetResponse> targets = targetRepository.findAllByOrderByIdAsc().stream()
                .map(DonationTargetResponse::from)
                .toList();
        List<DonationRecordResponse> recent = donationRepository
                .findRecent(PageRequest.of(0, SUMMARY_RECENT_SIZE)).stream()
                .map(DonationRecordResponse::from)
                .toList();

        return new DonationSummaryResponse(
                donationRepository.sumAmount(),
                donationRepository.count(),
                donationRepository.countDistinctDonors(),
                targets,
                recent
        );
    }

    public DonationTargetDetailResponse getTargetDetail(long targetId) {
        // 비활성(마감) 기부처도 상세는 보여줘요. 없는 기부처만 404예요.
        DonationTarget target = targetRepository.findById(targetId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND));

        List<DonationRecordResponse> recent = donationRepository
                .findRecentByTargetId(targetId, PageRequest.of(0, DETAIL_RECENT_SIZE)).stream()
                .map(DonationRecordResponse::from)
                .toList();

        return new DonationTargetDetailResponse(
                DonationTargetResponse.from(target),
                donationRepository.countDistinctDonorsByTargetId(targetId),
                donationRepository.countByTargetId(targetId),
                recent
        );
    }
}
