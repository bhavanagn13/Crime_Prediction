import os
import re
import pandas as pd

from werkzeug.security import generate_password_hash
from db import get_connection


# ==========================================================
# PATHS
# ==========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

STATION_FILE = os.path.join(
    os.path.dirname(BASE_DIR),
    "metadata",
    "correct_policestation_coords.csv"
)

OUTPUT_FILE = os.path.join(
    BASE_DIR,
    "police_credentials.csv"
)


# ==========================================================
# ALREADY CREATED ACCOUNTS
# ==========================================================

SKIP_STATIONS = {
    "Adugodi PS",
    "Mico Layout PS"
}


# ==========================================================
# CREATE SIMPLE USERNAME
# ==========================================================

def make_username(station):

    # Remove "PS" from the end
    name = re.sub(
        r"\s*PS\s*$",
        "",
        station,
        flags=re.IGNORECASE
    )

    # Remove spaces and special characters
    name = re.sub(
        r"[^a-zA-Z0-9]",
        "",
        name
    )

    return name.lower()


# ==========================================================
# CREATE PASSWORD
# ==========================================================

def make_password(username):

    return username + "123"


# ==========================================================
# MAIN
# ==========================================================

print("\n" + "=" * 60)
print("POLICE ACCOUNT CREATION")
print("=" * 60)


# ----------------------------------------------------------
# LOAD POLICE STATIONS
# ----------------------------------------------------------

if not os.path.exists(STATION_FILE):

    raise FileNotFoundError(
        f"\nPolice station file not found:\n"
        f"{STATION_FILE}"
    )


station_df = pd.read_csv(
    STATION_FILE
)


if "UnitName" not in station_df.columns:

    raise ValueError(
        "UnitName column not found in "
        "correct_policestation_coords.csv"
    )


station_df["UnitName"] = (
    station_df["UnitName"]
    .astype(str)
    .str.strip()
)


stations = (
    station_df["UnitName"]
    .dropna()
    .drop_duplicates()
    .tolist()
)


print(
    f"\nPolice stations found: {len(stations)}"
)


# ----------------------------------------------------------
# DATABASE
# ----------------------------------------------------------

conn = get_connection()

if conn is None:

    raise RuntimeError(
        "Could not connect to database."
    )


cursor = conn.cursor(
    dictionary=True
)


# ----------------------------------------------------------
# CREDENTIALS
# ----------------------------------------------------------

credentials = []

created = 0
skipped = 0
existing = 0


try:

    for station in stations:

        # ==================================================
        # SKIP EXISTING STATIONS
        # ==================================================

        if station in SKIP_STATIONS:

            print(
                f"[SKIP] {station}"
            )

            skipped += 1

            continue


        # ==================================================
        # USERNAME
        # ==================================================

        username = make_username(
            station
        )

        password = make_password(
            username
        )


        # ==================================================
        # CHECK EXISTING POLICE ACCOUNT
        # ==================================================

        cursor.execute(
            """
            SELECT
                user_id,
                name,
                email,
                police_station
            FROM users
            WHERE police_station = %s
            AND role = 'POLICE'
            """,
            (station,)
        )

        existing_user = cursor.fetchone()


        if existing_user:

            print(
                f"[EXISTS] {station}"
            )

            print(
                f"        Existing login: "
                f"{existing_user['email']}"
            )

            existing += 1

            continue


        # ==================================================
        # CHECK USERNAME / EMAIL FIELD
        # ==================================================

        cursor.execute(
            """
            SELECT user_id
            FROM users
            WHERE email = %s
            """,
            (username,)
        )

        username_exists = cursor.fetchone()


        if username_exists:

            print(
                f"[USERNAME EXISTS] "
                f"{username}"
            )

            existing += 1

            continue


        # ==================================================
        # HASH PASSWORD
        # ==================================================

        password_hash = generate_password_hash(
            password
        )


        # ==================================================
        # CREATE USER
        # ==================================================

        cursor.execute(
            """
            INSERT INTO users
            (
                name,
                email,
                password_hash,
                role,
                police_station,
                is_active
            )
            VALUES
            (
                %s,
                %s,
                %s,
                'POLICE',
                %s,
                TRUE
            )
            """,
            (
                station,
                username,
                password_hash,
                station
            )
        )


        conn.commit()


        # ==================================================
        # SAVE CREDENTIALS
        # ==================================================

        credentials.append({

            "Police Station": station,

            "Username": username,

            "Password": password

        })


        created += 1


        print(
            f"[CREATED] {station}"
        )

        print(
            f"          Username : {username}"
        )

        print(
            f"          Password : {password}"
        )


finally:

    cursor.close()
    conn.close()


# ==========================================================
# SAVE CSV
# ==========================================================

if credentials:

    credentials_df = pd.DataFrame(
        credentials
    )

    credentials_df.to_csv(
        OUTPUT_FILE,
        index=False
    )


# ==========================================================
# SUMMARY
# ==========================================================

print("\n" + "=" * 60)
print("ACCOUNT CREATION COMPLETE")
print("=" * 60)

print(
    f"Total stations found : {len(stations)}"
)

print(
    f"Created              : {created}"
)

print(
    f"Explicitly skipped   : {skipped}"
)

print(
    f"Already existed      : {existing}"
)

if credentials:

    print(
        "\nCredentials saved to:"
    )

    print(
        OUTPUT_FILE
    )

print("=" * 60)