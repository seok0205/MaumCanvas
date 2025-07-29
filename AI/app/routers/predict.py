from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from app.core.yolo_predict import run_inference
import numpy as np
import cv2
import io

router = APIRouter(prefix="/predict", tags=["Prediction"])

# 미리 로드된 전역 모델 및 클래스
from app.core.model_loader import model, class_names
from app.utils.s3imageLoader import s3imageLoader

#이미지 s3로 받을 때
@router.post("/json")
async def predict_json_s3(url):
    img_np = s3imageLoader(url)
    _, results = run_inference(img_np, model, class_names, visualize=False)
    return {"num_detections": len(results), "detections": results}

###########################################################################

#이미지 업로드로 받을 때
@router.post("/json")
async def predict_json(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img_np = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    _, results = run_inference(img_np, model, class_names, visualize=False)
    return {"num_detections": len(results), "detections": results}

@router.post("/image")
async def predict_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img_np = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    img_result, _ = run_inference(img_np, model, class_names, visualize=True)

    _, img_encoded = cv2.imencode('.jpg', img_result)
    return StreamingResponse(io.BytesIO(img_encoded.tobytes()), media_type="image/jpeg")
