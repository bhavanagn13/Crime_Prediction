def recommend_patrols(predictions, available_patrols=5):

    # Sort by GCN prediction first, then Hawkes score
    ranked = sorted(
        predictions,
        key=lambda x: (
            x["gcn_prediction"],
            x["hawkes_score"]
        ),
        reverse=True
    )

    recommendations = []

    for priority, item in enumerate(ranked[:available_patrols], start=1):

        if item["gcn_prediction"] == 2:
            risk = "HIGH"
        elif item["gcn_prediction"] == 1:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        recommendations.append({
            "priority": priority,
            "grid_id": item["grid_id"],
            "risk": risk,
            "gcn_prediction": item["gcn_prediction"],
            "hawkes_score": round(item["hawkes_score"], 2)
        })

    return recommendations