import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { registerFCMToken } from "@/functions/notifications";
import {
	firebaseConfig,
	isFirebaseConfigured,
	VAPID_KEY,
} from "@/lib/firebase-config";

type NotificationStatus =
	| "idle"
	| "requesting"
	| "granted"
	| "denied"
	| "unsupported";

/**
 * Hook for managing push notifications
 * - Requests notification permission
 * - Registers FCM token with server
 * - Shows toast notifications when app is in foreground
 */
export function useNotifications() {
	const [status, setStatus] = useState<NotificationStatus>("idle");
	const [isSupported, setIsSupported] = useState(false);

	/**
	 * Set up the foreground message listener for toast notifications
	 */
	const setupForegroundListener = useCallback(() => {
		if (typeof window === "undefined" || !isFirebaseConfigured()) return;

		try {
			let app = getApps()[0];
			if (!app) {
				app = initializeApp(firebaseConfig);
			}

			const messaging = getMessaging(app);

			// Set up foreground message handler
			onMessage(messaging, (payload) => {
				console.log("Foreground message received:", payload);

				const title = payload.notification?.title || "New Notification";
				const body = payload.notification?.body || "";
				const postId = payload.data?.postId;

				// Show toast notification
				toast(title, {
					description: body,
					action: postId
						? {
								label: "View",
								onClick: () => {
									window.location.href = `/posts/${postId}`;
								},
							}
						: undefined,
				});
			});

			console.log("Foreground message listener set up");
		} catch (error) {
			console.error("Failed to setup foreground listener:", error);
		}
	}, []);

	// Check if notifications are supported and set up listener if already granted
	useEffect(() => {
		const supported =
			typeof window !== "undefined" &&
			"Notification" in window &&
			"serviceWorker" in navigator &&
			isFirebaseConfigured();

		setIsSupported(supported);

		// Set initial status based on current permission
		if (supported && Notification.permission === "granted") {
			setStatus("granted");
			// Set up the foreground listener for already-granted permissions
			setupForegroundListener();
		} else if (Notification.permission === "denied") {
			setStatus("denied");
		}
	}, [setupForegroundListener]);

	/**
	 * Register the service worker and get FCM token
	 */
	const registerServiceWorker = useCallback(async () => {
		try {
			// Register the Firebase messaging service worker
			const registration = await navigator.serviceWorker.register(
				"/firebase-messaging-sw.js",
			);
			console.log("Service Worker registered:", registration);
			return registration;
		} catch (error) {
			console.error("Service Worker registration failed:", error);
			throw error;
		}
	}, []);

	/**
	 * Initialize Firebase and get the FCM token
	 */
	const initializeFirebaseMessaging = useCallback(async () => {
		// Initialize Firebase app if not already done
		let app = getApps()[0];
		if (!app) {
			app = initializeApp(firebaseConfig);
		}

		const messaging = getMessaging(app);

		// Get the service worker registration
		const swRegistration = await registerServiceWorker();

		// Get the FCM token
		const token = await getToken(messaging, {
			vapidKey: VAPID_KEY,
			serviceWorkerRegistration: swRegistration,
		});

		return { messaging, token };
	}, [registerServiceWorker]);

	/**
	 * Request notification permission and register FCM token
	 */
	const requestPermission = useCallback(async () => {
		if (!isSupported) {
			console.warn("Push notifications are not supported");
			setStatus("unsupported");
			return false;
		}

		if (Notification.permission === "denied") {
			setStatus("denied");
			toast.error(
				"Notifications are blocked. Please enable them in your browser settings.",
			);
			return false;
		}

		setStatus("requesting");

		try {
			const permission = await Notification.requestPermission();

			if (permission === "granted") {
				setStatus("granted");

				// Initialize Firebase and get token
				const { messaging, token } = await initializeFirebaseMessaging();

				if (token) {
					// Register token with server
					await registerFCMToken({
						data: {
							token,
							deviceInfo: navigator.userAgent,
						},
					});
					console.log("FCM token registered successfully");

					// Set up foreground message handler for toast notifications
					onMessage(messaging, (payload) => {
						console.log("Foreground message received:", payload);

						const title = payload.notification?.title || "New Notification";
						const body = payload.notification?.body || "";
						const postId = payload.data?.postId;

						// Show toast notification
						toast(title, {
							description: body,
							action: postId
								? {
										label: "View",
										onClick: () => {
											window.location.href = `/posts/${postId}`;
										},
									}
								: undefined,
						});
					});

					toast.success("Notifications enabled!");
					return true;
				}
			} else {
				setStatus("denied");
				return false;
			}
		} catch (error) {
			console.error("Error enabling notifications:", error);
			setStatus("idle");
			toast.error("Failed to enable notifications. Please try again.");
			return false;
		}

		return false;
	}, [isSupported, initializeFirebaseMessaging]);

	return {
		status,
		isSupported,
		requestPermission,
		isGranted: status === "granted",
		isDenied: status === "denied",
		isRequesting: status === "requesting",
	};
}
