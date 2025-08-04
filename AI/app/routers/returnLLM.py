from fastapi import APIRouter

router = APIRouter(prefix="/llm", tags=["llm"])

@router.post("/llm")
async def return_LLM(text):
    if text:
        return "연결 성공"
    else :
        return "연결 실패"