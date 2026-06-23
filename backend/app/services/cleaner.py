import re
import unicodedata
from typing import Dict, Optional, Tuple, Union


class TextCleaner:
    def __init__(
        self,
        remove_diacritics: bool = False,
        remove_numbers: bool = False,
        normalize_punctuation: bool = True,
        remove_repeated_chars: bool = False,
        remove_emojis: bool = True,
    ):
        self.remove_diacritics = remove_diacritics
        self.remove_numbers = remove_numbers
        self.normalize_punctuation = normalize_punctuation
        self.remove_repeated_chars = remove_repeated_chars
        self.remove_emojis = remove_emojis

        self._url_pattern = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
        self._email_pattern = re.compile(r"\S+@\S+", re.IGNORECASE)
        self._html_pattern = re.compile(r"<[^>]+>", re.IGNORECASE)
        self._number_pattern = re.compile(r"\d+")
        self._emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"
            "\U0001F300-\U0001F5FF"
            "\U0001F680-\U0001F6FF"
            "\U0001F1E0-\U0001F1FF"
            "\U00002702-\U000027B0"
            "\U000024C2-\U0001F251"
            "\U0001F900-\U0001F9FF"
            "\U0001FA00-\U0001FA6F"
            "\U0001FA70-\U0001FAFF"
            "\U00002600-\U000026FF"
            "\U0000FE00-\U0000FE0F"
            "\U0000200D"
            "]+", re.UNICODE
        )
        self._repeated_char_pattern = re.compile(r"(.)\1{2,}")
        self._repeated_punct_pattern = re.compile(r"([!?.])\1{2,}")
        self._whitespace_pattern = re.compile(r"\s+")

        self._single_quotes = str.maketrans({
            "\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
            "\u201e": '"', "\u2013": "-", "\u2014": "-", "\u00a0": " ",
        })

    def _normalize_unicode(self, text: str) -> str:
        return unicodedata.normalize("NFKC", text)

    def _strip_diacritics(self, text: str) -> str:
        nfkd = unicodedata.normalize("NFD", text)
        return "".join(c for c in nfkd if unicodedata.category(c) != "Mn")

    def _normalize_punctuation(self, text: str) -> str:
        text = text.translate(self._single_quotes)
        text = re.sub(r"\.{3,}", " ", text)
        text = re.sub(r"[\u2022\u2023\u25E6]", " ", text)
        text = re.sub(r"[\u203C\u203D]", " ", text)
        return text

    def _remove_repeated_chars(self, text: str) -> str:
        text = self._repeated_char_pattern.sub(r"\1\1", text)
        return text

    def clean(self, text: str, return_stats: bool = False) -> Union[str, Tuple[str, Dict]]:
        if not text:
            return ("", {"original_length": 0, "cleaned_length": 0, "removed_characters": 0}) if return_stats else ""

        original_length = len(text)

        text = self._normalize_unicode(text)
        text = self._url_pattern.sub("", text)
        text = self._email_pattern.sub("", text)
        text = self._html_pattern.sub("", text)

        if self.remove_emojis:
            text = self._emoji_pattern.sub(" ", text)

        if self.normalize_punctuation:
            text = self._normalize_punctuation(text)

        text = text.lower()

        if self.remove_diacritics:
            text = self._strip_diacritics(text)

        if self.remove_numbers:
            text = self._number_pattern.sub("", text)

        text = re.sub(r"[^\w\s]", " ", text)
        text = self._whitespace_pattern.sub(" ", text)

        if self.remove_repeated_chars:
            text = self._remove_repeated_chars(text)

        text = text.strip()

        if return_stats:
            cleaned_length = len(text)
            return text, {
                "original_length": original_length,
                "cleaned_length": cleaned_length,
                "removed_characters": original_length - cleaned_length,
            }

        return text

    def __call__(self, text: str, return_stats: bool = False) -> Union[str, Tuple[str, Dict]]:
        return self.clean(text, return_stats=return_stats)
