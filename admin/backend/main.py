from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router as rest_router
import uvicorn

from utils.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(rest_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
