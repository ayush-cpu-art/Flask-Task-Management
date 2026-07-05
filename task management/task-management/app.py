from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_connection

app = Flask(__name__)

import os

app.secret_key = os.getenv(
    "SECRET_KEY",
    "task_management_secret_key"
)

CORS(app)


# ==========================================
# Pages
# ==========================================

@app.route("/")
def login_page():
    return render_template("login.html")


@app.route("/register")
def register_page():
    return render_template("register.html")


@app.route("/dashboard")
def dashboard_page():

    if "user_id" not in session:
        return render_template("login.html")

    return render_template(
        "dashboard.html",
        username=session["username"]
    )


@app.route("/task")
def task_page():

    if "user_id" not in session:
        return render_template("login.html")

    return render_template("task.html")


# ==========================================
# Dashboard Statistics API
# ==========================================

@app.route("/dashboard/stats")
def dashboard_stats():

    if "user_id" not in session:

        return jsonify({
            "success": False
        })

    conn = get_connection()

    try:

        with conn.cursor() as cursor:

            cursor.execute("""
                SELECT COUNT(*) AS total
                FROM tasks
                WHERE user_id=%s
            """, (session["user_id"],))

            total = cursor.fetchone()["total"]

            cursor.execute("""
                SELECT COUNT(*) AS completed
                FROM tasks
                WHERE user_id=%s
                AND completed=1
            """, (session["user_id"],))

            completed = cursor.fetchone()["completed"]

            cursor.execute("""
                SELECT COUNT(*) AS pending
                FROM tasks
                WHERE user_id=%s
                AND completed=0
            """, (session["user_id"],))

            pending = cursor.fetchone()["pending"]

            cursor.execute("""
                SELECT COUNT(*) AS high
                FROM tasks
                WHERE user_id=%s
                AND priority='High'
            """, (session["user_id"],))

            high = cursor.fetchone()["high"]

            cursor.execute("""
                SELECT COUNT(*) AS medium
                FROM tasks
                WHERE user_id=%s
                AND priority='Medium'
            """, (session["user_id"],))

            medium = cursor.fetchone()["medium"]

            cursor.execute("""
                SELECT COUNT(*) AS low
                FROM tasks
                WHERE user_id=%s
                AND priority='Low'
            """, (session["user_id"],))

            low = cursor.fetchone()["low"]

        conn.close()

        return jsonify({

            "success": True,

            "total": total,

            "completed": completed,

            "pending": pending,

            "high": high,

            "medium": medium,

            "low": low

        })

    except Exception as e:

        conn.close()

        return jsonify({

            "success": False,

            "message": str(e)

        })


# ==========================================
# Register
# ==========================================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    hashed_password = generate_password_hash(password)

    conn = get_connection()

    try:

        with conn.cursor() as cursor:

            cursor.execute("""

                INSERT INTO admin(
                    username,
                    password
                )

                VALUES(%s,%s)

            """,

            (

                username,
                hashed_password

            ))

        conn.commit()

        conn.close()

        return jsonify({

            "success": True,

            "message": "Registration Successful!"

        })

    except Exception as e:

        conn.close()

        return jsonify({

            "success": False,

            "message": str(e)

        })


# ==========================================
# Login
# ==========================================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    conn = get_connection()

    try:

        with conn.cursor() as cursor:

            cursor.execute("""

                SELECT *
                FROM admin
                WHERE username=%s

            """,

            (username,))

            user = cursor.fetchone()

        conn.close()

        if user and check_password_hash(
            user["password"],
            password
        ):

            session["user_id"] = user["id"]
            session["username"] = user["username"]

            return jsonify({

                "success": True,

                "message": "Login Successful"

            })

        return jsonify({

            "success": False,

            "message": "Invalid Username or Password"

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        })


# ==========================================
# Logout
# ==========================================

@app.route("/logout")
def logout():

    session.clear()

    return render_template("login.html")

# ==========================================
# Add Task
# ==========================================

@app.route("/submit", methods=["POST"])
def submit_task():

    if "user_id" not in session:

        return jsonify({

            "success": False,

            "message": "Please login first."

        })

    data = request.get_json()

    title = data.get("title")
    priority = data.get("priority")
    completed = data.get("completed")
    due_date = data.get("due_date")

    conn = get_connection()

    try:

        with conn.cursor() as cursor:

            cursor.execute("""

                INSERT INTO tasks(

                    user_id,
                    title,
                    completed,
                    priority,
                    due_date

                )

                VALUES(%s,%s,%s,%s,%s)

            """,

            (

                session["user_id"],
                title,
                completed,
                priority,
                due_date

            ))

        conn.commit()

        conn.close()

        return jsonify({

            "success": True,

            "message": "Task Added Successfully!"

        })

    except Exception as e:

        conn.close()

        return jsonify({

            "success": False,

            "message": str(e)

        })


# ==========================================
# Get Tasks
# ==========================================

@app.route("/tasks")
def get_tasks():

    if "user_id" not in session:
        return jsonify([])

    search = request.args.get("search", "").strip()

    conn = get_connection()

    try:

        with conn.cursor() as cursor:

            cursor.execute("""

                SELECT

                    id,
                    title,
                    completed,
                    priority,
                    due_date

                FROM tasks

                WHERE user_id=%s

                AND title LIKE %s

                ORDER BY due_date ASC, priority DESC

            """,

            (

                session["user_id"],
                f"%{search}%"

            ))

            tasks = cursor.fetchall()

        conn.close()

        return jsonify(tasks)

    except Exception as e:

        conn.close()

        return jsonify({

            "success": False,

            "message": str(e)

        })


# ==========================================
# Update Task
# ==========================================

@app.route("/update/<int:id>", methods=["PUT"])
def update_task(id):

    if "user_id" not in session:

        return jsonify({

            "success": False,

            "message": "Please login first."

        })

    data = request.get_json()

    title = data.get("title")
    priority = data.get("priority")
    completed = data.get("completed")
    due_date = data.get("due_date")

    conn = get_connection()

    try:

        with conn.cursor() as cursor:

            cursor.execute("""

                UPDATE tasks

                SET

                    title=%s,
                    completed=%s,
                    priority=%s,
                    due_date=%s

                WHERE id=%s

                AND user_id=%s

            """,

            (

                title,
                completed,
                priority,
                due_date,
                id,
                session["user_id"]

            ))

        conn.commit()

        conn.close()

        return jsonify({

            "success": True,

            "message": "Task Updated Successfully!"

        })

    except Exception as e:

        conn.close()

        return jsonify({

            "success": False,

            "message": str(e)

        })


# ==========================================
# Delete Task
# ==========================================

@app.route("/delete/<int:id>", methods=["DELETE"])
def delete_task(id):

    if "user_id" not in session:

        return jsonify({

            "success": False,

            "message": "Please login first."

        })

    conn = get_connection()

    try:

        with conn.cursor() as cursor:

            cursor.execute("""

                DELETE FROM tasks

                WHERE id=%s

                AND user_id=%s

            """,

            (

                id,
                session["user_id"]

            ))

        conn.commit()

        conn.close()

        return jsonify({

            "success": True,

            "message": "Task Deleted Successfully!"

        })

    except Exception as e:

        conn.close()

        return jsonify({

            "success": False,

            "message": str(e)

        })
    
    # ==========================================
# Error Handlers
# ==========================================

@app.errorhandler(404)
def page_not_found(error):

    return render_template("404.html"), 404


@app.errorhandler(500)
def internal_server_error(error):

    return jsonify({

        "success": False,

        "message": "Internal Server Error"

    }), 500


# ==========================================
# Run Application
# ==========================================

if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )
