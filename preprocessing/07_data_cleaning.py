import pandas as pd

print("="*60)
print("DATA CLEANING")
print("="*60)

# Load cleaned dataset
df = pd.read_csv("data/Bengaluru_Cleaned.csv", low_memory=False)

print(f"\nOriginal Shape : {df.shape}")

# ------------------------------------
# Remove Duplicate Records
# ------------------------------------

duplicates = df.duplicated().sum()

print(f"\nDuplicate Records Found : {duplicates}")

df = df.drop_duplicates()

print(f"After Removing Duplicates : {df.shape}")

# ------------------------------------
# Remove Remaining Missing Coordinates
# ------------------------------------

missing_before = len(df)

df = df.dropna(subset=["Latitude", "Longitude"])

missing_after = len(df)

print("\nRemoved Records with Missing Coordinates :", missing_before - missing_after)

# ------------------------------------
# Reset Index
# ------------------------------------

df = df.reset_index(drop=True)

# ------------------------------------
# Save Dataset
# ------------------------------------

df.to_csv(
    "data/Bengaluru_Cleaned_Final.csv",
    index=False
)

print("\nFinal Dataset Shape :", df.shape)

print("\nDataset Saved Successfully!")