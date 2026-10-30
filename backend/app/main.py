from datetime import date
import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from .services.elexon import fetch_wind_data
from .services.analysis import build_analysis

app = FastAPI(title="UK Wind Forecast Intelligence API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kjhwp.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/dashboard")
async def dashboard(
    start_date: date = Query(date(2026, 1, 1)),
    end_date: date = Query(date(2026, 1, 31)),
    cutoff_hour: int = Query(11, ge=0, le=23),
):
    if start_date > end_date:
        raise HTTPException(400, "start_date must be on or before end_date")
    if (end_date - start_date).days > 31:
        raise HTTPException(400, "Maximum range is 32 calendar days")
    try:
        actuals, forecasts = await fetch_wind_data(start_date, end_date)
        return build_analysis(actuals, forecasts, start_date, end_date, cutoff_hour)
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(502, f"Elexon data request failed: {str(exc)[:250]}") from exc
