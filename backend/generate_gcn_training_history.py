import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

import torch
import torch.nn.functional as F

from torch_geometric.data import Data
from torch_geometric.nn import GCNConv

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


# ==========================================================
# CONFIG
# ==========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(BASE_DIR, "datasets")

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "model_visualizations",
    "gcn"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)

EPOCHS = 100
LEARNING_RATE = 0.01
WEIGHT_DECAY = 5e-4
HIDDEN_CHANNELS = 32

torch.manual_seed(42)
np.random.seed(42)


# ==========================================================
# LOAD DATA
# ==========================================================

print("\n" + "=" * 60)
print("GCN TRAINING HISTORY GENERATION")
print("=" * 60)

nodes_path = os.path.join(
    DATA_DIR,
    "GCN_Node_Features.csv"
)

edges_path = os.path.join(
    DATA_DIR,
    "GCN_Edges.csv"
)

print("\nLoading:")
print(nodes_path)
print(edges_path)

nodes = pd.read_csv(nodes_path)
edges = pd.read_csv(edges_path)

print("\nNode columns:")
print(nodes.columns.tolist())

print("\nEdge columns:")
print(edges.columns.tolist())


# ==========================================================
# CLEAN GRID IDS
# ==========================================================

nodes["Grid_ID"] = (
    nodes["Grid_ID"]
    .astype(str)
    .str.strip()
)

edges["Source"] = (
    edges["Source"]
    .astype(str)
    .str.strip()
)

edges["Target"] = (
    edges["Target"]
    .astype(str)
    .str.strip()
)


# ==========================================================
# FEATURES
# ==========================================================

FEATURE_COLUMNS = [
    "Hawkes_Intensity",
    "VICTIM COUNT",
    "Accused Count",
    "Unique_Crime_Types",
    "Crime_Count"
]


missing_features = [
    col
    for col in FEATURE_COLUMNS
    if col not in nodes.columns
]

if missing_features:

    raise ValueError(
        "Missing GCN feature columns:\n"
        + "\n".join(missing_features)
    )


X = nodes[
    FEATURE_COLUMNS
].copy()


# ==========================================================
# TARGET / RISK LABEL
# ==========================================================

if "Risk_Label" in nodes.columns:

    label_column = "Risk_Label"

elif "Risk" in nodes.columns:

    label_column = "Risk"

elif "Label" in nodes.columns:

    label_column = "Label"

else:

    raise ValueError(
        "Could not find a risk-label column in "
        "GCN_Node_Features.csv"
    )


print(
    f"\nUsing target column: {label_column}"
)


label_map = {
    "Low": 0,
    "LOW": 0,
    "low": 0,

    "Medium": 1,
    "MEDIUM": 1,
    "medium": 1,

    "High": 2,
    "HIGH": 2,
    "high": 2
}


y = nodes[
    label_column
].map(label_map)


# Handle numeric labels

if y.isna().all():

    y = pd.to_numeric(
        nodes[label_column],
        errors="coerce"
    )


# ==========================================================
# REMOVE INVALID ROWS
# ==========================================================

valid = (
    X.notna().all(axis=1)
    & y.notna()
)

X = X.loc[valid].copy()
y = y.loc[valid].astype(int).copy()

nodes_clean = nodes.loc[valid].copy()


print(
    f"\nValid nodes: {len(X)}"
)

print("\nClass distribution:")

print(
    y.value_counts()
    .sort_index()
)


# ==========================================================
# NORMALIZE FEATURES
# ==========================================================

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

X_tensor = torch.tensor(
    X_scaled,
    dtype=torch.float
)

y_tensor = torch.tensor(
    y.values,
    dtype=torch.long
)


# ==========================================================
# CREATE NODE INDEX
# ==========================================================

grid_to_index = {

    grid_id: idx

    for idx, grid_id
    in enumerate(
        nodes_clean["Grid_ID"]
    )
}


# ==========================================================
# CREATE GRAPH EDGES
# ==========================================================

source_indices = []
target_indices = []

for _, row in edges.iterrows():

    source = row["Source"]
    target = row["Target"]

    if (
        source in grid_to_index
        and target in grid_to_index
    ):

        source_indices.append(
            grid_to_index[source]
        )

        target_indices.append(
            grid_to_index[target]
        )


# Make graph undirected

edge_source = (
    source_indices
    + target_indices
)

edge_target = (
    target_indices
    + source_indices
)


edge_index = torch.tensor(
    [
        edge_source,
        edge_target
    ],
    dtype=torch.long
)


print(
    f"\nNodes: {len(X_tensor)}"
)

print(
    f"Edges: {edge_index.shape[1]}"
)


# ==========================================================
# TRAIN / VALIDATION MASKS
# ==========================================================

indices = np.arange(
    len(y_tensor)
)

train_indices, val_indices = train_test_split(
    indices,
    test_size=0.20,
    random_state=42,
    stratify=y
)


train_mask = torch.zeros(
    len(y_tensor),
    dtype=torch.bool
)

val_mask = torch.zeros(
    len(y_tensor),
    dtype=torch.bool
)

train_mask[
    train_indices
] = True

val_mask[
    val_indices
] = True


# ==========================================================
# GRAPH DATA
# ==========================================================

data = Data(
    x=X_tensor,
    edge_index=edge_index,
    y=y_tensor
)

data.train_mask = train_mask
data.val_mask = val_mask


# ==========================================================
# GCN MODEL
# ==========================================================

class CrimeGCN(torch.nn.Module):

    def __init__(self):

        super().__init__()

        self.conv1 = GCNConv(
            5,
            HIDDEN_CHANNELS
        )

        self.conv2 = GCNConv(
            HIDDEN_CHANNELS,
            HIDDEN_CHANNELS
        )

        self.classifier = torch.nn.Linear(
            HIDDEN_CHANNELS,
            3
        )

    def forward(self, x, edge_index):

        x = self.conv1(
            x,
            edge_index
        )

        x = F.relu(x)

        x = F.dropout(
            x,
            p=0.2,
            training=self.training
        )

        x = self.conv2(
            x,
            edge_index
        )

        x = F.relu(x)

        x = self.classifier(x)

        return x


# ==========================================================
# MODEL
# ==========================================================

device = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

print(
    f"\nUsing device: {device}"
)

model = CrimeGCN().to(device)

data = data.to(device)


optimizer = torch.optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY
)


# ==========================================================
# HISTORY
# ==========================================================

train_losses = []
val_losses = []

train_accuracies = []
val_accuracies = []


# ==========================================================
# TRAINING LOOP
# ==========================================================

print("\n" + "=" * 60)
print("TRAINING GCN")
print("=" * 60)


for epoch in range(
    1,
    EPOCHS + 1
):

    # ------------------------------------------------------
    # TRAIN
    # ------------------------------------------------------

    model.train()

    optimizer.zero_grad()

    output = model(
        data.x,
        data.edge_index
    )

    train_loss = F.cross_entropy(
        output[data.train_mask],
        data.y[data.train_mask]
    )

    train_loss.backward()

    optimizer.step()


    # ------------------------------------------------------
    # TRAIN ACCURACY
    # ------------------------------------------------------

    model.eval()

    with torch.no_grad():

        output = model(
            data.x,
            data.edge_index
        )

        train_predictions = (
            output[data.train_mask]
            .argmax(dim=1)
        )

        val_predictions = (
            output[data.val_mask]
            .argmax(dim=1)
        )


        train_accuracy = (
            train_predictions
            == data.y[data.train_mask]
        ).float().mean().item()


        val_accuracy = (
            val_predictions
            == data.y[data.val_mask]
        ).float().mean().item()


        val_loss = F.cross_entropy(
            output[data.val_mask],
            data.y[data.val_mask]
        )


    # ------------------------------------------------------
    # SAVE HISTORY
    # ------------------------------------------------------

    train_losses.append(
        train_loss.item()
    )

    val_losses.append(
        val_loss.item()
    )

    train_accuracies.append(
        train_accuracy
    )

    val_accuracies.append(
        val_accuracy
    )


    # ------------------------------------------------------
    # PRINT
    # ------------------------------------------------------

    if (
        epoch == 1
        or epoch % 10 == 0
    ):

        print(
            f"Epoch {epoch:03d} | "
            f"Train Loss: {train_loss.item():.4f} | "
            f"Val Loss: {val_loss.item():.4f} | "
            f"Train Acc: {train_accuracy * 100:.2f}% | "
            f"Val Acc: {val_accuracy * 100:.2f}%"
        )


# ==========================================================
# BEST RESULTS
# ==========================================================

best_val_accuracy = max(
    val_accuracies
)

best_val_loss = min(
    val_losses
)

final_val_accuracy = (
    val_accuracies[-1]
)

final_val_loss = (
    val_losses[-1]
)


print("\n" + "=" * 60)
print("FINAL GCN RESULTS")
print("=" * 60)

print(
    f"\nBest Validation Accuracy: "
    f"{best_val_accuracy * 100:.2f}%"
)

print(
    f"Final Validation Accuracy: "
    f"{final_val_accuracy * 100:.2f}%"
)

print(
    f"Best Validation Loss: "
    f"{best_val_loss:.4f}"
)

print(
    f"Final Validation Loss: "
    f"{final_val_loss:.4f}"
)


# ==========================================================
# SAVE HISTORY CSV
# ==========================================================

history_df = pd.DataFrame({

    "epoch":
        range(1, EPOCHS + 1),

    "train_loss":
        train_losses,

    "val_loss":
        val_losses,

    "train_accuracy":
        train_accuracies,

    "val_accuracy":
        val_accuracies
})


history_path = os.path.join(
    OUTPUT_DIR,
    "gcn_training_history.csv"
)

history_df.to_csv(
    history_path,
    index=False
)


# ==========================================================
# LOSS GRAPH
# ==========================================================

plt.figure(
    figsize=(10, 6)
)

plt.plot(
    history_df["epoch"],
    history_df["train_loss"],
    linewidth=2.5,
    label="Training Loss"
)

plt.plot(
    history_df["epoch"],
    history_df["val_loss"],
    linewidth=2.5,
    label="Validation Loss"
)

plt.xlabel(
    "Epoch"
)

plt.ylabel(
    "Loss"
)

plt.title(
    "GCN Training and Validation Loss"
)

plt.legend()

plt.grid(
    True,
    alpha=0.25
)

plt.tight_layout()


loss_path = os.path.join(
    OUTPUT_DIR,
    "GCN_Loss_Curve.png"
)

plt.savefig(
    loss_path,
    dpi=300
)

plt.close()


# ==========================================================
# ACCURACY GRAPH
# ==========================================================

plt.figure(
    figsize=(10, 6)
)

plt.plot(
    history_df["epoch"],
    history_df["train_accuracy"],
    linewidth=2.5,
    label="Training Accuracy"
)

plt.plot(
    history_df["epoch"],
    history_df["val_accuracy"],
    linewidth=2.5,
    label="Validation Accuracy"
)

plt.xlabel(
    "Epoch"
)

plt.ylabel(
    "Accuracy"
)

plt.title(
    "GCN Training and Validation Accuracy"
)

plt.ylim(
    0,
    1
)

plt.legend()

plt.grid(
    True,
    alpha=0.25
)

plt.tight_layout()


accuracy_path = os.path.join(
    OUTPUT_DIR,
    "GCN_Accuracy_Curve.png"
)

plt.savefig(
    accuracy_path,
    dpi=300
)

plt.close()


# ==========================================================
# SAVE SEPARATE MODEL
# ==========================================================

new_model_path = os.path.join(
    OUTPUT_DIR,
    "gcn_visualization_model.pth"
)

torch.save(
    model.state_dict(),
    new_model_path
)


# ==========================================================
# DONE
# ==========================================================

print("\n" + "=" * 60)
print("GCN VISUALIZATIONS READY")
print("=" * 60)

print(
    f"\nLoss graph:\n{loss_path}"
)

print(
    f"\nAccuracy graph:\n{accuracy_path}"
)

print(
    f"\nTraining history:\n{history_path}"
)

print(
    f"\nSeparate visualization model:\n"
    f"{new_model_path}"
)

print("\nExisting gcn_model.pth was NOT modified.")
print("Done.")