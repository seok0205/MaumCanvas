from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import JSONResponse, StreamingResponse
from app.core.yolo_predict import run_inference
from app.utils.filtering import nms_filter
from app.utils.calcSize import calc
from app.utils.toString import toString
import numpy as np
import cv2
import io

router = APIRouter(prefix="/predict", tags=["Prediction"])

# 미리 로드된 전역 모델 및 클래스
from app.core.model_loader import personModel, treeModel, houseModel, class_names_house, class_names_person, class_names_tree
from app.utils.s3imageLoader import s3imageLoader
#모든 카테고리는 person, tree, house로 고정입니다



#이미지 s3로 받을 때
@router.post("/json_s3")
async def predict_json_s3(url, category):
    if category in ("PERSON1", "PERSON2"):
        model = personModel
        class_names = class_names_person
    elif category == "TREE":
        model = treeModel
        class_names = class_names_tree
    else:
        model = houseModel
        class_names = class_names_house

    img_np = s3imageLoader(url)
    orig_height, orig_width = img_np.shape[:2]

    _, results = run_inference(img_np, model, class_names, visualize=False)
    # 일단 필터 빼
    # filtered_result = nms_filter(results)
    calc_result = calc(results, orig_width, orig_height)
    stringVal = toString(calc_result, category)
    return stringVal

###########################################################################

#이미지 업로드로 받을 때
@router.post("/json")
async def predict_json(file: UploadFile = File(...), category: str = Form(...)):
    if category == "PERSON1" or "PERSON2":
        model = personModel
        class_names = class_names_person
    elif category == "TREE":
        model = treeModel
        class_names = class_names_tree
    else:
        model = houseModel
        class_names = class_names_house
    image_bytes = await file.read()
    img_np = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    _, results = run_inference(img_np, model, class_names, visualize=False)
    # 일단 필터 빼
    # filtered_result = nms_filter(results)
    calc_result = calc(results)
    stringVal = toString(calc_result)
    # return {"num_detections": len(calc_result), "detections": calc_result}
    return stringVal

@router.post("/image")
async def predict_image(file: UploadFile = File(...), category: str = Form(...)):
    if category in ("PERSON1", "PERSON2"):
        model = personModel
        class_names = class_names_person
    elif category == "TREE":
        model = treeModel
        class_names = class_names_tree
    else:
        model = houseModel
        class_names = class_names_house
    image_bytes = await file.read()
    img_np = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    img_result, _ = run_inference(img_np, model, class_names, visualize=True)

    _, img_encoded = cv2.imencode('.jpg', img_result)
    return StreamingResponse(io.BytesIO(img_encoded.tobytes()), media_type="image/jpeg")
