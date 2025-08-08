package com.example.tetonam.community.repository;

import com.example.tetonam.community.domain.Category;
import com.example.tetonam.community.domain.Community;
import com.example.tetonam.community.dto.PostPageDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface  CommunityRepository extends JpaRepository<Community, Long> {

    /**
     * 특정 카테고리의 게시글을 모두 조회
     * - 사용 예: /community/posts?category=STUDY 요청 시
     */


    /**
     * 전체 게시글 중 최신순 정렬 조회
     * - 사용 예: 최신순 정렬 시 category 없이 전체 게시글 보기
     */

    //커서 사용으로 게시글 조회할거라 새로운 정렬 생성
    List<Community> findByIdLessThanOrderByIdDesc(Long lastId, Pageable pageable);
    /**
     * 특정 카테고리의 게시글을 최신순 정렬
     */

    /**
     * 전체 게시글 중 조회수 순 정렬
     */
    List<Community> findAllByOrderByViewCountDesc();

    /**
     * 키워드 검색 (제목에 포함되는 값)
     * - 확장 가능성 예시용
     */
    @Query("SELECT new com.example.tetonam.community.dto.PostPageDto(c.id, c.title, u.nickname, c.category) " +
            "FROM Community c JOIN c.author u ORDER BY c.createdDate DESC")
    Page<PostPageDto> findAllWithAuthorNickname(Pageable pageable);

}
