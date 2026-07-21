import pandas as pd

# Load your file
df = pd.read_csv("data/FIR_Details_Data.csv", low_memory=False)

# This prints the names of all the columns (the headers)
print("Here are your column names:")
print(df.columns.tolist())