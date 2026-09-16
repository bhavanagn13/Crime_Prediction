from flask import Blueprint, request, jsonify

from location_service import (
    search_locations,
    get_nearest_police_station
)

from auth import (
    role_required,
    get_current_user
)

from report_service import (
    get_priority,
    save_citizen_report,
    get_reports_by_station,
    get_reports_for_user,
    get_public_community_reports,
    update_report_status,
    validate_report,
    delete_resolved_report
)


community_bp = Blueprint(
    "community",
    __name__
)


# ==========================================================
# LOCATION SEARCH
# ==========================================================

@community_bp.route(
    "/locations/search",
    methods=["GET"]
)
def location_search():

    query = request.args.get(
        "q",
        ""
    ).strip()

    if not query:

        return jsonify([])

    locations = search_locations(query)

    return jsonify(locations)


# ==========================================================
# CITIZEN — SUBMIT REPORT
# ==========================================================

@community_bp.route(
    "/citizen/report",
    methods=["POST"]
)
@role_required("CITIZEN")
def submit_citizen_report():

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "Request body is missing."
        }), 400

    address = data.get(
        "address",
        ""
    ).strip()

    latitude = data.get("latitude")

    longitude = data.get("longitude")

    category = data.get(
        "category",
        ""
    ).strip()

    description = data.get(
        "description",
        ""
    ).strip()

    phone_number = data.get(
        "phone_number",
        ""
    ).strip()

    email = data.get(
        "email",
        ""
    ).strip()

    # ------------------------------------------------------
    # AUTHENTICATED CITIZEN
    # ------------------------------------------------------

    user = get_current_user()

    if user is None:

        return jsonify({
            "error": "Authentication required."
        }), 401

    user_id = user.get("user_id")

    # ------------------------------------------------------
    # VALIDATION
    # ------------------------------------------------------

    if not address:

        return jsonify({
            "error": "Address is required."
        }), 400

    if latitude is None or longitude is None:

        return jsonify({
            "error": "Latitude and longitude are required."
        }), 400

    if not category:

        return jsonify({
            "error": "Category is required."
        }), 400

    if not description:

        return jsonify({
            "error": "Description is required."
        }), 400

    if not phone_number:

        return jsonify({
            "error": "Phone number is required."
        }), 400

    if not email:

        return jsonify({
            "error": "Email address is required."
        }), 400

    # ------------------------------------------------------
    # FIND NEAREST POLICE STATION
    # ------------------------------------------------------

    try:

        location = get_nearest_police_station(
            float(latitude),
            float(longitude)
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "error": "Invalid latitude or longitude."
        }), 400

    if location is None:

        return jsonify({
            "error": "Unable to determine nearest police station."
        }), 404

    # ------------------------------------------------------
    # PRIORITY
    # ------------------------------------------------------

    priority = get_priority(
        category
    )

    # ------------------------------------------------------
    # SAVE
    # ------------------------------------------------------

    report_id = save_citizen_report(

        address=address,

        location_name=address,

        latitude=float(latitude),

        longitude=float(longitude),

        police_station=location[
            "police_station"
        ],

        category=category,

        description=description,

        priority=priority,

        phone_number=phone_number,

        email=email,

        user_id=user_id
    )

    if report_id is None:

        return jsonify({
            "error": "Unable to save report."
        }), 500

    return jsonify({

        "message":
            "Citizen report submitted successfully.",

        "report_id":
            report_id

    }), 201


# ==========================================================
# CITIZEN — COMMUNITY REPORTS
# ==========================================================

@community_bp.route(
    "/citizen/community-reports",
    methods=["GET"]
)
@role_required("CITIZEN")
def citizen_community_reports():

    reports = get_public_community_reports()

    if reports is None:

        return jsonify({
            "error":
                "Unable to fetch community reports."
        }), 500

    return jsonify(
        reports
    ), 200


# ==========================================================
# CITIZEN — MY REPORTS
# ==========================================================

@community_bp.route(
    "/citizen/my-reports",
    methods=["GET"]
)
@role_required("CITIZEN")
def citizen_my_reports():

    user = get_current_user()

    if user is None:

        return jsonify({
            "error": "Authentication required."
        }), 401

    reports = get_reports_for_user(
        user["user_id"]
    )

    if reports is None:

        return jsonify({
            "error":
                "Unable to fetch your reports."
        }), 500

    return jsonify(
        reports
    ), 200


# ==========================================================
# POLICE / ADMIN — VIEW REPORTS
# ==========================================================

@community_bp.route(
    "/police/reports",
    methods=["GET"]
)
@role_required(
    "POLICE",
    "ADMIN"
)
def police_reports():

    user = get_current_user()

    if user is None:

        return jsonify({
            "error": "Authentication required."
        }), 401

    # ------------------------------------------------------
    # POLICE
    # ------------------------------------------------------

    if user["role"] == "POLICE":

        station = user.get(
            "police_station"
        )

        if not station:

            return jsonify({
                "error":
                    "Police station is not assigned to this account."
            }), 400

    # ------------------------------------------------------
    # ADMIN
    # ------------------------------------------------------

    else:

        station = request.args.get(
            "station",
            ""
        ).strip()

        if not station:

            return jsonify({
                "error":
                    "Police station is required for admin."
            }), 400

    reports = get_reports_by_station(
        station
    )

    if reports is None:

        return jsonify({
            "error":
                "Unable to fetch reports."
        }), 500

    return jsonify(
        reports
    ), 200


# ==========================================================
# POLICE / ADMIN — UPDATE STATUS
# ==========================================================

@community_bp.route(
    "/police/report/<int:report_id>/status",
    methods=["PATCH"]
)
@role_required(
    "POLICE",
    "ADMIN"
)
def change_report_status(report_id):

    user = get_current_user()

    if user is None:

        return jsonify({
            "error": "Authentication required."
        }), 401

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "Request body is missing."
        }), 400

    status = data.get(
        "status",
        ""
    ).strip().upper()

    allowed_statuses = {
        "PENDING",
        "IN_PROGRESS",
        "RESOLVED",
        "REJECTED"
    }

    if status not in allowed_statuses:

        return jsonify({
            "error": "Invalid status."
        }), 400

    # ------------------------------------------------------
    # POLICE = OWN STATION ONLY
    # ------------------------------------------------------

    if user["role"] == "POLICE":

        station = user.get(
            "police_station"
        )

        if not station:

            return jsonify({
                "error":
                    "Police station is not assigned to this account."
            }), 400

    # ------------------------------------------------------
    # ADMIN = ALL STATIONS
    # ------------------------------------------------------

    else:

        station = None

    updated = update_report_status(
        report_id,
        status,
        station
    )

    if not updated:

        return jsonify({
            "error":
                "Report not found or access denied."
        }), 404

    return jsonify({
        "message":
            "Status updated successfully."
    }), 200


# ==========================================================
# POLICE — VALIDATE REPORT
# ==========================================================

@community_bp.route(
    "/police/report/<int:report_id>/validate",
    methods=["PATCH"]
)
@role_required("POLICE")
def validate_community_report(report_id):

    user = get_current_user()

    if user is None:

        return jsonify({
            "error": "Authentication required."
        }), 401

    station = user.get(
        "police_station"
    )

    if not station:

        return jsonify({
            "error":
                "Police station is not assigned to this account."
        }), 400

    updated = validate_report(
        report_id,
        station
    )

    if not updated:

        return jsonify({
            "error":
                "Report not found or access denied."
        }), 404

    return jsonify({

        "message":
            "Report validated successfully.",

        "validated":
            True

    }), 200


# ==========================================================
# POLICE / ADMIN — DELETE RESOLVED REPORT
# ==========================================================

@community_bp.route(
    "/police/report/<int:report_id>",
    methods=["DELETE"]
)
@role_required(
    "POLICE",
    "ADMIN"
)
def delete_community_report(report_id):

    user = get_current_user()

    if user is None:

        return jsonify({
            "error": "Authentication required."
        }), 401

    # ------------------------------------------------------
    # POLICE
    # ------------------------------------------------------

    if user["role"] == "POLICE":

        station = user.get(
            "police_station"
        )

        if not station:

            return jsonify({
                "error":
                    "Police station is not assigned to this account."
            }), 400

    # ------------------------------------------------------
    # ADMIN
    # ------------------------------------------------------

    else:

        station = None

    result = delete_resolved_report(
        report_id,
        station
    )

    if not result["success"]:

        return jsonify(result), 400

    return jsonify(result), 200