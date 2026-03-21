import csv
import io
import os
import sqlite3
import threading
from contextlib import closing
from datetime import datetime, timedelta, timezone
from typing import Optional

import uvicorn
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, Update
from telegram.ext import Application, CallbackQueryHandler, CommandHandler, ContextTypes, MessageHandler, filters

DB_PATH = os.getenv("LEAD_DB_PATH", "lead_bot/leads.db")
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
API_KEY = os.getenv("LEAD_API_KEY", "")
TZ = timezone.utc


def db_connect():
    return sqlite3.connect(DB_PATH)


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with closing(db_connect()) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                name TEXT NOT NULL,
                surname TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                about TEXT,
                country TEXT,
                source TEXT
            )
            """
        )
        conn.commit()


def period_start(period: str) -> Optional[datetime]:
    now = datetime.now(TZ)
    if period == "day":
        return now - timedelta(days=1)
    if period == "week":
        return now - timedelta(days=7)
    if period == "month":
        return now - timedelta(days=30)
    return None


def add_lead(row: dict):
    with closing(db_connect()) as conn:
        conn.execute(
            """
            INSERT INTO leads(created_at,name,surname,email,phone,about,country,source)
            VALUES(?,?,?,?,?,?,?,?)
            """,
            (
                datetime.now(TZ).isoformat(),
                row["name"],
                row["surname"],
                row["email"],
                row["phone"],
                row.get("about", ""),
                (row.get("country") or "UN").upper(),
                row.get("source", "landing-page"),
            ),
        )
        conn.commit()


def query_stats(period: str):
    since = period_start(period)
    where = ""
    params = []
    if since:
        where = "WHERE created_at >= ?"
        params.append(since.isoformat())

    with closing(db_connect()) as conn:
        total = conn.execute(f"SELECT COUNT(*) FROM leads {where}", params).fetchone()[0]
        rows = conn.execute(
            f"SELECT country, COUNT(*) c FROM leads {where} GROUP BY country ORDER BY c DESC", params
        ).fetchall()
    return total, rows


def query_leads(period: str, country: str):
    since = period_start(period)
    where = []
    params = []
    if since:
        where.append("created_at >= ?")
        params.append(since.isoformat())
    if country != "ALL":
        where.append("country = ?")
        params.append(country)
    where_sql = f"WHERE {' AND '.join(where)}" if where else ""

    with closing(db_connect()) as conn:
        rows = conn.execute(
            f"""
            SELECT created_at,name,surname,email,phone,about,country,source
            FROM leads
            {where_sql}
            ORDER BY created_at DESC
            LIMIT 500
            """,
            params,
        ).fetchall()
    return rows


def list_countries(period: str):
    since = period_start(period)
    where = ""
    params = []
    if since:
        where = "WHERE created_at >= ?"
        params.append(since.isoformat())
    with closing(db_connect()) as conn:
        rows = conn.execute(
            f"SELECT country, COUNT(*) c FROM leads {where} GROUP BY country ORDER BY c DESC", params
        ).fetchall()
    return rows


class LeadIn(BaseModel):
    name: str = Field(min_length=1)
    surname: str = Field(min_length=1)
    email: str
    phone: str
    about: str = ""
    country: str = "UN"
    source: str = "landing-page"


api = FastAPI(title="Lead Collector API")


@api.get("/health")
def health():
    return {"ok": True}


@api.post("/lead")
def collect_lead(lead: LeadIn, x_api_key: str = Header(default="")):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    add_lead(lead.model_dump())
    return {"ok": True}


MAIN_KB = ReplyKeyboardMarkup(
    [["📊 Stats"], ["📥 Get leads"]],
    resize_keyboard=True,
)


def period_keyboard(prefix: str):
    return InlineKeyboardMarkup(
        [
            [InlineKeyboardButton("Day", callback_data=f"{prefix}:day")],
            [InlineKeyboardButton("Week", callback_data=f"{prefix}:week")],
            [InlineKeyboardButton("Month", callback_data=f"{prefix}:month")],
            [InlineKeyboardButton("All time", callback_data=f"{prefix}:all")],
        ]
    )


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Lead manager bot is ready. Choose action:",
        reply_markup=MAIN_KB,
    )


async def on_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    txt = (update.message.text or "").strip()
    if txt == "📊 Stats":
        await update.message.reply_text("Select period:", reply_markup=period_keyboard("stats"))
    elif txt == "📥 Get leads":
        await update.message.reply_text("Select period:", reply_markup=period_keyboard("leads_period"))


async def on_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    data = q.data or ""

    if data.startswith("stats:"):
        period = data.split(":", 1)[1]
        total, by_country = query_stats(period)
        country_lines = [f"• {c}: {n}" for c, n in by_country[:10]] or ["• no data"]
        await q.edit_message_text(
            f"📊 Stats ({period})\n\nTotal leads: {total}\n\nBy country:\n" + "\n".join(country_lines)
        )
        return

    if data.startswith("leads_period:"):
        period = data.split(":", 1)[1]
        countries = list_countries(period)
        buttons = [[InlineKeyboardButton("All countries", callback_data=f"leads_export:{period}:ALL")]]
        for c, _ in countries[:12]:
            buttons.append([InlineKeyboardButton(c, callback_data=f"leads_export:{period}:{c}")])
        await q.edit_message_text("Choose country filter:", reply_markup=InlineKeyboardMarkup(buttons))
        return

    if data.startswith("leads_export:"):
        _, period, country = data.split(":", 2)
        rows = query_leads(period, country)
        if not rows:
            await q.edit_message_text(f"No leads for period={period}, country={country}")
            return

        buff = io.StringIO()
        writer = csv.writer(buff)
        writer.writerow(["created_at", "name", "surname", "email", "phone", "about", "country", "source"])
        writer.writerows(rows)

        file_bytes = io.BytesIO(buff.getvalue().encode("utf-8"))
        file_bytes.name = f"leads_{period}_{country.lower()}.csv"
        await q.message.reply_document(document=file_bytes, caption=f"Leads export: {period}/{country}, total {len(rows)}")
        await q.edit_message_text(f"✅ Export sent: {len(rows)} leads")


def run_api():
    uvicorn.run(api, host="0.0.0.0", port=int(os.getenv("LEAD_API_PORT", "8080")), log_level="info")


def main():
    if not BOT_TOKEN:
        raise RuntimeError("Set TELEGRAM_BOT_TOKEN env var")

    init_db()
    threading.Thread(target=run_api, daemon=True).start()

    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_text))
    app.add_handler(CallbackQueryHandler(on_callback))
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
