
import asyncio
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from app.services.elexon import fetch_wind_data, parse_time
from app.services.analysis import build_analysis

UK = ZoneInfo("Europe/London")
TARGET = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)
CUTOFF = datetime(2025, 12, 31, 11, 0, tzinfo=UK)


async def main():
    actuals, forecasts = await fetch_wind_data(
        date(2026, 1, 1),
        date(2026, 1, 31),
    )

    print("\n=== ACTUAL DATA CHECK ===")
    actual_matches = [
        row for row in actuals
        if parse_time(row.get("startTime")) == TARGET
        and str(row.get("fuelType", "")).upper() == "WIND"
    ]
    for row in actual_matches:
        print({
            "startTime": row.get("startTime"),
            "generation": row.get("generation"),
            "publishTime": row.get("publishTime"),
        })

    print("\n=== ALL RAW FORECAST VERSIONS FOR TARGET ===")
    versions = []

    for row in forecasts:
        start = parse_time(row.get("startTime"))
        published = parse_time(row.get("publishTime"))
        generation = row.get("generation")

        if start == TARGET:
            print({
                "startTime": row.get("startTime"),
                "publishTime": row.get("publishTime"),
                "generation": generation,
                "eligible": bool(
                    published and published.astimezone(UK) <= CUTOFF
                ),
            })

            if published and published.astimezone(UK) <= CUTOFF:
                try:
                    if generation is not None:
                        versions.append((published, float(generation)))
                except (ValueError, TypeError):
                    pass

    print("\n=== LATEST ELIGIBLE RAW VERSION ===")
    if versions:
        published, generation = max(versions, key=lambda item: item[0])
        print({
            "publishTime": published.isoformat(),
            "generation": generation,
        })
    else:
        print("No eligible version found in fetched records.")

    print("\n=== ANALYSIS OUTPUT ===")
    result = build_analysis(
        actuals,
        forecasts,
        date(2026, 1, 1),
        date(2026, 1, 31),
        cutoff_hour=11,
    )

    selected = [
        point for point in result["points"]
        if parse_time(point["startTime"]) == TARGET
    ]
    for point in selected:
        print(point)

    print("\n=== RECORD COUNTS ===")
    print("Raw actual rows:", len(actuals))
    print("Raw forecast rows:", len(forecasts))
    print("Actual delivery slots:", result["actual_records"])
    print("Selected forecast slots:", result["forecast_records"])
    print("Matched metric slots:", result["metrics"]["matched_slots"])
    print("Metrics:", result["metrics"])


if __name__ == "__main__":
    asyncio.run(main())
