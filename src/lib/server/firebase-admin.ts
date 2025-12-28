import admin from "firebase-admin";
import { serverConfig } from "../server-config";

// Parse the service account JSON from environment variable
const serviceAccountJson = serverConfig.FIREBASE_SERVICE_ACCOUNT_JSON;

let firebaseApp: admin.app.App | undefined;

function getFirebaseApp() {
	if (firebaseApp) {
		return firebaseApp;
	}

	if (!serviceAccountJson) {
		console.error(
			"[Firebase] FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set",
		);
		return undefined;
	}

	try {
		console.log("[Firebase] Parsing service account JSON...");
		const serviceAccount = JSON.parse(serviceAccountJson);
		console.log(
			"[Firebase] Service account project:",
			serviceAccount.project_id,
		);

		firebaseApp = admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
		});
		console.log("[Firebase] Admin SDK initialized successfully");
	} catch (error) {
		console.error("[Firebase] Failed to initialize Firebase Admin:", error);
	}

	return firebaseApp;
}

export function getMessaging() {
	const app = getFirebaseApp();
	if (!app) {
		console.warn(
			"[Firebase] Admin not initialized - notifications disabled. Check FIREBASE_SERVICE_ACCOUNT_JSON env var.",
		);
		return null;
	}
	return admin.messaging(app);
}
