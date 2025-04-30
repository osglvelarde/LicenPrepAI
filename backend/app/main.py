from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ingest, generate, quiz

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # (Later, you can restrict to just "http://localhost:5173" if you want)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ingest.router, prefix="/ingest")
app.include_router(generate.router, prefix="/generate")
app.include_router(quiz.router, prefix="/quiz")

@app.get("/")
async def root():
    return {"message": "Medibot API Running!"}
