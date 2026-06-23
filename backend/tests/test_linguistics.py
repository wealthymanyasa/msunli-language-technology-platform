import pytest
from app.linguistics import ShonaProcessor, NdebeleProcessor, EnglishProcessor, TongaProcessor, NambyaProcessor


class TestShonaProcessor:
    def setup_method(self):
        self.processor = ShonaProcessor()

    def test_clean_text(self):
        result = self.processor.clean("Mhuri yese yakaungana pamba pavakuru!")
        assert "mhuri" in result
        assert "!" not in result

    def test_tokenize(self):
        tokens = self.processor.tokenize("Mhuri yese yakaungana")
        assert len(tokens) == 3

    def test_tokenize_remove_stopwords(self):
        tokens = self.processor.tokenize("Mhuri yese yakaungana", remove_stopwords=True)
        assert len(tokens) <= 3

    def test_detect_returns_float(self):
        score = self.processor.detect("Ndiri kuenda kuchikoro nhasi")
        assert isinstance(score, float)
        assert 0 <= score <= 1

    def test_analyze(self):
        result = self.processor.analyze("Mhuri yese yakaungana")
        assert "cleaned_text" in result
        assert "tokens" in result
        assert "token_count" in result
        assert "language" in result
        assert result["language"] == "Shona"


class TestNdebeleProcessor:
    def setup_method(self):
        self.processor = NdebeleProcessor()

    def test_clean_text(self):
        result = self.processor.clean("Salibonile! Unjani?")
        assert "salibonile" in result

    def test_tokenize(self):
        tokens = self.processor.tokenize("Salibonile unjani")
        assert len(tokens) == 2

    def test_detect(self):
        score = self.processor.detect("Ngiyakuthanda kakhulu")
        assert isinstance(score, float)


class TestEnglishProcessor:
    def setup_method(self):
        self.processor = EnglishProcessor()

    def test_clean_text(self):
        result = self.processor.clean("Hello World!")
        assert result == "hello world"

    def test_tokenize_with_stopwords(self):
        tokens = self.processor.tokenize("the quick brown fox", remove_stopwords=True)
        assert "the" not in tokens
        assert "quick" in tokens

    def test_detect(self):
        score = self.processor.detect("This is a sample English text")
        assert isinstance(score, float)


class TestTongaProcessor:
    def setup_method(self):
        self.processor = TongaProcessor()

    def test_clean_and_tokenize(self):
        tokens = self.processor.tokenize("Ndili kwinda kucikolo")
        assert len(tokens) > 0

    def test_detect(self):
        score = self.processor.detect("Ndili kwinda kuzyalo")
        assert isinstance(score, float)


class TestNambyaProcessor:
    def setup_method(self):
        self.processor = NambyaProcessor()

    def test_clean_and_tokenize(self):
        tokens = self.processor.tokenize("Ndili kuya kucikolo")
        assert len(tokens) > 0

    def test_detect(self):
        score = self.processor.detect("Ndili kuza kuno")
        assert isinstance(score, float)
