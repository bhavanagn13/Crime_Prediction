import math
import random
import pandas as pd
import requests
import os

OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving/"

# Load police station coordinates once


# Load police station coordinates once
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

station_df = pd.read_csv(
    os.path.join(
        os.path.dirname(BASE_DIR),
        "metadata",
        "correct_policestation_coords.csv"
    )
)

POLICE_STATIONS = {
    row["UnitName"]: (
        row["Average_Latitude"],
        row["Average_Longitude"]
    )
    for _, row in station_df.iterrows()
}

OSRM_TABLE_URL = "https://router.project-osrm.org/table/v1/driving/"


def get_osrm_distance_matrix(locations):
    """
    Returns a road-distance matrix (in km) using OSRM.
    Falls back to None if the request fails.
    """

    coordinates = ";".join(
        f"{loc['coordinates']['lng']},{loc['coordinates']['lat']}"
        for loc in locations
    )

    url = (
        f"{OSRM_TABLE_URL}{coordinates}"
        "?annotations=distance"
    )

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()

        data = response.json()

        distances = data["distances"]

        # Convert metres → kilometres
        return [
            [
                round(d / 1000, 3) if d is not None else 0
                for d in row
            ]
            for row in distances
        ]

    except Exception as e:
        print(f"OSRM Error: {e}")
        return None


def priority_score(hotspot):
    """
    Calculate priority score for a hotspot.

    Higher score = higher patrol priority.
    """

    risk = hotspot["risk_level"]
    hawkes = hotspot["details"]["hawkes"]

    if risk == 2:
        risk_weight = 100
    elif risk == 1:
        risk_weight = 60
    else:
        risk_weight = 30

    return risk_weight + (10 * hawkes)

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the distance (in kilometers) between two
    latitude/longitude points using the Haversine formula.
    """

    R = 6371  # Earth's radius in kilometers

    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

# Build a distance matrix including the police station (depot).
def build_distance_matrix(police_station, hotspots):
    """
    Builds a distance matrix for one police station and its hotspots.
    Uses OSRM road distances if available.
    Falls back to Haversine if OSRM fails.
    """

    lat, lng = POLICE_STATIONS[police_station]

    depot = {
        "coordinates": {
            "lat": lat,
            "lng": lng
        }
    }

    # Police station + hotspots
    locations = [depot] + hotspots

    print(f"\nBuilding distance matrix for {police_station}")
    print(f"Number of locations: {len(locations)}")

    # Try OSRM
    distance_matrix = get_osrm_distance_matrix(locations)

    if distance_matrix is not None:
        print("✓ Using OSRM road distance matrix")
        return distance_matrix

    print("⚠ OSRM failed. Falling back to Haversine.")

    # Fallback
    n = len(locations)

    distance_matrix = [[0.0] * n for _ in range(n)]

    for i in range(n):

        lat1 = locations[i]["coordinates"]["lat"]
        lon1 = locations[i]["coordinates"]["lng"]

        for j in range(i + 1, n):

            lat2 = locations[j]["coordinates"]["lat"]
            lon2 = locations[j]["coordinates"]["lng"]

            d = haversine_distance(
                lat1,
                lon1,
                lat2,
                lon2
            )

            distance_matrix[i][j] = d
            distance_matrix[j][i] = d

    return distance_matrix

    # n = len(locations)

    # distance_matrix = [[0.0 for _ in range(n)] for _ in range(n)]
    

    # for i in range(n):

    #     lat1 = locations[i]["coordinates"]["lat"]
    #     lon1 = locations[i]["coordinates"]["lng"]

    #     for j in range(i + 1, n):

    #         lat2 = locations[j]["coordinates"]["lat"]
    #         lon2 = locations[j]["coordinates"]["lng"]

    #         distance = haversine_distance(
    #             lat1, lon1,
    #             lat2, lon2
    #         )

    #         distance_matrix[i][j] = distance
    #         distance_matrix[j][i] = distance

    # return distance_matrix

# Generate the initial population for the Genetic Algorithm.
def create_initial_population(hotspots, population_size=50):
    """
    Creates random patrol routes for two vehicles.
    Each hotspot is assigned exactly once.
    """

    population = []

    num_hotspots = len(hotspots)

    hotspot_indices = list(range(num_hotspots))

    for _ in range(population_size):

        # Create a random ordering
        shuffled = hotspot_indices.copy()
        random.shuffle(shuffled)

        # Split approximately equally between two vehicles
        split = len(shuffled) // 2

        vehicle1 = shuffled[:split]
        vehicle2 = shuffled[split:]

        chromosome = [vehicle1, vehicle2]

        population.append(chromosome)

    return population

# Calculate the total distance of a vehicle route.
def route_distance(route, distance_matrix):
    """
    Calculates:
    Police Station -> Hotspots -> Police Station
    """

    if not route:
        return 0

    total_distance = 0

    # Police Station -> First Hotspot
    total_distance += distance_matrix[0][route[0] + 1]

    # Between Hotspots
    for i in range(len(route) - 1):
        total_distance += distance_matrix[
            route[i] + 1
        ][
            route[i + 1] + 1
        ]

    # Last Hotspot -> Police Station
    total_distance += distance_matrix[
        route[-1] + 1
    ][0]

    return total_distance

# Calculate the fitness (cost) of a chromosome.
def fitness(chromosome, distance_matrix, hotspots):
    """
    Lower fitness value indicates a better solution.
    """

    vehicle1, vehicle2 = chromosome

    distance_cost = (
        route_distance(vehicle1, distance_matrix)
        + route_distance(vehicle2, distance_matrix)
    )

    priority_cost = (
        priority_penalty(vehicle1, hotspots)
        + priority_penalty(vehicle2, hotspots)
    )

    balance_cost = balance_penalty(chromosome)

    fitness_value = (
    1.0 * distance_cost
    + 0.05 * priority_cost
    + 2.0 * balance_cost
)

    return fitness_value

# Penalize routes that visit high-risk hotspots late.
def priority_penalty(route, hotspots):
    """
    Lower penalty means high-risk hotspots are visited earlier.
    """

    penalty = 0

    for position, hotspot_index in enumerate(route, start=1):

        hotspot = hotspots[hotspot_index]

        priority = priority_score(hotspot)

        penalty += position * priority

    return penalty

# Penalize unequal distribution of hotspots.
def balance_penalty(chromosome):
    """
    Lower penalty means both vehicles have similar workloads.
    """

    vehicle1, vehicle2 = chromosome

    return abs(len(vehicle1) - len(vehicle2))


# Select one parent using Tournament Selection.
def tournament_selection(population, distance_matrix, hotspots, tournament_size=3):
    """
    Selects the best chromosome from a randomly chosen group.
    """

    # Randomly choose chromosomes
    tournament = random.sample(population, tournament_size)

    # Find chromosome with minimum fitness
    winner = min(
        tournament,
        key=lambda chromosome: fitness(
            chromosome,
            distance_matrix,
            hotspots
        )
    )

    return winner

# Create one child using repair-based crossover.
def crossover(parent1, parent2):
    """
    Combines two parents into one valid child.
    """

    # Flatten parents
    p1 = parent1[0] + parent1[1]
    p2 = parent2[0] + parent2[1]

    child = []

    split = len(p1) // 2

    # Copy first half from Parent 1
    child.extend(p1[:split])

    # Fill remaining genes from Parent 2
    for gene in p2:
        if gene not in child:
            child.append(gene)

    # Split child into two vehicle routes
    split = len(child) // 2

    vehicle1 = child[:split]
    vehicle2 = child[split:]

    return [vehicle1, vehicle2]

# Randomly swap two hotspots in a chromosome.
def mutation(chromosome, mutation_rate=0.1):
    """
    Performs swap mutation on a chromosome.
    """

    # Create a copy so original chromosome isn't modified
    child = [
        chromosome[0][:],
        chromosome[1][:]
    ]

    # Flatten both vehicle routes
    genes = child[0] + child[1]

    # Apply mutation based on probability
    if random.random() < mutation_rate:

        i, j = random.sample(range(len(genes)), 2)

        genes[i], genes[j] = genes[j], genes[i]

    # Split back into two vehicles
    split = len(child[0])

    child[0] = genes[:split]
    child[1] = genes[split:]

    return child

# Run the Genetic Algorithm and return the best chromosome.
def genetic_algorithm(
    hotspots,
    distance_matrix,
    population_size=50,
    generations=100
):
    """
    Optimizes patrol routes using a Genetic Algorithm.
    """

    # Create initial population
    population = create_initial_population(
        hotspots,
        population_size
    )

    # Evolution loop
    for _ in range(generations):

        elite = min(
            population,
            key=lambda chromosome: fitness(
                chromosome,
                distance_matrix,
                hotspots
            )
        )

        new_population = [elite]

        while len(new_population) < population_size:

            # Select parents
            parent1 = tournament_selection(
                population,
                distance_matrix,
                hotspots
            )

            parent2 = tournament_selection(
                population,
                distance_matrix,
                hotspots
            )

            # Generate child
            child = crossover(parent1, parent2)

            # Mutate child
            child = mutation(child)

            new_population.append(child)

        #STEP 2: Preserve the elite chromosome
        new_population[0] = elite

        # Replace old population
        population = new_population

        population = new_population

    # Return best chromosome
    best = min(
        population,
        key=lambda chromosome: fitness(
            chromosome,
            distance_matrix,
            hotspots
        )
    )

    return best
def get_osrm_route(coordinates):
    """
    Returns the road geometry for a sequence of coordinates.
    """

    if len(coordinates) < 2:
        return coordinates, 0, 0

    coord_string = ";".join(
        f"{lng},{lat}"
        for lat, lng in coordinates
    )

    url = (
        f"{OSRM_ROUTE_URL}{coord_string}"
        "?overview=full&geometries=geojson"
    )

    try:

        response = requests.get(url, timeout=20)
        response.raise_for_status()

        data = response.json()

        route = data["routes"][0]

        geometry = [
            [lat, lng]
            for lng, lat in route["geometry"]["coordinates"]
        ]

        return (
            geometry,
            route["distance"] / 1000,
            route["duration"] / 60
        )

    except Exception as e:

        print("OSRM Route API failed:", e)

        return coordinates, 0, 0
# Optimize patrol routes for one police station.
def optimize_routes(
    police_station,
    hotspots,
    population_size=50,
    generations=100
):
    """
    Returns optimized routes for two patrol vehicles.
    """

    # No optimization needed
    if len(hotspots) <= 1:

       ps_lat, ps_lng = POLICE_STATIONS[police_station]

       geometry = [
        [ps_lat, ps_lng]
       ]

       geometry.extend([
        [h["coordinates"]["lat"], h["coordinates"]["lng"]]
        for h in hotspots
      ])

       return {
        "Vehicle 1": {
            "stops": hotspots,
            "geometry": geometry,
            "distance_km": 0,
            "duration_min": 0,
            "police_station": {
                "name": police_station,
                "lat": ps_lat,
                "lng": ps_lng
            }
        },
        "Vehicle 2": {
            "stops": [],
            "geometry": [],
            "distance_km": 0,
            "duration_min": 0,
            "police_station": {
                "name": police_station,
                "lat": ps_lat,
                "lng": ps_lng
            }
        }
    }
    # Build depot-based distance matrix
    distance_matrix = build_distance_matrix(
        police_station,
        hotspots
    )

    # Run Genetic Algorithm
    best = genetic_algorithm(
        hotspots,
        distance_matrix,
        population_size,
        generations
    )

    vehicle1, vehicle2 = best

    # Convert indices back to hotspot dictionaries
    route1 = [hotspots[i] for i in vehicle1]
    route2 = [hotspots[i] for i in vehicle2]
    def build_vehicle(route):

    # Police station coordinates
      ps_lat, ps_lng = POLICE_STATIONS[police_station]

    # Start the route from the police station
      coordinates = [
        (ps_lat, ps_lng)
     ]

    # Then visit each hotspot
      coordinates.extend(
        (
            hotspot["coordinates"]["lat"],
            hotspot["coordinates"]["lng"]
        )
        for hotspot in route
    )

      geometry, distance, duration = get_osrm_route(coordinates)
      print("=" * 50)
      print("Station:", police_station)
      print("Police Station Coordinates:", ps_lat, ps_lng)
      print("Route length:", len(route))
      print("=" * 50)

      return {
        "stops": route,
        "geometry": geometry,
        "distance_km": round(distance, 2),
        "duration_min": round(duration, 1),
        "police_station": {
        "name": police_station,
        "lat": ps_lat,
        "lng": ps_lng
    }
      }

    return {
        "Vehicle 1": build_vehicle(route1),
        "Vehicle 2": build_vehicle(route2)
    }