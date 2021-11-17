import os

import flask


def index():
    return "<h1>Hello, World</h1>"


def create_app(config=None):
    app = Flask(__name__)
    app.add_url_rule("/", index)
    return app
