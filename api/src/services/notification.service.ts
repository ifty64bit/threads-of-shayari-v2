type PayLoadType = {
    interests: string[];
    web: { notification: { title: string; body: string } };
};
function getPusherEndpoint({ INSTANCE_ID }: { INSTANCE_ID: string }): string {
    return `https://${INSTANCE_ID}.pushnotifications.pusher.com/publish_api/v1/instances/${INSTANCE_ID}/publishes`;
}

export async function sendNotification({
    INSTANCE_ID,
    SECRET_KEY,
    payload,
}: {
    INSTANCE_ID: string;
    SECRET_KEY: string;
    payload: PayLoadType;
}) {
    const response = await fetch(getPusherEndpoint({ INSTANCE_ID }), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SECRET_KEY}`,
        },
        body: JSON.stringify({
            payload,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send notification: ${errorText}`);
    }

    return response.json();
}
