import os
import random
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from torch.utils.data import TensorDataset, DataLoader

# ============================================================
# CONFIGURATION
# ============================================================

SEED = 42
EPOCHS = 20
BATCH_SIZE = 64
LEARNING_RATE = 0.001
VALIDATION_SIZE = 0.20

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Your project has Weekly_Risk_Dataset.csv under ../data
DATA_PATH = os.path.join(
    os.path.dirname(BASE_DIR),
    "data",
    "Weekly_Risk_Dataset.csv"
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "model_visualizations"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================
# LSTM MODEL
# Same architecture as your project
# ============================================================

class CrimeLSTM(nn.Module):

    def __init__(self):

        super().__init__()

        self.lstm = nn.LSTM(
            input_size=1,
            hidden_size=64,
            num_layers=1,
            batch_first=True
        )

        self.dropout = nn.Dropout(0.3)

        self.fc = nn.Linear(64, 3)

    def forward(self, x):

        output, (hidden, cell) = self.lstm(x)

        hidden = hidden[-1]

        hidden = self.dropout(hidden)

        output = self.fc(hidden)

        return output


# ============================================================
# LOAD DATA
# ============================================================

print("\n========================================")
print("Loading Weekly Risk Dataset")
print("========================================")

df = pd.read_csv(DATA_PATH)

print("Columns:")
print(df.columns.tolist())

required = [
    "Grid_ID",
    "Year",
    "Week",
    "Crime_Count"
]

missing = [
    col for col in required
    if col not in df.columns
]

if missing:

    raise ValueError(
        f"Missing required columns: {missing}"
    )

# ============================================================
# SORT CHRONOLOGICALLY
# ============================================================

df["Grid_ID"] = (
    df["Grid_ID"]
    .astype(str)
    .str.strip()
)

df = df.sort_values(
    ["Grid_ID", "Year", "Week"]
).reset_index(drop=True)

# ============================================================
# CREATE RISK LABEL
#
# IMPORTANT:
# If the dataset already contains a risk-label column,
# use it.
#
# Otherwise derive labels from Crime_Count using
# project-wide quantiles.
# ============================================================

possible_labels = [
    "Risk_Label",
    "Risk",
    "Risk_Level",
    "risk_level",
    "Label"
]

label_column = None

for col in possible_labels:

    if col in df.columns:

        label_column = col
        break


if label_column is not None:

    print(
        f"Using existing label column: {label_column}"
    )

    print("Original risk labels:")
    print(df[label_column].value_counts(dropna=False))

    # Convert textual risk labels to model classes
    risk_mapping = {
        "Low": 0,
        "low": 0,
        "LOW": 0,

        "Medium": 1,
        "medium": 1,
        "MEDIUM": 1,

        "High": 2,
        "high": 2,
        "HIGH": 2
    }

    df["Target"] = (
        df[label_column]
        .astype(str)
        .str.strip()
        .map(risk_mapping)
    )

else:

    print(
        "No existing risk-label column found."
    )

    print(
        "Creating Low/Medium/High labels "
        "from Crime_Count quantiles."
    )

    q_low = df["Crime_Count"].quantile(
        0.333333
    )

    q_high = df["Crime_Count"].quantile(
        0.666667
    )

    def make_label(value):

        if value <= q_low:
            return 0

        elif value <= q_high:
            return 1

        return 2

    df["Target"] = (
        df["Crime_Count"]
        .apply(make_label)
    )

# ============================================================
# REMOVE INVALID LABELS
# ============================================================

df = df.dropna(
    subset=["Target", "Crime_Count"]
).copy()

df["Target"] = (
    df["Target"]
    .astype(int)
)

# Keep only valid classes
df = df[
    df["Target"].isin([0, 1, 2])
].copy()

print("\nClass distribution:")

print(
    df["Target"]
    .value_counts()
    .sort_index()
)

# ============================================================
# NORMALIZE CRIME COUNT
#
# This matches the application prediction pipeline,
# which divides crime counts by MAX_CRIME_VAL.
# ============================================================

max_crime = float(
    df["Crime_Count"].max()
)

if max_crime == 0:

    raise ValueError(
        "Crime_Count maximum is zero."
    )

df["Crime_Normalized"] = (
    df["Crime_Count"] / max_crime
)

# ============================================================
# CREATE 4-WEEK SLIDING WINDOWS
#
# X = previous 4 weeks
# Y = risk class of the following week
# ============================================================

X = []
y = []

for grid_id, group in df.groupby("Grid_ID"):

    group = group.sort_values(
        ["Year", "Week"]
    )

    values = (
        group["Crime_Normalized"]
        .to_numpy(dtype=np.float32)
    )

    labels = (
        group["Target"]
        .to_numpy(dtype=np.int64)
    )

    if len(group) < 5:
        continue

    for i in range(4, len(group)):

        sequence = values[
            i - 4:i
        ]

        target = labels[i]

        X.append(sequence)
        y.append(target)


if len(X) == 0:

    raise ValueError(
        "No 4-week sequences could be created."
    )

X = np.array(
    X,
    dtype=np.float32
)

y = np.array(
    y,
    dtype=np.int64
)

# Required LSTM shape:
# (samples, 4 weeks, 1 feature)

X = X.reshape(
    X.shape[0],
    4,
    1
)

print("\nGenerated sequences:", len(X))
print("X shape:", X.shape)
print("y shape:", y.shape)

# ============================================================
# TRAIN / VALIDATION SPLIT
# ============================================================

X_train, X_val, y_train, y_val = train_test_split(
    X,
    y,
    test_size=VALIDATION_SIZE,
    random_state=SEED,
    stratify=y
)

print("\nTraining samples:", len(X_train))
print("Validation samples:", len(X_val))

# ============================================================
# TORCH DATASETS
# ============================================================

train_dataset = TensorDataset(
    torch.tensor(X_train),
    torch.tensor(y_train)
)

val_dataset = TensorDataset(
    torch.tensor(X_val),
    torch.tensor(y_val)
)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False
)

# ============================================================
# MODEL
# ============================================================

device = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

print("\nDevice:", device)

model = CrimeLSTM().to(device)

criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE
)

# ============================================================
# HISTORY
# ============================================================

train_losses = []
val_losses = []

train_accuracies = []
val_accuracies = []

# ============================================================
# TRAINING
# ============================================================

print("\n========================================")
print("Training LSTM for Performance Curves")
print("========================================")

for epoch in range(EPOCHS):

    # --------------------------------------------------------
    # TRAIN
    # --------------------------------------------------------

    model.train()

    running_loss = 0.0

    correct = 0
    total = 0

    for batch_x, batch_y in train_loader:

        batch_x = batch_x.to(device)
        batch_y = batch_y.to(device)

        optimizer.zero_grad()

        outputs = model(batch_x)

        loss = criterion(
            outputs,
            batch_y
        )

        loss.backward()

        optimizer.step()

        running_loss += (
            loss.item() *
            batch_x.size(0)
        )

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        correct += (
            predictions == batch_y
        ).sum().item()

        total += batch_y.size(0)

    train_loss = (
        running_loss / total
    )

    train_accuracy = (
        100.0 * correct / total
    )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    model.eval()

    val_running_loss = 0.0

    val_correct = 0
    val_total = 0

    with torch.no_grad():

        for batch_x, batch_y in val_loader:

            batch_x = batch_x.to(device)
            batch_y = batch_y.to(device)

            outputs = model(batch_x)

            loss = criterion(
                outputs,
                batch_y
            )

            val_running_loss += (
                loss.item() *
                batch_x.size(0)
            )

            predictions = torch.argmax(
                outputs,
                dim=1
            )

            val_correct += (
                predictions == batch_y
            ).sum().item()

            val_total += batch_y.size(0)

    val_loss = (
        val_running_loss / val_total
    )

    val_accuracy = (
        100.0 * val_correct / val_total
    )

    # Save history

    train_losses.append(train_loss)
    val_losses.append(val_loss)

    train_accuracies.append(
        train_accuracy
    )

    val_accuracies.append(
        val_accuracy
    )

    print(
        f"Epoch {epoch + 1:02d}/{EPOCHS} | "
        f"Train Loss: {train_loss:.4f} | "
        f"Val Loss: {val_loss:.4f} | "
        f"Train Acc: {train_accuracy:.2f}% | "
        f"Val Acc: {val_accuracy:.2f}%"
    )

# ============================================================
# SAVE HISTORY
# ============================================================

history = pd.DataFrame({

    "epoch": range(1, EPOCHS + 1),

    "train_loss": train_losses,

    "validation_loss": val_losses,

    "train_accuracy": train_accuracies,

    "validation_accuracy": val_accuracies

})

history_path = os.path.join(
    OUTPUT_DIR,
    "lstm_training_history.csv"
)

history.to_csv(
    history_path,
    index=False
)

# ============================================================
# LOSS GRAPH
# ============================================================

plt.figure(
    figsize=(10, 6),
    dpi=200
)

plt.plot(
    history["epoch"],
    history["train_loss"],
    marker="o",
    label="Training Loss"
)

plt.plot(
    history["epoch"],
    history["validation_loss"],
    marker="o",
    label="Validation Loss"
)

plt.title(
    "LSTM Training and Validation Loss"
)

plt.xlabel("Epoch")

plt.ylabel("Loss")

plt.grid(
    True,
    alpha=0.25
)

plt.legend()

plt.tight_layout()

loss_path = os.path.join(
    OUTPUT_DIR,
    "lstm_loss_curve.png"
)

plt.savefig(
    loss_path,
    bbox_inches="tight"
)

plt.close()

# ============================================================
# ACCURACY GRAPH
# ============================================================

plt.figure(
    figsize=(10, 6),
    dpi=200
)

plt.plot(
    history["epoch"],
    history["train_accuracy"],
    marker="o",
    label="Training Accuracy"
)

plt.plot(
    history["epoch"],
    history["validation_accuracy"],
    marker="o",
    label="Validation Accuracy"
)

plt.title(
    "LSTM Training and Validation Accuracy"
)

plt.xlabel("Epoch")

plt.ylabel("Accuracy (%)")

plt.ylim(0, 100)

plt.grid(
    True,
    alpha=0.25
)

plt.legend()

plt.tight_layout()

accuracy_path = os.path.join(
    OUTPUT_DIR,
    "lstm_accuracy_curve.png"
)

plt.savefig(
    accuracy_path,
    bbox_inches="tight"
)

plt.close()

# ============================================================
# FINAL OUTPUT
# ============================================================

print("\n========================================")
print("LSTM Performance Visualizations Ready")
print("========================================")

print(
    "Loss graph:",
    loss_path
)

print(
    "Accuracy graph:",
    accuracy_path
)

print(
    "History:",
    history_path
)

print(
    "\nBest validation accuracy:",
    f"{max(val_accuracies):.2f}%"
)

print(
    "Final validation accuracy:",
    f"{val_accuracies[-1]:.2f}%"
)