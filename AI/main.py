from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from tasks import run_agent_task
import sentry_sdk

sentry_sdk.init(
    dsn="https://65fdd209b1fae3d86af0bc85d6b33fcc@o4511141177655296.ingest.us.sentry.io/4511746102525952",
    send_default_pii=True,
)

app = FastAPI(title="E-commerce AI Agent", description="An AI assistant for our web store.")

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    if not req.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    try:
        # Dispatch task to Celery worker via RabbitMQ
        task = run_agent_task.delay(req.message, req.session_id)
        
        # Wait for the worker to complete and return result (synchronous wait for MERN api compatibility)
        # Timeout after 30 seconds to prevent blocking indefinitely
        response_text = task.get(timeout=30)
        
        return {
            "response": response_text,
            "session_id": req.session_id
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}
