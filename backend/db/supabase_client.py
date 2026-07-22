from supabase import create_client, Client
from config import get_settings
import logging

logger = logging.getLogger(__name__)

_client: Client | None = None


def get_supabase() -> Client:
    """Return a singleton Supabase client."""
    global _client
    if _client is None:
        settings = get_settings()
        if not settings.supabase_url or not settings.supabase_key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY must be set in environment variables."
            )
        _client = create_client(settings.supabase_url, settings.supabase_key)
        logger.info("Supabase client initialized.")
    return _client
