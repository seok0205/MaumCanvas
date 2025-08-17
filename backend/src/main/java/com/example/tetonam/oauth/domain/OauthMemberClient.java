package com.example.tetonam.oauth.domain;



public interface OauthMemberClient {

    OauthServerType supportServer();

    OauthMember fetch(String code);
}