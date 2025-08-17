package com.example.tetonam.oauth.repository;

import java.util.Optional;

import com.example.tetonam.oauth.domain.OauthId;
import com.example.tetonam.oauth.domain.OauthMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OauthMemberRepository extends JpaRepository<OauthMember, Long> {

    Optional<OauthMember> findByOauthId(OauthId oauthId);
}