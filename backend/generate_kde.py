import os
import json
import numpy as np
import pandas as pd
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_ROOT = os.path.join(os.path.dirname(BASE_DIR), "data")
DATASET_PATH=os.path.join(BASE_DIR, "datasets")

CACHE_PATH = os.path.join(BASE_DIR, "cache")

os.makedirs(CACHE_PATH, exist_ok=True)

history = pd.read_csv(
    os.path.join(DATA_ROOT, "Weekly_Risk_Dataset.csv")
)

coords = pd.read_csv(
    os.path.join(DATASET_PATH, "corrected_grid_coords.csv")
)

history["Grid_ID"] = (
    history["Grid_ID"]
    .astype(str)
    .str.strip()
)

coords["Grid_ID"] = (
    coords["Grid_ID"]
    .astype(str)
    .str.strip()
)
crime = (
    history
    .groupby("Grid_ID", as_index=False)["Crime_Count"]
    .sum()
)

merged = crime.merge(
    coords,
    on="Grid_ID",
    how="inner"
)

merged = merged[
    merged["Latitude"].between(12.70, 13.20) &
    merged["Longitude"].between(77.30, 77.90)
].copy()

# --------------------------------------------------
# Generate evaluation mesh
# --------------------------------------------------

GRID_SIZE = 150

lat_min = merged["Latitude"].min()
lat_max = merged["Latitude"].max()

lon_min = merged["Longitude"].min()
lon_max = merged["Longitude"].max()

lat_values = np.linspace(lat_min, lat_max, GRID_SIZE)
lon_values = np.linspace(lon_min, lon_max, GRID_SIZE)

lon_mesh, lat_mesh = np.meshgrid(lon_values, lat_values)

mesh_points = np.column_stack([
    lat_mesh.ravel(),
    lon_mesh.ravel()
])

print(f"Mesh points: {len(mesh_points)}")
print("Valid Bangalore Grids:", len(merged))
print(merged[["Latitude", "Longitude"]].describe())
print(merged.head())
print("Merged Grids:", len(merged))

crime_points = merged[["Latitude", "Longitude"]].to_numpy()
EARTH_RADIUS = 6371000  # meters

lat0 = np.deg2rad(merged["Latitude"].mean())

meters_per_deg_lat = 111320
meters_per_deg_lon = 111320 * np.cos(lat0)
crime_points_m = np.column_stack([
    crime_points[:, 0] * meters_per_deg_lat,
    crime_points[:, 1] * meters_per_deg_lon
])

mesh_points_m = np.column_stack([
    mesh_points[:, 0] * meters_per_deg_lat,
    mesh_points[:, 1] * meters_per_deg_lon
])

crime_weights = merged["Crime_Count"].to_numpy(dtype=float)

print("Crime points:", crime_points.shape)
print("Weights:", crime_weights.shape)

# --------------------------------------------------
# Gaussian KDE
# --------------------------------------------------

# Gaussian kernel bandwidth
# 1000 meters ≈ 0.009 degrees latitude

BANDWIDTH = 1000  # meters
BATCH_SIZE = 500
DENSITY_THRESHOLD = 0.01
GAMMA = 0.6

densities = []

total_points = len(mesh_points_m)

start_time = time.time()

for start in range(0, total_points, BATCH_SIZE):

    end = min(start + BATCH_SIZE, total_points)

    batch = mesh_points_m[start:end]

    diff = batch[:, None, :] - crime_points_m[None, :, :]

    dist_sq = np.sum(diff ** 2, axis=2)

    kernel = np.exp(
        -dist_sq / (2 * BANDWIDTH ** 2)
    )

    weighted_kernel = kernel * crime_weights

    density = weighted_kernel.sum(axis=1)

    densities.append(density)

    # ---------- Progress ----------
    processed = end
    progress = processed / total_points

    elapsed = time.time() - start_time

    eta = (elapsed / progress) - elapsed if progress > 0 else 0

    print(
        f"\rProgress: {progress*100:6.2f}% "
        f"({processed}/{total_points}) | "
        f"Elapsed: {elapsed:5.1f}s | "
        f"ETA: {eta:5.1f}s",
        end="",
        flush=True
    )

print()

densities = np.concatenate(densities)

print(f"\nFinished in {time.time()-start_time:.2f} seconds.")

# Normalize to 0-1
density_min = densities.min()
density_max = densities.max()

if density_max > density_min:
    densities = (densities - density_min) / (density_max - density_min)
else:
    densities = np.zeros_like(densities)

densities = densities ** GAMMA
densities[densities < DENSITY_THRESHOLD] = 0

print(f"Normalized Min : {densities.min():.4f}")
print(f"Normalized Max : {densities.max():.4f}")

heatmap_data = []

for (lat, lon), density in zip(mesh_points, densities):
    heatmap_data.append({
        "lat": float(lat),
        "lng": float(lon),
        "weight": float(density)
    })

output_file = os.path.join(CACHE_PATH, "kde_heatmap.json")

with open(output_file, "w") as f:
    json.dump(heatmap_data, f)

print(f"\nSaved {len(heatmap_data)} KDE points")
print(f"Output: {output_file}")