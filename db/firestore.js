
const admin = require('firebase-admin');

let serviceAccount;

if (process.env.FIREBASE_CREDENTIALS_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
} else {
    // Fallback for local development
    try {
        serviceAccount = require('../serviceAccountKey.json');
    } catch (error) {
        console.error('Service account key not found. Please set the SERVICE_ACCOUNT_KEY environment variable or create a serviceAccountKey.json file.');
        process.exit(1);
    }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;
