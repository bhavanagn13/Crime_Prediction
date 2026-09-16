from werkzeug.security import generate_password_hash
from getpass import getpass
from db import get_connection


name = input("Admin name: ").strip()
email = input("Admin email: ").strip().lower()
password = getpass("Admin password: ")

password_hash = generate_password_hash(password)

conn = get_connection()

if conn is None:
    print("Database connection failed.")
    exit()

cursor = conn.cursor()

cursor.execute(
    """
    INSERT INTO users
    (
        name,
        email,
        password_hash,
        role,
        police_station
    )
    VALUES (%s, %s, %s, 'ADMIN', NULL)
    """,
    (
        name,
        email,
        password_hash
    )
)

conn.commit()

cursor.close()
conn.close()

print("Admin account created successfully.")