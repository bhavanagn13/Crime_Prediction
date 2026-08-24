import mysql.connector
from mysql.connector import Error

from config import MYSQL_CONFIG


def get_connection():

    try:

        connection = mysql.connector.connect(
            **MYSQL_CONFIG
        )

        if connection.is_connected():

            print("Connected to MySQL")

        return connection

    except Error as e:

        print(f"Database Connection Error: {e}")

        return None


def ensure_application_schema():

    """
    Create/upgrade the tables required by the current application.
    Existing data is preserved.
    """

    conn = get_connection()

    if conn is None:
        return

    cursor = conn.cursor()

    try:

        # ======================================================
        # CITIZEN REPORTS
        # ======================================================

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS citizen_reports (

                report_id INT AUTO_INCREMENT PRIMARY KEY,

                user_id INT NULL,

                address VARCHAR(500) NULL,

                location_name VARCHAR(255) NOT NULL,

                latitude DECIMAL(10,7),

                longitude DECIMAL(10,7),

                nearest_police_station VARCHAR(150),

                category VARCHAR(100) NOT NULL,

                description TEXT,

                priority ENUM(
                    'LOW',
                    'MEDIUM',
                    'HIGH',
                    'REVIEW'
                )
                DEFAULT 'MEDIUM',

                status ENUM(
                    'PENDING',
                    'IN_PROGRESS',
                    'RESOLVED',
                    'REJECTED'
                )
                DEFAULT 'PENDING',

                phone_number VARCHAR(30) NULL,

                email VARCHAR(255) NULL,

                validated BOOLEAN NOT NULL DEFAULT FALSE,

                reported_at TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP

            )
            """
        )


        # ======================================================
        # UPGRADE EXISTING TABLE
        # ======================================================

        cursor.execute(
            "SHOW COLUMNS FROM citizen_reports"
        )

        columns = {
            row[0]
            for row in cursor.fetchall()
        }


        # user_id

        if "user_id" not in columns:

            cursor.execute(
                """
                ALTER TABLE citizen_reports
                ADD COLUMN user_id INT NULL
                AFTER report_id
                """
            )


        # address

        if "address" not in columns:

            cursor.execute(
                """
                ALTER TABLE citizen_reports
                ADD COLUMN address VARCHAR(500) NULL
                AFTER report_id
                """
            )


        # phone number

        if "phone_number" not in columns:

            cursor.execute(
                """
                ALTER TABLE citizen_reports
                ADD COLUMN phone_number VARCHAR(30) NULL
                """
            )


        # email

        if "email" not in columns:

            cursor.execute(
                """
                ALTER TABLE citizen_reports
                ADD COLUMN email VARCHAR(255) NULL
                """
            )


        # validated flag

        if "validated" not in columns:

            cursor.execute(
                """
                ALTER TABLE citizen_reports
                ADD COLUMN validated BOOLEAN NOT NULL DEFAULT FALSE
                """
            )


        # ======================================================
        # ENUM UPDATES
        # ======================================================

        cursor.execute(
            """
            ALTER TABLE citizen_reports

            MODIFY COLUMN priority
            ENUM(
                'LOW',
                'MEDIUM',
                'HIGH',
                'REVIEW'
            )

            DEFAULT 'MEDIUM'
            """
        )


        cursor.execute(
            """
            ALTER TABLE citizen_reports

            MODIFY COLUMN status
            ENUM(
                'PENDING',
                'IN_PROGRESS',
                'RESOLVED',
                'REJECTED'
            )

            DEFAULT 'PENDING'
            """
        )


        # ======================================================
        # POLICE ALERTS
        # ======================================================

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS police_alerts (

                alert_id INT AUTO_INCREMENT PRIMARY KEY,

                title VARCHAR(255),

                message TEXT,

                location_name VARCHAR(255),

                latitude DECIMAL(10,7),

                longitude DECIMAL(10,7),

                police_station VARCHAR(150),

                created_at TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP

            )
            """
        )


        conn.commit()

        print(
            "Application database schema verified."
        )

    except Error as e:

        conn.rollback()

        print(
            f"Schema initialization error: {e}"
        )

    finally:

        cursor.close()
        conn.close()