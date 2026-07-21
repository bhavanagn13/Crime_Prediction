import pandas as pd

df = pd.read_csv("datasets/Bengaluru_Hawkes.csv")

grid_locations = (
    df.groupby("Grid_ID")[["Latitude", "Longitude"]]
      .mean()
      .reset_index()
)

grid_locations.to_csv(
    "datasets/Grid_Locations.csv",
    index=False
)

print("Grid Locations Created Successfully!")

print()

print(grid_locations.head())

print()

print("Total Grids :", len(grid_locations))