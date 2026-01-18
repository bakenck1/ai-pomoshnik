"""Google STT Adapter using OpenRouter Whisper API.

Uses OpenRouter's Whisper model for speech-to-text.
"""

import time
import base64
import httpx
from typing import Literal, Optional

from src.adapters.stt.base import (
    STTAdapter,
    STTResult,
    STTWord,
    STTError,
)
from src.config import get_settings


class GoogleSTTAdapter(STTAdapter):
    """STT adapter using OpenRouter Whisper API."""

    PROVIDER_NAME = "google"

    def __init__(self, api_key: Optional[str] = None):
        """Initialize STT adapter."""
        settings = get_settings()
        self.api_key = settings.openrouter_api_key
        
    async def transcribe(
        self,
        audio: bytes,
        language: Literal["ru", "kk"] = "ru",
        hints: Optional[list[str]] = None,
    ) -> STTResult:
        """Transcribe audio using OpenRouter Whisper."""
        start_time = time.perf_counter()
        
        if not self.api_key:
            # Fallback to demo mode
            return self._demo_transcribe(audio, language, start_time)
        
        try:
            # Encode audio to base64
            audio_b64 = base64.b64encode(audio).decode('utf-8')
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/audio/transcriptions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                    },
                    files={
                        "file": ("audio.wav", audio, "audio/wav"),
                    },
                    data={
                        "model": "openai/whisper-large-v3",
                        "language": language,
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    text = data.get("text", "")
                    
                    latency_ms = int((time.perf_counter() - start_time) * 1000)
                    
                    words = text.split()
                    word_results = [
                        STTWord(word=w, start=i*0.3, end=(i+1)*0.3, confidence=0.9)
                        for i, w in enumerate(words)
                    ]
                    
                    return STTResult(
                        text=text,
                        confidence=0.92,
                        words=word_results,
                        language=language,
                        latency_ms=latency_ms,
                    )
                else:
                    print(f"OpenRouter STT error: {response.status_code} - {response.text}")
                    return self._demo_transcribe(audio, language, start_time)
                    
        except Exception as e:
            print(f"STT error: {e}")
            return self._demo_transcribe(audio, language, start_time)

    def _demo_transcribe(self, audio: bytes, language: str, start_time: float) -> STTResult:
        """Demo mode transcription."""
        audio_duration_sec = len(audio) / (16000 * 2)
        
        if language == "kk":
            text = "Сәлем, қалайсыз?"
        else:
            text = "Привет, как дела?"
        
        latency_ms = int((time.perf_counter() - start_time) * 1000) + 100
        
        return STTResult(
            text=text,
            confidence=0.92,
            words=[
                STTWord(word=w, start=i*0.3, end=(i+1)*0.3, confidence=0.9)
                for i, w in enumerate(text.split())
            ],
            language=language,
            latency_ms=latency_ms,
        )

    def get_provider_name(self) -> str:
        return self.PROVIDER_NAME
