from werkzeug.security import generate_password_hash
from getpass import getpass
from db import get_connection


name = input("Police officer name: ").strip()
email = input("Police officer email: ").strip().lower()
password = getpass("Police officer password: ")
police_station = input("Police station: ").strip()

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
    VALUES (%s, %s, %s, 'POLICE', %s)
    """,
    (
        name,
        email,
        password_hash,
        police_station
    )
)

conn.commit()

cursor.close()
conn.close()

print("Police account created successfully.")