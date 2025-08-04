package com.example.tetonam.image.service;

import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.image.domain.Drawing;
import com.example.tetonam.image.domain.DrawingList;
import com.example.tetonam.image.repository.DrawingListRepository;
import com.example.tetonam.image.repository.DrawingRepository;
import com.example.tetonam.image.service.enums.DrawingCategory;
import com.example.tetonam.response.code.status.ErrorStatus;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DrawingService {
    private final UserRepository userRepository;
    private final AwsS3Service awsS3Service;
    private final DrawingRepository drawingRepository;
    private final DrawingListRepository drawingListRepository;

    public String createDrawing(String email, List<MultipartFile> multipartFile) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        List<String> fileNameList = awsS3Service.uploadFile(multipartFile, user.getEmail());
        DrawingList drawingList=drawingListRepository.save(DrawingList.builder()
                .user(user).build());


        for(int i=0;i<4;i++){
            drawingRepository.save(Drawing.builder()
                            .imageUrl(fileNameList.get(i))
                            .drawingList(drawingList)
                            .drawingCategory(DrawingCategory.values()[i])
                    .build());
        }


        return "그림이 저장되었습니다";
    }
}
