import { useSystemContext } from "@/app/libs/systemContext";
import { DeviceCard } from "./deviceCard";
import { TouchPad } from "./touchPad";

export default function DevicesAndGroups({ systems }) {
  const { selectedDevice, setSelectedDevice } = useSystemContext();

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

  return (
    <div className="space-y-6 mb-12">
      {systems.map((system) => (
        <div
          key={system.systemId}
          className="p-4 border-2 border-[#7c7c7c3e] rounded-[0.563rem] shadow-md"
        >
          <h2 className="text-lg font-semibold">
            This network has {system.devices.length} Sonos devices
          </h2>
          <section className="flex h-fit w-full flex-wrap gap-x-5 gap-y-2 rounded-[0.563rem] px-[1.413rem] py-5">
            {system.devices.map((device, index) => {
              const borderColor = colors[index % colors.length];

              return (
                <button
                  key={device.id}
                  className="flex items-center justify-start gap-x-2 group w-fit"
                  onClick={() => setSelectedDevice(device)}
                >
                  <div
                    className={`size-6 rounded-full border-[3px] group-hover:bg-slate-100 ${borderColor}`}
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

          {selectedDevice && <DeviceCard device={selectedDevice} />}
          {selectedDevice && <TouchPad device={selectedDevice} />}
        </div>
      ))}
    </div>
  );
}
