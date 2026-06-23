from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Set
import re


class LanguageConfig:
    def __init__(
        self,
        code: str,
        name: str,
        stopwords: Optional[Set[str]] = None,
        prefixes: Optional[Set[str]] = None,
        clitics: Optional[Set[str]] = None,
        special_chars: str = "",
        word_pattern: str = r"\w+",
    ):
        self.code = code
        self.name = name
        self.stopwords = stopwords or set()
        self.prefixes = prefixes or set()
        self.clitics = clitics or set()
        self.special_chars = special_chars
        self.word_pattern = word_pattern


class BaseLanguageProcessor(ABC):
    def __init__(self, config: LanguageConfig):
        self.config = config
        self._compile_patterns()

    def _compile_patterns(self):
        char_class = f"a-z{self.config.special_chars}"
        self._clean_pattern = re.compile(f"[^{char_class}\\s]", re.IGNORECASE)
        self._whitespace_pattern = re.compile(r"\s+")
        self._url_pattern = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
        self._email_pattern = re.compile(r"\S+@\S+", re.IGNORECASE)
        self._html_pattern = re.compile(r"<[^>]+>")

    @abstractmethod
    def clean(self, text: str) -> str:
        pass

    @abstractmethod
    def tokenize(
        self, text: str, remove_punctuation: bool = True, remove_stopwords: bool = False
    ) -> List[str]:
        pass

    def detect(self, text: str) -> float:
        return 0.0

    def is_supported(self, code: str) -> bool:
        return self.config.code == code

    def get_stopwords_removed(self, tokens: List[str]) -> List[str]:
        return [t for t in tokens if t not in self.config.stopwords]

    def get_word_frequency(self, tokens: List[str]) -> Dict[str, int]:
        from collections import Counter
        return dict(Counter(tokens))

    def analyze(self, text: str) -> Dict:
        cleaned = self.clean(text)
        tokens = self.tokenize(cleaned)
        tokens_no_stop = self.get_stopwords_removed(tokens)
        freq = self.get_word_frequency(tokens)
        return {
            "cleaned_text": cleaned,
            "tokens": tokens,
            "tokens_without_stopwords": tokens_no_stop,
            "token_count": len(tokens),
            "unique_words": len(freq),
            "word_frequency": freq,
            "language": self.config.name,
            "language_code": self.config.code,
        }
