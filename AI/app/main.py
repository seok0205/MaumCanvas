from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.routers import example, predict, returnLLM
from app.rag.components import get_llm, get_embeddings, get_retriever
from app.rag.graph import create_graph

@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 실행 시 LLM, 임베딩, 검색기 초기화"""
    llm = get_llm()
    embeddings = get_embeddings()
    retriever = get_retriever(embeddings)
    rag_graph = create_graph(llm, retriever)
    
    app.state.rag_graph = rag_graph
    yield

    # 서버 종료 시 리소스 정리
    app.state.rag_graph = None

app = FastAPI(lifespan=lifespan)

app.include_router(example.router)
app.include_router(predict.router)
app.include_router(returnLLM.router)