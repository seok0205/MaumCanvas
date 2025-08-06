import yaml
from pathlib import Path
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langgraph.graph import StateGraph, END
from state import GraphState

# Load prompts from YAML file
PROMPT_DIR = Path(__file__).parent.parent.parent / "prompts"
with open(PROMPT_DIR / "htp_prompts.yaml", "r", encoding="utf-8") as file:
    prompts = yaml.safe_load(file)


def relevance_check_node(state: GraphState, llm):
    """1. 질문 관령성 검사
    질문의 HTP 검사 관련성 여부를 확인하는 노드
    question이 관련이 있다면 yes, 없다면 no 로 할당
    no 일 때 state["generation"]에 "관찰 결과를 다시 입력해주세요." 할당
    """
    question = state["original_question"]
    prompt = ChatPromptTemplate.from_template(prompts["relevance_check"])
    chain = prompt | llm | StrOutputParser()
    relevance = chain.invoke({"question": question})

    state["relevance_check"] = relevance.lower()
    if state["relevance_check"] == "no":
        state["generation"] = "관찰 결과를 다시 입력해주세요."
    return state


def decompose_query_node(state: GraphState, llm):
    """2. 질문 분해
    질문을 여러 개의 하위 질문으로 분해하는 노드
    관련성 검사 통과 시 의미단위로 질문을 분해
    """
    question = state["original_question"]
    prompt = ChatPromptTemplate.from_template(prompts["decompose_query"])
    chain = prompt | llm | JsonOutputParser()
    decomposed = chain.invoke({"question": question})
    decomposed_questions = decomposed.get("queries", [])

    state["decomposed_questions"] = decomposed_questions
    return state


def retrieve_node(state: GraphState, retriever):
    """3. 문맥 검색
    분해된 질문으로 정보를 검색하는 노드
    List로 저장된 질문을 순회하며 각 질문에 대한 검색 결과를 저장
    """
    decomposed_questions = state["decomposed_questions"]
    all_retrieved_docs = []
    for query in decomposed_questions:
        retrieved_docs = retriever.invoke(query)
        doc_texts = [doc.page_content for doc in retrieved_docs]
        all_retrieved_docs.extend(doc_texts)
    # 중복 제거
    unique_contexts = list(set(all_retrieved_docs))
    state["retrieved_contexts"] = unique_contexts
    return state


def generate_node(state: GraphState, llm):
    """4. 답변 생성
    분해된 질문과 검색된 문맥을 바탕으로 최종 답변을 생성하는 노드
    state["retrieved_contexts"]에 저장된 문맥을 사용
    """
    question = state["original_question"]
    contexts = "\n\n".join(state["retrieved_contexts"])
    prompt = ChatPromptTemplate.from_template(prompts["generate_answer"])
    chain = prompt | llm | StrOutputParser()
    generation = chain.invoke({"question": question, "context": contexts})

    state["generation"] = generation
    return state
