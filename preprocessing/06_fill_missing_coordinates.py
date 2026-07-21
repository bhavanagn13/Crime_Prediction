import pandas as pd

# ===============================
# Load Dataset
# ===============================

df = pd.read_csv("data/Bengaluru_Final.csv", low_memory=False)

master = pd.read_csv(
    "metadata/PoliceStation_Master.csv",
    low_memory=False
)

# ===============================
# Merge Station Master
# ===============================

df = df.merge(
    master[["UnitName", "Average_Latitude", "Average_Longitude"]],
    on="UnitName",
    how="left"
)

# ===============================
# Fill Missing Latitude
# ===============================

df["Latitude"] = df["Latitude"].fillna(df["Average_Latitude"])

# Fill Missing Longitude
df["Longitude"] = df["Longitude"].fillna(df["Average_Longitude"])

# ===============================
# Remove Helper Columns
# ===============================

df.drop(
    columns=["Average_Latitude", "Average_Longitude"],
    inplace=True
)

# ===============================
# Save Dataset
# ===============================

df.to_csv(
    "data/Bengaluru_Cleaned.csv",
    index=False
)

print("\nCoordinates Filled Successfully!\n")

print("Missing Latitude :", df["Latitude"].isna().sum())
print("Missing Longitude:", df["Longitude"].isna().sum())