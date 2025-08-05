package com.example.tetonam.community.service;

import com.example.tetonam.community.dto.PostListDto;
import com.example.tetonam.community.domain.Category;
import com.example.tetonam.community.domain.Community;
import com.example.tetonam.community.dto.PostWriteDto;
import com.example.tetonam.community.repository.CommunityRepository;
import com.example.tetonam.exception.handler.BoardHandler;
import com.example.tetonam.response.code.status.ErrorStatus;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = false)     // 조회 전용(readOnly 최적화)
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;

    /**
     * 게시글 목록 조회
     * - 정렬 조건: latest, popular
     * - 카테고리 필터링 가능
     */
    public List<PostListDto> getAllPosts(String sort, Category category) {
        List<Community> posts;

        if (category != null) {
            posts = "popular".equalsIgnoreCase(sort)        // 문자 비교하여 popular이면
                    ? communityRepository.findByCategoryOrderByViewCountDesc(category)
                    : communityRepository.findByCategoryOrderByCreatedAtDesc(category);
        } else {
            posts = "popular".equalsIgnoreCase(sort)
                    ? communityRepository.findAllByOrderByViewCountDesc()
                    : communityRepository.findAllByOrderByCreatedAtDesc();
        }

        // 게시글 아무것도 없으면 예외 발생
        if (posts.isEmpty()) {
            log.info("[getAllPosts] 조회된 게시글이 없습니다. (정렬: {}, 카테고리: {})", sort, category);
            throw new BoardHandler(ErrorStatus.POST_LIST_EMPTY);
        }

        log.info("[getAllPosts] 게시글 {}건 조회됨 (정렬: {}, 카테고리: {})", posts.size(), sort, category);
        return posts.stream()
                .map(PostListDto::from)
                .collect(Collectors.toList());
    }
    // PostId로 게시글 정보 다 가져오기(게시글 상세 조회)
    public PostListDto getPostById(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new BoardHandler(ErrorStatus.POST_LIST_EMPTY));
        return PostListDto.from(community);
    }


    // 글 작성 api
    public Long writePost(PostWriteDto dto, String email) {
        User author = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("일치하는 정보가 없습니다"));
        Community community = Community.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .author(author)
                .category(dto.getCategory())
                .build();
        communityRepository.save(community);
        return community.getId();
    }

    @Transactional
    public void deletePost(Long id){
        if (!communityRepository.existsById(id)){
            throw new IllegalArgumentException("게시글이 존재하지 않습니다");
        }
        communityRepository.deleteById(id);
    }

    @Transactional
    public Community updatePost(Long id, Community updateCommunity){
        Community community = communityRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("게시글이 존재하지 않습니다."));
        community.setTitle(updateCommunity.getTitle());
        community.setContent(updateCommunity.getContent());
        community.setUpdatedAt(updateCommunity.getCreatedAt());
        return communityRepository.save(community);
    }

    public List<Community> getPosts(Long lastId, int size){
        if(lastId == null){
            lastId = Long.MAX_VALUE;
        }
        Pageable pageable = PageRequest.of(0, size);
        return communityRepository.findByIdLessThanOrderByIdDesc(lastId, pageable);
    }
}
