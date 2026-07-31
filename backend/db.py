import mysql.connector
from mysql.connector import Error
from config import MYSQL_CONFIG


def get_connection():
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)

        if connection.is_connected():
            print(" Connected to MySQL")

        return connection

    except Error as e:
        print(f" Database Connection Error: {e}")
        return None