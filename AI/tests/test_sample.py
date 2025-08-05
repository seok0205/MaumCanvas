# AI/tests/test_health.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)  # FastAPI 앱 인스턴스 가져오기

def test_fastapi():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello FastAPI"}
