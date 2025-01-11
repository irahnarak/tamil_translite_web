from tamil_translite import translite
from gtts import gTTS
from flask import (
    Flask,
    request,
    render_template,
    jsonify,
    Response,
    redirect,
)
from flask_swagger_ui import get_swaggerui_blueprint
import tempfile
import json
import random
import os

# Create a Flask instance
app = Flask(__name__)

SWAGGER_URL = "/api/docs"  # URL for exposing Swagger UI (without trailing '/')
API_URL = "/static/swagger.json"  # Our API url (can of course be a local resource)

# Call factory function to create our blueprint
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,  # Swagger UI static files will be mapped to '{SWAGGER_URL}/dist/'
    API_URL,
    config={
        "app_name": "Tamil Translite",
        "theme": "dark",
    },  # Swagger UI config overrides
    # oauth_config={  # OAuth config. See https://github.com/swagger-api/swagger-ui#oauth2-configuration .
    #    'clientId': "your-client-id",
    #    'clientSecret': "your-client-secret-if-required",
    #    'realm': "your-realms",
    #    'appName': "your-app-name",
    #    'scopeSeparator': " ",
    #    'additionalQueryStringParams': {'test': "hello"}
    # }
)

app.register_blueprint(swaggerui_blueprint)


@app.route("/translite/api", methods=["POST"])
def result():
    """
    Convert Tamil text to English transliteration.
    """
    data = request.get_json()
    tamil_txt = data.get("tamil_txt")
    print(tamil_txt)
    eng_txt_val = translite(tamil_txt)  # Your transliteration logic here
    print(eng_txt_val)

    return jsonify({"eng_text": eng_txt_val})


@app.route("/translite/learn", methods=["GET"])
def result_learn():
    json_file_path = os.path.join(os.path.dirname(__file__), "learn_data.json")
    with open(json_file_path, "r") as file:
        data = json.load(file)
    random_key = random.choice(list(data.keys()))
    random_value = data[random_key]
    eng_txt_val = translite(random_key)  # Your transliteration logic here

    return jsonify(
        {"tam_txt": random_key, "eng_txt": eng_txt_val, "meaning": random_value}
    )


# Define a route for the home page


@app.route("/")
def index():
    return redirect("/translite")


@app.route("/translite")
def home():
    return render_template("home.html")


@app.route("/translite/audio", methods=["POST"])
def speak():
    # Get text from the form
    text = request.form["text"]

    # Convert text to speech using gTTS
    tts = gTTS(text=text, lang="ta")

    with tempfile.NamedTemporaryFile(delete=True) as temp_file:

        tts.save(temp_file.name)

        temp_file.seek(0)

        audio_data = temp_file.read()

        return Response(audio_data, mimetype="audio/mpeg")


# @app.route("/sitemap.xml")
# def serve_sitemap():
#     # Use send_from_directory to serve the static sitemap.xml file
#     return send_from_directory("static", "sitemap.xml")


# Run the app on the local server (default port 5000)
if __name__ == "__main__":
    app.run(
        ssl_context=("example.com+5.pem", "example.com+5-key.pem"),
        host="0.0.0.0",
        port=5000,
        debug=True,
    )
