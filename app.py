from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import openai
import base64
from datetime import datetime
import os
import uuid

app = Flask(__name__)
CORS(app)

openai.api_key = os.environ.get("OPENAI_API_KEY")

animals_db = {
    "1": {"id": "1", "name": "Max", "type": "Dog", "age": 3, "lastActivity": "Not monitored yet"},
    "2": {"id": "2", "name": "Whiskers", "type": "Cat", "age": 2, "lastActivity": "Not monitored yet"},
    "3": {"id": "3", "name": "Tweety", "type": "Bird", "age": 1, "lastActivity": "Not monitored yet"},
    "4": {"id": "4", "name": "Billy", "type": "Goat", "age": 4, "lastActivity": "Not monitored yet"},
}

behaviors_db = []
camera_configs = {}

@app.route("/")
def home():
    response = render_template("index.html")
    return response, 200, {'Cache-Control': 'no-cache, no-store, must-revalidate'}

@app.route("/animals", methods=["GET", "POST"])
def handle_animals():
    if request.method == "GET":
        return jsonify(list(animals_db.values()))
    
    elif request.method == "POST":
        data = request.json
        animal_id = str(uuid.uuid4())
        new_animal = {
            "id": animal_id,
            "name": data.get("name", "Unknown"),
            "type": data.get("type", "Unknown"),
            "age": data.get("age", 0),
            "lastActivity": "Not monitored yet"
        }
        animals_db[animal_id] = new_animal
        return jsonify({"success": True, "animal": new_animal}), 201

@app.route("/animals/<animal_id>", methods=["GET"])
def get_animal_details(animal_id):
    if animal_id in animals_db:
        return jsonify(animals_db[animal_id])
    return jsonify({"error": "Animal not found"}), 404

@app.route("/upload", methods=["POST"])
def analyze_image():
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "message": "Empty filename"}), 400

    image_bytes = file.read()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    image_url = f"data:image/jpeg;base64,{image_b64}"

    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        "You are Pawtrol AI — a smart animal monitoring system. "
                        "Analyze this image and respond with:\n"
                        "1. The animal(s) detected\n"
                        "2. The movement or behavior (running, sitting, walking, etc.)\n"
                        "3. Confidence level (0-1)\n"
                        "4. A short summary for the user"
                    ),
                },
                {"type": "image_url", "image_url": {"url": image_url}},
            ],
        }
    ]
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=400,
        )
        ai_result = response.choices[0].message.content.strip()

        result = {
            "success": True,
            "behavior": "AI analysis complete",
            "duration": "N/A",
            "confidence": 0.9,
            "timestamp": datetime.now().isoformat(),
            "details": ai_result,
        }
        
        behavior_log = {
            "id": str(uuid.uuid4()),
            "timestamp": result["timestamp"],
            "behavior": result["behavior"],
            "details": ai_result,
            "confidence": result["confidence"],
            "duration": result["duration"],
            "source": "upload"
        }
        behaviors_db.append(behavior_log)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/behaviors", methods=["GET", "POST"])
def handle_behaviors():
    if request.method == "GET":
        return jsonify(behaviors_db)
    
    elif request.method == "POST":
        data = request.json
        behavior_log = {
            "id": str(uuid.uuid4()),
            "timestamp": data.get("timestamp", datetime.now().isoformat()),
            "behavior": data.get("behavior", "Unknown"),
            "details": data.get("details", ""),
            "confidence": data.get("confidence", 0.0),
            "duration": data.get("duration", "N/A"),
            "source": data.get("source", "manual")
        }
        behaviors_db.append(behavior_log)
        return jsonify({"success": True, "behavior": behavior_log}), 201

# summary analysis 

@app.route("/summary/daily", methods=["GET"])
def get_summary():
    return jsonify({
        "timestamp": datetime.now().isoformat(),
        "content": "No summary yet. AI summaries will appear here."
    })


# Alerts fr the user /alerts
@app.route("/alerts", methods=["GET"])
def get_alerts():
    return jsonify([])


@app.route("/stream", methods=["POST"])
def analyze_stream():
    frame = request.json.get("frame")
    if not frame:
        return jsonify({"success": False, "message": "No frame data"}), 400

    image_url = f"data:image/jpeg;base64,{frame}"
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Detect and describe animal movement in this live frame briefly."},
                {"type": "image_url", "image_url": {"url": image_url}},
            ],
        }
    ]

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=150,
        )
        ai_result = response.choices[0].message.content.strip()
        
        behavior_log = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "behavior": "Live stream detection",
            "details": ai_result,
            "confidence": 0.85,
            "duration": "Live",
            "source": "webcam"
        }
        behaviors_db.append(behavior_log)
        
        return jsonify({
            "success": True,
            "result": ai_result
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/camera/configure", methods=["POST"])
def configure_camera():
    data = request.json
    camera_id = data.get("cameraId", "camera1")
    camera_configs[camera_id] = {
        "name": data.get("name", f"Camera {camera_id}"),
        "enabled": data.get("enabled", True),
        "frameRate": data.get("frameRate", 3),
        "timestamp": datetime.now().isoformat()
    }
    return jsonify({"success": True, "config": camera_configs[camera_id]})



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
