package com.sesac.charity_auction.auction.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionSort;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.domain.QAuction;
import com.sesac.charity_auction.auction.dto.request.AuctionSearchCondition;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class AuctionQueryRepositoryImpl implements AuctionQueryRepository {
    private final JPAQueryFactory queryFactory;

    private final QAuction auction = QAuction.auction;

    @Override
    public Page<Auction> searchAuctions(final AuctionSearchCondition condition, final Pageable pageable) {
        // 동적 검색 조건
        final BooleanBuilder builder = new BooleanBuilder();

        // 삭제되지 않은 경매
        builder.and(auction.isDeleted.isFalse());

        // 제목 검색
        if (condition.keyword() != null && !condition.keyword().isBlank()) { // 검색어를 입력했을 때만 검색 조건 추가
            builder.and(auction.title.containsIgnoreCase(condition.keyword().trim()));
        }

        // 카테고리 필터링
        if (condition.categoryId() != null) {
            builder.and(auction.category.id.eq(condition.categoryId()));
        }

        // 상태 필터링
        if (condition.status() != null) {
            switch (condition.status()) {
                case SCHEDULED -> builder.and(auction.status.eq(AuctionStatus.SCHEDULED));

                case IN_PROGRESS -> builder.and(auction.status.eq(AuctionStatus.IN_PROGRESS));

                case CLOSED -> builder.and(auction.status.eq(AuctionStatus.CLOSED));

                case COMPLETED -> builder.and(auction.status.eq(AuctionStatus.COMPLETED));
            }
        }

        // 경매 목록 조회 - 현재 페이지에만 해당하는 데이터
        final List<Auction> content = queryFactory
                .selectFrom(auction)
                .where(builder) // 동적 검색 조건 적용
                .orderBy(getOrderSpecifier(condition.sort()), auction.id.desc()) // 조건이 같을 때 id가 높은 순으로
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch(); // QueryDSL 쿼리를 실제 데이터베이스에 실행

        // 전체 게시물 수
        final Long total = queryFactory
                .select(auction.count())
                .from(auction)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(content, pageable, total != null ? total : 0L);
    }

    // 정렬 조건
    private OrderSpecifier<?> getOrderSpecifier(AuctionSort sort) {
        if (sort == null) {
            sort = AuctionSort.LATEST;
        }

        return switch (sort) {
            case LATEST -> auction.id.desc();

            case LOWEST_PRICE -> auction.currentPrice.asc();

            case HIGHEST_PRICE -> auction.currentPrice.desc();

            case ENDING_SOON -> auction.endAt.asc();

            case STARTING_SOON -> auction.startAt.asc();

            case MOST_BIDS -> auction.bidCount.desc();
        };
    }
}
