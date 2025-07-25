from app.utils.augmentations import letterbox
import cv2
import numpy as np
from app.utils.general import non_max_suppression, scale_boxes, check_img_size
import torch

def run_inference(img0, model, class_names, imgsz=1280, font_path="app/font/font.ttf", font_size=20, visualize=True):
    stride = model.stride
    imgsz = check_img_size(imgsz, s=stride)
    
    # 전처리
    im = letterbox(img0, imgsz, stride=stride, auto=True)[0]
    im = im.transpose((2, 0, 1))[::-1]
    im = np.ascontiguousarray(im)
    im = torch.from_numpy(im).float().unsqueeze(0) / 255.0

    pred = model(im, augment=False, visualize=False)
    pred = non_max_suppression(pred, conf_thres=0.25, iou_thres=0.45, max_det=1000)[0]
    pred[:, :4] = scale_boxes(im.shape[2:], pred[:, :4], img0.shape).round()

    results = []
    img_result = img0.copy()

    if visualize:
        from PIL import ImageFont, ImageDraw, Image
        img_rgb = cv2.cvtColor(img_result, cv2.COLOR_BGR2RGB)
        img_pil = Image.fromarray(img_rgb)
        draw = ImageDraw.Draw(img_pil)
        font = ImageFont.truetype(font_path, font_size)

    for *xyxy, conf, cls in pred:
        cid = int(cls.item())
        name = class_names[cid] if cid < len(class_names) else f'class_{cid}'
        box = [int(x.item()) for x in xyxy]
        confidence = round(conf.item(), 4)

        if visualize:
            draw.rectangle([box[0], box[1], box[2], box[3]], outline=(0, 255, 0), width=2)
            draw.text((box[0], box[1] - font_size), f'{name} {confidence}', font=font, fill=(0, 255, 0))

        results.append({
            "class": name,
            "bbox": box,
            "confidence": confidence
        })

    if visualize:
        img_result = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

    return img_result, results
