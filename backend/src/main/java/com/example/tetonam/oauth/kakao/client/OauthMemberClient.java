package com.example.tetonam.oauth.kakao.client;

import com.example.tetonam.oauth.domain.OauthMember;
import com.example.tetonam.oauth.domain.OauthServerType;


public interface OauthMemberClient {

    OauthServerType supportServer();

    OauthMember fetch(String code);
}