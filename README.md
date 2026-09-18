# DemandVision — ASP.NET Core + Python AI

Architecture:
Browser -> ASP.NET Core (.NET 8) -> Python model service -> scikit-learn RandomForest

The ASP.NET Core app is the main backend and serves the website. The Python service contains the scikit-learn model because the original model is a Python/joblib model.

## Local run

1. In `model-service`:
   `python -m pip install -r requirements.txt`
2. Generate the model:
   `python prepare_model.py`
3. Start the model service:
   `python -m uvicorn app:app --host 127.0.0.1 --port 8000`
4. In another terminal, inside `DemandVision.Api`:
   `dotnet run`

Open the URL printed by `dotnet run`.

## Important
The uploaded notebook trains `RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)`.
For a GitHub/Railway-friendly artifact, `prepare_model.py` in this starter uses 20 trees. If you want the exact 200-tree model, change `n_estimators=20` to `n_estimators=200` and regenerate the artifacts.
