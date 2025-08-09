def calc(detections, orig_width, orig_height):
    img_area = orig_width * orig_height

    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        w = max(0, x2 - x1)
        h = max(0, y2 - y1)
        area = w * h
        det["area_ratio"] = round(area / img_area, 4)
    return detections
