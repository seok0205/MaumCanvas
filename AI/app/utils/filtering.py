def compute(box1, box2):
    x1, y1, x2, y2 = box1
    x1_, y1_, x2_, y2_ = box2

    xi1 = max(x1, x1_)
    yi1 = max(y1, y1_)
    xi2 = min(x2, x2_)
    yi2 = min(y2, y2_)

    inter_area = max(0, xi2 - xi1) * max(0, yi2 - yi1)
    box1_area = (x2 - x1) * (y2 - y1)
    box2_area = (x2_ - x1_) * (y2_ - y1_)
    union_area = box1_area + box2_area - inter_area

    iou = inter_area / union_area if union_area > 0 else 0.0
    contain1 = inter_area / box1_area if box1_area > 0 else 0.0
    contain2 = inter_area / box2_area if box2_area > 0 else 0.0

    return iou, contain1, contain2

def nms_filter(detections, iou_thresh=0.7, contain_thresh=0.9):
    detections = sorted(detections, key=lambda x: x['confidence'], reverse=True)
    keep = []

    while detections:
        current = detections.pop(0)
        keep.append(current)

        filtered = []
        for d in detections:
            iou, c1, c2 = compute(current["bbox"], d["bbox"])
            if iou >= iou_thresh or c1 >= contain_thresh or c2 >= contain_thresh:
                continue
            filtered.append(d)
        detections = filtered

    return keep



