def toString(result) :
    stringVal = f"{len(result)}개의 그림이 탐지되었습니다. "
    counts = {}
    for x in result :
        if x["class"] == "집전체" :
            stringVal = stringVal + f"집이 그림 전체에서 {x['area_ratio'] * 100:.2f}%를 차지합니다. "
        cls = x["class"]
        counts[cls] = counts.get(cls, 0) + 1
    elseLst = "그 외에는"
    for key, value in counts.items() :
        if key == "태양" :
            elseLst = elseLst + f", {key}"
        else :
            if value > 1 :
                stringVal = stringVal + f"{key}이(가) {value}개 탐지되었습니다. "
            if value == 1 :
                elseLst = elseLst + f", {key}"
    stringVal = stringVal + elseLst + "가 탐지되었습니다."
    return stringVal