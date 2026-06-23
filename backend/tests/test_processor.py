import pytest
from app.services.processor import TextProcessor


class TestTextProcessor:
    def setup_method(self):
        self.processor = TextProcessor()

    def test_supported_languages(self):
        langs = self.processor.supported_languages
        codes = [l["code"] for l in langs]
        assert "sn" in codes
        assert "nd" in codes
        assert "en" in codes
        assert "to" in codes
        assert "nm" in codes

    def test_get_processor(self):
        proc = self.processor.get_processor("sn")
        assert proc.config.name == "Shona"

    def test_get_processor_invalid(self):
        with pytest.raises(ValueError):
            self.processor.get_processor("xx")

    def test_detect_language_shona(self):
        result = self.processor.detect_language("Ndiri kuenda kuchikoro")
        assert result.code in ("sn", "en")

    def test_detect_language_english(self):
        result = self.processor.detect_language("The quick brown fox")
        assert result.code == "en"

    def test_detect_language_empty(self):
        result = self.processor.detect_language("")
        assert result.code == "en"

    def test_clean_text(self):
        cleaned = self.processor.clean("Hello World! 😊")
        assert "!" not in cleaned
        assert "😊" not in cleaned

    def test_tokenize_auto_detect(self):
        result = self.processor.tokenize("The quick brown fox")
        assert result["token_count"] == 4
        assert "language_code" in result

    def test_tokenize_with_language(self):
        result = self.processor.tokenize("Mhuri yese yakaungana", language="sn")
        assert result["token_count"] == 3
        assert result["language_code"] == "sn"

    def test_tokenize_with_stopwords(self):
        result = self.processor.tokenize("the quick brown fox", language="en", remove_stopwords=True)
        assert "the" not in result["tokens"]

    def test_process_full(self):
        result = self.processor.process("Ndiri kuenda kuchikoro nhasi.")
        assert "original_text" in result
        assert "cleaned_text" in result
        assert "tokens" in result
        assert result["token_count"] > 0
        assert "word_frequency" in result
        assert "execution_time_ms" in result

    def test_batch_tokenize(self):
        texts = ["Hello world", "Test batch"]
        results = self.processor.batch_tokenize(texts, language="en")
        assert len(results) == 2
        assert results[0]["token_count"] == 2

    def test_get_statistics(self):
        stats = self.processor.get_statistics("The quick brown fox", language="en")
        assert stats["total_words"] == 4
        assert stats["unique_words"] == 4
        assert stats["total_characters"] == 19
