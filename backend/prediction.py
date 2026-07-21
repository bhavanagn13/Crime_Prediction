import torch
import numpy as np

class CrimePredictor:
    def __init__(self, lstm_model, gcn_model, hawkes_df, graph, node_df):
        self.lstm_model = lstm_model
        self.gcn_model = gcn_model
        self.hawkes_df = hawkes_df
        self.graph = graph
        self.node_df = node_df
        self.grid_to_index = {grid: idx for idx, grid in enumerate(node_df["Grid_ID"])}

        with torch.no_grad():
            output = self.gcn_model(self.graph)
            self.gcn_predictions = torch.argmax(output, dim=1).numpy()
            print("\n===== GCN Prediction Distribution =====")

            unique, counts = np.unique(self.gcn_predictions, return_counts=True)

            for u, c in zip(unique, counts):
                print(f"Class {u}: {c} nodes")

            print("======================================")

        print("GCN Predictions Cached Successfully")
        print("Unique GCN Predictions:", np.unique(self.gcn_predictions))
        print("Total Nodes:", len(self.gcn_predictions))
        print("First 20 Predictions:", self.gcn_predictions[:20])

    def _map_to_risk_scale(self, raw_pred):
        if raw_pred is None: return 0
        mapping = {0: 0, 1: 1, 2: 2}
        return mapping.get(int(raw_pred), 0)

    def predict_lstm(self, last_four_weeks):
        try:
            # Shape: (1, 4, 1)
            x = torch.tensor(last_four_weeks, dtype=torch.float32).view(1, 4, 1)

            with torch.no_grad():
                output = self.lstm_model(x)
                pred = torch.argmax(output, dim=1).item()

            return int(pred)

        except Exception as e:
            print("LSTM Prediction Error:", e)
            return 0

    def predict_gcn(self, grid_id):
        idx = self.grid_to_index.get(grid_id)

        if idx is None:
            print(f"GCN: Grid {grid_id} not found!")
            return 0

        pred = int(self.gcn_predictions[idx])

        #print(f"GCN DEBUG -> Grid: {grid_id}")
        #print(f"GCN DEBUG -> Index: {idx}")
        #print(f"GCN DEBUG -> Prediction: {pred}")

        return pred

    def get_hawkes_score(self, grid_id):
        try:
            row = self.hawkes_df[self.hawkes_df["Grid_ID"] == grid_id]

            if row.empty:
                return 0.0

            # Ensure chronological order
            row = row.sort_values("Date")

            # Return the latest Hawkes intensity for this grid
            return float(row["Hawkes_Intensity"].iloc[-1])

        except Exception as e:
            print("Hawkes Prediction Error:", e)
            return 0.0

    def fuse_predictions(self, lstm_pred, gcn_pred, hawkes_score):
        # Defaulting to 0 if values are None
        l = lstm_pred if lstm_pred is not None else 0
        g = gcn_pred if gcn_pred is not None else 0
        h = hawkes_score if hawkes_score is not None else 0
        
        if h >= 5: return 2
        return max(l, g)

    def get_final_risk(self, grid_id, last_four_weeks_data):
        return self.fuse_predictions(
            self.predict_lstm(last_four_weeks_data),
            self.predict_gcn(grid_id),
            self.get_hawkes_score(grid_id)
        )