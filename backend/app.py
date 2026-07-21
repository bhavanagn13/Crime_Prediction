from flask import Flask, request, jsonify
import pandas as pd
import os

from model_loader import (
    load_lstm_model,
    load_gcn_model,
    load_hawkes_dataset,
    load_graph
)

from prediction import CrimePredictor

app = Flask(__name__)

# ==========================================================
# PATHS
# ==========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "datasets")
DATA_ROOT = os.path.join(os.path.dirname(BASE_DIR), "data")
METADATA_PATH = os.path.join(os.path.dirname(BASE_DIR), "metadata")

# ==========================================================
# LOAD STATION INFORMATION
# ==========================================================

def load_station_data():

    fir_counts = pd.read_csv(
        os.path.join(DATA_ROOT, "Police_Station_Counts.csv")
    )

    station_master = pd.read_csv(
        os.path.join(
            METADATA_PATH,
            "PoliceStation_Master.csv"
        )
    )

    return pd.merge(
        fir_counts,
        station_master,
        on="UnitName"
    )


station_df = load_station_data()

# ==========================================================
# LOAD GRID MAP
# ==========================================================

grid_map = pd.read_csv(
    os.path.join(
        DATASET_PATH,
        "Grid_to_Location_Map.csv"
    )
)

grid_map["Grid_ID"] = (
    grid_map["Grid_ID"]
    .astype(str)
    .str.strip()
)

# ==========================================================
# LOAD WEEKLY HISTORY
# ==========================================================

history_full = pd.read_csv(
    os.path.join(
        DATA_ROOT,
        "Weekly_Risk_Dataset.csv"
    )
)

history_full["Grid_ID"] = (
    history_full["Grid_ID"]
    .astype(str)
    .str.strip()
)

MAX_CRIME_VAL = float(
    history_full["Crime_Count"].max()
)

# ==========================================================
# LOAD MODELS
# ==========================================================

predictor = CrimePredictor(
    load_lstm_model(),
    load_gcn_model(),
    load_hawkes_dataset(),
    *load_graph()
)

# ==========================================================
# COMMON PREDICTION FUNCTION
# ==========================================================

def predict_single_grid(grid_id, demo_mode=False):

    grid_id = str(grid_id).strip()

    # ------------------------------------------------------
    # LAST FOUR WEEKS
    # ------------------------------------------------------

    if demo_mode:

        last_four_weeks = [
            0.2,
            0.4,
            0.7,
            0.9
        ]

    else:

        grid_history = (

            history_full[
                history_full["Grid_ID"] == grid_id
            ]

            .sort_values(
                ["Year", "Week"]
            )

            .tail(4)

        )

        raw_counts = (
            grid_history["Crime_Count"]
            .tolist()
        )

        last_four_weeks = [

            float(x) / MAX_CRIME_VAL

            for x in raw_counts

        ]

        while len(last_four_weeks) < 4:

            last_four_weeks.insert(
                0,
                0.0
            )

    # ------------------------------------------------------
    # MODEL PREDICTIONS
    # ------------------------------------------------------

    lstm_prediction = predictor.predict_lstm(
        last_four_weeks
    )

    gcn_prediction = predictor.predict_gcn(
        grid_id
    )

    hawkes_prediction = predictor.get_hawkes_score(
        grid_id
    )

    final_prediction = predictor.get_final_risk(
        grid_id,
        last_four_weeks
    )
        # ------------------------------------------------------
    # LOCATION INFORMATION
    # ------------------------------------------------------

    loc_row = grid_map[
        grid_map["Grid_ID"] == grid_id
    ]

    if loc_row.empty:

        station_name = "Unknown"
        area_name = "Unknown"
        lat = 0.0
        lng = 0.0

    else:

        station_name = loc_row.iloc[0]["UnitName"]
        area_name = loc_row.iloc[0]["Village_Area_Name"]

        s_info = station_df[
            station_df["UnitName"] == station_name
        ]

        if s_info.empty:

            lat = 0.0
            lng = 0.0

        else:

            lat = float(
                s_info.iloc[0]["Average_Latitude"]
            )

            lng = float(
                s_info.iloc[0]["Average_Longitude"]
            )

    # ------------------------------------------------------
    # RETURN RESULT
    # ------------------------------------------------------

    return {

        "grid_id": grid_id,

        "police_station": station_name,

        "area_name": area_name,

        "coordinates": {

            "lat": lat,
            "lng": lng

        },

        "risk_level": int(final_prediction),

        "details": {

            "lstm": int(lstm_prediction),

            "gcn": int(gcn_prediction),

            "hawkes": float(hawkes_prediction)

        }

    }


# ==========================================================
# PREDICT SINGLE GRID
# ==========================================================

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "Request body is missing."
        }), 400

    if "grid_id" not in data:

        return jsonify({
            "error": "grid_id is required."
        }), 400

    grid_id = str(data["grid_id"]).strip()

    demo_mode = data.get(
        "demo_mode",
        False
    )

    result = predict_single_grid(
        grid_id,
        demo_mode
    )

    return jsonify(result)
# ==========================================================
# PREDICT ALL GRIDS
# ==========================================================

@app.route("/predict-all", methods=["GET"])
def predict_all():
    print("Entered /predict-all")

    results = []

    unique_grids = grid_map["Grid_ID"].dropna().unique()

    print(f"Total grids: {len(unique_grids)}")

    for i, grid_id in enumerate(unique_grids):

        print(f"Processing {i+1}/{len(unique_grids)} : {grid_id}")

        prediction = predict_single_grid(grid_id)
        results.append(prediction)

    print("Finished!")

    return jsonify(results)

@app.route("/statistics", methods=["GET"])
def statistics():

    low = 0
    medium = 0
    high = 0

    unique_grids = grid_map["Grid_ID"].dropna().unique()

    for grid_id in unique_grids:

        prediction = predict_single_grid(grid_id)

        risk = prediction["risk_level"]

        if risk == 0:
            low += 1
        elif risk == 1:
            medium += 1
        elif risk == 2:
            high += 1

    return jsonify({
        "total_grids": len(unique_grids),
        "low": low,
        "medium": medium,
        "high": high
    })

# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({

        "message": "AI Crime Prediction Backend Running",

        "available_endpoints": [

            "POST /predict",

            "GET /predict-all"

        ]

    })


# ==========================================================
# RUN SERVER
# ==========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )