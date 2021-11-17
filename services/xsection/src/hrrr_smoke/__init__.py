import os

from flask import Flask


def index():
    return "<h1>Hello, World</h1>"


def create_app(config=None):
    app = Flask(__name__)
    app.add_url_rule("/", view_func=index)
    return app
