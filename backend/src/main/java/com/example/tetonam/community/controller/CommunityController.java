package com.example.tetonam.community.controller;

import com.example.tetonam.community.dto.PostListDto;
import com.example.tetonam.community.dto.PostWriteDto;
import com.example.tetonam.community.service.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/community")
public class CommunityController {
    private final CommunityService communityService;

//    @GetMapping
//    public ResponseEntity<List<PostListDto>> getAllPosts() {
//        List<PostListDto> posts = communityService.getAllPosts();
//        return ResponseEntity.ok(posts);
//    } 얜 보류

    /**
     * 게시글 단건 조회
     * GET /community/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "게시글 단건 조회", description = "정해진 한건의 게시글을 가져옵니다")
    public ResponseEntity<PostListDto> getPost(@PathVariable Long id) {
        PostListDto post = communityService.getPostById(id);
        return ResponseEntity.ok(post);
    }

    //글 작성
    @PostMapping
    @Operation(summary = "글 작성 API", description = "작성한 글을 등록합니다")
    public ResponseEntity<Long> createPost(@RequestBody PostWriteDto dto) {
        Long postId = communityService.writePost(dto);
        return ResponseEntity.ok(postId);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "글 삭제 API", description = "등록된 글을 삭제합니다")
    public ResponseEntity<Void> deletePost(@PathVariable Long id){
        communityService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
