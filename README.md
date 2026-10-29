# Wind Forecast Intelligence Dashboard

Pilot full-stack application using React, FastAPI, Docker and Elexon BMRS national wind data.

## Features
- Forecast versus actual wind generation chart.
- MAE, RMSE, forecast bias and MAPE (MAPE excludes zero actuals).
- Delivery-slot table and CSV export.
- Selectable delivery dates and decision cutoff.
- Docker Compose startup and backend tests.

## Data sources
- Actual generation (`FUELHH`): https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream
- Wind forecast (`WINDFOR`): https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream
- API base used: https://data.elexon.co.uk/bmrs/api/v1/datasets

Actuals are filtered to `fuelType=WIND`. Forecasts are matched by `startTime` and the latest `publishTime` available by the configured cutoff.

## Forecast cutoff assumption
Default cutoff: **11:00 Europe/London on the calendar day before delivery**. This is a configurable pilot assumption, not a claim about an official market gate-closure time. Confirm the client's real decision deadline before operational use.

Metrics use only delivery slots with both eligible forecast and actual. Error = forecast - actual. Since demand and non-wind generation are outside the assignment data scope, the dashboard does not calculate total procurement requirements.

## Run with Docker
Install Docker Desktop / Docker Engine, then from this repository root:

```bash
docker compose up --build
```

- Dashboard: http://localhost:3000
- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

Stop with `Ctrl+C`, then `docker compose down`.

## Run without Docker
Backend:
```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Frontend in another terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend dev server: http://localhost:5173. Set `VITE_API_BASE_URL` if API is not at localhost:8000.

## Tests
```bash
cd backend
pip install -r requirements.txt
pytest
```

## Deployment
Deploy the Python backend to a Docker/FastAPI-compatible host and deploy the frontend to Vercel. Set `VITE_API_BASE_URL` to the public backend URL at frontend build time. Restrict backend CORS to the deployed frontend origin before production. Add actual deployment URLs here after deployment; this generated project has not been deployed.

## AI tools disclosure
ChatGPT was used to assist with scaffolding code, project structure and documentation. The developer must verify API responses, historical data availability, metrics, deployment and all outputs before submission.

## Limitations
This is a pilot assignment project, not a production trading system. Validate Elexon API response fields and data availability. Production hardening should add caching, retries/backoff, rate-limit handling, strict CORS, monitoring and integration tests.
