from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 필드 이름과 타입만 선언
    OPENAI_API_KEY: str
    OPENAI_API_BASE: str | None = None # 기본값을 None으로 설정

    # model_config를 통해 .env 파일 사용을 명시
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
