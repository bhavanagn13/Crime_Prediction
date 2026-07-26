from collections import defaultdict
from patrol_vrp import optimize_routes

def recommend_patrols(predictions, police_station):
    """
    Generates optimized patrol routes for one police station.
    """

    hotspots = [

        prediction

        for prediction in predictions

        if (
            prediction["police_station"] == police_station
            and prediction["risk_level"] > 0
        )
    ]

    return optimize_routes(
        police_station,
        hotspots
    )