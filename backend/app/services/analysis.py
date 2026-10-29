
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from statistics import mean
from math import sqrt

from .elexon import parse_time


UK = ZoneInfo("Europe/London")


def number(value):
    """Convert a numeric API value to float safely."""
    try:
        if value is None or value == "":
            return None

        result = float(value)

        # Ignore invalid numeric values such as NaN or infinity.
        if not (float("-inf") < result < float("inf")):
            return None

        return result

    except (ValueError, TypeError):
        return None


def build_analysis(
    actual_rows,
    forecast_rows,
    start_date,
    end_date,
    cutoff_hour=11,
):
    """
    Compare national wind generation actuals with eligible forecasts.

    A forecast is eligible when it was published no later than the
    selected UK-time cutoff on the calendar day before delivery.

    Metrics include only delivery slots with both an eligible forecast
    and an actual. Forecast values are never interpolated or duplicated.
    """

    if start_date > end_date:
        raise ValueError("start_date must be on or before end_date")

    if not 0 <= cutoff_hour <= 23:
        raise ValueError("cutoff_hour must be between 0 and 23")

    range_start = datetime.combine(
        start_date,
        datetime.min.time(),
        tzinfo=UK,
    )

    range_end = datetime.combine(
        end_date + timedelta(days=1),
        datetime.min.time(),
        tzinfo=UK,
    )

    # ---------------------------------------------------------
    # 1. Process actual wind generation
    # ---------------------------------------------------------
    actuals = {}

    for row in actual_rows:
        if str(row.get("fuelType", "")).upper() != "WIND":
            continue

        start = parse_time(row.get("startTime"))
        generation = number(row.get("generation"))

        if start is None or generation is None:
            continue

        local_start = start.astimezone(UK)

        if not range_start <= local_start < range_end:
            continue

        # Keep timestamps in UTC for reliable exact matching.
        key = start.isoformat()

        actuals[key] = generation

    # ---------------------------------------------------------
    # 2. Select the latest eligible forecast per delivery slot
    # ---------------------------------------------------------
    selected = {}

    for row in forecast_rows:
        start = parse_time(row.get("startTime"))
        published = parse_time(row.get("publishTime"))
        generation = number(row.get("generation"))

        if start is None or published is None or generation is None:
            continue

        local_start = start.astimezone(UK)
        local_publish = published.astimezone(UK)

        if not range_start <= local_start < range_end:
            continue

        # Forecast must have been published by the cutoff
        # on the preceding UK calendar day.
        previous_day = local_start.date() - timedelta(days=1)

        cutoff = datetime.combine(
            previous_day,
            datetime.min.time(),
            tzinfo=UK,
        ).replace(hour=cutoff_hour)

        if local_publish > cutoff:
            continue

        key = start.isoformat()

        existing = selected.get(key)

        # Select the most recently published eligible forecast.
        if existing is None:
            selected[key] = {
                "generation": generation,
                "publishTime": published.isoformat(),
            }
        else:
            existing_publish = parse_time(existing["publishTime"])

            if existing_publish is None or published > existing_publish:
                selected[key] = {
                    "generation": generation,
                    "publishTime": published.isoformat(),
                }

    # ---------------------------------------------------------
    # 3. Build delivery-slot points and matched metric pairs
    # ---------------------------------------------------------
    points = []
    pairs = []

    all_keys = sorted(set(actuals) | set(selected))

    for key in all_keys:
        actual = actuals.get(key)
        forecast_record = selected.get(key)

        forecast = (
            forecast_record["generation"]
            if forecast_record is not None
            else None
        )

        publish_time = (
            forecast_record["publishTime"]
            if forecast_record is not None
            else None
        )

        error = None
        absolute_error = None

        if actual is not None and forecast is not None:
            # Positive error means over-forecasting.
            error = forecast - actual
            absolute_error = abs(error)
            pairs.append((forecast, actual))

        if forecast is None:
            status = "No eligible forecast"
        elif actual is None:
            status = "Awaiting actual"
        else:
            status = "Matched"

        points.append({
            "startTime": key,
            "publishTime": publish_time,
            "forecast": forecast,
            "actual": actual,
            "error": error,
            "absoluteError": absolute_error,
            "status": status,
        })

    # ---------------------------------------------------------
    # 4. Calculate accuracy metrics on matched slots only
    # ---------------------------------------------------------
    if pairs:
        errors = [
            forecast - actual
            for forecast, actual in pairs
        ]

        absolute_errors = [
            abs(error)
            for error in errors
        ]

        squared_errors = [
            error ** 2
            for error in errors
        ]

        # MAPE is undefined for zero actual values.
        mape_values = [
            abs(forecast - actual) / abs(actual) * 100
            for forecast, actual in pairs
            if actual != 0
        ]

        metrics = {
            "matched_slots": len(pairs),
            "mae": mean(absolute_errors),
            "rmse": sqrt(mean(squared_errors)),
            "bias": mean(errors),
            "mape": mean(mape_values) if mape_values else None,
        }

    else:
        metrics = {
            "matched_slots": 0,
            "mae": None,
            "rmse": None,
            "bias": None,
            "mape": None,
        }

    # ---------------------------------------------------------
    # 5. Return API response
    # ---------------------------------------------------------
    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "decision_cutoff": (
            f"{cutoff_hour:02d}:00 Europe/London "
            "on preceding calendar day"
        ),
        "actual_records": len(actuals),
        "forecast_records": len(selected),
        "points": points,
        "metrics": metrics,
        "notes": [
            "Actual generation is filtered to fuelType=WIND.",
            (
                "For each delivery slot, the latest forecast published "
                f"by {cutoff_hour:02d}:00 UK time on the preceding "
                "calendar day is selected."
            ),
            (
                "The cutoff is a pilot assumption, not a claim about "
                "an official market gate-closure deadline."
            ),
            (
                "Accuracy metrics use only slots with both an eligible "
                "forecast and an actual."
            ),
            (
                "Forecasts are matched by exact delivery startTime. "
                "Missing forecasts are not interpolated or duplicated."
            ),
            (
                "Demand and non-wind generation are outside this data "
                "scope, so procurement requirements are not calculated."
            ),
        ],
    }
