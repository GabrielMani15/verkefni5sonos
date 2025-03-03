import { useCallback } from "react";

export default function useDevice(device) {
  const sendDeviceCommand = useCallback(
    async (action: string, seconds?: number, spotifyUri?: string) => {
      if (!device || !device.host) {
        console.error("Invalid device");
        return null;
      }

      try {
        const body: {
          host: string;
          action: string;
          seconds?: number;
          spotifyUri?: string;
        } = {
          host: device.host,
          action: action,
        };

        if (action === "seek" && seconds !== undefined) {
          body.seconds = seconds;
        }

        if (action === "play" && spotifyUri !== undefined) {
          body.spotifyUri = spotifyUri;
        }
        const res = await fetch("/api/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to send command");

        return await res.json();
      } catch (error) {
        console.error("Error sending command:", error);
        return null;
      }
    },
    [device]
  );

  return { sendDeviceCommand };
}
