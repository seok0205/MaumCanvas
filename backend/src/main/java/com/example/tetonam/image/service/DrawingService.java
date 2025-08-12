package com.example.tetonam.image.service;

import com.example.tetonam.counseling.domain.CounselingImage;
import com.example.tetonam.counseling.repository.CounselingImageRepository;
import com.example.tetonam.exception.handler.CounselingHandler;
import com.example.tetonam.exception.handler.DrawingHandler;
import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.image.domain.Drawing;
import com.example.tetonam.image.domain.DrawingList;
import com.example.tetonam.image.domain.DrawingRagResult;
import com.example.tetonam.image.domain.DrawingResult;
import com.example.tetonam.image.dto.CounselingRagRequestDto;
import com.example.tetonam.image.dto.LLMRequestDto;
import com.example.tetonam.image.dto.RecentDrawingResponseDto;
import com.example.tetonam.image.repository.DrawingListRepository;
import com.example.tetonam.image.repository.DrawingRagResultRepository;
import com.example.tetonam.image.repository.DrawingRepository;
import com.example.tetonam.image.repository.DrawingResultRepository;
import com.example.tetonam.image.service.enums.DrawingCategory;
import com.example.tetonam.kakao.service.KakaoService;
import com.example.tetonam.response.code.status.ErrorStatus;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.domain.enums.Role;
import com.example.tetonam.user.repository.UserRepository;
import com.example.tetonam.util.WebClientUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DrawingService {
    private final UserRepository userRepository;
    private final AwsS3Service awsS3Service;
    private final DrawingRepository drawingRepository;
    private final DrawingListRepository drawingListRepository;
    private final WebClientUtil webClientUtil;
    private final DrawingResultRepository drawingResultRepository;
    private final DrawingRagResultRepository drawingRagResultRepository;
    @Value("${ai.server.url}")
    private String AI_SERVER_URL;
    private final KakaoService kakaoService;

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
        DrawingList drawingList=drawingListRepository.findFirstByUserOrderByCreatedDateDesc(user)
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


    //rag로 통신
    public void drawingRagResult(Drawing drawing, String question, String category){

        String url = AI_SERVER_URL+"/llm";

        LLMRequestDto llmRequestDto=LLMRequestDto.toDto(question,category);
        webClientUtil.post(url, llmRequestDto, String.class)
                .subscribe(result -> {
                    drawingRagResultRepository.save(DrawingRagResult.builder()
                                    .drawing(drawing)
                                    .drawingRagResult(result)
                            .build());

//                    kakaoService.sendMessage("AI 결과가 도착했습니다",category+"그림의 결과가 저장되었습니다. 확인해주세요","https://i13e108.p.ssafy.io/counseling/image/"+drawing.getId(),drawing.getImageUrl());
                }, error -> {
                    log.error("RAG 저장 중 에러 발생", error);
                });
    }


    public String counselingRagSave(String email, Long id, CounselingRagRequestDto counselingRagRequestDto) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        Drawing drawing=drawingRepository.findById(id)
                .orElseThrow(()-> new DrawingHandler(ErrorStatus.DRAWING_NOT_FOUND));

        // 이미 생성되어있을 때
        if(drawing.getDrawingRagResult()!=null){
            throw new DrawingHandler(ErrorStatus.ALREADY_RAG);
        }
        // 여기 예외처리 해줘야할듯 이미 생성됐을시

        drawingRagResult(drawing,counselingRagRequestDto.getComment(),drawing.getDrawingCategory().toString());
        return "저장되었습니다.";
    }

    public String showCounselingRag(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));

       DrawingRagResult drawingRagResult=drawingRagResultRepository.findByDrawing(id)
                .orElseThrow(()->new DrawingHandler(ErrorStatus.NOT_FOUND_RAG));

        if (!user.hasRole(user, Role.COUNSELOR)&&drawingRagResult.getDrawing().getDrawingList().getUser()!=user){
            throw new DrawingHandler(ErrorStatus.DRAWING_NOT_VALID);
        }


        return drawingRagResult.getDrawingRagResult();
    }

    public String objectDetectionImage(String email, Long id) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        DrawingResult drawingResult=drawingResultRepository.findByDrawing(id)
                .orElseThrow(() -> new DrawingHandler(ErrorStatus.NOT_FOUND_OBJECT));
        return drawingResult.getDrawingResult();
    }

}
