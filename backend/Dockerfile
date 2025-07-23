# backend/Dockerfile
FROM openjdk:17-jdk-slim

# JAR 파일 이름 지정 (빌드된 JAR 파일 경로)
ARG JAR_FILE=build/libs/*.jar

# JAR 복사
COPY ${JAR_FILE} app.jar

# 실행 명령
ENTRYPOINT ["java", "-jar", "/app.jar"]
