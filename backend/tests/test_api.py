import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestSystemEndpoints:
    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data

    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "version" in data

    def test_version(self):
        response = client.get("/version")
        assert response.status_code == 200
        data = response.json()
        assert "app_name" in data
        assert "app_version" in data


class TestCleanEndpoint:
    def test_clean_text_basic(self):
        response = client.post("/api/v1/clean", json={
            "text": "Hello World! Check https://example.com",
        })
        assert response.status_code == 200
        data = response.json()
        assert "cleaned_text" in data
        assert "hello world check" in data["cleaned_text"]
        assert data["original_length"] > 0

    def test_clean_remove_numbers(self):
        response = client.post("/api/v1/clean", json={
            "text": "Hello 123 World",
            "remove_numbers": True,
        })
        assert response.status_code == 200
        data = response.json()
        assert "hello world" in data["cleaned_text"]

    def test_clean_empty_text(self):
        response = client.post("/api/v1/clean", json={"text": ""})
        assert response.status_code == 200
        data = response.json()
        assert data["cleaned_text"] == ""


class TestTokenizeEndpoint:
    def test_tokenize_shona(self):
        response = client.post("/api/v1/tokenize", json={
            "text": "Mhuri yese yakaungana pamba pavakuru",
            "language": "sn",
        })
        assert response.status_code == 200
        data = response.json()
        assert "tokens" in data
        assert "token_count" in data
        assert data["token_count"] > 0
        assert data["language_code"] == "sn"

    def test_tokenize_invalid_language(self):
        response = client.post("/api/v1/tokenize", json={
            "text": "Hello world",
            "language": "xx",
        })
        assert response.status_code == 400

    def test_tokenize_auto_detect(self):
        response = client.post("/api/v1/tokenize", json={
            "text": "The quick brown fox jumps over the lazy dog",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["token_count"] > 0

    def test_tokenize_with_stopwords_removal(self):
        response = client.post("/api/v1/tokenize", json={
            "text": "the quick brown fox",
            "language": "en",
            "remove_stopwords": True,
        })
        assert response.status_code == 200
        data = response.json()
        assert "the" not in data["tokens"]


class TestProcessEndpoint:
    def test_process_full_pipeline(self):
        response = client.post("/api/v1/process", json={
            "text": "Ndiri kuenda kuchikoro nhasi.",
        })
        assert response.status_code == 200
        data = response.json()
        assert "original_text" in data
        assert "cleaned_text" in data
        assert "language" in data
        assert "tokens" in data
        assert "token_count" in data
        assert "unique_words" in data
        assert "word_frequency" in data
        assert "execution_time_ms" in data


class TestDetectLanguageEndpoint:
    def test_detect_shona(self):
        response = client.post("/api/v1/detect-language", json={
            "text": "Ndiri kuenda kuchikoro nhasi",
        })
        assert response.status_code == 200
        data = response.json()
        assert "language" in data
        assert "language_code" in data
        assert "confidence" in data

    def test_detect_english(self):
        response = client.post("/api/v1/detect-language", json={
            "text": "The quick brown fox jumps over the lazy dog",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["language_code"] == "en"

    def test_detect_empty_text(self):
        response = client.post("/api/v1/detect-language", json={"text": ""})
        assert response.status_code == 200
        data = response.json()
        assert data["language_code"] == "en"


class TestBatchEndpoint:
    def test_batch_tokenize(self):
        response = client.post("/api/v1/tokenize/batch", json={
            "texts": [
                "Mhuri yese yakaungana",
                "Vana vaitamba panze",
            ],
            "language": "sn",
        })
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert len(data["results"]) == 2
        for result in data["results"]:
            assert "tokens" in result
            assert "token_count" in result


class TestStatisticsEndpoint:
    def test_get_statistics(self):
        response = client.get("/api/v1/statistics", params={
            "text": "Ndiri kuenda kuchikoro nhasi",
            "language": "sn",
        })
        assert response.status_code == 200
        data = response.json()
        assert "total_words" in data
        assert "unique_words" in data
        assert "word_frequency" in data


class TestValidation:
    def test_missing_text_field(self):
        response = client.post("/api/v1/tokenize", json={})
        assert response.status_code == 422

    def test_invalid_json(self):
        response = client.post("/api/v1/tokenize", data="not-json", headers={
            "Content-Type": "application/json",
        })
        assert response.status_code in (400, 422)
