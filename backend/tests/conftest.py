import pytest
from fastapi.testclient import TestClient
from typing import Dict

from app.main import app
from app.services.processor import TextProcessor
from app.services.cleaner import TextCleaner


@pytest.fixture(scope="module")
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture(scope="module")
def text_cleaner() -> TextCleaner:
    return TextCleaner(
        remove_diacritics=False,
        remove_numbers=False,
        normalize_punctuation=True,
        remove_repeated_chars=False,
        remove_emojis=True,
    )


@pytest.fixture(scope="module")
def processor() -> TextProcessor:
    return TextProcessor()


@pytest.fixture(scope="module")
def sample_text_shona() -> str:
    return "Mhuri yese yakaungana pamba pavakuru. Vana vaitamba panze!"


@pytest.fixture(scope="module")
def sample_text_mixed() -> str:
    return "Ndiri kuenda kuchikoro nhasi. Check this out at https://example.com! 😊"


@pytest.fixture(scope="module")
def auth_headers() -> Dict[str, str]:
    return {"Authorization": "Bearer test_token"}
