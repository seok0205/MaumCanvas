package com.example.tetonam.oauth.service;

import com.example.tetonam.oauth.domain.AuthCodeRequestUrlProviderComposite;
import com.example.tetonam.oauth.domain.OauthMember;
import com.example.tetonam.oauth.domain.OauthServerType;
import com.example.tetonam.oauth.kakao.client.OauthMemberClientComposite;
import com.example.tetonam.oauth.repository.OauthMemberRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OauthService {

    private final AuthCodeRequestUrlProviderComposite authCodeRequestUrlProviderComposite;
    private final OauthMemberClientComposite oauthMemberClientComposite;
    private final OauthMemberRepository oauthMemberRepository;

    public String getAuthCodeRequestUrl(OauthServerType oauthServerType) {
        return authCodeRequestUrlProviderComposite.provide(oauthServerType);
    }

    // 추가
    public Long login(OauthServerType oauthServerType, String authCode) {
        OauthMember oauthMember = oauthMemberClientComposite.fetch(oauthServerType, authCode);
        OauthMember saved = oauthMemberRepository.findByOauthId(oauthMember.oauthId())
                .orElseGet(() -> oauthMemberRepository.save(oauthMember));
        System.out.println(saved.nickname()+"닉네임");
        System.out.println(saved.profileImageUrl()+"이미지");
        return saved.id();
    }
}