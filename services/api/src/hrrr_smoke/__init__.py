from logging.config import dictConfig
import os

from flask import Flask


def cors(response):
    """Add CORS header for frontend in development"""
    response.access_control_allow_origin = "http://localhost:5000"
    return response


def create_app(config=None):
    dictConfig(
        {
            "version": 1,
            "formatters": {
                "default": {
                    "format": "[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
                },
            },
            "handlers": {
                "wsgi": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://flask.logging.wsgi_errors_stream",
                    "formatter": "default",
                }
            },
            "root": {
                "level": "DEBUG",
                "handlers": ["wsgi"],
            },
        }
    )

    app = Flask(__name__)

    from . import routes

    app.register_blueprint(routes.bp)

    if app.env == "development":
        app.after_request(cors)

    app.config.hrrr_data_dir = os.environ.get("HRRR_DATA_DIR", None)
    app.config.forecasts_array = os.environ.get("FORECASTS_ARRAY", None)

    return app
