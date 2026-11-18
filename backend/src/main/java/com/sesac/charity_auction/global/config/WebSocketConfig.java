package com.sesac.charity_auction.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // 메세지 브로커의 전달 경로 설정
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config){

        // 서버에서 클라이언트로 메시지를 전달하는 경로
        config.enableSimpleBroker("/topic"); // 해당 경로로 시작하는 주소를 구독하는 클라이언트들에게 메시지 전달
    }

    // 클라이언트가 서버와 웹소켓 연결을 시작할 수 있는 접속 주소 등록
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry){

        // 웹소켓 연결 엔드포인트
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:3000");
    }
}
