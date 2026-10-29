
from datetime import datetime, time, timedelta, timezone

import httpx

BASE = "https://data.elexon.co.uk/bmrs/api/v1/datasets"


def parse_time(value):
    if not value:
        return None

    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))

        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)

        return dt.astimezone(timezone.utc)
    except (ValueError, TypeError):
        return None


def extract_rows(payload):
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]

    if isinstance(payload, dict):
        for key in ("data", "results", "result"):
            if isinstance(payload.get(key), list):
                return [
                    item for item in payload[key]
                    if isinstance(item, dict)
                ]

    return []


async def fetch_dataset(
    client,
    dataset,
    start,
    end,
    date_filter="publish",
    extra=None,
):
    if start > end:
        return []

    rows = []
    day = start

    while day <= end:
        last = min(day + timedelta(days=6), end)

        if date_filter == "settlement":
            params = {
                "settlementDateFrom": day.isoformat(),
                "settlementDateTo": last.isoformat(),
            }
        elif date_filter == "publish":
            params = {
                "publishDateTimeFrom": (
                    datetime.combine(
                        day, time.min, tzinfo=timezone.utc
                    ).isoformat().replace("+00:00", "Z")
                ),
                "publishDateTimeTo": (
                    datetime.combine(
                        last + timedelta(days=1),
                        time.min,
                        tzinfo=timezone.utc,
                    ).isoformat().replace("+00:00", "Z")
                ),
            }
        else:
            raise ValueError(f"Unsupported date filter: {date_filter}")

        if extra:
            params.update(extra)

        response = await client.get(
            f"{BASE}/{dataset}/stream",
            params=params,
        )
        response.raise_for_status()
        rows.extend(extract_rows(response.json()))

        day = last + timedelta(days=1)

    return rows


async def fetch_wind_data(start, end):
    if start > end:
        raise ValueError("start must be on or before end")

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(30),
        headers={"User-Agent": "wind-forecast-dashboard/1.0"},
    ) as client:
        actuals = await fetch_dataset(
            client,
            "FUELHH",
            start,
            end,
            date_filter="settlement",
            extra={"fuelType": "WIND"},
        )

        forecasts = await fetch_dataset(
            client,
            "WINDFOR",
            start - timedelta(days=1),
            end,
            date_filter="publish",
        )

    print(f"\nFUELHH rows received: {len(actuals)}")
    print(f"WINDFOR rows received: {len(forecasts)}")

    target = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)

    matching = [
        row for row in forecasts
        if parse_time(row.get("startTime")) == target
    ]

    matching.sort(
        key=lambda row: parse_time(row.get("publishTime"))
        or datetime.min.replace(tzinfo=timezone.utc)
    )

    print("\n--- Raw forecast versions for 1 Jan 2026, 00:00 UTC ---")

    for row in matching:
        print({
            "startTime": row.get("startTime"),
            "publishTime": row.get("publishTime"),
            "generation": row.get("generation"),
            "all_fields": row,
        })

    return actuals, forecasts
