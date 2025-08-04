from fastapi import FastAPI
from app.routers import example, predict, returnLLM

app = FastAPI()

app.include_router(example.router)
app.include_router(predict.router)
app.include_router(returnLLM.router)