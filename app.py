
import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
app = Flask(__name__)

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
SYSTEM_PROMPT = 'You are CareerCraft AI, a career-development assistant.\nHelp students and early-career learners explore career paths, identify skills to learn,\nprepare resumes, practice interviews, and plan projects. Give structured, realistic\nguidance without guaranteeing jobs or outcomes. When discussing current job openings,\nsalaries, or company-specific requirements, remind the user that these can change and\nshould be verified from current sources.'

client = genai.Client(api_key=API_KEY) if API_KEY else None

@app.route("/")
def index():
    return render_template("index.html")

@app.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error":"Message is required."}), 400
    if not client:
        return jsonify({"error":"GEMINI_API_KEY is not configured."}), 500
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=message,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.7,
                max_output_tokens=1000
            )
        )
        reply = response.text or "I couldn't generate a response."
        return jsonify({"reply": reply})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
