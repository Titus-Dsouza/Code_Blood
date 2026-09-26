from rest_framework.exceptions import APIException

class FirebaseUnavailable(APIException):
    status_code = 503
    default_detail = "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID and server credentials."
    default_code = "firebase_unavailable"

class Conflict(APIException):
    status_code = 409
    default_detail = "This action conflicts with existing data."
    default_code = "conflict"
