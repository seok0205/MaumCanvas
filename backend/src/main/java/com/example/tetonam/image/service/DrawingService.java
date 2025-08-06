package com.example.tetonam.image.service;

import com.example.tetonam.counseling.domain.CounselingImage;
import com.example.tetonam.counseling.repository.CounselingImageRepository;
import com.example.tetonam.exception.handler.CounselingHandler;
import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.image.domain.Drawing;
import com.example.tetonam.image.domain.DrawingList;
import com.example.tetonam.image.domain.DrawingResult;
import com.example.tetonam.image.dto.RecentDrawingResponseDto;
import com.example.tetonam.image.dto.testDto;
import com.example.tetonam.image.repository.DrawingListRepository;
import com.example.tetonam.image.repository.DrawingRepository;
import com.example.tetonam.image.repository.DrawingResultRepository;
import com.example.tetonam.image.service.enums.DrawingCategory;
import com.example.tetonam.response.code.status.ErrorStatus;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.repository.UserRepository;
import com.example.tetonam.util.WebClientUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final WebClientUtil webClientUtil;
    private final DrawingResultRepository drawingResultRepository;
    @Value("${ai.server.url}")
    private String AI_SERVER_URL;

    private final CounselingImageRepository counselingImageRepository;
    @Transactional
    public String createDrawing(String email, List<MultipartFile> multipartFile) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        List<String> fileNameList = awsS3Service.uploadFile(multipartFile, user.getEmail());
        DrawingList drawingList=drawingListRepository.save(DrawingList.builder()
                .user(user).build());


        for(int i=0;i<4;i++){
            Drawing drawing =Drawing.builder()
                    .imageUrl(fileNameList.get(i))
                    .drawingList(drawingList)
                    .drawingCategory(DrawingCategory.values()[i])
                    .build();
            drawingRepository.save(drawing);
            drawingResult(drawing);
        }

        return "그림이 저장되었습니다";
    }

    public void drawingResult(Drawing drawing){
        String imageUrl=drawing.getImageUrl();
//        String category="house";
        String category=drawing.getDrawingCategory().toString();
        String url = AI_SERVER_URL+"/predict/json_s3?url=" + imageUrl + "&category=" + category;

        System.out.println(url);
        webClientUtil.post(url, "", String.class)
                .subscribe(result -> {
                    drawingResultRepository.save(DrawingResult.builder()
                                    .drawing(drawing)
                                    .drawingResult(result)
                            .build());
                }, error -> {
                    error.printStackTrace();
                });
    }

    // 최근그림 반환
    public List<RecentDrawingResponseDto> showRecentImages(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        DrawingList drawingList=drawingListRepository.findLatestByUser(user)
                .orElseThrow(()-> new CounselingHandler(ErrorStatus.STUDENT_HAVE_NOT_IMAGE));
        return drawingList.getDrawings().stream().map(RecentDrawingResponseDto::toDto).toList();
    }

    public List<RecentDrawingResponseDto> showCounselingImage(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        CounselingImage counselingImage=counselingImageRepository.findByCounselingId(id);
        if(!counselingImage.getCounseling().getStudent().equals(user)&&!counselingImage.getCounseling().getCounselor().equals(user)){
            throw new CounselingHandler(ErrorStatus.COUNSELING_IS_NOT_AUTHORITY);
        }
        return counselingImage.getDrawingList().getDrawings().stream().map(RecentDrawingResponseDto::toDto).toList();
    }


//    public void drawingRagResult(String question,String category){
//        String imageUrl=drawing.getImageUrl();
////        String category="house";
//        String category=drawing.getDrawingCategory().toString();
//        String url = AI_SERVER_URL+"/predict/json_s3?url=" + imageUrl + "&category=" + category;
//
//        System.out.println(url);
//        webClientUtil.post(url, "", String.class)
//                .subscribe(result -> {
//                    drawingResultRepository.save(DrawingResult.builder()
//                            .drawing(drawing)
//                            .drawingResult(result)
//                            .build());
//                }, error -> {
//                    error.printStackTrace();
//                });
//    }



}
