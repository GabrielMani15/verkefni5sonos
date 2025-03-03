
export const ApiService = {
    discoverSystems: async () => {
      try {
        const res = await fetch("/api/discovery");
        const result = await res.json();
        if (result.success && Array.isArray(result.systems)) {
          return result.systems;
        }
        throw new Error("Expected 'systems' to be an array");
      } catch (error) {
        console.error("Error discovering systems:", error);
        return [];
      }
    },
  
    sendDeviceCommand: async (
      device: { host: string },
      action: string,
      seconds?: number,
      spotifyUri?: string
    ) => {
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
  };