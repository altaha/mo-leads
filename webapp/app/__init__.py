from flask import Flask
app = Flask(
    __name__,
    template_folder='frontend/public',
    static_folder='frontend/public/static'
)
from app import views
