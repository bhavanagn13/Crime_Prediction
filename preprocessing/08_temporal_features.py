import pandas as pd

print("=" * 60)
print("TEMPORAL FEATURE ENGINEERING")
print("=" * 60)

# Load cleaned dataset
df = pd.read_csv("data/Bengaluru_Cleaned_Final.csv", low_memory=False)

# ---------------------------------------------------
# Create Date Column
# ---------------------------------------------------

df["Date"] = pd.to_datetime(
    dict(
        year=df["FIR_YEAR"],
        month=df["FIR_MONTH"],
        day=df["FIR_Day"]
    ),
    errors="coerce"
)

# ---------------------------------------------------
# Day of Week
# ---------------------------------------------------

df["DayOfWeek"] = df["Date"].dt.day_name()

# ---------------------------------------------------
# Weekend Flag
# ---------------------------------------------------

df["IsWeekend"] = df["DayOfWeek"].isin(
    ["Saturday", "Sunday"]
).astype(int)

# ---------------------------------------------------
# Quarter
# ---------------------------------------------------

df["Quarter"] = df["Date"].dt.quarter

# ---------------------------------------------------
# Save Dataset
# ---------------------------------------------------

df.to_csv(
    "data/Bengaluru_Temporal.csv",
    index=False
)

print("\nTemporal Features Created Successfully!")

print("\nFinal Shape :", df.shape)

print("\nNew Columns Added:")

print([
    "Date",
    "DayOfWeek",
    "IsWeekend",
    "Quarter"
])