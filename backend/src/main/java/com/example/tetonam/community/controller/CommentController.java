package com.example.tetonam.community.controller;

import com.example.tetonam.community.domain.Comment;
import com.example.tetonam.community.dto.CommentListDto;
import com.example.tetonam.community.dto.CommentWriteDto;
import com.example.tetonam.community.repository.CommentRepository;
import com.example.tetonam.community.service.CommentService;
import com.example.tetonam.community.service.CommunityService;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.token.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/community/{community_id}/comments")
public class CommentController {
    private final CommentService commentService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    @Operation(summary = "게시글 내 댓글 전체 조회", description = "정해진 한건의 게시글의 댓글을 전부 가져옵니다")
    public ResponseEntity<?> getComments(@PathVariable Long community_id) {
        List<CommentListDto> result = commentService.getComments(community_id);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    //글 작성
    @PostMapping
    @Operation(summary = "댓글 작성 API", description = "작성한 댓글을 등록합니다")
    public ResponseEntity<?> createComment(@RequestBody CommentWriteDto dto, @RequestHeader("Authorization") String token, @PathVariable Long community_id) {
        String jwt = token.substring(7);
        String email = jwtTokenProvider.getEmail(jwt);
        Comment comment = commentService.writeComment(community_id, dto, email);
        return ResponseEntity.ok(ApiResponse.onSuccess(CommentWriteDto.toDto(comment)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "댓글 삭제 API", description = "등록된 댓글을 삭제합니다")
    public ResponseEntity<Void> deletePost(@PathVariable Long community_id, @PathVariable Long id, @RequestHeader("Authorization") String token){
        String jwt = token.substring(7);
        String email = jwtTokenProvider.getEmail(jwt);
        commentService.deleteComment(id, email);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "댓글 수정 API", description = "등록된 댓글을 수정합니다")
    public ResponseEntity<CommentWriteDto> updatePost(@PathVariable Long community_id, @PathVariable Long id, @RequestBody CommentWriteDto updatedComment, @RequestHeader("Authorization") String token){
        String jwt = token.substring(7);
        String email = jwtTokenProvider.getEmail(jwt);
            Comment comment = commentService.updateComment(id, community_id, email, updatedComment);
        return ResponseEntity.ok(CommentWriteDto.toDto(comment));
    }

}
