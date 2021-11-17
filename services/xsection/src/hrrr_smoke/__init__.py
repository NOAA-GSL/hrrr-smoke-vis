import os

from flask import Flask


def create_app(config=None):
    app = Flask(__name__)

    from . import routes

    app.register_blueprint(routes.bp)

    return app
