"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { DeviceCard } from "@/components/ui/deviceCard";
import { TouchPad } from "@/components/ui/touchPad";
import Header from "@/components/ui/header";
import SpotifyHandler from "@/components/ui/spotfiy";
import { useRouter } from "next/navigation";

const apiService = {
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

function ConnectedSystem({
  system,
  deviceStates,
  onToggleDevice,
  handleTrackDetails,
}) {
  const router = useRouter();
  const [openDeviceId, setOpenDeviceId] = useState(null);
  console.log(system);
  useEffect(() => {
    if (system && system.devices.length > 0) {
      setOpenDeviceId(system.devices[0].id);
    }
  }, [system]);

  if (!system) return <p>Error: System not found.</p>;

  const handleToggleDeviceCard = (deviceId) => {
    setOpenDeviceId(deviceId);
  };
  console.log("systemm", system);
  const currentDevice = system.devices.find(
    (device) => device.id === openDeviceId
  );

  useEffect(() => {
    window.history.replaceState(null, "", `/connected`);
  }, []);

  return (
    <section className="h-screen w-full flex flex-col items-center justify-between">
      <Header />
      <div className="flex flex-col items-center">
        <section>
          <div className="flex items-center gap-x-3">
            <h1 className="py-2 text-[1.188rem] font-semibold">Your devices</h1>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="16" height="16" fill="white" fillOpacity="0.01" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.46667 2.13332H1.6C1.30545 2.13332 1.06667 2.3721 1.06667 2.66665V7.46665H7.46667V2.13332ZM8.53333 2.13332V7.46665H14.9333V2.66665C14.9333 2.3721 14.6945 2.13332 14.4 2.13332H8.53333ZM7.46667 8.53332H1.06667V13.3333C1.06667 13.6278 1.30545 13.8667 1.6 13.8667H7.46667V8.53332ZM8.53333 13.8667V8.53332H14.9333V13.3333C14.9333 13.6278 14.6945 13.8667 14.4 13.8667H8.53333ZM1.6 1.06665C0.716345 1.06665 0 1.78299 0 2.66665V13.3333C0 14.2169 0.716345 14.9333 1.6 14.9333H14.4C15.2836 14.9333 16 14.2169 16 13.3333V2.66665C16 1.78299 15.2836 1.06665 14.4 1.06665H1.6Z"
                fill="#1C2024"
              />
            </svg>
          </div>
          <section className="flex h-fit w-full flex-wrap gap-x-5 gap-y-2 rounded-[0.563rem] border-2 border-[#7c7c7c3e] px-[1.413rem] py-5">
            {(() => {
              const colors = [
                "border-blue-500",
                "border-red-500",
                "border-green-500",
                "border-yellow-500",
                "border-purple-500",
                "border-pink-500",
                "border-indigo-500",
                "border-teal-500",
                "border-orange-500",
                "border-cyan-500",
                "border-lime-500",
                "border-amber-500",
                "border-fuchsia-500",
                "border-rose-500",
                "border-violet-500",
              ];

              return system.devices.map((device, index) => {
                const borderColor = colors[index % colors.length];

                return (
                  <button
                    key={device.id}
                    className="flex items-center justify-start gap-x-2 group w-[89px]"
                    onClick={() => handleToggleDeviceCard(device.id)}
                  >
                    <div
                      className={`size-4 rounded-full border-[3px] group-hover:bg-slate-100 ${borderColor}`}
                    ></div>
                    <div className="text-left font-semibold">
                      <p className="text-[0.625rem]">{device.roomName}</p>
                      <p className="text-[0.563rem]">
                        {device.model.replace(/[0-9;:]/g, "")}
                      </p>
                    </div>
                  </button>
                );
              });
            })()}
          </section>
        </section>
      </div>

      {/* Pass current device state to TouchPad */}
      <TouchPad
        currentDevice={currentDevice}
        apiService={apiService}
        onTogglePlayPause={() => onToggleDevice(currentDevice)}
      />

      {/* Always show the open DeviceCard at the bottom */}
      {system.devices.map(
        (device) =>
          openDeviceId === device.id && (
            <DeviceCard
              key={device.id}
              device={device}
              isPlaying={Boolean(deviceStates[device.id])}
              onTogglePlayPause={() => onToggleDevice(device)}
              trackDetails={() => handleTrackDetails(device)}
              apiService={apiService}
            />
          )
      )}
    </section>
  );
}

function SystemSelector({ systems, deviceStates, onSelectSystem }) {
  if (systems.length === 0) {
    return (
      <section className="h-screen w-full overflow-hidden flex justify-center items-center">
        <div className="border-r-2 border-t-2 size-28 border-black animate-spin rounded-full"></div>
      </section>
    );
  }
  //console.log("Image url:", systems[0].devices);
  return (
    <section className="h-screen w-full">
      <div className="absolute bottom-0 h-[60%] w-[85%] rounded-t-[12%] border-2 border-[#7c7c7c3e]">
        <h1 className="pt-5 text-center text-[1.5rem] font-semibold">
          Got {systems.length} systems
        </h1>
        <p className="text-center text-[0.688rem] font-medium">
          Select your system then click connect
        </p>
        <section className="mx-5 my-8">
          {systems.map((system, index) => (
            <div
              key={system.systemId}
              className={`relative mx-auto flex h-24 w-[80%] items-center justify-center rounded-[0.375rem] border-2 ${
                onSelectSystem === system.systemId
                  ? "border-blue-500 bg-blue-50"
                  : "border-[#7c7c7c3e] bg-white"
              } px-5 mb-4`}
              onClick={() => onSelectSystem(system.systemId)}
            >
              <h1 className="absolute left-5 text-[0.688rem] font-medium">
                {system.devices.length} devices
              </h1>
              <div className="text-center">
                <h1 className="text-[1.188rem] font-semibold">
                  System {index + 1}
                </h1>
                <h1 className="text-[0.563rem] font-medium">
                  Includes Sonos One
                </h1>
              </div>
            </div>
          ))}
        </section>

        <div className="absolute bottom-3 flex h-24 w-full justify-center">
          <button
            className="h-12 w-[80%] max-w-96 rounded-full bg-black font-semibold text-white"
            onClick={() => {
              if (onSelectSystem) {
                console.log(`Connecting to system ${onSelectSystem}`);
              }
            }}
          >
            Connect
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [systems, setSystems] = useState([]);
  const [deviceStates, setDeviceStates] = useState({});
  const [selectedSystemId, setSelectedSystemId] = useState(null);

  useEffect(() => {
    const loadSystems = async () => {
      const discoveredSystems = await apiService.discoverSystems();
      setSystems(discoveredSystems);

      const initialStates = {};
      discoveredSystems.forEach((system) => {
        system.devices.forEach((device) => {
          initialStates[device.id] = device.isReady === "playing";
        });
      });
      setDeviceStates(initialStates);
      console.log("Initial device states:", initialStates);
    };

    loadSystems();
  }, []);

  const handleSystemSelect = (systemId) => {
    setSelectedSystemId(systemId);
  };

  const handleToggleDevice = async (device) => {
    const currentState = Boolean(deviceStates[device.id]);
    const action = currentState ? "stop" : "play";

    console.log("handleToggleDevice - Action:", action);

    const success = await apiService.sendDeviceCommand(device, action);

    if (success) {
      setDeviceStates((prev) => ({
        ...prev,
        [device.id]: !prev[device.id],
      }));
    }
  };

  const handleTrackDetails = async (device) => {
    const data = await apiService.sendDeviceCommand(device, "getPlaybackState");
    return data;
  };

  const selectedSystem = selectedSystemId
    ? systems.find((sys) => sys.systemId === selectedSystemId)
    : null;

  return selectedSystemId ? (
    <ConnectedSystem
      system={selectedSystem}
      deviceStates={deviceStates}
      onToggleDevice={handleToggleDevice}
      handleTrackDetails={handleTrackDetails}
    />
  ) : (
    <SystemSelector
      systems={systems}
      deviceStates={deviceStates}
      onSelectSystem={handleSystemSelect}
    />
  );
}
