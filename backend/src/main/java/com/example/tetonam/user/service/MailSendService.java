package com.example.tetonam.user.service;

import com.example.tetonam.exception.handler.MailHandler;
import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.response.code.status.ErrorStatus;
import com.example.tetonam.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor

public class MailSendService {
    private final JavaMailSender mailSender;
    private String authNumber;
    private final RedisTemplate redisTemplate;
    private final UserRepository userRepository;

    /**
     * 인증번호 만들기
     */
    //임의의 6자리 양수를 반환합니다.
    public void makeRandomNumber() {
        Random r = new Random();
        String randomNumber = "";
        for (int i = 0; i < 6; i++) {
            randomNumber += Integer.toString(r.nextInt(10));
        }
        authNumber = randomNumber;
    }

    /**
     * 이메일 형식
     * @param email
     * @return
     */
    //mail을 어디서 보내는지, 어디로 보내는지 , 인증 번호를 html 형식으로 어떻게 보내는지 작성합니다.
    @Async
    public void joinEmail(String email) {
        makeRandomNumber();
        String setFrom = "jj99526@naver.com";
        String toMail = email;
        String title = "🌼 회원가입 인증 메일 – 마음 캔버스";

        String content =
                "<!DOCTYPE html>" +
                        "<html lang='ko'><head><meta charset='UTF-8'>" +
                        "<meta name='viewport' content='width=device-width, initial-scale=1.0'></head>" +
                        "<body style='margin:0;padding:0;background:#fff8e6;'>"+
                        "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='background:#fff8e6;'>"+
                        "<tr><td align='center' style='padding:24px;'>"+
                        "<table role='presentation' width='560' cellspacing='0' cellpadding='0' border='0' style='max-width:560px;background:#ffffff;border-radius:14px;box-shadow:0 6px 24px rgba(0,0,0,0.08);overflow:hidden;font-family:Segoe UI,Apple SD Gothic Neo,Apple Color Emoji,Arial,sans-serif;'>"+
                        // 헤더
                        "<tr><td style='padding:28px 24px;background:linear-gradient(135deg,#FFE082,#FFCC80,#FFAB91);color:#4a2b00;text-align:center;'>"+
                        "<div style='font-size:20px;font-weight:700;letter-spacing:.3px'>마음 캔버스 방문을 환영합니다 ✨</div>"+
                        "<div style='font-size:13px;opacity:.9;margin-top:6px'>아래 인증번호를 3분 이내에 입력해 주세요</div>"+
                        "</td></tr>"+
                        // 본문
                        "<tr><td style='padding:28px 28px 10px 28px;color:#333333;'>"+
                        "<div style='font-size:15px;line-height:1.6;'>안녕하세요!<br>회원가입을 계속하려면 아래의 인증번호를 입력해 주세요.</div>"+
                        "</td></tr>"+
                        // 코드 카드
                        "<tr><td align='center' style='padding:6px 28px 22px 28px;'>"+
                        "<div style='display:inline-block;background:#fff3cd;border:2px dashed #ffb300;color:#7a4b00;font-weight:800;font-size:28px;letter-spacing:4px;padding:14px 22px;border-radius:12px;'>"
                        + authNumber +
                        "</div>"+
                        "<div style='font-size:12px;color:#a06b00;margin-top:10px'>유효시간: 3분</div>"+
                        "</td></tr>"+
                        // 안내
                        "<tr><td style='padding:0 28px 22px 28px;color:#555555;'>"+
                        "<div style='font-size:13px;line-height:1.6;'>본 메일을 요청하지 않으셨다면 안전하게 무시하셔도 됩니다.<br>더 나은 보안을 위해 인증번호는 타인과 공유하지 마세요.</div>"+
                        "</td></tr>"+
                        // 푸터
                        "<tr><td style='padding:14px 18px 24px 18px;text-align:center;background:#fffaf0;color:#8a6d3b;font-size:11px;'>"+
                        "© "+ java.time.LocalDate.now() +" 마음 캔버스 · 본 메일은 발신전용입니다"+
                        "</td></tr>"+
                        "</table>"+
                        "</td></tr>"+
                        "</table>"+
                        "</body></html>";

        mailSend(setFrom, toMail, title, content);
        redisTemplate.opsForValue().set("MAIL:" + authNumber, toMail, 3, java.util.concurrent.TimeUnit.MINUTES);
    }




    /**
     * 메일 확인
     *
     * @param email
     * @param authNum
     * @return
     */
    public String CheckAuthNum(String email, String authNum) {
        String code = (String) redisTemplate.opsForValue().get("MAIL:" + authNum);
        if (code == null) {
            throw new MailHandler(ErrorStatus.MAIL_NUMBER_IS_NOT_MATCH);
        } else if (code.equals(email)) {
            String uuid=UUID.randomUUID().toString();
            // 5분안에 안할시 세션종료
            redisTemplate.opsForValue().set("UUID:" + uuid, email, 5, TimeUnit.MINUTES);
            redisTemplate.delete("MAIL:" + authNum);

            return uuid;

        } else {
            throw new MailHandler(ErrorStatus.MAIL_NUMBER_IS_NOT_MATCH);
        }
    }

    /**
     * 이메일 전송
     * @param setFrom
     * @param toMail
     * @param title
     * @param content
     */
    public void mailSend(String setFrom, String toMail, String title, String content) {
        MimeMessage message = mailSender.createMimeMessage();//JavaMailSender 객체를 사용하여 MimeMessage 객체를 생성
        try {

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");//이메일 메시지와 관련된 설정을 수행합니다.
            // true를 전달하여 multipart 형식의 메시지를 지원하고, "utf-8"을 전달하여 문자 인코딩을 설정
            helper.setFrom(setFrom);//이메일의 발신자 주소 설정
            helper.setTo(toMail);//이메일의 수신자 주소 설정
            helper.setSubject(title);//이메일의 제목을 설정
            helper.setText(content, true);//이메일의 내용 설정 두 번째 매개 변수에 true를 설정하여 html 설정으로한다.
            mailSender.send(message);

        } catch (MessagingException e) {//이메일 서버에 연결할 수 없거나, 잘못된 이메일 주소를 사용하거나, 인증 오류가 발생하는 등 오류
            throw new MailHandler(ErrorStatus.MAIL_SEND_ERROR);
        }
    }

    public String mailSendForPassword(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(()->new UserHandler(ErrorStatus.USER_NOT_FOUND));
        joinEmail(email);
        return "메일이 전송되었습니다";
    }
}