from typing import Dict, List, Optional, Tuple
import logging
from collections import Counter
import time

from app.services.cleaner import TextCleaner
from app.linguistics import (
    BaseLanguageProcessor,
    ShonaProcessor,
    NdebeleProcessor,
    TongaProcessor,
    NambyaProcessor,
    EnglishProcessor,
)

logger = logging.getLogger(__name__)


class LanguageDetectionResult:
    def __init__(self, code: str, name: str, confidence: float):
        self.code = code
        self.name = name
        self.confidence = confidence


class TextProcessor:
    def __init__(self):
        self.cleaner = TextCleaner(
            remove_diacritics=True,
            remove_numbers=True,
            normalize_punctuation=True,
            remove_repeated_chars=False,
            remove_emojis=True,
        )
        self._processors: Dict[str, BaseLanguageProcessor] = {
            "sn": ShonaProcessor(),
            "nd": NdebeleProcessor(),
            "to": TongaProcessor(),
            "nm": NambyaProcessor(),
            "en": EnglishProcessor(),
        }

    @property
    def supported_languages(self) -> List[Dict[str, str]]:
        return [
            {"code": code, "name": proc.config.name}
            for code, proc in self._processors.items()
        ]

    def get_processor(self, language: str) -> BaseLanguageProcessor:
        if language not in self._processors:
            raise ValueError(
                f"Unsupported language '{language}'. "
                f"Supported: {[p.config.code for p in self._processors.values()]}"
            )
        return self._processors[language]

    def detect_language(self, text: str) -> LanguageDetectionResult:
        if not text or not text.strip():
            return LanguageDetectionResult("en", "English", 1.0)

        best_code = "en"
        best_name = "English"
        best_confidence = 0.0

        for code, processor in self._processors.items():
            confidence = processor.detect(text)
            if confidence > best_confidence:
                best_confidence = confidence
                best_code = code
                best_name = processor.config.name

        return LanguageDetectionResult(best_code, best_name, round(best_confidence, 4))

    def clean(self, text: str, language: Optional[str] = None) -> str:
        return self.cleaner.clean(text)

    def tokenize(
        self,
        text: str,
        language: Optional[str] = None,
        remove_stopwords: bool = False,
    ) -> Dict:
        start = time.time()

        detected = None
        if language is None:
            detected = self.detect_language(text)
            language = detected.code

        cleaned = self.clean(text)
        processor = self.get_processor(language)
        tokens = processor.tokenize(cleaned, remove_stopwords=remove_stopwords)

        result = {
            "cleaned_text": cleaned,
            "tokens": tokens,
            "token_count": len(tokens),
            "language": processor.config.name,
            "language_code": language,
            "execution_time_ms": round((time.time() - start) * 1000, 2),
        }

        if detected:
            result["detected_language"] = detected.name
            result["detection_confidence"] = detected.confidence

        return result

    def process(self, text: str, language: Optional[str] = None) -> Dict:
        start = time.time()

        detected = self.detect_language(text)
        lang_code = language or detected.code

        cleaned = self.clean(text)
        processor = self.get_processor(lang_code)
        tokens = processor.tokenize(cleaned, remove_stopwords=False)
        tokens_no_stop = processor.get_stopwords_removed(tokens)
        all_freq = processor.get_word_frequency(tokens)

        return {
            "original_text": text,
            "cleaned_text": cleaned,
            "language": processor.config.name,
            "language_code": lang_code,
            "detected_language": detected.name,
            "detection_confidence": detected.confidence,
            "tokens": tokens,
            "tokens_without_stopwords": tokens_no_stop,
            "token_count": len(tokens),
            "token_count_without_stopwords": len(tokens_no_stop),
            "unique_words": len(all_freq),
            "word_frequency": dict(
                sorted(all_freq.items(), key=lambda x: -x[1])[:50]
            ),
            "execution_time_ms": round((time.time() - start) * 1000, 2),
        }

    def batch_tokenize(
        self,
        texts: List[str],
        language: Optional[str] = None,
        remove_stopwords: bool = False,
    ) -> List[Dict]:
        return [self.tokenize(t, language, remove_stopwords) for t in texts]

    def get_statistics(self, text: str, language: Optional[str] = None) -> Dict:
        result = self.process(text, language)
        return {
            "language": result["language"],
            "language_code": result["language_code"],
            "detected_language": result["detected_language"],
            "detection_confidence": result["detection_confidence"],
            "total_words": result["token_count"],
            "unique_words": result["unique_words"],
            "total_characters": len(text),
            "cleaned_characters": len(result["cleaned_text"]),
            "words_without_stopwords": result["token_count_without_stopwords"],
            "stopwords_removed": result["token_count"] - result["token_count_without_stopwords"],
            "word_frequency": result["word_frequency"],
            "execution_time_ms": result["execution_time_ms"],
        }


text_processor = TextProcessor()
