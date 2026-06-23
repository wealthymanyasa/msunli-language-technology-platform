from typing import List, Optional
import re

from .base import BaseLanguageProcessor, LanguageConfig


NDEBELE_CONFIG = LanguageConfig(
    code="nd",
    name="Ndebele",
    special_chars="ḓṱṅṋ",
    stopwords={
        "na", "kanye", "futhi", "kodwa", "ngoba", "uma", "ukuthi", "lapho",
        "khona", "nje", "pho", "ngakho", "ngamanye", "amanye", "abanye",
        "mina", "wena", "yena", "thina", "lina", "bona", "sonkana",
        "konke", "zonke", "wonke", "lonke",
        "ngi", "u", "si", "li", "ba", "a", "be", "se",
        "kule", "kulo", "kula", "kuna", "ngaphandle", "phakathi",
        "ngaphambi", "ngemuva", "phezulu", "phansi",
    },
    prefixes={
        "ngi", "u", "si", "li", "a", "s", "ba", "be", "se",
        "anga", "ange", "angabe", "ngabe",
    },
    clitics={
        "ngi", "u", "si", "li", "a", "ba",
    },
)


class NdebeleProcessor(BaseLanguageProcessor):
    def __init__(self):
        super().__init__(NDEBELE_CONFIG)
        self._clitic_pattern = re.compile(
            r"^(?:" + "|".join(sorted(self.config.clitics, key=len, reverse=True)) + r")(.+)$"
        )

    def clean(self, text: str) -> str:
        if not text:
            return ""
        text = text.lower().strip()
        text = self._url_pattern.sub("", text)
        text = self._email_pattern.sub("", text)
        text = self._html_pattern.sub("", text)
        text = re.sub(r"\d+", "", text)
        text = re.sub(r"http\S+|www\S+", "", text, flags=re.IGNORECASE)
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
        common_words = {"ngiyakuthanda", "ngicela", "ngiyabonga", "kunjani", "salibonile"}
        for word in common_words:
            checks += 1
            if word in sample:
                indicators += 1
        nd_stopwords_in_text = sum(1 for sw in self.config.stopwords if sw in sample)
        indicators += nd_stopwords_in_text * 0.5
        checks += len(self.config.stopwords) * 0.5
        return min(indicators / max(checks, 1), 1.0) if checks > 0 else 0.0
