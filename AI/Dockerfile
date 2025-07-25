FROM python:3.11-slim

WORKDIR /app

# 시스템 패키지 설치 (matplotlib/openCV등 빌드용 -> GUI의존에서 리눅스기반에서 사용하려면 필요)
RUN apt-get update && apt-get install -y \
    gcc \
    libfreetype6-dev \
    libpng-dev \
    pkg-config \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*



COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
