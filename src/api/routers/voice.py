"""Voice API endpoints.

Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5
"""

import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.auth import get_current_user, get_optional_user
from src.api.schemas import (
    SessionCreateRequest,
    SessionResponse,
    TranscribeResponse,
    ConfirmRequest,
    ConfirmResponse,
    RespondRequest,
    RespondResponse,
    FullPipelineResponse,
    TextProcessRequest,
    TextProcessResponse,
)
from src.models.database import get_db
from src.models.entities import User
from src.services.voice_session import VoiceSessionService
from src.services.llm import get_llm_service

router = APIRouter(prefix="/api/voice", tags=["voice"])


@router.post("/session", response_model=SessionResponse)
async def create_session(
    request: SessionCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Create a new voice session.
    
    Validates: Requirements 11.1
    """
    service = VoiceSessionService(db)
    
    # Use demo user if not authenticated
    user_id = current_user.id if current_user else "00000000-0000-0000-0000-000000000001"
    
    conversation = await service.create_session(
        user_id=user_id,
        device_info=request.device_info,
    )
    return SessionResponse(session_id=conversation.id)


@router.post("/upload/{session_id}", response_model=TranscribeResponse)
async def upload_and_transcribe(
    session_id: uuid.UUID,
    audio: Annotated[UploadFile, File(description="Audio file (WAV, MP3)")],
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Upload audio and get transcription.
    
    Validates: Requirements 11.2, 11.3
    """
    # Validate file type
    allowed_types = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/webm", "audio/ogg"]
    if audio.content_type and audio.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid audio format. Allowed: {allowed_types}",
        )

    # Read audio content
    audio_content = await audio.read()
    
    if len(audio_content) < 500:  # Reduced minimum
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio too short.",
        )

    # Use demo user if not authenticated
    user_id = current_user.id if current_user else "00000000-0000-0000-0000-000000000001"

    service = VoiceSessionService(db)
    
    try:
        result = await service.process_audio(
            session_id=str(session_id),
            audio=audio_content,
            user_id=user_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    return TranscribeResponse(
        turn_id=result.turn_id,
        raw_transcript=result.raw_transcript,
        normalized_transcript=result.normalized_transcript,
        confidence=result.confidence,
        stt_latency_ms=result.stt_latency_ms,
    )


@router.post("/transcribe/{session_id}", response_model=TranscribeResponse)
async def transcribe(
    session_id: uuid.UUID,
    audio: Annotated[UploadFile, File(description="Audio file")],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Transcribe audio (alias for upload).
    
    Validates: Requirements 11.3
    """
    return await upload_and_transcribe(session_id, audio, current_user, db)


@router.post("/confirm/{session_id}", response_model=ConfirmResponse)
async def confirm_transcript(
    session_id: uuid.UUID,
    request: ConfirmRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Confirm or correct transcript.
    
    Validates: Requirements 11.5
    """
    service = VoiceSessionService(db)
    
    try:
        await service.confirm_transcript(
            session_id=session_id,
            turn_id=request.turn_id,
            confirmed=request.confirmed,
            correction=request.correction,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return ConfirmResponse(success=True)


@router.post("/respond/{session_id}", response_model=RespondResponse)
async def generate_response(
    session_id: uuid.UUID,
    request: RespondRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Generate TTS response.
    
    Validates: Requirements 11.4
    """
    service = VoiceSessionService(db)
    
    try:
        result = await service.generate_response(
            session_id=session_id,
            turn_id=request.turn_id,
            assistant_text=request.assistant_text,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return RespondResponse(
        assistant_text=result.assistant_text,
        audio_url=result.audio_url,
        tts_latency_ms=result.tts_latency_ms,
    )


@router.post("/end/{session_id}")
async def end_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """End voice session."""
    service = VoiceSessionService(db)
    await service.end_session(session_id)
    return {"success": True}


@router.post("/process-text/{session_id}", response_model=TextProcessResponse)
async def process_text_pipeline(
    session_id: uuid.UUID,
    request: TextProcessRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Text pipeline: LLM -> TTS (using browser STT).
    
    Processes text through the pipeline:
    1. Generate intelligent response (MiniMax LLM)
    2. Synthesize response to audio (TTS)
    
    This is faster than full pipeline since STT is done in browser.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    user_text = request.text.strip()
    if not user_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty",
        )
    
    logger.info(f"Processing text: {user_text}")
    
    # Use demo user if not authenticated
    user_id = current_user.id if current_user else "00000000-0000-0000-0000-000000000001"
    
    service = VoiceSessionService(db)
    llm_service = get_llm_service()
    
    try:
        # Create a turn for this interaction
        turn_id = await service.create_turn_from_text(
            session_id=str(session_id),
            user_id=user_id,
            text=user_text,
        )
        
        # Step 1: LLM - Generate intelligent response
        logger.info("Starting LLM...")
        assistant_text = await llm_service.generate_response(
            user_message=user_text,
            language=request.language,
        )
        logger.info(f"LLM result: {assistant_text}")
        
        # Step 2: TTS - Synthesize response
        logger.info("Starting TTS...")
        tts_result = await service.generate_response(
            session_id=str(session_id),
            turn_id=turn_id,
            assistant_text=assistant_text,
        )
        logger.info(f"TTS done, audio_url: {tts_result.audio_url}")
        
        return TextProcessResponse(
            turn_id=turn_id,
            user_text=user_text,
            assistant_text=tts_result.assistant_text,
            audio_url=tts_result.audio_url,
            tts_latency_ms=tts_result.tts_latency_ms,
        )
        
    except ValueError as e:
        logger.error(f"ValueError: {e}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/process/{session_id}", response_model=FullPipelineResponse)
async def process_full_pipeline(
    session_id: uuid.UUID,
    audio: Annotated[UploadFile, File(description="Audio file (WAV, MP3)")],
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Full voice pipeline: STT -> LLM -> TTS.
    
    Processes audio through the complete pipeline:
    1. Transcribe audio to text (STT)
    2. Generate intelligent response (DeepSeek LLM)
    3. Synthesize response to audio (TTS)
    
    Returns both the transcription and the audio response.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # Validate file type
    allowed_types = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/webm", "audio/ogg"]
    if audio.content_type and audio.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid audio format. Allowed: {allowed_types}",
        )

    # Read audio content
    audio_content = await audio.read()
    logger.info(f"Received audio: {len(audio_content)} bytes")
    
    if len(audio_content) < 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio too short.",
        )

    # Use demo user if not authenticated
    user_id = current_user.id if current_user else "00000000-0000-0000-0000-000000000001"

    service = VoiceSessionService(db)
    llm_service = get_llm_service()
    
    try:
        # Step 1: STT - Transcribe audio
        logger.info("Starting STT...")
        stt_result = await service.process_audio(
            session_id=str(session_id),
            audio=audio_content,
            user_id=user_id,
        )
        logger.info(f"STT result: {stt_result.normalized_transcript}")
        
        # Get user language for LLM
        user = await service.get_user(user_id)
        language = user.language if user else "ru"
        
        # Step 2: LLM - Generate intelligent response
        logger.info("Starting LLM...")
        assistant_text = await llm_service.generate_response(
            user_message=stt_result.normalized_transcript,
            language=language,
        )
        logger.info(f"LLM result: {assistant_text}")
        
        # Step 3: TTS - Synthesize response
        logger.info("Starting TTS...")
        tts_result = await service.generate_response(
            session_id=str(session_id),
            turn_id=stt_result.turn_id,
            assistant_text=assistant_text,
        )
        logger.info(f"TTS done, audio_url: {tts_result.audio_url}")
        
        return FullPipelineResponse(
            turn_id=stt_result.turn_id,
            raw_transcript=stt_result.raw_transcript,
            normalized_transcript=stt_result.normalized_transcript,
            confidence=stt_result.confidence,
            stt_latency_ms=stt_result.stt_latency_ms,
            assistant_text=tts_result.assistant_text,
            audio_url=tts_result.audio_url,
            tts_latency_ms=tts_result.tts_latency_ms,
        )
        
    except ValueError as e:
        logger.error(f"ValueError: {e}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
