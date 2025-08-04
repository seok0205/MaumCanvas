def calc(detections, img_size = 1280) :
    img_area = img_size * img_size

    for det in detections :
        x1, y1, x2, y2 = det["bbox"]
        w = max(0, x2 - x1)
        h = max(0, y2 - y1)
        area = w * h
        det["area_ratio"] = round(area/img_area, 4)
    return detections