package com.example.tetonam.community.controller;

import com.example.tetonam.community.domain.Community;
import com.example.tetonam.community.dto.PostListDto;
import com.example.tetonam.community.dto.PostPageDto;
import com.example.tetonam.community.dto.PostUpdateDto;
import com.example.tetonam.community.dto.PostWriteDto;
import com.example.tetonam.community.service.CommunityService;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.token.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/community")
public class CommunityController {
    private final CommunityService communityService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 게시글 단건 조회
     * GET /community/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "게시글 단건 조회", description = "정해진 한건의 게시글을 가져옵니다")
    public ResponseEntity<?> getPost(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String email = jwtTokenProvider.getEmail(jwt);
        PostListDto post = communityService.getPostById(id, email);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(post));
    }

    //글 작성
    @PostMapping
    @Operation(summary = "글 작성 API", description = "작성한 글을 등록합니다")
    public ResponseEntity<?> createPost(@RequestBody PostWriteDto dto, @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String email = jwtTokenProvider.getEmail(jwt);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(communityService.writePost(dto, email)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "글 삭제 API", description = "등록된 글을 삭제합니다")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @RequestHeader("Authorization") String token){
        String jwt = token.substring(7);
        String email = jwtTokenProvider.getEmail(jwt);
        communityService.deletePost(id, email);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "글 수정 API", description = "등록된 글을 수정합니다")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody PostUpdateDto updatedCommunity, @RequestHeader("Authorization") String token){
        String jwt = token.substring(7);
        String email = jwtTokenProvider.getEmail(jwt);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(communityService.updatePost(id, updatedCommunity, email)));
    }


    @GetMapping("/page/{number}")
    @Operation(summary = "페이지별 조회", description = "10개 단위 조회로 작성")
    public ResponseEntity<?> getPostPage(@PathVariable int number){
        return ResponseEntity.ok(communityService.getPostPage(number, 10));
    }
    @GetMapping("/page/{number}/search")
    @Operation(summary = "아이디로 게시글 검색", description = "아이디로 게시글을 검색합니다.")
    public ResponseEntity<?> getPostPageById(@PathVariable int number, @RequestParam String nickname){
        return ResponseEntity.ok(communityService.getPostPageById(number, 10, nickname));
    }
}
