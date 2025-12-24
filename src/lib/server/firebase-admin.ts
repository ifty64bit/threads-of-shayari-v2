import admin from "firebase-admin";

// Parse the service account JSON from environment variable
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

let firebaseApp: admin.app.App | undefined;

function getFirebaseApp() {
	if (!firebaseApp && serviceAccountJson) {
		try {
			const serviceAccount = JSON.parse(serviceAccountJson);
			firebaseApp = admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
			});
		} catch (error) {
			console.error("Failed to initialize Firebase Admin:", error);
		}
	}
	return firebaseApp;
}

export function getMessaging() {
	const app = getFirebaseApp();
	if (!app) {
		console.warn("Firebase Admin not initialized - notifications disabled");
		return null;
	}
	return admin.messaging(app);
}
