import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: GEMINI_API_KEY not found in .env")
    exit()

print("API key found.")

client = genai.Client(api_key=api_key)

try:
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents="Explain hibiscus leaf spot disease in 3 simple sentences."
    )

    print("\n===== GEMINI RESPONSE =====")
    print(response.text)

except Exception as e:
    print("\n===== GEMINI ERROR =====")
    print(e)