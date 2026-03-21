from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
DOCS_DIR = ROOT_DIR.parent / "docs"
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection (optional at import/startup time so the app can boot on Render)
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME')
client = AsyncIOMotorClient(mongo_url) if mongo_url else None
db = client[db_name] if client and db_name else None

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


class PayPalOrderRequest(BaseModel):
    productType: str = Field(..., pattern="^(basic|pro)$")


class PayPalCaptureRequest(PayPalOrderRequest):
    orderID: str = Field(..., min_length=1)


PAYPAL_PRODUCT_MAP = {
    "basic": {"value": "20.00", "label": "FULL SYSTEM"},
    "pro": {"value": "200.00", "label": "Freelance Start PRO"},
}


def get_paypal_base_url() -> str:
    return "https://api-m.sandbox.paypal.com" if os.environ.get("PAYPAL_ENV", "sandbox") == "sandbox" else "https://api-m.paypal.com"


def get_paypal_access_token() -> str:
    client_id = os.environ.get("PAYPAL_CLIENT_ID")
    client_secret = os.environ.get("PAYPAL_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="PayPal credentials are not configured")

    response = requests.post(
        f"{get_paypal_base_url()}/v1/oauth2/token",
        auth=(client_id, client_secret),
        data={"grant_type": "client_credentials"},
        timeout=30,
    )
    if not response.ok:
        raise HTTPException(status_code=502, detail=f"PayPal auth failed: {response.text}")

    payload = response.json()
    token = payload.get("access_token")
    if not token:
        raise HTTPException(status_code=502, detail="PayPal auth response missing access token")
    return token


def get_paypal_product(product_type: str) -> dict:
    product = PAYPAL_PRODUCT_MAP.get(product_type)
    if not product:
        raise HTTPException(status_code=400, detail="Unsupported product type")
    return product


def get_leads_collection():
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not configured. Set MONGO_URL and DB_NAME.")
    return db.leads


# Lead endpoints
@api_router.post("/leads", response_model=LeadResponse)
async def create_lead(input: LeadCreate):
    """Create a new lead from the landing page form"""
    try:
        # Check if email already exists
        leads = get_leads_collection()
        existing = await leads.find_one({"email": input.email}, {"_id": 0})
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
        
        await leads.insert_one(doc)
        
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
    leads_collection = get_leads_collection()
    leads = await leads_collection.find({}, {"_id": 0}).to_list(1000)
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    return leads

@api_router.get("/leads/stats", response_model=StatsResponse)
async def get_lead_stats():
    """Get lead statistics"""
    leads_collection = get_leads_collection()
    total = await leads_collection.count_documents({})
    
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today = await leads_collection.count_documents({
        "created_at": {"$gte": today_start.isoformat()}
    })
    
    return StatsResponse(total_leads=total, today_leads=today)


@api_router.post("/paypal/create-order")
async def create_paypal_order(input: PayPalOrderRequest):
    product = get_paypal_product(input.productType)
    access_token = get_paypal_access_token()

    response = requests.post(
        f"{get_paypal_base_url()}/v2/checkout/orders",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
        json={
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "amount": {
                        "currency_code": "USD",
                        "value": product["value"],
                    },
                    "description": product["label"],
                }
            ],
            "application_context": {
                "shipping_preference": "NO_SHIPPING",
                "user_action": "PAY_NOW",
            },
        },
        timeout=30,
    )
    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "PayPal create order failed",
                "paypal_status": response.status_code,
                "paypal_body": response.text,
            },
        )

    return response.json()


@api_router.post("/paypal/capture-order")
async def capture_paypal_order(input: PayPalCaptureRequest):
    product = get_paypal_product(input.productType)
    access_token = get_paypal_access_token()

    response = requests.post(
        f"{get_paypal_base_url()}/v2/checkout/orders/{input.orderID}/capture",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
        timeout=30,
    )
    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "PayPal capture failed",
                "paypal_status": response.status_code,
                "paypal_body": response.text,
            },
        )

    payload = response.json()
    amount_value = (((payload.get("purchase_units") or [{}])[0].get("payments") or {}).get("captures") or [{}])[0].get("amount", {}).get("value")
    if amount_value != product["value"]:
        raise HTTPException(status_code=400, detail="Captured amount did not match configured product price")

    return {
        "status": payload.get("status", "COMPLETED"),
        "orderID": payload.get("id"),
        "productType": input.productType,
        "amount": amount_value,
        "paypal": payload,
    }


# Health check
@api_router.get("/")
async def root():
    return {"status": "ok", "message": "Freelance Funnel API"}


# Include the router in the main app
app.include_router(api_router)

if DOCS_DIR.exists():
    app.mount("/docs", StaticFiles(directory=str(DOCS_DIR), html=True), name="docs")

    @app.get("/", include_in_schema=False)
    async def serve_docs_index():
        return FileResponse(DOCS_DIR / "index.html")

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
    if client is not None:
        client.close()
