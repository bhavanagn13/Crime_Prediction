"""
PLOT PATROL OPTIMIZER EVALUATION

IMPORTANT:
This script does NOT rerun the patrol optimizer or OSRM.
It reads the already-generated:
    evaluation_results/patrol_overall_evaluation.csv

It fixes the previous graphing mistake:
    - Baseline is NOT forced to 100 for every case.
    - A SINGLE common reference is used for all cases.
    - Baseline therefore varies from case to case.
    - GA varies from case to case.
    - No police-station names are shown.
    - No raw distances are shown on the graph.

The common reference is the MEAN BASELINE route cost across all
evaluated cases.

Example:
    if mean baseline = 100 km

    baseline cases:
        80 km  -> 80%
        120 km -> 120%
        95 km  -> 95%

    GA cases:
        60 km  -> 60%
        100 km -> 100%
        75 km  -> 75%

Thus the two lines are genuinely comparable across cases.

Run from backend:
    python plot_patrol_evaluation.py
"""

from pathlib import Path
import csv
import matplotlib.pyplot as plt


RESULTS_DIR = Path("evaluation_results")
CSV_PATH = RESULTS_DIR / "patrol_overall_evaluation.csv"

GRAPH_PATH = RESULTS_DIR / "patrol_overall_comparison.png"
IMPROVEMENT_PATH = RESULTS_DIR / "patrol_improvement_trend.png"


# ------------------------------------------------------------
# READ EXISTING RESULTS
# ------------------------------------------------------------

if not CSV_PATH.exists():
    raise FileNotFoundError(
        f"Could not find {CSV_PATH}. "
        "Run the patrol evaluation first."
    )


rows = []

with CSV_PATH.open(
    "r",
    encoding="utf-8",
    newline=""
) as f:

    reader = csv.DictReader(f)

    required = {
        "Evaluation_Case",
        "Baseline_Route_Cost",
        "GA_Route_Cost",
        "Improvement_Percent",
    }

    missing = required - set(reader.fieldnames or [])

    if missing:
        raise RuntimeError(
            "CSV is missing required columns: "
            + ", ".join(sorted(missing))
        )

    for row in reader:
        rows.append({
            "case": int(row["Evaluation_Case"]),
            "baseline": float(row["Baseline_Route_Cost"]),
            "ga": float(row["GA_Route_Cost"]),
            "improvement": float(row["Improvement_Percent"]),
        })


if not rows:
    raise RuntimeError("The evaluation CSV contains no results.")


# ------------------------------------------------------------
# COMMON NORMALIZATION
# ------------------------------------------------------------
#
# DO NOT normalize each case separately.
#
# One common reference is calculated from ALL baseline values.
# This keeps the baseline line variable across cases.
# ------------------------------------------------------------

mean_baseline = sum(
    r["baseline"] for r in rows
) / len(rows)

if mean_baseline <= 0:
    raise RuntimeError(
        "Mean baseline route cost must be greater than zero."
    )


cases = [r["case"] for r in rows]

baseline_relative = [
    (r["baseline"] / mean_baseline) * 100
    for r in rows
]

ga_relative = [
    (r["ga"] / mean_baseline) * 100
    for r in rows
]


# ------------------------------------------------------------
# GRAPH 1
# BASELINE vs OUR GENETIC ALGORITHM
# ------------------------------------------------------------

plt.figure(figsize=(11, 6))

plt.plot(
    cases,
    baseline_relative,
    marker="o",
    linewidth=2,
    label="Baseline Algorithm",
)

plt.plot(
    cases,
    ga_relative,
    marker="o",
    linewidth=2,
    label="Our Genetic Algorithm",
)

# 100% represents the average baseline across all cases.
plt.axhline(
    100,
    linewidth=1,
    alpha=0.25,
)

plt.xlabel("Evaluation Case")
plt.ylabel("Relative Route Cost (%)")

plt.title(
    "Patrol Route Optimization: Baseline vs Genetic Algorithm"
)

plt.xticks(cases)

plt.legend()

plt.grid(alpha=0.25)

plt.tight_layout()

plt.savefig(
    GRAPH_PATH,
    dpi=200,
    bbox_inches="tight",
)

plt.close()


# ------------------------------------------------------------
# GRAPH 2
# IMPROVEMENT TREND
# ------------------------------------------------------------

improvements = [
    r["improvement"]
    for r in rows
]

average_improvement = (
    sum(improvements) / len(improvements)
)

plt.figure(figsize=(11, 6))

plt.plot(
    cases,
    improvements,
    marker="o",
    linewidth=2,
    label="Route Improvement",
)

plt.axhline(
    average_improvement,
    linewidth=1,
    alpha=0.35,
    label=f"Average Improvement ({average_improvement:.2f}%)",
)

plt.axhline(
    0,
    linewidth=1,
    alpha=0.25,
)

plt.xlabel("Evaluation Case")
plt.ylabel("Improvement (%)")

plt.title(
    "Patrol Optimization Improvement Across Evaluation Cases"
)

plt.xticks(cases)

plt.legend()

plt.grid(alpha=0.25)

plt.tight_layout()

plt.savefig(
    IMPROVEMENT_PATH,
    dpi=200,
    bbox_inches="tight",
)

plt.close()


# ------------------------------------------------------------
# CONSOLE OUTPUT
# ------------------------------------------------------------

print("=" * 70)
print("PATROL OPTIMIZATION GRAPHS GENERATED")
print("=" * 70)

print(f"Evaluation cases        : {len(rows)}")
print(f"Common baseline reference: {mean_baseline:.2f}")
print(f"Average improvement      : {average_improvement:.2f}%")

print("\nGenerated:")
print(f"  {GRAPH_PATH}")
print(f"  {IMPROVEMENT_PATH}")

print("\nIMPORTANT:")
print("Baseline is NOT fixed at 100% per case.")
print(
    "100% now represents the average baseline across ALL "
    "evaluation cases."
)
print(
    "Therefore both lines vary and can be compared across cases."
)

print("=" * 70)
