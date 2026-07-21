import pandas as pd

# Load dataset
df = pd.read_csv("data/Bengaluru_Final.csv", low_memory=False)

# Count valid coordinates for each police station
station_coordinates = (
    df.groupby("UnitName")
      .agg(
          Total_Records=("UnitName", "count"),
          Valid_Latitude=("Latitude", lambda x: x.notna().sum()),
          Valid_Longitude=("Longitude", lambda x: x.notna().sum())
      )
)

print("="*70)
print("COORDINATE ANALYSIS")
print("="*70)

print(station_coordinates)

# Stations having no coordinates
missing = station_coordinates[
    (station_coordinates["Valid_Latitude"] == 0) |
    (station_coordinates["Valid_Longitude"] == 0)
]

print("\n")
print("="*70)
print("Stations with NO Coordinates")
print("="*70)

print(missing)

station_coordinates.to_csv(
    "data/PoliceStation_Coordinate_Report.csv"
)

print("\nReport Saved Successfully.")