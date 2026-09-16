import pandas as pd
import os
import requests

# Dataset folder
DATASET_PATH = os.path.join(os.path.dirname(__file__), "datasets")

# Load datasets only once
location_df = pd.read_csv(
    os.path.join(DATASET_PATH, "Grid_to_Location_Map.csv")
)

coords_df = pd.read_csv(
    os.path.join(DATASET_PATH, "corrected_grid_coords.csv")
)

# Clean Grid_ID
location_df["Grid_ID"] = location_df["Grid_ID"].astype(str).str.strip()
coords_df["Grid_ID"] = coords_df["Grid_ID"].astype(str).str.strip()

# Merge datasets
merged_df = location_df.merge(coords_df, on="Grid_ID", how="inner")

# Normalize location names
merged_df["Village_Area_Name"] = (
    merged_df["Village_Area_Name"]
    .astype(str)
    .str.upper()
    .str.strip()
)

def get_location_details(location_name):

    location_name = location_name.upper().strip()

    matches = merged_df[
    merged_df["Village_Area_Name"].str.contains(
        location_name,
        case=False,
        na=False
    )
]

    if matches.empty:
        return None

    latitude = matches["Latitude"].mean()
    longitude = matches["Longitude"].mean()

    police_station = matches.iloc[0]["UnitName"]

    return {
        "location_name": location_name.title(),
        "latitude": float(latitude),
        "longitude": float(longitude),
        "police_station": police_station
    }

def get_nearest_police_station(latitude, longitude):

    nearest = merged_df.copy()

    nearest["distance"] = (
        (nearest["Latitude"] - latitude) ** 2 +
        (nearest["Longitude"] - longitude) ** 2
    )

    nearest = nearest.sort_values("distance")

    nearest_location = nearest.iloc[0]

    return {

        "latitude": float(latitude),

        "longitude": float(longitude),

        "police_station": nearest_location["UnitName"]

    }

def search_locations(query, limit=5):

    query = query.strip()

    if len(query) < 2:
        return []

    try:

        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": f"{query}, Bengaluru, Karnataka, India",
                "format": "jsonv2",
                "addressdetails": 1,
                "limit": limit
            },
            headers={
                "User-Agent": "crime_prediction_system"
            },
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        suggestions = []

        for item in data:

            suggestions.append({

                "address": item["display_name"],

                "latitude": float(item["lat"]),

                "longitude": float(item["lon"])

            })

        return suggestions

    except Exception as e:

        print("Nominatim Error:", e)

        return []