from datetime import date
from app.services.analysis import build_analysis

def test_forecast_cutoff_and_metrics():
    actuals = [{"fuelType":"WIND","startTime":"2026-01-15T12:00:00Z","generation":100}]
    forecasts = [
        {"startTime":"2026-01-15T12:00:00Z","publishTime":"2026-01-14T08:00:00Z","generation":110},
        {"startTime":"2026-01-15T12:00:00Z","publishTime":"2026-01-14T09:00:00Z","generation":120},
        {"startTime":"2026-01-15T12:00:00Z","publishTime":"2026-01-14T12:00:00Z","generation":130},
    ]
    result = build_analysis(actuals, forecasts, date(2026,1,15), date(2026,1,15), 11)
    assert result["metrics"]["matched_slots"] == 1
    assert result["points"][0]["forecast"] == 120
    assert result["metrics"]["bias"] == 20
