import { useSystemContext } from "@/app/libs/systemContext";
import { DeviceCard } from "./deviceCard";
import { TouchPad } from "./touchPad";
import { useEffect } from "react";

export default function DeviceHolder({ systems }) {
  const { selectedDevice, setSelectedDevice } = useSystemContext();
  //If user has set default speaker it will get and open up that device media player
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

  return (
    <div className="h-96 rounded-[5px] text-black w-full mt-52">
      {systems.map((system) => (
        <div key={system.systemId} className="rounded-[0.563rem] shadow-md">
          <h2 className="text-lg font-semibold pt-2 flex items-center gap-x-3">
            <p className="pb-1">Found {system.devices.length} Sonos devices</p>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="16" height="16" fill="white" fill-opacity="0.01" />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.46667 2.13332H1.6C1.30545 2.13332 1.06667 2.3721 1.06667 2.66665V7.46665H7.46667V2.13332ZM8.53333 2.13332V7.46665H14.9333V2.66665C14.9333 2.3721 14.6945 2.13332 14.4 2.13332H8.53333ZM7.46667 8.53332H1.06667V13.3333C1.06667 13.6278 1.30545 13.8667 1.6 13.8667H7.46667V8.53332ZM8.53333 13.8667V8.53332H14.9333V13.3333C14.9333 13.6278 14.6945 13.8667 14.4 13.8667H8.53333ZM1.6 1.06665C0.716345 1.06665 0 1.78299 0 2.66665V13.3333C0 14.2169 0.716345 14.9333 1.6 14.9333H14.4C15.2836 14.9333 16 14.2169 16 13.3333V2.66665C16 1.78299 15.2836 1.06665 14.4 1.06665H1.6Z"
                fill="#1C2024"
              />
            </svg>
          </h2>
          <section className="flex border-[#7c7c7c3e] border-[2px] px-4 h-fit w-full flex-wrap gap-x-5 gap-y-2 rounded-[0.563rem] py-5">
            {system.devices.map((device, index) => {
              const colorKeys = Object.keys(colors);
              const color = colors[colorKeys[index % colorKeys.length]];
              const isSelected = selectedDevice?.id === device.id;

              return (
                <button
                  key={device.id}
                  className={`flex items-center justify-start gap-x-2 group w-fit rounded-md  py-1 transition`}
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

          {selectedDevice && <DeviceCard device={selectedDevice} />}
        </div>
      ))}
    </div>
  );
}
