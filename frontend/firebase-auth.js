import { firebaseConfig, firebaseConfigReady } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/12.19.0";
let auth;
let confirmationResult;
let verifier;
let currentUser = null;
let authReadyResolve;
const ready = new Promise((resolve) => { authReadyResolve = resolve; });
window.logixFirebase = {
  ready,
  configured: firebaseConfigReady,
  getCurrentUser: () => currentUser,
  getIdToken: async () => currentUser ? currentUser.getIdToken() : "",
  requestOtp,
  confirmOtp,
  signOut: async () => {
    if (auth) {
      const { signOut } = await import(`${SDK}/firebase-auth.js`);
      return signOut(auth);
    }
  },
};

async function initialize() {
  if (!firebaseConfigReady) {
    authReadyResolve(null);
    return;
  }
  try {
    const [{ initializeApp }, authSdk] = await Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-auth.js`),
    ]);
    const app = initializeApp(firebaseConfig);
    auth = authSdk.getAuth(app);
    authSdk.onAuthStateChanged(auth, (user) => {
      currentUser = user;
      authReadyResolve(user);
    }, () => authReadyResolve(null));
    window.logixFirebase.configured = true;
  } catch (error) {
    console.error("Firebase initialization failed", error);
    authReadyResolve(null);
    window.logixFirebase.configured = false;
    window.logixFirebase.error = error;
  }
}

async function requestOtp(phoneNumber) {
  if (!auth) throw new Error("Firebase is not configured. Add your Firebase web settings first.");
  const { RecaptchaVerifier, signInWithPhoneNumber } = await import(`${SDK}/firebase-auth.js`);
  if (verifier) verifier.clear();
  verifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "normal" });
  confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
}

async function confirmOtp(code) {
  if (!confirmationResult) throw new Error("Request a new verification code first.");
  const result = await confirmationResult.confirm(code);
  currentUser = result.user;
  return result.user.getIdToken();
}

initialize();
