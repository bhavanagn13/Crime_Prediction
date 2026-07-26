import time

from app import grid_map, predict_single_grid
from patrol import recommend_patrols
from patrol_vrp import (
    build_distance_matrix,
    route_distance
)


print("=" * 70)
print("PATROL OPTIMIZER EVALUATION")
print("=" * 70)

# Generate predictions
predictions = []

unique_grids = grid_map["Grid_ID"].dropna().unique()

for grid in unique_grids:
    predictions.append(predict_single_grid(grid))

# Group into patrol routes
start = time.perf_counter()

patrol_plan = recommend_patrols(predictions)

end = time.perf_counter()

print(f"\nExecution Time : {end-start:.4f} seconds")
print(f"Police Stations: {len(patrol_plan)}")

print("\n" + "=" * 70)

overall_distance = 0

for station, vehicles in patrol_plan.items():

    hotspots = []

    hotspots.extend(vehicles["Vehicle 1"])
    hotspots.extend(vehicles["Vehicle 2"])

    if len(hotspots) == 0:
        continue

    distance_matrix = build_distance_matrix(
        station,
        hotspots
    )

    hotspot_index = {
        h["grid_id"]: i
        for i, h in enumerate(hotspots)
    }

    vehicle1 = [
        hotspot_index[h["grid_id"]]
        for h in vehicles["Vehicle 1"]
    ]

    vehicle2 = [
        hotspot_index[h["grid_id"]]
        for h in vehicles["Vehicle 2"]
    ]

    d1 = route_distance(vehicle1, distance_matrix)
    d2 = route_distance(vehicle2, distance_matrix)

    total = d1 + d2

    overall_distance += total

    print(f"\n{station}")
    print("-" * 40)
    print(f"Vehicle 1 : {len(vehicle1)} hotspots")
    print(f"Vehicle 2 : {len(vehicle2)} hotspots")
    print(f"Distance   : {total:.2f} km")

print("\n" + "=" * 70)
print(f"Overall Route Distance : {overall_distance:.2f} km")
print("=" * 70)