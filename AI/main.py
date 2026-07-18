from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sentry_sdk
from config.settings import settings

# Import service routers
from services.chatbot.routes import router as chatbot_router
from services.recommendations.routes import router as recommendations_router

# Initialize Sentry if DSN is provided
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        send_default_pii=True,
    )

app = FastAPI(title="E-commerce AI Services", description="AI assistant and recommendation engine.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chatbot_router)
app.include_router(recommendations_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "services": ["chatbot", "recommendations"]}
