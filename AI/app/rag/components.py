import os
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
from app.core.config import settings

def get_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",
        openai_api_key=settings.OPENAI_API_KEY,
        openai_api_base=settings.OPENAI_API_BASE,
    )

def get_embeddings():
    return OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=settings.OPENAI_API_KEY,
        openai_api_base=settings.OPENAI_API_BASE,
    )

def get_retriever(embeddings, k=3, weights=[0.3, 0.7]):
    if not os.path.exists("faiss_store"):
        raise FileNotFoundError("FAISS vector store not found. Please create it first.")

    faiss_store = FAISS.load_local(
        "faiss_store", embeddings=embeddings, allow_dangerous_deserialization=True
    )
    all_texts = [doc.page_content for doc in faiss_store.docstore._dict.values()]

    # Sparse Retriever (BM25)
    sparse_retriever = BM25Retriever.from_texts(texts=all_texts)
    sparse_retriever.k = k

    # Dense Retriever (FAISS)
    dense_retriever = faiss_store.as_retriever(search_type="similarity", search_kwargs={"k": k})

    # Ensemble Retriever
    ensemble_retriever = EnsembleRetriever(
        retrievers=[sparse_retriever, dense_retriever], weights=weights
    )
    return ensemble_retriever