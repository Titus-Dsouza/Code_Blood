from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from firebase_admin import auth
from api.exceptions import FirebaseUnavailable
from services.firebase import firebase_app, firestore_client

class FirebaseIsAuthenticated:
    """Permission for verified Firebase claim dictionaries returned by the authenticator."""
    def has_permission(self, request, view):
        return bool(getattr(request, "auth", None) and getattr(request, "user", None))

class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = get_authorization_header(request).split()
        if not header:
            return None
        if len(header) != 2 or header[0].lower() != b"bearer":
            raise AuthenticationFailed("Use a Firebase ID token in the Bearer authorization header.")
        try:
            claims = auth.verify_id_token(header[1].decode(), app=firebase_app(), check_revoked=True)
        except FirebaseUnavailable:
            raise
        except Exception as exc:
            raise AuthenticationFailed("Firebase token is invalid or expired.") from exc
        if not claims.get("uid") or not claims.get("phone_number"):
            raise AuthenticationFailed("A verified Firebase phone number is required.")
        return (claims, claims)

    def authenticate_header(self, request):
        return "Bearer"

def current_profile(request):
    try:
        uid = request.user["uid"]
        snap = firestore_client().collection("users").document(uid).get()
    except FirebaseUnavailable:
        raise
    except Exception as exc:
        raise FirebaseUnavailable("Unable to read the account from Firestore.") from exc
    if not snap.exists:
        from rest_framework.exceptions import NotFound
        raise NotFound("Logix account has not been created")
    return {"uid": uid, **(snap.to_dict() or {})}

def require_role(request, role):
    profile = current_profile(request)
    from rest_framework.exceptions import PermissionDenied
    if profile.get("role") != role:
        raise PermissionDenied(f"{role.title()} access required")
    return profile
