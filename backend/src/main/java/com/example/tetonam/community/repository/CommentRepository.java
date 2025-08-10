package com.example.tetonam.community.repository;

import com.example.tetonam.community.domain.Category;
import com.example.tetonam.community.domain.Comment;
import com.example.tetonam.community.domain.Community;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * 특정 카테고리의 게시글을 모두 조회
     * - 사용 예: /community/posts?category=STUDY 요청 시
     */
    List<Comment> findByCommunity_id(Long id);
    long countByCommunity_Id(Long communityId);
}
