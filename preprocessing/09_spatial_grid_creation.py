import pandas as pd
import numpy as np

print("=" * 60)
print("SPATIAL GRID CREATION")
print("=" * 60)

# Load temporal dataset
df = pd.read_csv("data/Bengaluru_Temporal.csv", low_memory=False)

# ---------------------------------------
# Grid Size
# ---------------------------------------

GRID_SIZE = 0.01

# ---------------------------------------
# Create Grid Coordinates
# ---------------------------------------

df["Grid_X"] = np.floor(df["Latitude"] / GRID_SIZE).astype(int)

df["Grid_Y"] = np.floor(df["Longitude"] / GRID_SIZE).astype(int)

# ---------------------------------------
# Grid ID
# ---------------------------------------

df["Grid_ID"] = (
    df["Grid_X"].astype(str)
    + "_"
    + df["Grid_Y"].astype(str)
)

# ---------------------------------------
# Save Dataset
# ---------------------------------------

df.to_csv(
    "data/Bengaluru_Spatial.csv",
    index=False
)

print("\nSpatial Grid Created Successfully!")

print("\nTotal Grid Cells :")

print(df["Grid_ID"].nunique())

print("\nFinal Shape :", df.shape)