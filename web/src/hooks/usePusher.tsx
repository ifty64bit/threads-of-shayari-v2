import config from "@/lib/config";
import { authAtom } from "@/lib/store";
import * as PusherPushNotifications from "@pusher/push-notifications-web";
import { useAtom } from "jotai/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function usePusher() {
    const beamsClient = useRef<PusherPushNotifications.Client | null>(null);

    const [auth] = useAtom(authAtom);

    useEffect(() => {
        if (!auth) {
            return;
        }

        function handler(event: MessageEvent) {
            if (event.data?.type === "PUSH_NOTIFICATION") {
                const { payload } = event.data;

                // Replace with your toast logic
                toast.info(payload.notification.title, {
                    description: payload.notification.body,
                });
            }
        }

        if (!beamsClient.current) {
            beamsClient.current = new PusherPushNotifications.Client({
                instanceId: config.PUSHER_INSTANCE_ID,
            });

            beamsClient.current.start().then(() => {
                beamsClient.current
                    ?.addDeviceInterest(`user-${auth?.user.id}`)
                    .then(() =>
                        console.log("Successfully registered and subscribed!")
                    )
                    .catch(console.error);

                if ("serviceWorker" in navigator) {
                    navigator.serviceWorker.addEventListener(
                        "message",
                        handler
                    );
                }
            });
        }

        return () => {
            if (beamsClient.current) {
                beamsClient.current?.stop().then(() => {
                    beamsClient.current?.clearDeviceInterests().then(() => {
                        console.log("Cleared all device interests");
                    });
                });

                navigator.serviceWorker.removeEventListener("message", handler);
            }
        };
    }, []);

    return beamsClient;
}

export default usePusher;
