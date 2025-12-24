import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { isFirebaseConfigured } from "@/lib/firebase-config";

/**
 * A banner prompt to enable push notifications
 * Shows only when:
 * - Firebase is configured
 * - Notifications are supported
 * - Permission hasn't been granted or denied yet
 * - User hasn't dismissed the prompt recently
 */
export function NotificationPrompt() {
	const { isSupported, status, requestPermission, isRequesting } =
		useNotifications();
	const [dismissed, setDismissed] = useState(true);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Check if user has dismissed the prompt recently (within 7 days)
		const dismissedAt = localStorage.getItem("notification_prompt_dismissed");
		if (dismissedAt) {
			const daysSinceDismissed =
				(Date.now() - Number.parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
			if (daysSinceDismissed < 7) {
				setDismissed(true);
				return;
			}
		}
		setDismissed(false);
	}, []);

	// Don't show if:
	// - Not mounted yet (SSR)
	// - Firebase not configured
	// - Not supported
	// - Already granted or denied
	// - User dismissed recently
	if (
		!mounted ||
		!isFirebaseConfigured() ||
		!isSupported ||
		status === "granted" ||
		status === "denied" ||
		dismissed
	) {
		return null;
	}

	const handleDismiss = () => {
		localStorage.setItem(
			"notification_prompt_dismissed",
			Date.now().toString(),
		);
		setDismissed(true);
	};

	const handleEnable = async () => {
		const success = await requestPermission();
		if (success) {
			setDismissed(true);
		}
	};

	return (
		<div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl p-4 mx-4 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
			<div className="flex items-start gap-3">
				<div className="shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
					<Bell className="h-5 w-5 text-primary" />
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="text-sm font-medium">Enable Notifications</h3>
					<p className="text-xs text-muted-foreground mt-0.5">
						Get notified when someone comments or reacts to your posts
					</p>
					<div className="flex items-center gap-2 mt-3">
						<Button
							size="sm"
							onClick={handleEnable}
							disabled={isRequesting}
							className="rounded-full px-4"
						>
							{isRequesting ? "Enabling..." : "Enable"}
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onClick={handleDismiss}
							className="rounded-full px-4"
						>
							Not now
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
