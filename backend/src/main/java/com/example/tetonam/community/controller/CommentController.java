package com.example.tetonam.community.controller;

import com.example.tetonam.community.domain.Comment;
import com.example.tetonam.community.domain.Community;
import com.example.tetonam.community.dto.CommentWriteDto;
import com.example.tetonam.community.dto.PostListDto;
import com.example.tetonam.community.dto.PostUpdateDto;
import com.example.tetonam.community.dto.PostWriteDto;
import com.example.tetonam.community.repository.CommunityRepository;
import com.example.tetonam.community.repository.CommentRepository;
import com.example.tetonam.community.service.CommentService;
import com.example.tetonam.community.service.CommunityService;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.repository.UserRepository;
import com.example.tetonam.user.token.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/community/{community_id}/comments")
public class CommentController {
    private final CommunityService communityService;
    private final CommentService commentService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final CommentRepository commentRepository;

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
    @Operation(summary = "댓글 작성 API", description = "작성한 댓글을 등록합니다")
    public ResponseEntity<Long> createComment(@RequestBody CommentWriteDto dto, @RequestHeader("Authorization") String token, @PathVariable Long community_id) {
        String jwt = token.substring(7);
        String email = jwtTokenProvider.getEmail(jwt);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 사용자"));
        Long commentId = commentService.writeComment(community_id, dto, user.getEmail());
        return ResponseEntity.ok(commentId);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "댓글 삭제 API", description = "등록된 댓글을 삭제합니다")
    public ResponseEntity<Void> deletePost(@PathVariable Long community_id, @PathVariable Long id, @RequestHeader("Authorization") String token){
        String jwt = token.substring(7);
        String email = jwtTokenProvider.getEmail(jwt);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 댓글"));
        if(email.equals(comment.getAuthor().getEmail())){
            commentService.deleteComment(id);
        }
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "댓글 수정 API", description = "등록된 댓글을 수정합니다")
    public ResponseEntity<CommentWriteDto> updatePost(@PathVariable Long community_id, @PathVariable Long id, @RequestBody CommentWriteDto updatedComment, @RequestHeader("Authorization") String token){
        String jwt = token.substring(7);
        String email = jwtTokenProvider.getEmail(jwt);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 댓글"));
        if(email.equals(comment.getAuthor().getEmail())){
            Comment updateComment = commentService.updateComment(id, updatedComment);
        }
        return ResponseEntity.ok(updatedComment);
    }

    @GetMapping
    @Operation(summary = "게시판 10개 단위 조회 API", description = "10개 단위로 커서를 활용하여 조회합니다")
    public ResponseEntity<List<Community>> getPosts(@RequestParam(required = false) Long lastId, @RequestParam(defaultValue = "10") int size){
        return ResponseEntity.ok(communityService.getPosts(lastId, size));
    }
}
