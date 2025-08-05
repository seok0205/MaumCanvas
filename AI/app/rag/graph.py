import yaml
from pathlib import Path
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langgraph.graph import StateGraph, END
from state import GraphState

PROMPT_DIR = Path(__file__).parent.parent.parent / "prompts"
with open(PROMPT_DIR / "htp_prompts.yaml", "r", encoding="utf-8") as file:
    prompts = yaml.safe_load(file)

def relevance_check_node(state: GraphState, llm):
    '''
    질문의 HTP 검사 관련성 여부를 확인하는 노드
    question이 관련이 있다면 yes, 없다면 no 로 할당
    no 일 때 state["generation"]에 "관찰 결과를 다시 입력해주세요." 할당
    '''
    print("--- 1. 질문 관련성 검사 시작 ---")
    question = state["original_question"]
    prompt = ChatPromptTemplate.from_template(prompts["relevance_check"])
    chain = prompt | llm | StrOutputParser()
    relevance = chain.invoke({"question": question})
    
    print(f"질문 관련성: {relevance}")
    state["relevance_check"] = relevance.lower()
    if state["relevance_check"] == "no":
        state["generation"] = "관찰 결과를 다시 입력해주세요."
    return state