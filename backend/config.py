# config.py

import os

MYSQL_CONFIG = {
    "host": os.environ.get("TIDB_HOST"),
    "port": int(os.environ.get("TIDB_PORT", "4000")),
    "user": os.environ.get("TIDB_USER"),
    "password": os.environ.get("TIDB_PASSWORD"),
    "database": os.environ.get("TIDB_DATABASE"),
    "ssl_ca": os.environ.get("TIDB_CA_PATH"),
    "ssl_verify_cert": True,
    "ssl_verify_identity": True
}