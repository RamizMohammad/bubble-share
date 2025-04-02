from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_socketio import SocketIO

app = Flask(__name__)
app.secret_key = "supersecretkey"  # Change this for security
socketio = SocketIO(app, cors_allowed_origins="*")

# Static Admin Credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "password123"

# Active Rooms and Users
active_rooms = {}  # { "room_id": ["user1", "user2"] }
file_transfers = []  # List of file transfer logs

@app.route('/')
def home():
    """Serve Home Page"""
    return render_template('home.html')

@app.route('/developer')
def dev():
    """Serve Developer Page"""
    return render_template('developer.html')

@app.route('/login', methods=["GET", "POST"])
def login():
    """Admin Login Page"""
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session["admin"] = True
            return redirect(url_for("monitor"))
        else:
            return render_template("login.html", error="Invalid Credentials")

    return render_template("login.html")

@app.route('/logout')
def logout():
    """Admin Logout"""
    session.pop("admin", None)
    return redirect(url_for("login"))

@app.route('/monitor')
def monitor():
    """Serve Admin Dashboard"""
    if not session.get("admin"):
        return redirect(url_for("login"))
    return render_template('monitor.html')

@app.route("/api/rooms")
def get_rooms():
    """API to fetch active rooms"""
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 403
    return jsonify(active_rooms)

@app.route("/api/files")
def get_files():
    """API to fetch file transfer logs"""
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 403
    return jsonify(file_transfers)

@socketio.on("join")
def handle_join(data):
    """Handles users joining rooms"""
    room = data["room"]
    user = data["user"]
    
    if room not in active_rooms:
        active_rooms[room] = []
    active_rooms[room].append(user)

    socketio.emit("update", active_rooms)

@socketio.on("leave")
def handle_leave(data):
    """Handles users leaving rooms"""
    room = data["room"]
    user = data["user"]
    
    if room in active_rooms and user in active_rooms[room]:
        active_rooms[room].remove(user)
        if not active_rooms[room]:  # If room is empty, delete it
            del active_rooms[room]
    
    socketio.emit("update", active_rooms)

@socketio.on("file_transfer")
def handle_file_transfer(data):
    """Handles file transfer logs"""
    file_transfers.append(data)
    socketio.emit("file_update", file_transfers)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
