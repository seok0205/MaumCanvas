from fastapi import APIRouter, Request
from app.schemas.schema import AnalysisResponse, AnalysisRequest
from app.rag.state import GraphState

router = APIRouter(prefix="/llm", tags=["llm"])


@router.post("/llm")
async def return_LLM(request_body: AnalysisRequest, request: Request):
    """
    LLM을 호출하여 분석 요청에 대한 응답을 반환합니다.
    """
    rag_graph = request.app.state.rag_graph

    inputs = GraphState(
        question=request_body.question,
        category=request_body.category,
    )

    final_state = rag_graph.invoke(inputs, {"recursion_limit": 15})

    return AnalysisResponse(
        answer=final_state.get("generation", "해석을 생성하지 못했습니다."),
    )
