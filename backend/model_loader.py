import os
import torch
import pandas as pd
from torch_geometric.data import Data
from model_definitions import CrimeLSTM, CrimeGCN

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATASET_DIR = os.path.join(BASE_DIR, "datasets")

# -----------------------------
# Load LSTM
# -----------------------------
def load_lstm_model():
    model = CrimeLSTM()
    model.load_state_dict(torch.load(os.path.join(MODEL_DIR, "lstm_model.pth"), map_location=torch.device("cpu")))
    model.eval()
    print("LSTM Model Loaded Successfully")
    return model

# -----------------------------
# Load GCN
# -----------------------------
def load_gcn_model():
    # Make sure in_channels matches your input feature count (5)
    model = CrimeGCN(in_channels=5) 
    model.load_state_dict(torch.load(os.path.join(MODEL_DIR, "gcn_model.pth"), map_location=torch.device("cpu")))
    model.eval()
    print("GCN Model Loaded Successfully")
    return model

# -----------------------------
# Load Hawkes Dataset
# -----------------------------
def load_hawkes_dataset():
    df = pd.read_csv(os.path.join(DATASET_DIR, "Bengaluru_Hawkes.csv"), low_memory=False)
    print("Hawkes Dataset Loaded Successfully")
    return df

# -----------------------------
# Load Graph (ADDED THIS MISSING FUNCTION)
# -----------------------------
def load_graph():
    # 1. Load node features
    node_df = pd.read_csv(os.path.join(DATASET_DIR, "GCN_Node_Features.csv"))
    
    # Define features used in training (must match your model's input size)
    feature_cols = ['Hawkes_Intensity', 'VICTIM COUNT', 'Accused Count', 'Unique_Crime_Types', 'Crime_Count']
    x = torch.tensor(node_df[feature_cols].values, dtype=torch.float)
    
    # 2. Load Edges
    edges_df = pd.read_csv(os.path.join(DATASET_DIR, "GCN_Edges.csv"))
    
    # IMPORTANT: Since your Source/Target values (e.g., '1200_7725') look like strings, 
    # we need to map these unique IDs to integer indices (0, 1, 2...) for the graph.
    all_nodes = pd.unique(edges_df[['Source', 'Target']].values.ravel('K'))
    node_map = {node: i for i, node in enumerate(all_nodes)}
    
    # Convert string IDs to integer indices
    src = [node_map[n] for n in edges_df['Source']]
    tgt = [node_map[n] for n in edges_df['Target']]
    
    edge_index = torch.tensor([src, tgt], dtype=torch.long)
    
    graph = Data(x=x, edge_index=edge_index)
    print("GCN Graph Loaded Successfully")
    return graph, node_df