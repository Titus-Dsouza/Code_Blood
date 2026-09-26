# Logix Django API

The Django REST Framework application verifies Firebase Authentication ID tokens with Firebase Admin and stores Logix application data in Cloud Firestore. No relational database stores product records.

## Setup

```sh
python3.12 -m venv .venv312
source .venv312/bin/activate
pip install -r requirements.txt
# Copy .env.example to .env only if you do not already have a local .env.
```

Set `DJANGO_SECRET_KEY`, `FIREBASE_PROJECT_ID`, `AADHAAR_HASH_SECRET`, and `FRONTEND_ORIGINS`. Give the server Firebase credentials using Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS` set to an external service-account file. Do not commit the key file. Django uses an in-memory SQLite database only as a framework default; all application reads and writes go through Firestore.

Run `python manage.py check`, then `python manage.py runserver 127.0.0.1:8000`. `/health` checks the process; `/api/v1/health` checks Firestore connectivity.

## Authentication and authorization

The frontend obtains phone verification from Firebase Phone Auth and sends the resulting Firebase ID token as a Bearer token. `FirebaseAuthentication` verifies the token with `check_revoked=True`, requires the verified phone claim, and derives the UID from the signed claims. Each protected endpoint reads the role from `users/{uid}` in Firestore. Client-supplied UIDs and roles never authorize access.

Signup derives employer from a valid-format GSTIN and employee when GSTIN is absent. Aadhaar is HMACed using the server secret and stored only in the server-only `private_identity` collection; no official Aadhaar verification is claimed. GSTIN validation is format-only.

## API routes

- `POST /api/v1/account/signup`, `GET/PUT /api/v1/account/me`
- `GET/POST/PUT /api/v1/employee/profile`, `GET /api/v1/employee/summary`, `GET /api/v1/employee/skill-gaps`
- `GET /api/v1/jobs`, `POST /api/v1/employee/jobs/{job_id}/apply`
- `GET/POST/PUT /api/v1/employer/profile`, `GET/POST /api/v1/employer/requirements`, `POST /api/v1/employer/jobs`, `GET /api/v1/employer/matches`, `GET /api/v1/employer/summary`
- `GET/POST /api/v1/employer/hiring-requests`, `PATCH /api/v1/employer/hiring-requests/{id}` (cancel), `GET /api/v1/employee/hiring-requests`, `PATCH /api/v1/employee/hiring-requests/{id}` (accept/reject)
- `GET /api/v1/skills`, `GET /api/v1/learning/resources`, `GET /api/v1/insights/demand`, `GET /api/v1/news`, `POST /api/v1/logisky`

Matching rules live in `services/matching.py`. Data access supports canonical Firestore collection names and non-destructive reads of legacy collection names. Firestore Security Rules are in `app/firestore.rules` and deploy from the repository root. Admin SDK calls bypass those rules; all API ownership/role checks therefore remain mandatory.

## Tests

Run `.venv312/bin/python manage.py check` and `.venv312/bin/python -m pytest -q`. Flow tests mock token verification and Firestore; they do not contact Firebase, send OTP SMS, or validate production IAM/rules.
