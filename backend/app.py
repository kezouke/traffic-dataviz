from flask import Flask, request, jsonify, send_from_directory
from collections import deque
import os

# Path to the static directory (assuming backend/ is one level in from project root)
STATIC_DIR = "/app/static"
print("Serving static from:", STATIC_DIR)

app = Flask(__name__)

# In-memory data structures
MAX_EVENTS = 1000
events_buffer = deque(maxlen=MAX_EVENTS)      # store event dicts
total_events = 0
suspicious_count = 0
normal_count = 0
location_counts = {}  # dict mapping "lat,lon" -> count

@app.route('/events', methods=['POST'])
def receive_event():
    data = request.get_json()
    if not data:
        return "Bad Request: JSON body required", 400
    # Update global counters and structures
    global total_events, suspicious_count, normal_count
    total_events += 1
    if data.get("suspicious"):
        suspicious_count += 1
    else:
        normal_count += 1
    # Update location count
    loc_key = f'{data.get("latitude")},{data.get("longitude")}'
    location_counts[loc_key] = location_counts.get(loc_key, 0) + 1
    # Add to buffer
    events_buffer.append(data)
    return "", 204  # No Content (or could return a JSON ack)


@app.route('/events', methods=['GET'])
def get_events():
    # Optional 'since' query param
    since_ts = request.args.get('since', default=None, type=float)  # assuming timestamp is numeric
    # Decide which events to return
    if since_ts is not None:
        # Filter events newer than since_ts
        events_list = [evt for evt in events_buffer if evt.get("timestamp") and float(evt.get("timestamp")) > since_ts]
    else:
        # No filter, return last N events
        events_list = list(events_buffer)
    # Build top locations list (e.g., top 5 by count)
    # If since_ts is given, one might consider top locations in that filtered set.
    # Here we'll return global top locations from location_counts:
    top_locs = sorted(location_counts.items(), key=lambda kv: kv[1], reverse=True)[:5]
    top_locations = [ { "location": loc, "count": count } for loc, count in top_locs ]
    # Prepare stats
    stats = {
        "total_events": total_events,
        "suspicious_count": suspicious_count,
        "normal_count": normal_count
    }
    return jsonify({ "events": events_list, "top_locations": top_locations, "stats": stats })


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from the static/ directory. If path is empty, serve index.html."""
    if path == "" or path is None:
        path = "index.html"
    # send_from_directory will raise 404 if file not found or path is unsafe
    return send_from_directory(STATIC_DIR, path)
