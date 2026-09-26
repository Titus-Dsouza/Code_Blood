# Logix

Logix is a Smart India Hackathon prototype for logistics workforce readiness and demand-led hiring. It connects worker profiles and skills with logistics learning and employer demand using rule-based matching.

## Architecture

```text
Static frontend (HTML, CSS, JavaScript)
  ├─ Firebase Authentication Web SDK (phone OTP)
  └─ Django REST Framework API (Firebase ID token)
       └─ Firebase Admin SDK → Cloud Firestore
```

All application records are stored in Cloud Firestore. Django's SQLite `:memory:` configuration is only a minimal framework default; Logix has no relational application database or migrations. The browser does not access Firestore directly and cannot choose a role.

The requested `MEMORY.md`, `LOGIX_ARCHITECTURE.md`, and `LOGIX_PRD.md` were not present in this checkout. The available README files were the only project documentation to consult before implementation.

## Firebase setup

1. Create a Firebase project, add a Web App, and create a Cloud Firestore database.
2. In Firebase Console → Project settings → Your apps, copy the Web App's `apiKey`, `authDomain`, `projectId`, and `appId` into `frontend/firebase-config.js`. These values identify a browser app and are public; restrict the API key to your domains and intended APIs. Do not put service-account JSON, Admin private keys, or AI API keys in frontend files.
3. In Authentication → Sign-in method, enable **Phone**. Add local and deployed frontend domains to Authorized domains. Phone Auth uses reCAPTCHA and Firebase controls SMS quotas.
4. Copy `backend/.env.example` to `backend/.env`; set `DJANGO_SECRET_KEY`, `FIREBASE_PROJECT_ID`, and a random `AADHAAR_HASH_SECRET` (at least 32 characters). Provide Admin credentials through Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service-account JSON stored outside this repository. The Admin identity needs Firestore access and permission to verify Firebase ID tokens.
5. Deploy rules from the repository root:

   ```sh
   firebase login
   firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
   ```

Firebase Web configuration and server Admin credentials are deliberately separate. The Firebase Admin SDK bypasses Firestore Security Rules, so Django verifies each bearer token and checks the Firestore role before protected operations. Firestore rules deny browser writes and restrict reads; do not grant client access to `private_identity`.

Signup sends the Aadhaar number in the HTTPS request only; the server stores an HMAC-SHA256 reference in `private_identity`, never the raw value. Set a unique secret with `openssl rand -hex 32`. The prototype does not connect to UIDAI and does not claim official Aadhaar verification. GSTIN is checked for format only.

## Run locally

Use Python 3.10+ (Python 3.12 recommended; the preinstalled Python 3.9.6 is end-of-life for Google libraries). Install and run the backend:

```sh
cd backend
python3.12 -m venv .venv312
source .venv312/bin/activate
pip install -r requirements.txt
# Copy .env.example to .env only if you do not already have a local .env.
python manage.py check
python manage.py runserver 127.0.0.1:8000
```

Configure `.env` before testing Firebase connectivity. In another terminal:

```sh
cd frontend
python3 server.py
```

Open <http://127.0.0.1:5500>. Django liveness is at `/health`; `/api/v1/health` checks Firestore. Run API flow tests from `backend/` with `python -m pytest -q`. The tests use a Firestore test double, so live OTP and hosted Firestore flows still require a configured Firebase project.

Seed the curated skill catalog and learning links without creating sample people or jobs:

```sh
cd backend
python seed_firestore.py
```

The browser Firebase SDK is loaded from Google's official CDN and needs internet access. Use Firebase fictional phone numbers or real SMS verification for local OTP tests.

## Firestore collections

| Collection | Purpose |
| --- | --- |
| `users/{uid}` | Public account data and server-assigned role |
| `employees/{uid}` | Employee logistics profile, skills, experience and category details |
| `employers/{uid}` | Employer/company profile |
| `skills/{id}` | Logistics skill catalog |
| `jobs/{id}` | Employer-posted jobs |
| `jobRequirements/{id}` | Job skill, location, experience and domain requirements |
| `hiringRequests/{id}` | Employer-to-employee request and status |
| `learningResources/{id}` | Curated external learning links |
| `news/{id}` | Optional real feed records; no demo/live news is seeded |
| `private_identity/{uid}` | Server-only Aadhaar HMAC and GSTIN |
| `applications/{jobId_uid}` | Employee job applications |

Older documents in `employee_profiles`, `employer_profiles`, `requirements`, `hiring_requests`, and `learning_resources` are not deleted. Reads include those legacy collections; new records use the canonical names above (requirements are also dual-written additively for existing clients). No Firestore data migration or deletion is performed.

## Implemented API behavior

- Firebase Phone Auth OTP in the existing frontend; Django verifies Firebase ID tokens and reads the authenticated UID/phone from signed claims.
- Server-derived roles: valid-format GSTIN means employer; no GSTIN means employee. Existing roles cannot be changed at signup.
- Employee/employer profiles, category details, jobs and requirements, registered-profile candidate matching with explainable Match/Partial Match/Skill Gap results, skill gaps, learning recommendations, applications and hiring request states (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`).
- Logisky is a logistics-only server-side rule responder; unrelated prompts return exactly `Invalid Questions`. No AI provider/key is configured.
- `/api/v1/news` returns no news unless a real feed is configured and stored; the UI does not claim to show live news.

This project snapshot did not include the requested PRD/architecture/memory documents. Restore those source documents if there are additional SIH requirements that should be checked against this implementation.
