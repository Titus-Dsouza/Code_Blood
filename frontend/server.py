"""Serve the static frontend locally; Django owns the application APIs."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

HOST = os.getenv("FRONTEND_HOST", "127.0.0.1")
PORT = int(os.getenv("FRONTEND_PORT", "5500"))
FRONTEND_DIR = Path(__file__).resolve().parent


if __name__ == "__main__":
    handler = partial(SimpleHTTPRequestHandler, directory=str(FRONTEND_DIR))
    print(f"Logix frontend: http://{HOST}:{PORT}")
    print("API server: run `python manage.py runserver 127.0.0.1:8000` from backend/")
    ThreadingHTTPServer((HOST, PORT), handler).serve_forever()
