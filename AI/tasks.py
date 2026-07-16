import os
import json
import redis
from celery_app import celery_app
from agent import agent_executor
from langchain_core.messages import messages_from_dict, messages_to_dict

# Connect to Redis
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.Redis.from_url(REDIS_URL)

@celery_app.task(name="tasks.run_agent_task")
def run_agent_task(message: str, session_id: str) -> str:
    print(f"[Worker] Processing task for session_id: {session_id}")
    
    # 1. Fetch history from Redis
    history_key = f"chat_session:{session_id}"
    history_data = None
    try:
        history_data = redis_client.get(history_key)
    except Exception as e:
        print(f"[Worker] Redis fetch error: {e}")
        
    messages = []
    if history_data:
        try:
            messages = messages_from_dict(json.loads(history_data))
        except Exception as e:
            print(f"[Worker] History deserialization error: {e}")
            
    # 2. Append new user message
    messages.append(("user", message))
    
    # 3. Invoke agent state-lessly (history is fed directly)
    result = agent_executor.invoke({"messages": messages})
    
    # 4. Save updated history back to Redis (messages contains history + new AI & Tool messages)
    try:
        serialized = messages_to_dict(result["messages"])
        redis_client.set(history_key, json.dumps(serialized))
    except Exception as e:
        print(f"[Worker] Redis save error: {e}")
    
    # 5. Extract the final AI response
    final_message = result["messages"][-1]
    
    # Extract text from content
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
        
    print(f"[Worker] Task completed. Response length: {len(response_text)}")
    return response_text
