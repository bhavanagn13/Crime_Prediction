from flask import Flask, request, jsonify
from patrol import recommend_patrols
import pandas as pd
import os
from flask_cors import CORS

from model_loader import (
    load_lstm_model,
    load_gcn_model,
    load_hawkes_dataset,
    load_graph
)

from prediction import CrimePredictor

app = Flask(__name__)
CORS(app)
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
            "correct_policestation_coords.csv"
        )
    )

    return pd.merge(
        fir_counts,
        station_master,
        on="UnitName"
    )


station_df = load_station_data()

#LOAD GRID LOCATIONS
# ------------------------------------------------------
# LOAD GRID LOCATIONS
# ------------------------------------------------------

grid_locations = pd.read_csv(
    os.path.join(DATASET_PATH, "corrected_grid_coords.csv")
)

grid_locations["Grid_ID"] = (
    grid_locations["Grid_ID"]
    .astype(str)
    .str.strip()
)

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

# =====================================================
# Prediction Cache
# =====================================================

prediction_cache = None
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

    # Default to police station coordinates
     s_info = station_df[
        station_df["UnitName"] == station_name
     ]

     if s_info.empty:
        lat = 0.0
        lng = 0.0
     else:
        lat = float(s_info.iloc[0]["Average_Latitude"])
        lng = float(s_info.iloc[0]["Average_Longitude"])

    # Try to use grid coordinates if they are valid
     coord_row = grid_locations[
        grid_locations["Grid_ID"] == grid_id
     ]

     if not coord_row.empty:

        temp_lat = float(coord_row.iloc[0]["Latitude"])
        temp_lng = float(coord_row.iloc[0]["Longitude"])

        # Accept only Bengaluru coordinates
        if (
            12.7 <= temp_lat <= 13.2 and
            77.3 <= temp_lng <= 77.9
        ):
            lat = temp_lat
            lng = temp_lng
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

def generate_prediction_cache():
    """
    Generates predictions for all grids only once and
    stores them in memory.

    Subsequent calls return the cached predictions.
    """

    global prediction_cache

    # Return cached results if already generated
    if prediction_cache is not None:
        print("Using cached predictions.")
        return prediction_cache

    print("\n========================================")
    print("Generating prediction cache...")
    print("========================================")

    results = []

    unique_grids = grid_map["Grid_ID"].dropna().unique()

    total = len(unique_grids)

    print(f"Total grids: {total}")

    for i, grid_id in enumerate(unique_grids):

        print(f"Processing {i + 1}/{total} : {grid_id}")

        prediction = predict_single_grid(grid_id)

        results.append(prediction)

    prediction_cache = results

    print("========================================")
    print(f"Prediction cache generated successfully.")
    print(f"Cached {len(results)} predictions.")
    print("========================================\n")

    return prediction_cache

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

    results = generate_prediction_cache()

    print(f"Returning {len(results)} cached predictions.")

    return jsonify(results)

# @app.route("/predict-all", methods=["GET"])
# def predict_all():
#     print("Entered /predict-all")

#     results = []

#     unique_grids = grid_map["Grid_ID"].dropna().unique()

#     print(f"Total grids: {len(unique_grids)}")

#     for i, grid_id in enumerate(unique_grids):

#         print(f"Processing {i+1}/{len(unique_grids)} : {grid_id}")

#         prediction = predict_single_grid(grid_id)
#         results.append(prediction)

#     print("Finished!")

#     return jsonify(results)



# @app.route("/statistics", methods=["GET"])
# def statistics():

#     low = 0
#     medium = 0
#     high = 0

#     unique_grids = grid_map["Grid_ID"].dropna().unique()

#     for grid_id in unique_grids:

#         prediction = predict_single_grid(grid_id)

#         risk = prediction["risk_level"]

#         if risk == 0:
#             low += 1
#         elif risk == 1:
#             medium += 1
#         elif risk == 2:
#             high += 1

#     return jsonify({
#         "total_grids": len(unique_grids),
#         "low": low,
#         "medium": medium,
#         "high": high
#     })

@app.route("/statistics", methods=["GET"])
def statistics():

    predictions = generate_prediction_cache()

    low = 0
    medium = 0
    high = 0

    for prediction in predictions:

        risk = prediction["risk_level"]

        if risk == 0:
            low += 1

        elif risk == 1:
            medium += 1

        elif risk == 2:
            high += 1

    return jsonify({
        "total_grids": len(predictions),
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

@app.route("/patrol-optimization", methods=["POST"])
def patrol_optimization():

    try:

        print("Entered /patrol-optimization")

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "Request body is missing."
            }), 400

        if "police_station" not in data:
            return jsonify({
                "success": False,
                "error": "police_station is required."
            }), 400

        police_station = data["police_station"].strip()

        predictions = generate_prediction_cache()

        patrol_plan = recommend_patrols(
            predictions,
            police_station
        )

        return jsonify({

            "success": True,

            "police_station": police_station,

            "total_grids": len(predictions),

            "patrols": patrol_plan

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500

@app.route("/police-stations", methods=["GET"])
def get_police_stations():

    predictions = generate_prediction_cache()

    stations = sorted(
        list({
            prediction["police_station"]
            for prediction in predictions
        })
    )

    return jsonify({
        "success": True,
        "stations": stations
    })
# ==========================================================
# RUN SERVER
# ==========================================================
print("Loading prediction cache...")

generate_prediction_cache()

print("Prediction cache ready.\n")

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )