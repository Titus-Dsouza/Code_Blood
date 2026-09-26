// Firebase Web App settings are public identifiers, not Admin credentials.
// Copy the values for your Firebase Web App from Firebase Console > Project settings.
// Never place a service-account JSON, private key, or AI API key in this file.
const supplied = window.LOGIX_FIREBASE_CONFIG || {};
export const firebaseConfig = {
  apiKey: supplied.apiKey || "YOUR_FIREBASE_WEB_API_KEY",
  authDomain: supplied.authDomain || "YOUR_FIREBASE_PROJECT_ID.firebaseapp.com",
  projectId: supplied.projectId || "YOUR_FIREBASE_PROJECT_ID",
  appId: supplied.appId || "YOUR_FIREBASE_WEB_APP_ID",
};
export const firebaseConfigReady = [firebaseConfig.apiKey, firebaseConfig.authDomain, firebaseConfig.projectId, firebaseConfig.appId]
  .every((value) => value && !value.startsWith("YOUR_"));
