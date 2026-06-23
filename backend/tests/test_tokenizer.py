import pytest
from app.services.tokenizer import Tokenizer, TokenizerConfig, create_tokenizer


class TestTokenizerConfig:
    def test_default_config_creation(self):
        config = TokenizerConfig.for_language("en")
        assert config.language == "en"
        assert config._word_regex is not None

    def test_shona_config(self):
        config = TokenizerConfig.for_language("sn")
        assert config.language == "sn"
        assert "ndi" in config.prefixes

    def test_ndebele_config(self):
        config = TokenizerConfig.for_language("nd")
        assert config.language == "nd"
        assert "ngi" in config.prefixes

    def test_tonga_config(self):
        config = TokenizerConfig.for_language("to")
        assert config.language == "to"
        assert len(config.prefixes) > 0

    def test_nambya_config(self):
        config = TokenizerConfig.for_language("nm")
        assert config.language == "nm"
        assert len(config.prefixes) > 0

    def test_unknown_language_fallback(self):
        config = TokenizerConfig.for_language("xx")
        assert config.language == "xx"
        assert len(config.prefixes) == 0


class TestTokenizer:
    def test_tokenize_basic(self):
        tokenizer = create_tokenizer("en")
        tokens = tokenizer.tokenize("Hello world")
        assert tokens == ["hello", "world"]

    def test_tokenize_shona(self):
        tokenizer = create_tokenizer("sn")
        tokens = tokenizer.tokenize("Mhuri yese yakaungana")
        assert "mhuri" in tokens
        assert "yese" in tokens
        assert "yakaungana" in tokens
        assert len(tokens) == 3

    def test_tokenize_empty_input(self):
        tokenizer = create_tokenizer("en")
        assert tokenizer.tokenize("") == []
        assert tokenizer.tokenize("   ") == []

    def test_tokenize_punctuation_removed(self):
        tokenizer = create_tokenizer("en")
        tokens = tokenizer.tokenize("Hello, world! How are you?")
        assert "," not in tokens
        assert "!" not in tokens

    def test_token_count(self):
        tokenizer = create_tokenizer("en")
        tokens = tokenizer.tokenize("one two three four five")
        assert len(tokens) == 5

    @pytest.mark.parametrize("text,expected_count", [
        ("", 0),
        ("hello", 1),
        ("hello world", 2),
        ("a b c d e", 5),
        ("one   two   three", 3),
    ])
    def test_tokenize_parametrized(self, text, expected_count):
        tokenizer = create_tokenizer("en")
        tokens = tokenizer.tokenize(text)
        assert len(tokens) == expected_count

    def test_call_method(self):
        tokenizer = create_tokenizer("en")
        result = tokenizer("hello world")
        assert result == ["hello", "world"]
