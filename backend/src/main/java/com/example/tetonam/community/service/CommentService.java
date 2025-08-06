package com.example.tetonam.community.service;

import com.example.tetonam.community.domain.Category;
import com.example.tetonam.community.domain.Comment;
import com.example.tetonam.community.domain.Community;
import com.example.tetonam.community.dto.CommentWriteDto;
import com.example.tetonam.community.dto.PostListDto;
import com.example.tetonam.community.dto.PostUpdateDto;
import com.example.tetonam.community.dto.PostWriteDto;
import com.example.tetonam.community.repository.CommentRepository;
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
public class CommentService {

    private final CommunityRepository communityRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    // 댓글 작성 api
    public Comment writeComment(Long community_id,CommentWriteDto dto, String email) {
        User author = userRepository.findByEmail(email)
                .orElseThrow(() -> new BoardHandler(ErrorStatus.USER_NOT_FOUND));
        Community community = communityRepository.findById(community_id)
                .orElseThrow(() -> new BoardHandler(ErrorStatus.POST_LIST_EMPTY));
        Comment comment = Comment.builder()
                .content(dto.getContent())
                .author(author)
                .community(community)
                .build();
        commentRepository.save(comment);
        return comment;
    }

    @Transactional
    public void deleteComment(Long id, String email){
        Comment comment = commentRepository.findById(id)
                        .orElseThrow(() -> new BoardHandler(ErrorStatus.COMMENT_LIST_EMPTY));
        User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new BoardHandler(ErrorStatus.USER_NOT_FOUND));
        if(!user.equals(comment.getAuthor())){
            throw new BoardHandler(ErrorStatus.USER_NOT_MATCH);
        }
        commentRepository.deleteById(id);
    }

    @Transactional
    public Comment updateComment(Long id, CommentWriteDto updateComment){
        Comment comment = commentRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("게시글이 존재하지 않습니다."));
        comment.setContent(updateComment.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public List<Community> getPosts(Long lastId, int size){
        if(lastId == null){
            lastId = Long.MAX_VALUE;
        }
        Pageable pageable = PageRequest.of(0, size);
        return communityRepository.findByIdLessThanOrderByIdDesc(lastId, pageable);
    }


}
