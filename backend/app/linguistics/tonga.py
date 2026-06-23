from typing import List
import re

from .base import BaseLanguageProcessor, LanguageConfig


TONGA_CONFIG = LanguageConfig(
    code="to",
    name="Tonga",
    special_chars="",
    stopwords={
        "a", "aba", "ali", "alo", "antu", "anu", "bo", "ci", "cila", "cili",
        "cimo", "cincene", "cinzi", "ciyo", "ico", "ili", "imwi", "ino",
        "intu", "iyo", "mbo", "mpo", "mpa", "ndi", "ndila", "nga", "nguwo",
        "nzi", "o", "obu", "omwi", "otu", "oyo", "pamwi", "po", "pantu",
        "ula", "uli", "umbo", "umwi", "uno", "wo", "ye", "yebo",
    },
    prefixes={
        "ndi", "u", "a", "tu", "mu", "ba", "ci", "bu",
        "wa", "ya", "za", "sha", "la",
    },
    clitics=set(),
)


class TongaProcessor(BaseLanguageProcessor):
    def __init__(self):
        super().__init__(TONGA_CONFIG)

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
        common_words = {"ndili", "ndiyanda", "mwana", "bala", "cisyona", "mboni"}
        for word in common_words:
            checks += 1
            if word in sample:
                indicators += 1
        to_stopwords = sum(1 for sw in self.config.stopwords if sw in sample)
        indicators += to_stopwords * 0.5
        checks += len(self.config.stopwords) * 0.5
        return min(indicators / max(checks, 1), 1.0) if checks > 0 else 0.0
