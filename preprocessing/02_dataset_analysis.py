import pandas as pd

# ===============================
# Load Dataset
# ===============================

df = pd.read_csv(
    "data/Bengaluru_Final.csv",
    low_memory=False
)

print("="*60)
print("DATASET INFORMATION")
print("="*60)

print("\nShape:")
print(df.shape)

print("\nData Types:")
print(df.dtypes)

print("\n")

print("="*60)
print("MISSING VALUES")
print("="*60)

print(df.isnull().sum())

print("\n")

print("="*60)
print("DUPLICATE RECORDS")
print("="*60)

print(df.duplicated().sum())

print("\n")

print("="*60)
print("UNIQUE VALUES")
print("="*60)

for col in df.columns:
    print(f"{col:30} : {df[col].nunique()}")