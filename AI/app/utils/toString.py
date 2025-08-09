def toString(result, category):
    if len(result) <= 5:
        return "그림에서 분석할 수 있는 요소가 발견되지 않았습니다. 그림을 다시 그려주세요."
    counts = {}
    for x in result:
        cls = x["class"]
        counts[cls] = counts.get(cls, 0) + 1
    if category == "HOME":
        stringVal = f"{len(result)}개의 그림이 탐지되었습니다. "
        for x in result:
            if x["class"] == "집전체":
                stringVal += f"집이 그림 전체에서 {x['area_ratio'] * 100:.2f}%를 차지합니다. "
        elseLst = "탐지된 항목은"
        for key, value in counts.items():
            if key == "태양":
                elseLst += f", {key}"
            else:
                if value > 1:
                    stringVal += f"{key}이(가) {value}개 탐지되었습니다. "
                elif value == 1:
                    elseLst += f", {key}"
        if len(result) > 1:
            stringVal += elseLst + "입니다."
        return stringVal
    elif category in ("PERSON1", "PERSON2"):
        stringVal = f"{len(result)}개의 그림이 탐지되었습니다. "
        for x in result:
            if x["class"] == "사람전체":
                stringVal += f"사람이 그림 전체에서 {x['area_ratio'] * 100:.2f}%를 차지합니다. "
        parts = [k for k in counts.keys()]
        if parts:
            stringVal += "사람의 구성으로는 " + ", ".join(parts) + "이(가) 탐지되었습니다."
        return stringVal
    elif category == "TREE":
        stringVal = f"{len(result)}개의 그림이 탐지되었습니다. "
        for x in result:
            if x["class"] == "나무전체":
                stringVal += f"나무가 그림 전체에서 {x['area_ratio'] * 100:.2f}%를 차지합니다. "
        elseLst = "탐지된 항목은"
        for key, value in counts.items():
            if key == "태양":
                elseLst += f", {key}"
            else:
                if value > 1:
                    stringVal += f"{key}이(가) {value}개 탐지되었습니다. "
                elif value == 1:
                    elseLst += f", {key}"
        if len(result) > 1:
            stringVal += elseLst + "입니다."
        return stringVal
    return f"{len(result)}개의 그림이 탐지되었습니다."
