import os
import json

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    send_from_directory
)

from dotenv import load_dotenv
from google import genai


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# ============================================================
# GEMINI CLIENT
# ============================================================

gemini_client = None

if GEMINI_API_KEY:

    try:

        gemini_client = genai.Client(
            api_key=GEMINI_API_KEY
        )

        print("Gemini AI: API key loaded successfully.")

    except Exception as e:

        print(
            "Gemini initialization error:",
            e
        )

else:

    print(
        "WARNING: GEMINI_API_KEY not found in .env"
    )


# ============================================================
# AGRIGUARD AI
# ============================================================

app = Flask(__name__)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

SHARED_DIR = os.path.join(
    BASE_DIR,
    "shared"
)

ANALYSIS_FILE = os.path.join(
    SHARED_DIR,
    "latest_analysis.json"
)

IMAGE_FILE = os.path.join(
    SHARED_DIR,
    "latest_image.jpg"
)


# ============================================================
# READ LATEST ANALYSIS
# ============================================================

def get_latest_analysis():

    if not os.path.exists(
        ANALYSIS_FILE
    ):

        return {

            "available": False,

            "message":
                "Waiting for AI analysis..."

        }


    try:

        with open(
            ANALYSIS_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)


        data["available"] = True

        return data


    except Exception as e:

        print(
            "Analysis read error:",
            e
        )

        return {

            "available": False,

            "message":
                "Unable to read analysis."

        }


# ============================================================
# DASHBOARD
# ============================================================

@app.route("/")
def dashboard():

    return render_template(
        "dashboard.html"
    )


# ============================================================
# ANALYSIS API
# ============================================================

@app.route(
    "/api/analysis"
)
def analysis():

    data = get_latest_analysis()

    return jsonify(data)


# ============================================================
# IMAGE STATUS
# ============================================================

@app.route(
    "/api/image-status"
)
def image_status():

    return jsonify({

        "available":
            os.path.exists(
                IMAGE_FILE
            )

    })


# ============================================================
# SERVE SHARED FILES
# ============================================================

@app.route(
    "/shared/<path:filename>"
)
def shared_file(filename):

    return send_from_directory(
        SHARED_DIR,
        filename
    )


# ============================================================
# GEMINI AI FUNCTION
# ============================================================

def ask_gemini(
    question,
    analysis_data
):

    if gemini_client is None:

        return (
            "Gemini AI is not configured. "
            "Please check the GEMINI_API_KEY "
            "in the .env file."
        )


    # --------------------------------------------------------
    # Extract important information
    # --------------------------------------------------------

    disease = analysis_data.get(
        "prediction",
        "Unknown"
    )

    confidence = analysis_data.get(
        "confidence",
        0
    )

    status = analysis_data.get(
        "status",
        "Unknown"
    )

    sensors = analysis_data.get(
        "sensors",
        {}
    )


    temperature = sensors.get(
        "temperature",
        "--"
    )

    humidity = sensors.get(
        "humidity",
        "--"
    )


    # --------------------------------------------------------
    # Complete analysis context
    # --------------------------------------------------------

    analysis_context = json.dumps(
        analysis_data,
        indent=2
    )


    # --------------------------------------------------------
    # Gemini prompt
    # --------------------------------------------------------

    prompt = f"""
You are AgriGuard AI, an intelligent smart farming
assistant for hibiscus plants.

Your job is to help farmers understand plant health,
diseases, environmental conditions and possible actions.

IMPORTANT RULES:

1. The machine learning model detected:
   Disease/Condition: {disease}
   Confidence: {confidence:.2f}%
   Status: {status}

2. Current ESP32 sensor information:
   Temperature: {temperature} °C
   Humidity: {humidity} %

3. The complete latest analysis data from the AgriGuard
   backend is provided below:

{analysis_context}

4. Answer the farmer's question using the information
   above.

5. Do not invent sensor readings.

6. Do not change the ML prediction.

7. If the ML confidence is low, clearly tell the farmer
   that the prediction may need visual/manual confirmation.

8. If the user asks about treatment, prevention,
   symptoms, causes or disease management, provide
   practical agricultural guidance.

9. The four primary hibiscus ML classes in this project are:
   Healthy
   Leaf_Spot
   Dead_Leaf
   Rust

10. If the user asks something unrelated to farming,
    answer briefly and politely.

11. Use simple language that a farmer can understand.

12. Do not claim that you physically examined the plant.

13. Do not claim certainty when the available information
    is uncertain.

FARMER'S QUESTION:

{question}

Give a useful, concise answer.
"""


    try:

        response = gemini_client.models.generate_content(

            model="gemini-3.6-flash",

            contents=prompt

        )


        if response and response.text:

            return response.text.strip()


        return (
            "I could not generate an AI response "
            "right now. Please try again."
        )


    except Exception as e:

        print(
            "Gemini API error:",
            e
        )

        return (
            "Gemini AI is temporarily unavailable. "
            "Please try again in a moment."
        )


# ============================================================
# CHATBOT
# ============================================================

@app.route(
    "/api/chat",
    methods=["POST"]
)
def chat():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "answer":
                    "Invalid request."

            }), 400


        question = (
            data.get(
                "question",
                ""
            )
            .strip()
        )


        if not question:

            return jsonify({

                "answer":
                    "Please enter a question."

            }), 400


        # ----------------------------------------------------
        # Get latest ML + sensor information
        # ----------------------------------------------------

        context = get_latest_analysis()


        if not context.get(
            "available",
            False
        ):

            return jsonify({

                "answer":
                    "I don't have a recent crop analysis yet. "
                    "Run the ESP32 AI predictor first."

            })


        # ----------------------------------------------------
        # Ask Gemini
        # ----------------------------------------------------

        answer = ask_gemini(
            question,
            context
        )


        return jsonify({

            "answer":
                answer

        })


    except Exception as e:

        print(
            "Chat error:",
            e
        )

        return jsonify({

            "answer":
                "An error occurred while processing "
                "your question."

        }), 500


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    print()
    print("==============================================")
    print("             AGRIGUARD AI")
    print("==============================================")
    print()

    print(
        "Gemini AI:"
    )

    if gemini_client:

        print(
            "ENABLED"
        )

    else:

        print(
            "DISABLED - Check .env"
        )

    print()

    print(
        "Dashboard:"
    )

    print(
        "http://127.0.0.1:5000"
    )

    print()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )