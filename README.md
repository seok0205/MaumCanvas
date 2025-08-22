# Maum Canvas

## 1. 서비스 소개

![Maum Canvas](./docs/image/maum.png)

- 정신 건강 관리에 도움을 줄 수 있는 다양한 상담 기법과 방법들을 활용할 수 있는 웹 서비스 구축
- 다양한 심리 문진을 포함하여 문진의 한계점인 심리적 압박감에 대한 한계를 해소할 수 있는 그림 검사까지 도입하여 심리 건강 관리에 도움을 주고자 함
- 높은 접근성을 가진 온라인 문진 및 상담 웹 서비스로 현재 정신 건강 서비스의 한계점 극복

## 2. 팀 소개

- Tetonam

|팀원|담당|주요 업무|
|---|---|---|
|유정석|INFRA|CI/CD|
|전재욱|BE|API 개발|
|김현서|BE,AI|API 개발, PPT, AI 모델|
|노혜성|FE|FE 개발|
|박진호|FE, AI|FE 개발, AI 모델|

## 3. 기술 스택

- **Backend** :  
  ![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=openjdk&logoColor=white)
  ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
  ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
    

- **FrontEnd** :  
  ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
  ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

- **DB** :  
  ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
  ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
  
- **AI** :  
  ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
  ![YOLOv5](https://img.shields.io/badge/YOLOv5-00FFFF?style=for-the-badge&logo=opencv&logoColor=black)
  ![LangGraph](https://img.shields.io/badge/LangGraph-1D3D3C?style=for-the-badge&logo=langgraph&logoColor=white)
  ![LangChain](https://img.shields.io/badge/LangChain-1D3D3C?style=for-the-badge&logo=langchain&logoColor=white)

- **INFRA** :  
  ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
  ![AWS EC2](https://img.shields.io/badge/AWS%20EC2-FF9900?style=for-the-badge&logo=amazon-ec2&logoColor=white)
  ![Gerrit](https://img.shields.io/badge/Gerrit-EEEEEE?style=for-the-badge&logo=gerrit&logoColor=black)
  ![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
  ![SonarQube](https://img.shields.io/badge/SonarQube-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white)
  ![Certbot](https://img.shields.io/badge/Certbot-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white)

## 4. 주요 기능

1. **그림 검사**
   - 객체 탐지부터 RAG-LLM을 활용한 AI 활용으로 상담사와 피상담자 모두 신뢰도 높고 효율성 좋은 검사 과정 제공
2. **WebRTC 통한 온라인 상담**
   - 이전 검사 및 상담 내역을 상담사가 확인할 수 있도록 하여 피상담자의 특징을 활용하 상담 가능
3. **예약 및 상담 내역**
   - 이전 검사 및 상담 내역, 예약 상담 내역 모두 제공하여 지속적인 상담 및 심리 건강 관리에 도움
4. **커뮤니티**
   - 권한 구분하여 또래들부터 상담사와의 커뮤니티까지 다양한 분류의 커뮤니티 제공

## 5. 배포 특이사항

### porting manual

[실행 및 배포하러가기!](./exec/porting_manual.md)

## 6. ERD

![ERD](./docs/E108_마음캔버스ERD.png)

## 7. CI/CD

[CI/CD 구성](./docs/CICD_산출물.pdf)  
![CI/CD 구성도](./docs/image/Maum%20Canvas.png)

## 8. API 명세서

[API 및 기능 명세](./docs/E108_마음%20캔버스%20API%20명세서.pdf)

## 9. AI 관련 문서(HTP)

[AI RAG Pipeline 구축](./docs/HTP%20검사%20해석%20RAG%20pipeline구축.pdf)  
[AI RAG 최종 평가](./docs/HTP%20검사%20해석%20RAG%20최종%20평가.pdf)

## 10. 미리보기

![온보딩페이지](./docs/image/onboarding.png)  
![메인페이지](./docs/image/counselor.png)  
![그림진단1](./docs/image/art.png)  
![그림진단2](./docs/image/art_2.png)  
![상담예약](./docs/image/reserve.png)  
![온라인상담](./docs/image/webrtc.png)  
![커뮤니티](./docs/image/community.png)  
