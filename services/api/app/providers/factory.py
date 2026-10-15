from app.core.config import settings
from app.providers.base import (
    BaseStoryProvider, BaseImageProvider, BaseTTSProvider, BaseStorageAdapter
)
from app.providers.mock_provider import (
    MockStoryProvider, MockImageProvider, MockTTSProvider
)
from app.providers.openai_provider import (
    OpenAIScriptProvider, OpenAIImageProvider, OpenAITTSProvider
)
from app.providers.storage import LocalStorageAdapter, S3StorageAdapter

def get_story_provider() -> BaseStoryProvider:
    provider = settings.STORY_PROVIDER.lower()
    if provider == "openai" and settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("placeholder"):
        return OpenAIScriptProvider()
    return MockStoryProvider()

def get_image_provider() -> BaseImageProvider:
    provider = settings.IMAGE_PROVIDER.lower()
    if provider == "openai" and settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("placeholder"):
        return OpenAIImageProvider()
    return MockImageProvider()

def get_tts_provider() -> BaseTTSProvider:
    provider = settings.TTS_PROVIDER.lower()
    if provider == "openai" and settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("placeholder"):
        return OpenAITTSProvider()
    return MockTTSProvider()

def get_storage_adapter() -> BaseStorageAdapter:
    backend = settings.STORAGE_BACKEND.lower()
    if backend in ["s3", "r2"] and settings.AWS_ACCESS_KEY_ID and not settings.AWS_ACCESS_KEY_ID.startswith("placeholder"):
        return S3StorageAdapter()
    return LocalStorageAdapter()
