import pandas as pd

# Load original cleaned data
df = pd.read_csv("data/Bengaluru_Temporal.csv", low_memory=False)

# Assuming your FIR data has an 'FIR_Hour' or similar column. 
# If not, you need to extract it from your timestamp column.
# Let's assume you have an 'Hour' column (0-23). If you don't, 
# extract it from your source data.

def get_time_bin(hour):
    if 0 <= hour < 6: return "Late Night"
    elif 6 <= hour < 12: return "Morning"
    elif 12 <= hour < 18: return "Afternoon"
    else: return "Evening/Night"

# df['Time_Bin'] = df['Hour'].apply(get_time_bin)
# df.to_csv("data/Bengaluru_Final_With_TimeBins.csv", index=False)