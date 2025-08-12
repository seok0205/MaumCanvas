package com.example.tetonam.util;

import com.example.tetonam.config.WebClientConfig;
import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.response.code.status.ErrorStatus;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import reactor.core.publisher.Mono;


@Component
@RequiredArgsConstructor
public class WebClientUtil {

    private final WebClientConfig webClientConfig;

    public <T> Mono<T> postForm(String url, MultiValueMap<String, String> formData, Class<T> responseDtoClass) {
        return webClientConfig.webClient()
                .post()
                .uri(url)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)  // Content-Type 지정
                .headers(headers -> headers.setBearerAuth("Qv3ITniP5A70N1O0i3l2jbXbh-Mnx2hlAAAAAQoNFZsAAAGYmBrdrhKZRqbpl2cW"))
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                        clientResponse -> Mono.error(new UserHandler(ErrorStatus.AI_CLIENT_ERROR)))
                .onStatus(HttpStatusCode::is5xxServerError,
                        clientResponse -> Mono.error(new UserHandler(ErrorStatus.AI_SERVER_ERROR)))
                .bodyToMono(responseDtoClass);
    }

    public <T> Mono<T> get(String url, Class<T> responseDtoClass) {
        return webClientConfig.webClient().method(HttpMethod.GET)
                .uri(url)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, clientResponse -> Mono.error(new UserHandler(ErrorStatus.AI_CLIENT_ERROR)))
                .onStatus(HttpStatusCode::is5xxServerError, clientResponse -> Mono.error(new UserHandler(ErrorStatus.AI_SERVER_ERROR)))
                .bodyToMono(responseDtoClass);
//                .block();
    }

    public <T, V> Mono<T> post(String url, V requestDto, Class<T> responseDtoClass) {
        return webClientConfig.webClient().method(HttpMethod.POST)
                .uri(url)
                .bodyValue(requestDto)
                .retrieve()
                .bodyToMono(responseDtoClass);
//                .block();
    }
}