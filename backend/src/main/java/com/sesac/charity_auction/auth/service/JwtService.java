package com.sesac.charity_auction.auth.service;

import com.sesac.charity_auction.user.domain.Role;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class JwtService {
    private static final String ISSUER = "charity-auction";

    private final JwtEncoder jwtEncoder;
    @Getter
    private final long expirationSeconds;

    public JwtService(final JwtEncoder jwtEncoder,
                      @Value("${security.jwt.expiration-seconds}") final long expirationSeconds) {
        this.jwtEncoder = jwtEncoder;
        this.expirationSeconds = expirationSeconds;
    }

    public String createAccessToken(final Authentication authentication) {
        final List<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return createAccessToken(authentication.getName(), authorities);
    }

    public String createAccessToken(final long userId, final Role role) {
        return createAccessToken(String.valueOf(userId), List.of("ROLE_" + role.name()));
    }

    private String createAccessToken(final String subject, final List<String> authorities) {
        final Instant issuedAt = Instant.now();

        final JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plusSeconds(expirationSeconds))
                .subject(subject)
                .id(UUID.randomUUID().toString())
                .claim("authorities", authorities)
                .build();

        final JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
