"""LLM service for generating intelligent responses.

Uses Groq for ultra-fast inference, or simple responses if no API key.
"""

import httpx
from typing import Optional

from src.config import get_settings


class LLMService:
    """Service for LLM responses - uses Groq (fastest) or simple mode."""

    def __init__(self):
        self.settings = get_settings()
        self.groq_api_key = getattr(self.settings, 'groq_api_key', '') or ''
        self.openrouter_api_key = self.settings.openrouter_api_key or ''
        
    async def generate_response(
        self,
        user_message: str,
        system_prompt: Optional[str] = None,
        language: str = "ru"
    ) -> str:
        """Generate a response - fast mode."""
        if not user_message.strip():
            return self._get_fallback_response(user_message, language)

        # Try Groq first (fastest - < 1 second)
        if self.groq_api_key:
            result = await self._call_groq(user_message, language)
            if result:
                return result
        
        # Skip slow OpenRouter - use simple responses instead (instant)
        return self._get_simple_response(user_message, language)

    async def _call_groq(self, user_message: str, language: str) -> Optional[str]:
        """Call Groq API (ultra-fast < 1 second)."""
        try:
            messages = [
                {"role": "system", "content": self._get_default_system_prompt(language)},
                {"role": "user", "content": user_message}
            ]
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.groq_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": messages,
                        "temperature": 0.5,
                        "max_tokens": 80,
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                print(f"Groq error: {response.status_code}")
        except Exception as e:
            print(f"Groq failed: {e}")
        return None

    async def _call_openrouter_fast(self, user_message: str, language: str) -> Optional[str]:
        """Call OpenRouter with fastest free model."""
        try:
            messages = [
                {"role": "system", "content": self._get_default_system_prompt(language)},
                {"role": "user", "content": user_message}
            ]
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openrouter_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "meta-llama/llama-3.2-1b-instruct:free",  # Smallest, fastest
                        "messages": messages,
                        "temperature": 0.5,
                        "max_tokens": 60,
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                print(f"OpenRouter error: {response.status_code}")
        except Exception as e:
            print(f"OpenRouter failed: {e}")
        return None

    def _get_simple_response(self, user_message: str, language: str) -> str:
        """Generate simple response without LLM (instant)."""
        msg = user_message.lower()
        
        if language == "kk":
            if any(w in msg for w in ["сәлем", "салем", "қалай", "калай"]):
                return "Сәлем! Мен жақсымын, рахмет. Сізге қалай көмектесе аламын?"
            if any(w in msg for w in ["ауа", "райы", "weather"]):
                return "Бүгін ауа райы жақсы болады."
            if any(w in msg for w in ["уақыт", "сағат", "time"]):
                return "Қазір түс уақыты."
            if any(w in msg for w in ["рахмет", "сау бол"]):
                return "Өзіңізге де рахмет! Сау болыңыз!"
            return "Мен сізге көмектесуге дайынмын. Сұрағыңызды қойыңыз."
        else:
            if any(w in msg for w in ["привет", "здравствуй", "добрый"]):
                return "Здравствуйте! Чем могу помочь?"
            if any(w in msg for w in ["погода", "weather"]):
                return "Сегодня хорошая погода, можно погулять."
            if any(w in msg for w in ["время", "час", "time"]):
                return "Сейчас дневное время."
            if any(w in msg for w in ["спасибо", "благодар"]):
                return "Пожалуйста! Рада помочь!"
            if any(w in msg for w in ["как дела", "как ты"]):
                return "У меня всё хорошо, спасибо! А у вас?"
            return "Я вас слушаю. Чем могу помочь?"

    def _get_default_system_prompt(self, language: str) -> str:
        """Get default system prompt based on language."""
        if language == "kk":
            return "Сен қарт адамдарға көмектесетін көмекшісің. Тек қазақша жауап бер. Қысқа жауап бер."
        return "Ты помощник для пожилых. Отвечай только по-русски. Кратко."

    def _get_fallback_response(self, user_message: str, language: str) -> str:
        """Return fallback response."""
        if language == "kk":
            return "Кешіріңіз, түсінбедім."
        return "Извините, не понял."


_llm_service: Optional[LLMService] = None

def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
