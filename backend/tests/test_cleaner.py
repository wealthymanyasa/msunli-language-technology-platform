import pytest
from app.services.cleaner import TextCleaner


class TestTextCleaner:
    def test_cleaner_default_initialization(self):
        cleaner = TextCleaner()
        assert cleaner.remove_diacritics is False
        assert cleaner.remove_numbers is False
        assert cleaner.normalize_punctuation is True
        assert cleaner.remove_emojis is True

    def test_cleaner_custom_initialization(self):
        cleaner = TextCleaner(
            remove_diacritics=True,
            remove_numbers=True,
            normalize_punctuation=False,
        )
        assert cleaner.remove_diacritics is True
        assert cleaner.remove_numbers is True
        assert cleaner.normalize_punctuation is False

    def test_clean_removes_urls(self):
        cleaner = TextCleaner()
        result = cleaner.clean("Visit https://example.com and www.test.com")
        assert "https://example.com" not in result
        assert "www.test.com" not in result
        assert "visit" in result

    def test_clean_removes_emails(self):
        cleaner = TextCleaner()
        result = cleaner.clean("Contact test@example.com for info")
        assert "test@example.com" not in result
        assert "contact" in result

    def test_clean_removes_emojis(self):
        cleaner = TextCleaner()
        result = cleaner.clean("Hello 😊 World 🌍")
        assert "😊" not in result
        assert "🌍" not in result
        assert "hello" in result
        assert "world" in result

    def test_clean_lowercases(self):
        cleaner = TextCleaner()
        result = cleaner.clean("Hello World")
        assert result == "hello world"

    def test_clean_removes_numbers_when_enabled(self):
        cleaner = TextCleaner(remove_numbers=True)
        result = cleaner.clean("Hello 123 World 456")
        assert "123" not in result
        assert "456" not in result
        assert result == "hello world"

    def test_clean_preserves_numbers_when_disabled(self):
        cleaner = TextCleaner(remove_numbers=False)
        result = cleaner.clean("Hello 123 World")
        assert "123" in result

    def test_clean_removes_diacritics_when_enabled(self):
        cleaner = TextCleaner(remove_diacritics=True)
        result = cleaner.clean("Café résumé")
        assert "cafe resume" == result or "café" not in result

    def test_clean_normalizes_whitespace(self):
        cleaner = TextCleaner()
        result = cleaner.clean("Hello    World   Test")
        assert result == "hello world test"

    def test_clean_empty_string(self):
        cleaner = TextCleaner()
        assert cleaner.clean("") == ""
        assert cleaner.clean("   ") == ""

    def test_clean_returns_stats(self):
        cleaner = TextCleaner()
        text, stats = cleaner.clean("Hello World!", return_stats=True)
        assert "original_length" in stats
        assert "cleaned_length" in stats
        assert "removed_characters" in stats
        assert stats["original_length"] == 12

    def test_call_method(self):
        cleaner = TextCleaner()
        result = cleaner("Hello World!")
        assert result == "hello world"
