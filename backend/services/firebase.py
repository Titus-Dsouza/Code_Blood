"""Server-only Firebase Admin and Firestore initialization."""
import os
import firebase_admin
from firebase_admin import credentials, firestore
from api.exceptions import FirebaseUnavailable

def firebase_app():
    try:
        return firebase_admin.get_app()
    except ValueError:
        project_id = os.getenv("FIREBASE_PROJECT_ID")
        if not project_id:
            raise FirebaseUnavailable()
        try:
            if os.getenv("FIRESTORE_EMULATOR_HOST") and os.getenv("FIREBASE_AUTH_EMULATOR_HOST"):
                return firebase_admin.initialize_app(options={"projectId": project_id})
            return firebase_admin.initialize_app(credentials.ApplicationDefault(), {"projectId": project_id})
        except Exception as exc:
            raise FirebaseUnavailable("Configure Application Default Credentials or GOOGLE_APPLICATION_CREDENTIALS on the server.") from exc

def firestore_client():
    try:
        return firestore.client(firebase_app())
    except FirebaseUnavailable:
        raise
    except Exception as exc:
        raise FirebaseUnavailable("Firebase Firestore is not available; check server credentials and project access.") from exc
