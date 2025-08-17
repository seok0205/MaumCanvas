package com.example.tetonam.oauth.domain;


public interface AuthCodeRequestUrlProvider {

    OauthServerType supportServer();

    String provide();
}