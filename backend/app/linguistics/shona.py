from typing import List, Dict, Optional
import re

from .base import BaseLanguageProcessor, LanguageConfig


SHONA_CONFIG = LanguageConfig(
    code="sn",
    name="Shona",
    special_chars="âêîôû",
    stopwords={
        "ne", "na", "ku", "kwa", "pa", "mu", "ma", "aka", "va", "cha", "zva",
        "uye", "asi", "kana", "nekuti", "zvakare", "zvakadaro", "saka", "iri",
        "ndi", "che", "vo", "zvake", "kwavo", "kwake", "kwedu", "kwenyu", "kwecho",
        "pano", "apo", "uko", "uno", "iyi", "iyo", "ichi", "icho", "zviri", "zvine",
        "zvino", "zvose", "ose", "oga", "chete", "chaizvo",
        "zvakanyanya", "zvakare", "zvakadaro", "zvisinei",
    },
    prefixes={
        "ndi", "va", "mu", "ti", "va", "pa", "ku", "zva", "aka", "cha", "cha", "sa",
        "se", "che", "dza", "dze", "dzo", "nya", "nye", "nyo", "sha", "she", "sho",
    },
    clitics={
        "ndi", "va", "mu", "ti", "va", "pa", "ku", "zva",
    },
)


class ShonaProcessor(BaseLanguageProcessor):
    def __init__(self):
        super().__init__(SHONA_CONFIG)
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
        common_words = {"ndiri", "uri", "ari", "tiri", "muri", "vari", "ndi", "cha", "zva"}
        for word in common_words:
            checks += 1
            if word in sample:
                indicators += 1
        sn_stopwords_in_text = sum(1 for sw in self.config.stopwords if sw in sample)
        indicators += sn_stopwords_in_text * 0.5
        checks += len(self.config.stopwords) * 0.5
        return min(indicators / max(checks, 1), 1.0) if checks > 0 else 0.0
