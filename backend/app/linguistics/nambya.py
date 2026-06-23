from typing import List
import re

from .base import BaseLanguageProcessor, LanguageConfig


NAMBYA_CONFIG = LanguageConfig(
    code="nm",
    name="Nambya",
    special_chars="",
    stopwords={
        "na", "ne", "ku", "kwa", "pa", "mu", "ma", "aka", "ava", "vava",
        "uye", "asi", "kana", "nekuti", "saka", "iyi", "iyo", "ichi", "icho",
        "pano", "apo", "uko", "uno", "chete", "ose", "oga", "zvose",
    },
    prefixes={
        "ndi", "u", "a", "tu", "mu", "va", "ku", "pa", "cha", "zva",
    },
    clitics=set(),
)


class NambyaProcessor(BaseLanguageProcessor):
    def __init__(self):
        super().__init__(NAMBYA_CONFIG)

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
        common_words = {"ndili", "uli", "ali", "tuli", "muli", "vali", "kuya", "kuza"}
        for word in common_words:
            checks += 1
            if word in sample:
                indicators += 1
        nm_stopwords = sum(1 for sw in self.config.stopwords if sw in sample)
        indicators += nm_stopwords * 0.5
        checks += len(self.config.stopwords) * 0.5
        return min(indicators / max(checks, 1), 1.0) if checks > 0 else 0.0
