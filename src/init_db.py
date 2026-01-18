"""Initialize database with admin user."""

import asyncio
import hashlib
import uuid
from sqlalchemy import text
from src.models.database import engine, async_session_factory


def get_password_hash(password: str) -> str:
    """Hash password."""
    return hashlib.sha256(password.encode()).hexdigest()


async def init_db():
    """Initialize database and create admin user."""
    async with engine.begin() as conn:
        # Check if users table exists, if not create it
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(100) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'senior',
                language VARCHAR(5) NOT NULL DEFAULT 'ru',
                stt_provider VARCHAR(20) NOT NULL DEFAULT 'google',
                tts_provider VARCHAR(20) NOT NULL DEFAULT 'google',
                is_test_user BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active_at TIMESTAMP
            )
        """))
        
        # Check if admin exists
        result = await conn.execute(text("SELECT id FROM users WHERE username = 'bake'"))
        admin = result.fetchone()
        
        if not admin:
            # Create admin user
            admin_id = str(uuid.uuid4())
            hashed_pw = get_password_hash("bake")
            await conn.execute(text("""
                INSERT INTO users (id, name, email, username, hashed_password, role, language, stt_provider, tts_provider)
                VALUES (:id, :name, :email, :username, :hashed_password, :role, :language, :stt_provider, :tts_provider)
            """), {
                "id": admin_id,
                "name": "Administrator",
                "email": "bake@local",
                "username": "bake",
                "hashed_password": hashed_pw,
                "role": "admin",
                "language": "ru",
                "stt_provider": "google",
                "tts_provider": "google",
            })
            print(f"✅ Admin user 'bake' created with ID: {admin_id}")
        else:
            print("ℹ️ Admin user 'bake' already exists")
        
        # Create conversations table if not exists
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS conversations (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP,
                stt_provider_used VARCHAR(20) NOT NULL,
                tts_provider_used VARCHAR(20) NOT NULL,
                device_info TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """))
        
        # Create turns table if not exists
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS turns (
                id VARCHAR(36) PRIMARY KEY,
                conversation_id VARCHAR(36) NOT NULL,
                turn_number INTEGER NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                audio_input_url VARCHAR(500),
                audio_input_duration_ms INTEGER,
                raw_transcript TEXT,
                normalized_transcript TEXT,
                transcript_confidence REAL,
                stt_latency_ms INTEGER,
                stt_words TEXT,
                user_confirmed BOOLEAN,
                user_correction TEXT,
                llm_prompt_summary TEXT,
                assistant_text TEXT,
                llm_latency_ms INTEGER,
                audio_output_url VARCHAR(500),
                audio_output_duration_ms INTEGER,
                tts_latency_ms INTEGER,
                needs_review BOOLEAN DEFAULT FALSE,
                low_confidence BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id)
            )
        """))
        
        print("✅ Database initialized successfully")


if __name__ == "__main__":
    asyncio.run(init_db())
