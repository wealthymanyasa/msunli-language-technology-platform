from dataclasses import dataclass, field
from typing import List, Optional, Set, Pattern
import re


@dataclass
class TokenizerConfig:
    language: str
    word_pattern: str = r"\w+"
    split_clitics: bool = False
    join_prefixes: bool = False
    prefixes: Set[str] = field(default_factory=set)
    clitic_pattern: Optional[str] = None
    _word_regex: Optional[Pattern] = None
    _clitic_regex: Optional[Pattern] = None

    def __post_init__(self):
        self._word_regex = re.compile(self.word_pattern, re.UNICODE)
        if self.clitic_pattern:
            self._clitic_regex = re.compile(self.clitic_pattern, re.UNICODE)

    @classmethod
    def for_language(cls, language: str, **overrides) -> "TokenizerConfig":
        configs = {
            "sn": cls(
                language="sn",
                word_pattern=r"\w+",
                split_clitics=False,
                join_prefixes=False,
                prefixes={"ndi", "va", "mu", "ti", "pa", "ku", "zva"},
            ),
            "nd": cls(
                language="nd",
                word_pattern=r"\w+",
                split_clitics=False,
                join_prefixes=False,
                prefixes={"ngi", "u", "si", "li", "a", "ba"},
            ),
            "en": cls(
                language="en",
                word_pattern=r"\w+",
                split_clitics=False,
                join_prefixes=False,
            ),
            "to": cls(
                language="to",
                word_pattern=r"\w+",
                split_clitics=False,
                join_prefixes=False,
                prefixes={"ndi", "u", "a", "tu", "mu", "ba", "ci", "bu"},
            ),
            "nm": cls(
                language="nm",
                word_pattern=r"\w+",
                split_clitics=False,
                join_prefixes=False,
                prefixes={"ndi", "u", "a", "tu", "mu", "va", "ku", "pa", "cha", "zva"},
            ),
        }
        base = configs.get(language, cls(language=language))
        for k, v in overrides.items():
            if hasattr(base, k):
                setattr(base, k, v)
        base.__post_init__()
        return base


class Tokenizer:
    def __init__(self, config: TokenizerConfig):
        self.config = config

    def tokenize(self, text: str) -> List[str]:
        if not text or not text.strip():
            return []

        tokens = self.config._word_regex.findall(text.lower())

        if self.config.split_clitics and self.config._clitic_regex:
            tokens = self._split_clitics(tokens)

        if self.config.join_prefixes and self.config.prefixes:
            tokens = self._join_prefixes(tokens)

        return tokens

    def _split_clitics(self, tokens: List[str]) -> List[str]:
        result = []
        for token in tokens:
            match = self.config._clitic_regex.match(token) if self.config._clitic_regex else None
            if match:
                result.append(match.group(1))
                result.append(match.group(2))
            else:
                result.append(token)
        return result

    def _join_prefixes(self, tokens: List[str]) -> List[str]:
        result = []
        skip_next = False
        for i, token in enumerate(tokens):
            if skip_next:
                skip_next = False
                continue
            if token in self.config.prefixes and i + 1 < len(tokens):
                result.append(token + tokens[i + 1])
                skip_next = True
            else:
                result.append(token)
        return result

    def __call__(self, text: str) -> List[str]:
        return self.tokenize(text)


def create_tokenizer(language: str, **overrides) -> Tokenizer:
    config = TokenizerConfig.for_language(language, **overrides)
    return Tokenizer(config)
