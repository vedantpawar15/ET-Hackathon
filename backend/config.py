from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash"

    # Voyage AI
    voyage_api_key: Optional[str] = None
    voyage_model: str = "voyage-2"
    embedding_dim: int = 1024  # Voyage AI dimension; fallback uses same via BAAI/bge-large-en-v1.5

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""

    # App
    max_chunk_tokens: int = 600
    chunk_overlap_tokens: int = 100
    top_k_chunks: int = 5
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
