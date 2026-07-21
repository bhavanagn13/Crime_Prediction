import pandas as pd

# Load dataset
df = pd.read_csv("data/Bengaluru_Final.csv", low_memory=False)

print("="*60)
print("POLICE STATION ANALYSIS")
print("="*60)

# Number of unique police stations
print("\nTotal Police Stations:", df["UnitName"].nunique())

# Records per police station
station_counts = (
    df["UnitName"]
    .value_counts()
    .sort_index()
)

print("\nRecords per Police Station:\n")
print(station_counts)

# Save to CSV for inspection
station_counts.to_csv(
    "data/Police_Station_Counts.csv",
    header=["Number_of_FIRs"]
)

print("\nPolice station list saved successfully!")