from db import get_connection


# ==========================================================
# PRIORITY
# ==========================================================

def get_priority(category):

    priority_map = {

        "Suspicious Activity": "HIGH",
        "Harassment": "HIGH",
        "Drug Activity": "HIGH",

        "Poor Streetlight": "MEDIUM",
        "Broken CCTV": "MEDIUM",
        "Unsafe Area": "MEDIUM",
        "Public Drinking": "MEDIUM",

        "Abandoned Vehicle": "LOW",
        "Traffic Signal Issue": "LOW",

        "Other": "REVIEW"
    }

    return priority_map.get(
        category,
        "REVIEW"
    )


# ==========================================================
# SAVE CITIZEN REPORT
# ==========================================================

def save_citizen_report(
    address,
    location_name,
    latitude,
    longitude,
    police_station,
    category,
    description,
    priority,
    phone_number=None,
    email=None,
    user_id=None
):

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor()

    try:

        query = """
            INSERT INTO citizen_reports
            (
                address,
                location_name,
                latitude,
                longitude,
                nearest_police_station,
                category,
                description,
                priority,
                phone_number,
                email,
                user_id
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """

        values = (
            address,
            location_name,
            latitude,
            longitude,
            police_station,
            category,
            description,
            priority,
            phone_number,
            email,
            user_id
        )

        cursor.execute(query, values)

        conn.commit()

        return cursor.lastrowid

    except Exception as e:

        conn.rollback()

        print(
            f"Error saving citizen report: {e}"
        )

        return None

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# GET REPORTS BY POLICE STATION
# ==========================================================

def get_reports_by_station(police_station):

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    try:

        query = """
            SELECT

                cr.report_id,
                cr.user_id,

                cr.address,
                cr.location_name,
                cr.latitude,
                cr.longitude,
                cr.nearest_police_station,

                cr.category,
                cr.description,
                cr.priority,
                cr.status,

                cr.phone_number,

                cr.email AS report_email,

                cr.validated,

                u.name AS citizen_name,

                u.email AS citizen_account_email,

                cr.reported_at

            FROM citizen_reports AS cr

            LEFT JOIN users AS u
                ON cr.user_id = u.user_id

            WHERE cr.nearest_police_station = %s

            ORDER BY
                FIELD(
                    cr.priority,
                    'HIGH',
                    'MEDIUM',
                    'LOW',
                    'REVIEW'
                ),
                cr.reported_at DESC
        """

        cursor.execute(
            query,
            (police_station,)
        )

        reports = cursor.fetchall()

        # --------------------------------------------------
        # Normalize email field expected by frontend
        # --------------------------------------------------

        for report in reports:

            if not report.get("report_email"):

                report["report_email"] = report.get(
                    "citizen_account_email"
                )

            # Frontend expects report.email
            report["email"] = report.get(
                "report_email"
            )

            # Convert MySQL BOOLEAN/TINYINT to Python bool
            report["validated"] = bool(
                report.get("validated", False)
            )

        return reports

    except Exception as e:

        print(
            f"Error fetching reports by station: {e}"
        )

        return None

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# CITIZEN — MY REPORTS
# ==========================================================

def get_reports_for_user(user_id):

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT

                report_id,
                address,
                location_name,
                latitude,
                longitude,
                nearest_police_station,
                category,
                description,
                priority,
                status,
                phone_number,
                email,
                validated,
                reported_at

            FROM citizen_reports

            WHERE user_id = %s

            ORDER BY reported_at DESC
            """,
            (user_id,)
        )

        reports = cursor.fetchall()

        for report in reports:

            report["validated"] = bool(
                report.get("validated", False)
            )

        return reports

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# PUBLIC COMMUNITY REPORTS
# ==========================================================

def get_public_community_reports():

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT

                report_id,
                location_name,
                latitude,
                longitude,
                category,
                description,
                priority,
                status,
                reported_at

            FROM citizen_reports

            ORDER BY reported_at DESC
            """
        )

        return cursor.fetchall()

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# UPDATE REPORT STATUS
# ==========================================================

def update_report_status(
    report_id,
    status,
    police_station=None
):

    conn = get_connection()

    if conn is None:
        return False

    cursor = conn.cursor()

    try:

        # --------------------------------------------------
        # POLICE
        # --------------------------------------------------

        if police_station:

            query = """
                UPDATE citizen_reports

                SET status = %s

                WHERE report_id = %s

                AND nearest_police_station = %s
            """

            values = (
                status,
                report_id,
                police_station
            )

        # --------------------------------------------------
        # ADMIN
        # --------------------------------------------------

        else:

            query = """
                UPDATE citizen_reports

                SET status = %s

                WHERE report_id = %s
            """

            values = (
                status,
                report_id
            )

        cursor.execute(
            query,
            values
        )

        conn.commit()

        return cursor.rowcount > 0

    except Exception as e:

        conn.rollback()

        print(
            f"Error updating report status: {e}"
        )

        return False

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# VALIDATE REPORT
# ==========================================================

def validate_report(
    report_id,
    police_station=None
):

    conn = get_connection()

    if conn is None:
        return False

    cursor = conn.cursor(dictionary=True)

    try:

        # --------------------------------------------------
        # First check that the report exists and belongs
        # to the correct station.
        # --------------------------------------------------

        if police_station:

            cursor.execute(
                """
                SELECT
                    report_id,
                    validated

                FROM citizen_reports

                WHERE report_id = %s

                AND nearest_police_station = %s
                """,
                (
                    report_id,
                    police_station
                )
            )

        else:

            cursor.execute(
                """
                SELECT
                    report_id,
                    validated

                FROM citizen_reports

                WHERE report_id = %s
                """,
                (report_id,)
            )

        report = cursor.fetchone()

        if not report:

            return False

        # Already validated.
        # Treat this as success so the endpoint is idempotent.
        if report["validated"]:

            return True

        # --------------------------------------------------
        # Validate
        # --------------------------------------------------

        if police_station:

            cursor.execute(
                """
                UPDATE citizen_reports

                SET validated = TRUE

                WHERE report_id = %s

                AND nearest_police_station = %s
                """,
                (
                    report_id,
                    police_station
                )
            )

        else:

            cursor.execute(
                """
                UPDATE citizen_reports

                SET validated = TRUE

                WHERE report_id = %s
                """,
                (report_id,)
            )

        conn.commit()

        return True

    except Exception as e:

        conn.rollback()

        print(
            f"Error validating report: {e}"
        )

        return False

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# DELETE RESOLVED REPORT
# ==========================================================

def delete_resolved_report(
    report_id,
    police_station=None
):

    conn = get_connection()

    if conn is None:

        return {
            "success": False,
            "error": "Database connection failed."
        }

    cursor = conn.cursor(dictionary=True)

    try:

        # --------------------------------------------------
        # FIRST CHECK THE REPORT
        # --------------------------------------------------

        if police_station:

            cursor.execute(
                """
                SELECT
                    report_id,
                    status,
                    nearest_police_station

                FROM citizen_reports

                WHERE report_id = %s

                AND nearest_police_station = %s
                """,
                (
                    report_id,
                    police_station
                )
            )

        else:

            cursor.execute(
                """
                SELECT
                    report_id,
                    status,
                    nearest_police_station

                FROM citizen_reports

                WHERE report_id = %s
                """,
                (report_id,)
            )

        report = cursor.fetchone()

        # --------------------------------------------------
        # REPORT DOES NOT EXIST / ACCESS DENIED
        # --------------------------------------------------

        if not report:

            return {
                "success": False,
                "error": "Report not found or access denied."
            }

        # --------------------------------------------------
        # ONLY RESOLVED REPORTS CAN BE DELETED
        # --------------------------------------------------

        if report["status"] != "RESOLVED":

            return {
                "success": False,
                "error": "Only resolved reports can be deleted."
            }

        # --------------------------------------------------
        # DELETE
        # --------------------------------------------------

        if police_station:

            cursor.execute(
                """
                DELETE FROM citizen_reports

                WHERE report_id = %s

                AND nearest_police_station = %s

                AND status = 'RESOLVED'
                """,
                (
                    report_id,
                    police_station
                )
            )

        else:

            cursor.execute(
                """
                DELETE FROM citizen_reports

                WHERE report_id = %s

                AND status = 'RESOLVED'
                """,
                (report_id,)
            )

        conn.commit()

        if cursor.rowcount == 0:

            return {
                "success": False,
                "error": "Report could not be deleted."
            }

        return {
            "success": True,
            "message": "Resolved report deleted successfully.",
            "report_id": report_id
        }

    except Exception as e:

        conn.rollback()

        print(
            f"Error deleting resolved report: {e}"
        )

        return {
            "success": False,
            "error": "Unable to delete report."
        }

    finally:

        cursor.close()
        conn.close()