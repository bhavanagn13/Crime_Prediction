from db import get_connection

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

    return priority_map.get(category, "REVIEW")

def save_citizen_report(
    address,
    location_name,
    latitude,
    longitude,
    police_station,
    category,
    description,
    priority
):
    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor()

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
    priority
)
        VALUES
        (%s,%s,%s,%s,%s,%s,%s,%s)
    """

    values = (
    address,
    location_name,
    latitude,
    longitude,
    police_station,
    category,
    description,
    priority
)

    cursor.execute(query, values)

    conn.commit()

    report_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return report_id

def get_reports_by_station(police_station):
    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    query = """
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
        WHERE nearest_police_station = %s
        ORDER BY
            FIELD(priority,'HIGH','MEDIUM','LOW','REVIEW'),
            reported_at DESC
    """

    cursor.execute(query, (police_station,))

    reports = cursor.fetchall()

    cursor.close()
    conn.close()

    return reports

def update_report_status(report_id, status):
    conn = get_connection()

    if conn is None:
        return False

    cursor = conn.cursor()

    query = """
        UPDATE citizen_reports
        SET status = %s
        WHERE report_id = %s
    """

    cursor.execute(query, (status, report_id))
    conn.commit()

    updated = cursor.rowcount > 0

    cursor.close()
    conn.close()

    return updated