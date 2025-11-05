from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import openai
import base64
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Put your OpenAI API key here
openai.api_key = "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"

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True, port=8080)

# Define animals for analysis

@app.route("/animals", methods=["GET"])
def get_animals():
    animals = ["Dog", "Cat", "Bird", "Goat"]
    return jsonify(animals)

# upload the AI Analysis
@app.route("/upload", methods=["POST"])
def analyze_image():
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "message": "Empty filename"}), 400

    # use base64 for converting
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
   # add open api model
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
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# behaviors function

@app.route("/behaviors", methods=["GET"])
def get_behaviors():
    return jsonify([])

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


# Webcam Tracking

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
                {"type": "text", "text": "Detect and describe animal movement in this live frame."},
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
        return jsonify({
            "success": True,
            "result": response.choices[0].message.content.strip()
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True, port=8080)
