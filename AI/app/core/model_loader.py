from app.models.common import DetectMultiBackend

device = "cpu"

houseModel = DetectMultiBackend("app/weights/house.pt", device=device)
personModel = DetectMultiBackend("app/weights/person.pt", device=device)
treeModel = DetectMultiBackend("app/weights/tree.pt", device=device)
houseModel.eval()
personModel.eval()
treeModel.eval()
class_names_house = ['집전체', '지붕', '집벽', '문', '창문', '굴뚝', '연기', '울타리', '길', '연못', '산', '잔디', '꽃', '태양', '기타_집']
class_names_tree = ['나무전체', '기둥', '수관', '가지', '뿌리', '나뭇잎', '나무꽃', '열매', '그네', '새', '다람쥐', '구름', '달', '별']
class_names_person = ['사람전체', '머리', '얼굴', '눈', '코', '입', '귀', '머리카락', '목', '상체', '팔', '손', '다리', '발', '단추', '주머니', '운동화', '구두']

