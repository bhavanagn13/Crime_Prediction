import pandas as pd
from sklearn.model_selection import train_test_split

# ================================
# Step 1: Load Dataset
# ================================

print("Loading dataset...")

df = pd.read_csv(
    "data/FIR_Details_Data.csv",
    low_memory=False
)

print(f"Original Dataset Shape : {df.shape}")

# ================================
# Step 2: Filter Bengaluru City
# ================================

blr_df = df[df["District_Name"] == "Bengaluru City"]

print(f"Bengaluru Dataset Shape : {blr_df.shape}")

# ================================
# Step 3: Remove Incomplete Year (2024)
# ================================

blr_df = blr_df[
    (blr_df["FIR_YEAR"] >= 2016) &
    (blr_df["FIR_YEAR"] <= 2023)
]

print(f"After Removing 2024 : {blr_df.shape}")

# ================================
# Step 4: Stratified Sampling
# ================================

sample_df, _ = train_test_split(
    blr_df,
    train_size=150000,
    stratify=blr_df["FIR_YEAR"],
    random_state=42
)

print(f"Final Dataset Shape : {sample_df.shape}")

# ================================
# Step 5: Save Dataset
# ================================

sample_df.to_csv(
    "data/Bengaluru_Final.csv",
    index=False
)

print("\nDataset saved successfully!")

# ================================
# Step 6: Display Year Distribution
# ================================

print("\nRecords Per Year")

print(
    sample_df["FIR_YEAR"]
    .value_counts()
    .sort_index()
)