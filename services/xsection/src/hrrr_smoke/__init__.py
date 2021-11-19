import os

from flask import Flask


def cors(response):
    """Add CORS header for frontend in development"""
    response.access_control_allow_origin = "http://localhost:5000"
    return response


def create_app(config=None):
    app = Flask(__name__)

    from . import routes

    app.register_blueprint(routes.bp)

    if app.env == "development":
        app.after_request(cors)

    app.config.hrrr_data_dir = os.environ.get("HRRR_DATA_DIR", None)

    return app
