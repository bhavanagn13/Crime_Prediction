import pandas as pd
import os

folder = r"C:\Users\hp\Desktop\major project\AI_Crime_Prediction\backend\datasets"

for file in os.listdir(folder):
    if file.endswith(".csv"):
        print("=" * 60)
        print(file)

        try:
            df = pd.read_csv(os.path.join(folder, file), nrows=2)
            print(df.columns.tolist())
        except Exception as e:
            print(e)