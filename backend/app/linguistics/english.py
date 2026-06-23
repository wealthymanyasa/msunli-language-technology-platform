from typing import List
import re

from .base import BaseLanguageProcessor, LanguageConfig


ENGLISH_CONFIG = LanguageConfig(
    code="en",
    name="English",
    special_chars="",
    stopwords={
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "by", "with", "from", "up", "about", "into", "over", "after",
        "is", "am", "are", "was", "were", "be", "been", "being", "have", "has",
        "had", "do", "does", "did", "will", "would", "shall", "should", "may",
        "might", "must", "can", "could", "i", "you", "he", "she", "it", "we",
        "they", "me", "him", "her", "us", "them", "my", "your", "his", "its",
        "our", "their", "this", "that", "these", "those", "not", "no", "nor",
        "so", "very", "just", "too", "also", "if", "then", "else", "when",
        "where", "why", "how", "which", "who", "whom", "what", "there", "here",
    },
    prefixes=set(),
    clitics=set(),
)


class EnglishProcessor(BaseLanguageProcessor):
    def __init__(self):
        super().__init__(ENGLISH_CONFIG)

    def clean(self, text: str) -> str:
        if not text:
            return ""
        text = text.lower().strip()
        text = self._url_pattern.sub("", text)
        text = self._email_pattern.sub("", text)
        text = self._html_pattern.sub("", text)
        text = re.sub(r"\d+", "", text)
        text = self._clean_pattern.sub(" ", text)
        text = self._whitespace_pattern.sub(" ", text)
        return text.strip()

    def tokenize(
        self, text: str, remove_punctuation: bool = True, remove_stopwords: bool = False
    ) -> List[str]:
        cleaned = self.clean(text)
        tokens = cleaned.split()
        if remove_stopwords:
            tokens = self.get_stopwords_removed(tokens)
        return tokens

    def detect(self, text: str) -> float:
        sample = text.lower()
        indicators = 0
        checks = 0
        common_words = {"the", "and", "you", "that", "have", "with", "this", "from"}
        for word in common_words:
            checks += 1
            indicators += sample.count(word)
        en_stopwords = sum(sample.count(sw) for sw in self.config.stopwords)
        indicators += en_stopwords * 0.3
        checks += len(self.config.stopwords) * 0.3
        return min(indicators / max(checks, 1), 1.0) if checks > 0 else 0.0
