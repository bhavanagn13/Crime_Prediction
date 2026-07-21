from model_loader import load_lstm_model, load_gcn_model, load_hawkes_dataset, load_graph

# 1. Load everything once (Global scope)
print("Initializing Prediction Engine...")
lstm_model = load_lstm_model()
gcn_model = load_gcn_model()
hawkes_df = load_hawkes_dataset()
gcn_graph, node_df = load_graph()

def get_final_risk(grid_id):
    # 2. Get predictions
    # Note: Ensure your models have a .predict() method or call forward() 
    # For GCN, you'll need the index from node_df
    
    # Example logic for GCN lookup:
    idx = node_df[node_df['Grid_ID'] == grid_id].index[0]
    gcn_out = gcn_model(gcn_graph)
    gcn_pred = gcn_out[idx].argmax().item()
    
    # Example logic for LSTM lookup:
    lstm_pred = lstm_model.predict(grid_id) 
    
    # Example logic for Hawkes lookup:
    hawkes_score = hawkes_df[hawkes_df['Grid_ID'] == grid_id]['Hawkes_Intensity'].values[0]
    
    # 3. Fuse
    return fuse_predictions(lstm_pred, gcn_pred, hawkes_score)

def fuse_predictions(lstm_prediction, gcn_prediction, hawkes_score):
    if hawkes_score >= 5 and (lstm_prediction == 2 or gcn_prediction == 2):
        return 2
    if lstm_prediction == gcn_prediction:
        return lstm_prediction
    if 2 in [lstm_prediction, gcn_prediction]:
        return 2
    if 1 in [lstm_prediction, gcn_prediction]:
        return 1
    return 0