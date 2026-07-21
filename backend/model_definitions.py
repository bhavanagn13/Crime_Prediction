import torch
import torch.nn as nn
import torch.nn.functional as F

from torch_geometric.nn import GCNConv

class CrimeLSTM(nn.Module):

    def __init__(self):
        super(CrimeLSTM, self).__init__()

        self.lstm = nn.LSTM(
            input_size=1,
            hidden_size=64,
            num_layers=1,
            batch_first=True
        )

        self.dropout = nn.Dropout(0.3)

        self.fc = nn.Linear(64, 3)

    def forward(self, x):
        # Add this print to debug what is happening during the demo
        # print(f"DEBUG: Input shape entering forward: {x.shape}")
        
        # BRUTE FORCE FIX:
        # If the input is 4D (1, 1, 4, 1), this turns it into (1, 4, 1)
        if x.dim() == 4:
            x = x.squeeze(1) 
        
        # Now pass to LSTM
        output, (hidden, cell) = self.lstm(x)
        # ... rest of your code ...

        output, (hidden, cell) = self.lstm(x)

        hidden = hidden[-1]

        hidden = self.dropout(hidden)

        output = self.fc(hidden)

        return output
    
class CrimeGCN(torch.nn.Module):
    # Change the signature to accept in_channels
    def __init__(self, in_channels=5): 
        super().__init__()
        # Use the variable instead of the hardcoded 7
        self.conv1 = GCNConv(in_channels, 32)
        self.conv2 = GCNConv(32, 16)
        self.fc = torch.nn.Linear(16, 3)

    def forward(self, data):
        x = data.x
        edge_index = data.edge_index

        x = self.conv1(x, edge_index)
        x = F.relu(x)

        x = self.conv2(x, edge_index)
        x = F.relu(x)

        x = self.fc(x)
        return x