from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    source: str = "landing_page"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeadCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr = Field(...)
    phone: Optional[str] = Field(None, max_length=20)

class LeadResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    created_at: str
    message: str

class StatsResponse(BaseModel):
    total_leads: int
    today_leads: int


# Lead endpoints
@api_router.post("/leads", response_model=LeadResponse)
async def create_lead(input: LeadCreate):
    """Create a new lead from the landing page form"""
    try:
        # Check if email already exists
        existing = await db.leads.find_one({"email": input.email}, {"_id": 0})
        if existing:
            return LeadResponse(
                id=existing["id"],
                name=existing["name"],
                email=existing["email"],
                phone=existing.get("phone"),
                created_at=existing["created_at"],
                message="Вы уже зарегистрированы! Проверьте почту."
            )
        
        lead_obj = Lead(**input.model_dump())
        doc = lead_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.leads.insert_one(doc)
        
        return LeadResponse(
            id=lead_obj.id,
            name=lead_obj.name,
            email=lead_obj.email,
            phone=lead_obj.phone,
            created_at=doc['created_at'],
            message="Спасибо! Ваш план готов."
        )
    except Exception as e:
        logging.error(f"Error creating lead: {e}")
        raise HTTPException(status_code=500, detail="Ошибка сервера. Попробуйте позже.")

@api_router.get("/leads", response_model=List[Lead])
async def get_leads():
    """Get all leads (admin endpoint)"""
    leads = await db.leads.find({}, {"_id": 0}).to_list(1000)
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    return leads

@api_router.get("/leads/stats", response_model=StatsResponse)
async def get_lead_stats():
    """Get lead statistics"""
    total = await db.leads.count_documents({})
    
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today = await db.leads.count_documents({
        "created_at": {"$gte": today_start.isoformat()}
    })
    
    return StatsResponse(total_leads=total, today_leads=today)


# Health check
@api_router.get("/")
async def root():
    return {"status": "ok", "message": "Freelance Funnel API"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
