import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

print("=" * 60)
print("PREPARING LSTM DATASET (With Zero-Filling & Scaling)")
print("=" * 60)

# Load dataset
df = pd.read_csv("data/Bengaluru_Spatial.csv", low_memory=False)
df["Date"] = pd.to_datetime(df["Date"])

# 1. Create a complete grid of all dates for all Grid_IDs
all_grids = df["Grid_ID"].unique()
all_dates = pd.date_range(start=df["Date"].min(), end=df["Date"].max())

# Create a MultiIndex (Cartesian product of all grids and all dates)
full_index = pd.MultiIndex.from_product([all_grids, all_dates], names=["Grid_ID", "Date"])

# 2. Calculate daily crime counts
daily_crimes = df.groupby(["Grid_ID", "Date"]).size().reset_index(name="Crime_Count")
daily_crimes = daily_crimes.set_index(["Grid_ID", "Date"])

# 3. Reindex to include missing days and fill with 0
daily_crimes = daily_crimes.reindex(full_index, fill_value=0).reset_index()

# 4. Normalization (MinMaxScaler)
scaler = MinMaxScaler()
daily_crimes["Crime_Count_Scaled"] = scaler.fit_transform(daily_crimes[["Crime_Count"]])

# Save the scaler as well, you'll need it later to de-normalize predictions
import joblib
joblib.dump(scaler, 'models/crime_scaler.pkl')

# Save
daily_crimes.to_csv("data/LSTM_Dataset_Final.csv", index=False)

print(f"LSTM Dataset Final Shape: {daily_crimes.shape}")
print("Min-Max Scaler saved to models/crime_scaler.pkl")
print("Sample of reindexed data:\n", daily_crimes.head(10))