import pandas as pd

# ===========================
# Load Dataset
# ===========================

df = pd.read_csv(
    "data/Bengaluru_Final.csv",
    low_memory=False
)

# ===========================
# Create Police Station Master
# ===========================

station_master = (
    df.groupby("UnitName")
      .agg(
          Unit_ID=("Unit_ID", "first"),
          Average_Latitude=("Latitude", "mean"),
          Average_Longitude=("Longitude", "mean"),
          Total_FIRs=("UnitName", "count")
      )
      .reset_index()
)

# ===========================
# Save Master File
# ===========================

station_master.to_csv(
    "metadata/PoliceStation_Master.csv",
    index=False
)

print("Police Station Master Created Successfully.\n")

print(station_master.head(10))