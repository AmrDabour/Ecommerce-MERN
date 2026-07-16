"""LangGraph ReAct agent for the e-commerce chatbot."""
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from config.settings import settings
from services.chatbot.tools import search_products

# Initialize the Gemini Model
llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.3,
)

# Setup tools
tools = [search_products]

# System Prompt
SYSTEM_PROMPT = """You are a helpful and polite AI shopping assistant for our E-commerce store.
Here is some knowledge about the store:
- We offer free shipping on all orders over $50.
- We have a 30-day hassle-free return policy.
- Our physical store is located at 123 Tech Avenue, Silicon Valley.
- Support email is support@ourstore.com

When a user asks for a product (e.g., 'what is the lowest price mobile phone?'), you MUST use the `search_products` tool to query the database.
When you receive the results, format them nicely using Markdown. 
ALWAYS provide the `link` from the tool results as a clickable markdown link, e.g., [Product Name](http://...).

Do not hallucinate products. Only suggest products returned by the tool.
"""

# Create the Agent (Stateless, session history will be managed via Redis externally)
agent_executor = create_react_agent(
    llm,
    tools,
    prompt=SYSTEM_PROMPT,
)
