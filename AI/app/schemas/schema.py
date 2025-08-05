from pydantic import BaseModel

# 분석 요청
class AnalysisRequest(BaseModel):
    '''
    question : 상담사가 분석을 요청할 쿼리
    category : 해당 그림의 카테고리 ( 메타데이터 검색용 )
    '''
    question: str
    category: str

class AnalysisResponse(BaseModel):
    '''
    answer : 분석 결과
    '''
    answer: str

