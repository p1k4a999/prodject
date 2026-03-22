# Lead Manager Bot

This bot stores leads in SQLite and lets you check stats/exports in Telegram.

## Features
- Receives leads via HTTP API: `POST /lead`
- Stores leads in `lead_bot/leads.db`
- Telegram menu:
  - `📊 Stats` → day/week/month/all + country breakdown
  - `📥 Get leads` → period + country filter + CSV export

## Setup
```bash
cd lead_bot
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run
```bash
export TELEGRAM_BOT_TOKEN="<your_bot_token>"
export LEAD_API_KEY="<your_api_key>"
python app.py
```

API runs on `http://0.0.0.0:8080` by default.

## Connect from landing (`docs/index.html`)
Set in page config:
```html
<script>
  window.LEAD_API_URL = "https://your-domain/lead";
  window.LEAD_API_KEY = "<your_api_key>";
</script>
```
