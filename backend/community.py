from flask import Blueprint, request, jsonify
from location_service import (
    search_locations,
    get_nearest_police_station
)
from report_service import (
    get_priority,
    save_citizen_report,
    get_reports_by_station,  update_report_status
)


community_bp = Blueprint("community", __name__)


@community_bp.route("/locations/search", methods=["GET"])
def location_search():

    query = request.args.get("q", "").strip()

    if not query:
        return jsonify([])

    locations = search_locations(query)

    return jsonify(locations)

@community_bp.route("/citizen/report", methods=["POST"])
def submit_citizen_report():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is missing."}), 400

    address = data.get("address", "").strip()
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    category = data.get("category", "").strip()
    description = data.get("description", "").strip()

    if not address:
      return jsonify({"error": "Address is required."}), 400

    if latitude is None or longitude is None:
       return jsonify({
        "error": "Latitude and longitude are required."
    }), 400

    if not category:
        return jsonify({"error": "Category is required."}), 400

    if not description:
        return jsonify({"error": "Description is required."}), 400

    location = get_nearest_police_station(
    float(latitude),
    float(longitude)
)

    if location is None:
      return jsonify({
        "error": "Unable to determine nearest police station."
    }), 404

    priority = get_priority(category)

    report_id = save_citizen_report(
    address=address,
    location_name=address,
    latitude=float(latitude),
    longitude=float(longitude),
    police_station=location["police_station"],
    category=category,
    description=description,
    priority=priority
)
    if report_id is None:
        return jsonify({"error": "Unable to save report."}), 500

    return jsonify({
        "message": "Citizen report submitted successfully.",
        "report_id": report_id
    }), 201

@community_bp.route("/police/reports", methods=["GET"])
def police_reports():

    station = request.args.get("station", "").strip()

    if not station:
        return jsonify({
            "error": "Police station is required."
        }), 400

    reports = get_reports_by_station(station)

    if reports is None:
        return jsonify({
            "error": "Unable to fetch reports."
        }), 500

    return jsonify(reports), 200

@community_bp.route("/police/report/<int:report_id>/status", methods=["PATCH"])
def change_report_status(report_id):

    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is missing."}), 400

    status = data.get("status", "").strip().upper()

    allowed_statuses = {
        "PENDING",
        "IN_PROGRESS",
        "RESOLVED"
    }

    if status not in allowed_statuses:
        return jsonify({
            "error": "Invalid status."
        }), 400

    updated = update_report_status(report_id, status)

    if not updated:
        return jsonify({
            "error": "Report not found."
        }), 404

    return jsonify({
        "message": "Status updated successfully."
    }), 200