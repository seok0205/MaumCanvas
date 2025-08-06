import yaml
from pathlib import Path
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langgraph.graph import StateGraph, END
from .state import GraphState

# Load prompts from YAML file
PROMPT_DIR = Path(__file__).parent.parent.parent / "prompts"
with open(PROMPT_DIR / "htp_prompts.yaml", "r", encoding="utf-8") as file:
    prompts = yaml.safe_load(file)


# ---Graph Node definitions---
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


def hallucination_check_node(state: GraphState, llm):
    """5. 환각 검사
    생성된 답변이 검색된 문맥과 일치하는지 확인하는 노드
    state["retrieved_contexts"]와 state["generation"]을 사용
    환각이 발생하면 "yes", 발생하지 않으면 "no"로 할당
    """
    contexts = state["retrieved_contexts"]
    generation = state["generation"]
    prompt = ChatPromptTemplate.from_template(prompts["hallucination_check"])
    chain = prompt | llm | StrOutputParser()
    check_result = chain.invoke(
        {"context": "\n\n".join(contexts), "generation": generation}
    )

    state["hallucination_check"] = check_result.lower()
    return state


# ---Conditional Edges---
def decide_after_relevance_check(state: GraphState):
    """관계성 검사 후 분기 결정
    'yes'일 경우 질문 분해로, 'no'일 경우 END로 이동
    """
    if state["relevance_check"] == "yes":
        return "decompose_query"
    else:
        return END


def decide_after_hallucination_check(state: GraphState):
    """환각 검사 후 분기 결정
    'yes'일 경우 환각 존재 답변 재생성으로, 'no'일 경우 END로 이동
    """
    if state["hallucination_check"] == "yes":
        return "generate_answer"
    else:
        return END


# ---Graph Definition---
def create_graph(llm, retriever):
    """Graph 생성 함수
    각 노드와 엣지를 정의하여 StateGraph를 생성
    """
    workflow = StateGraph(GraphState)

    # add nodes
    workflow.add_node("relevance_check", lambda state: relevance_check_node(state, llm))
    workflow.add_node("decompose_query", lambda state: decompose_query_node(state, llm))
    workflow.add_node("retrieve", lambda state: retrieve_node(state, retriever))
    workflow.add_node("generate_answer", lambda state: generate_node(state, llm))
    workflow.add_node(
        "hallucination_check", lambda state: hallucination_check_node(state, llm)
    )

    # add edges
    workflow.set_entry_point("relevance_check")
    workflow.add_conditional_edges("relevance_check", decide_after_relevance_check)
    workflow.add_edge("decompose_query", "retrieve")
    workflow.add_edge("retrieve", "generate_answer")
    workflow.add_edge("generate_answer", "hallucination_check")
    workflow.add_conditional_edges(
        "hallucination_check",
        decide_after_hallucination_check,
        {"generate_answer": "generate_answer", END: END},
    )

    return workflow.compile()
