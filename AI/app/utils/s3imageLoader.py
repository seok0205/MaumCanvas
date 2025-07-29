import cv2
import numpy as np
import requests

def s3imageLoader(url) :
    response = requests.get(url)
    if response.status_code != 200:
        raise ValueError(f"이미지 다운로드 실패: {response.status_code}")

    image_bytes = response.content
    img_np = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)

    if img_np is None:
        raise ValueError("이미지 디코딩 실패")

    return img_np