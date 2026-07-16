"""FastAPI router for the chatbot service."""
import os
import json
import redis
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_core.messages import messages_from_dict, messages_to_dict
from config.settings import settings
from services.chatbot.agent import agent_executor

router = APIRouter(prefix="/chat", tags=["Chatbot"])

# Redis client for session history
redis_client = redis.Redis.from_url(settings.REDIS_URL)


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"


@router.post("/")
async def chat_endpoint(req: ChatRequest):
    """Process a chat message through the AI agent with Redis-backed session history."""
    if not req.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        # 1. Fetch history from Redis
        history_key = f"chat_session:{req.session_id}"
        messages = []
        try:
            history_data = redis_client.get(history_key)
            if history_data:
                messages = messages_from_dict(json.loads(history_data))
        except Exception as e:
            print(f"[Chat] Redis fetch error: {e}")

        # 2. Append new user message
        messages.append(("user", req.message))

        # 3. Invoke agent
        result = agent_executor.invoke({"messages": messages})

        # 4. Save updated history back to Redis
        try:
            serialized = messages_to_dict(result["messages"])
            redis_client.set(history_key, json.dumps(serialized))
        except Exception as e:
            print(f"[Chat] Redis save error: {e}")

        # 5. Extract the final AI response
        final_message = result["messages"][-1]
        content = final_message.content
        if isinstance(content, list):
            text_parts = []
            for part in content:
                if isinstance(part, dict) and part.get("type") == "text":
                    text_parts.append(part.get("text", ""))
                elif isinstance(part, str):
                    text_parts.append(part)
            response_text = "".join(text_parts)
        else:
            response_text = str(content)

        return {"response": response_text, "session_id": req.session_id}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
