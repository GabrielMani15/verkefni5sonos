import { useSystemContext } from "@/app/libs/systemContext";
import { DeviceCard } from "./deviceCard";
import { TouchPad } from "./touchPad";
import { useEffect, useState } from "react";
import useDevice from "@/app/libs/useDevice"; // Assuming this is the correct import path

export default function DevicesAndGroups({ systems }) {
  const { selectedDevice, setSelectedDevice } = useSystemContext();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If user has set default speaker it will get and open up that device media player
  useEffect(() => {
    const speaker = localStorage.getItem("speaker");
    const config = localStorage.getItem("systems");

    if (speaker && config) {
      try {
        const parsedSpeaker = JSON.parse(speaker);
        const parsedConfig = JSON.parse(config);

        if (parsedSpeaker?.host && Array.isArray(parsedConfig)) {
          console.log("got in device speaker:", parsedSpeaker.host);

          // Find the matching device
          const selectedDevice = parsedConfig.find(
            (device) => device.host === parsedSpeaker.host
          );

          if (selectedDevice) {
            console.log("true");
            setSelectedDevice(selectedDevice); // Call the function with the device
          } else {
            console.log("false");
          }
        } else {
          console.error("Invalid data format in localStorage.");
        }
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    } else {
      console.warn("Missing speaker or systems data in localStorage.");
    }
  }, []);

  const colors = {
    blue: { border: "border-blue-500", bg: "bg-blue-500" },
    red: { border: "border-red-500", bg: "bg-red-500" },
    green: { border: "border-green-500", bg: "bg-green-500" },
    yellow: { border: "border-yellow-500", bg: "bg-yellow-500" },
    purple: { border: "border-purple-500", bg: "bg-purple-500" },
    pink: { border: "border-pink-500", bg: "bg-pink-500" },
    indigo: { border: "border-indigo-500", bg: "bg-indigo-500" },
    teal: { border: "border-teal-500", bg: "bg-teal-500" },
    orange: { border: "border-orange-500", bg: "bg-orange-500" },
    cyan: { border: "border-cyan-500", bg: "bg-cyan-500" },
    lime: { border: "border-lime-500", bg: "bg-lime-500" },
    amber: { border: "border-amber-500", bg: "bg-amber-500" },
    fuchsia: { border: "border-fuchsia-500", bg: "bg-fuchsia-500" },
    rose: { border: "border-rose-500", bg: "bg-rose-500" },
    violet: { border: "border-violet-500", bg: "bg-violet-500" },
  };

  // Function to toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Component for individual device in fullscreen mode
  const DeviceItem = ({ device, colorKey, index }) => {
    const { sendDeviceCommand } = useDevice(device);
    const [volume, setVolume] = useState(0);
    const [loading, setLoading] = useState(true);
    const color = colors[colorKey];
    const isSelected = selectedDevice?.id === device.id;

    useEffect(() => {
      const fetchVolume = async () => {
        try {
          setLoading(true);
          const playbackState = await sendDeviceCommand("getPlaybackState");
          if (
            playbackState.result &&
            typeof playbackState.result.volume === "number"
          ) {
            setVolume(playbackState.result.volume);
          }
        } catch (error) {
          console.error(`Error fetching volume for ${device.roomName}:`, error);
        } finally {
          setLoading(false);
        }
      };

      fetchVolume();
    }, [device, sendDeviceCommand]);

    return (
      <div className="rounded-lg p-4 transition">
        <div
          className="flex items-center mb-3 cursor-pointer"
          onClick={() => {
            setSelectedDevice(device);
            setIsFullscreen(false);
          }}
        >
          <div
            className={`size-8 rounded-full border-[3px] ${color.border} ${
              isSelected ? color.bg : ""
            }`}
          ></div>
          <div className="ml-3">
            <h3 className="font-bold text-lg">{device.roomName}</h3>
            <p className="text-gray-600">
              {device.model.replace(/[0-9;:]/g, "")}
            </p>
          </div>
        </div>

        {/* Volume Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Volume</span>
            <span className="text-sm">{volume}%</span>
          </div>
          {loading ? (
            <div className="h-2 bg-[#ffffff42] rounded-full animate-pulse"></div>
          ) : (
            <div className="h-2 bg-[#ffffff42] rounded-full overflow-hidden">
              <div
                className={`h-full ${color.bg}`}
                style={{ width: `${volume}%` }}
              ></div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <DeviceCard device={device} />
        </div>
      </div>
    );
  };

  // Fullscreen devices component
  const FullscreenDevices = () => {
    // Flatten all devices from all systems
    const allDevices = systems.flatMap((system) => system.devices);

    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">All Devices</h2>
          <div className="flex items-center">
            <div className="flex items-center gap-x-2 lg:hidden">
              <div className="size-4 bg-[#2efb0063] rounded-full flex items-center justify-center">
                <svg
                  width="6"
                  height="6"
                  viewBox="0 0 6 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="6" height="6" fill="white" fill-opacity="0.01" />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2.02982 1.64005C2.02982 1.16446 2.50271 0.770057 2.99982 0.770057C3.49694 0.770057 3.96982 1.16446 3.96982 1.64005C3.96982 2.07949 3.74693 2.28579 3.44722 2.55158L3.43483 2.56257C3.13773 2.82592 2.76982 3.15203 2.76982 3.80005C2.76982 3.92708 2.8728 4.03005 2.99982 4.03005C3.12685 4.03005 3.22982 3.92708 3.22982 3.80005C3.22982 3.36612 3.45158 3.16254 3.75243 2.89575L3.76076 2.88836C4.05964 2.62336 4.4298 2.29515 4.4298 1.64005C4.4298 0.851077 3.68728 0.310059 2.99982 0.310059C2.31236 0.310059 1.56982 0.851077 1.56982 1.64005C1.56982 1.76708 1.6728 1.87005 1.79982 1.87005C1.92685 1.87005 2.02982 1.76708 2.02982 1.64005ZM2.99982 5.34305C3.19312 5.34305 3.34982 5.18633 3.34982 4.99305C3.34982 4.79973 3.19312 4.64305 2.99982 4.64305C2.80652 4.64305 2.64982 4.79973 2.64982 4.99305C2.64982 5.18633 2.80652 5.34305 2.99982 5.34305Z"
                    fill="#1C2024"
                  />
                </svg>
              </div>
              <h1 className="font-semibold">Scroll</h1>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 18L18 6M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allDevices.map((device, index) => {
            const colorKeys = Object.keys(colors);
            const colorKey = colorKeys[index % colorKeys.length];

            return (
              <DeviceItem
                key={device.id}
                device={device}
                colorKey={colorKey}
                index={index}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-96 rounded-[5px] text-black w-full">
      {isFullscreen && <FullscreenDevices />}

      {systems.map((system) => (
        <div key={system.systemId} className="rounded-[0.563rem]">
          <h2 className="text-lg font-semibold pt-2 flex items-center gap-x-3">
            <p className="pb-1">Found {system.devices.length} Sonos devices</p>
            <button onClick={toggleFullscreen}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer hover:opacity-70 transition"
              >
                <rect width="16" height="16" fill="white" fillOpacity="0.01" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.46667 2.13332H1.6C1.30545 2.13332 1.06667 2.3721 1.06667 2.66665V7.46665H7.46667V2.13332ZM8.53333 2.13332V7.46665H14.9333V2.66665C14.9333 2.3721 14.6945 2.13332 14.4 2.13332H8.53333ZM7.46667 8.53332H1.06667V13.3333C1.06667 13.6278 1.30545 13.8667 1.6 13.8667H7.46667V8.53332ZM8.53333 13.8667V8.53332H14.9333V13.3333C14.9333 13.6278 14.6945 13.8667 14.4 13.8667H8.53333ZM1.6 1.06665C0.716345 1.06665 0 1.78299 0 2.66665V13.3333C0 14.2169 0.716345 14.9333 1.6 14.9333H14.4C15.2836 14.9333 16 14.2169 16 13.3333V2.66665C16 1.78299 15.2836 1.06665 14.4 1.06665H1.6Z"
                  fill="#1C2024"
                />
              </svg>
            </button>
          </h2>
          <section className="flex border-[#7c7c7c3e] border-[2px] px-4 h-fit w-full flex-wrap gap-x-5 gap-y-2 rounded-[0.563rem] py-5">
            {system.devices.map((device, index) => {
              const colorKeys = Object.keys(colors);
              const color = colors[colorKeys[index % colorKeys.length]];
              const isSelected = selectedDevice?.id === device.id;

              return (
                <button
                  key={device.id}
                  className="flex items-center justify-start gap-x-2 group w-fit min-w-36 rounded-md py-1 transition"
                  onClick={() => setSelectedDevice(device)}
                >
                  <div
                    className={`size-6 rounded-full border-[3px] ${
                      isSelected ? color.bg : ""
                    } ${color.border} transition-all group-hover:bg-slate-50`}
                  ></div>
                  <div className="text-left font-semibold">
                    <p className="text-[0.925rem]">{device.roomName}</p>
                    <p className="text-[0.863rem]">
                      {device.model.replace(/[0-9;:]/g, "")}
                    </p>
                  </div>
                </button>
              );
            })}
          </section>
          {selectedDevice && <TouchPad device={selectedDevice} />}

          <div className="absolute bottom-0 bg-white px-3 w-full left-0">
            {selectedDevice && <DeviceCard device={selectedDevice} />}
          </div>
        </div>
      ))}
    </div>
  );
}
