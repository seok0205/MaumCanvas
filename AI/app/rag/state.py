from typing import List, TypedDict

class GraphState(TypedDict):
    """
    Graph RAG 파이프라인의 상태

    Attributes:
        original_question (str): 사용자가 입력한 원본 질문 (그림 묘사)
        decomposed_questions (List[str]): 의미 단위로 분해된 질문 리스트
        retrieved_contexts (List[str]): 검색된 관련 문서(해석) 조각 리스트
        generation (str): LLM이 생성한 최종 해석
        relevance_check (str): 질문의 HTP 검사 관련성 여부 ("yes" or "no")
        hallucination_check (str): 생성된 답변의 환각 현상 유무 ("yes" or "no")
        category (str): 해당 그림의 카테고리 (메타데이터 검색용)
    """
    original_question: str
    decomposed_questions: List[str]
    retrieved_contexts: List[str]
    generation: str
    relevance_check: str
    hallucination_check: str
    category: str