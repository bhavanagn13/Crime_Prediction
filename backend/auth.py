from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from db import get_connection
from datetime import datetime


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# ==========================================================
# GET CURRENT USER
# ==========================================================

def get_current_user():

    user_id = session.get("user_id")

    if not user_id:
        return None

    conn = get_connection()

    if conn is None:
        return None

    cursor = conn.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                user_id,
                name,
                email,
                role,
                police_station,
                is_active
            FROM users
            WHERE user_id = %s
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user:
            session.clear()
            return None

        # Account disabled by admin
        if not user["is_active"]:
            session.clear()
            return None

        return user

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# ROLE-BASED ACCESS DECORATOR
# ==========================================================

def role_required(*allowed_roles):

    def decorator(route_function):

        @wraps(route_function)
        def wrapper(*args, **kwargs):

            user = get_current_user()

            if user is None:

                return jsonify({
                    "error": "Authentication required."
                }), 401

            if user["role"] not in allowed_roles:

                return jsonify({
                    "error": "You do not have permission to access this resource."
                }), 403

            return route_function(
                *args,
                **kwargs
            )

        return wrapper

    return decorator


# ==========================================================
# LOGIN
# ==========================================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "Request body is missing."
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:

        return jsonify({
            "error": "Email and password are required."
        }), 400

    conn = get_connection()

    if conn is None:

        return jsonify({
            "error": "Database connection failed."
        }), 500

    cursor = conn.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                user_id,
                name,
                email,
                password_hash,
                role,
                police_station,
                is_active
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

        if not user:

            return jsonify({
                "error": "Invalid email or password."
            }), 401

        if not user["is_active"]:

            return jsonify({
                "error": "Your account has been disabled. Contact the administrator."
            }), 403

        # Verify hashed password
        if not check_password_hash(
            user["password_hash"],
            password
        ):

            return jsonify({
                "error": "Invalid email or password."
            }), 401

        # Store ONLY identity information in session.
        # Do not store password or password hash.
        session.clear()

        session["user_id"] = user["user_id"]

        # Update last login
        cursor.execute(
            """
            UPDATE users
            SET last_login = %s
            WHERE user_id = %s
            """,
            (
                datetime.now(),
                user["user_id"]
            )
        )

        conn.commit()

        return jsonify({

            "message": "Login successful.",

            "user": {
                "user_id": user["user_id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "police_station": user["police_station"]
            }

        }), 200

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# CURRENT USER
# ==========================================================

@auth_bp.route("/me", methods=["GET"])
def current_user():

    user = get_current_user()

    if user is None:

        return jsonify({
            "authenticated": False
        }), 401

    return jsonify({

        "authenticated": True,

        "user": user

    }), 200


# ==========================================================
# LOGOUT
# ==========================================================

@auth_bp.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "message": "Logged out successfully."
    }), 200

# ==========================================================
# ADMIN - CREATE POLICE ACCOUNT
# ==========================================================

@auth_bp.route("/admin/police", methods=["POST"])
@role_required("ADMIN")
def create_police_account():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is missing."
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    police_station = data.get("police_station", "").strip()

    if not name:
        return jsonify({
            "error": "Name is required."
        }), 400

    if not email:
        return jsonify({
            "error": "Email is required."
        }), 400

    if not password:
        return jsonify({
            "error": "Password is required."
        }), 400

    if len(password) < 8:
        return jsonify({
            "error": "Password must contain at least 8 characters."
        }), 400

    if not police_station:
        return jsonify({
            "error": "Police station is required for a police account."
        }), 400

    password_hash = generate_password_hash(password)

    conn = get_connection()

    if conn is None:
        return jsonify({
            "error": "Database connection failed."
        }), 500

    cursor = conn.cursor()

    try:

        # Prevent duplicate email accounts
        cursor.execute(
            """
            SELECT user_id
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:

            return jsonify({
                "error": "An account with this email already exists."
            }), 409

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
                name,
                email,
                password_hash,
                police_station
            )
        )

        conn.commit()

        user_id = cursor.lastrowid

        return jsonify({
            "message": "Police account created successfully.",
            "user": {
                "user_id": user_id,
                "name": name,
                "email": email,
                "role": "POLICE",
                "police_station": police_station,
                "is_active": True
            }
        }), 201

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# ADMIN - VIEW POLICE ACCOUNTS
# ==========================================================

@auth_bp.route("/admin/police", methods=["GET"])
@role_required("ADMIN")
def get_police_accounts():

    conn = get_connection()

    if conn is None:
        return jsonify({
            "error": "Database connection failed."
        }), 500

    cursor = conn.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                user_id,
                name,
                email,
                role,
                police_station,
                is_active,
                created_at,
                last_login
            FROM users
            WHERE role = 'POLICE'
            ORDER BY created_at DESC
            """
        )

        users = cursor.fetchall()

        return jsonify(users), 200

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# ADMIN - ACTIVATE / DEACTIVATE POLICE ACCOUNT
# ==========================================================

@auth_bp.route(
    "/admin/police/<int:user_id>/status",
    methods=["PATCH"]
)
@role_required("ADMIN")
def update_police_account_status(user_id):

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "Request body is missing."
        }), 400

    is_active = data.get("is_active")

    if not isinstance(is_active, bool):

        return jsonify({
            "error": "is_active must be true or false."
        }), 400

    conn = get_connection()

    if conn is None:

        return jsonify({
            "error": "Database connection failed."
        }), 500

    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            UPDATE users
            SET is_active = %s
            WHERE user_id = %s
            AND role = 'POLICE'
            """,
            (
                is_active,
                user_id
            )
        )

        conn.commit()

        if cursor.rowcount == 0:

            return jsonify({
                "error": "Police account not found."
            }), 404

        return jsonify({
            "message": (
                "Police account activated."
                if is_active
                else "Police account deactivated."
            )
        }), 200

    finally:

        cursor.close()
        conn.close()

# ==========================================================
# ADMIN - VIEW CITIZEN ACCOUNTS
# ==========================================================

@auth_bp.route("/admin/citizens", methods=["GET"])
@role_required("ADMIN")
def get_citizen_accounts():

    conn = get_connection()

    if conn is None:
        return jsonify({
            "error": "Database connection failed."
        }), 500

    cursor = conn.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                user_id,
                name,
                email,
                role,
                is_active,
                created_at,
                last_login
            FROM users
            WHERE role = 'CITIZEN'
            ORDER BY created_at DESC
            """
        )

        users = cursor.fetchall()

        return jsonify(users), 200

    finally:

        cursor.close()
        conn.close()


# ==========================================================
# ADMIN - ACTIVATE / DEACTIVATE CITIZEN ACCOUNT
# ==========================================================

@auth_bp.route(
    "/admin/citizens/<int:user_id>/status",
    methods=["PATCH"]
)
@role_required("ADMIN")
def update_citizen_account_status(user_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is missing."
        }), 400

    is_active = data.get("is_active")

    if not isinstance(is_active, bool):
        return jsonify({
            "error": "is_active must be true or false."
        }), 400

    conn = get_connection()

    if conn is None:
        return jsonify({
            "error": "Database connection failed."
        }), 500

    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            UPDATE users
            SET is_active = %s
            WHERE user_id = %s
            AND role = 'CITIZEN'
            """,
            (
                is_active,
                user_id
            )
        )

        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "error": "Citizen account not found."
            }), 404

        return jsonify({
            "message": (
                "Citizen account activated."
                if is_active
                else "Citizen account deactivated."
            )
        }), 200

    finally:

        cursor.close()
        conn.close()

# ==========================================================
# CITIZEN REGISTRATION
# ==========================================================

@auth_bp.route("/register", methods=["POST"])
def register_citizen():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is missing."
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name:
        return jsonify({
            "error": "Name is required."
        }), 400

    if not email:
        return jsonify({
            "error": "Email is required."
        }), 400

    if not password:
        return jsonify({
            "error": "Password is required."
        }), 400

    if len(password) < 8:
        return jsonify({
            "error": "Password must contain at least 8 characters."
        }), 400

    password_hash = generate_password_hash(password)

    conn = get_connection()

    if conn is None:
        return jsonify({
            "error": "Database connection failed."
        }), 500

    cursor = conn.cursor()

    try:

        # Check whether email already exists
        cursor.execute(
            """
            SELECT user_id
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({
                "error": "An account with this email already exists."
            }), 409

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
                'CITIZEN',
                NULL,
                TRUE
            )
            """,
            (
                name,
                email,
                password_hash
            )
        )

        conn.commit()

        user_id = cursor.lastrowid

        return jsonify({
            "message": "Citizen account created successfully.",
            "user": {
                "user_id": user_id,
                "name": name,
                "email": email,
                "role": "CITIZEN"
            }
        }), 201

    finally:

        cursor.close()
        conn.close()