"use client";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function DeviceCard({
  device,
  isPlaying: beginnerState,
  onTogglePlayPause,
  trackDetails,
  apiService,
}) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [position, setPosition] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false); 
  const [isPlaying, setIsPlaying] = useState(beginnerState);

  const fetchTrackDetails = async () => {
    const { result: trackData } = await trackDetails();
    if (trackData && trackData.currentTrack) {
      setCurrentTrack(trackData);
      setPosition(trackData.currentTrack.position || 0);
      setIsPlaying(trackData.currentTrack.isplaying);
    }
    console.log(currentTrack);
  };

  useEffect(() => {
    fetchTrackDetails();
  }, [device, trackDetails]);

  const libary = async () => {
    let i = await apiService.sendDeviceCommand(device, "getLibary");
    console.log(i);
    return i;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTrackDetails();
    }, 1000);

    return () => clearInterval(interval);
  }, [device, trackDetails]);

  useEffect(() => {
    if (!isPlaying || !currentTrack || isSeeking) return;

    const interval = setInterval(() => {
      setPosition((prevPosition) =>
        Math.min(prevPosition + 1, currentTrack.currentTrack.duration)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, isSeeking]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleTrackChange = async (command) => {
    await apiService.sendDeviceCommand(device, command);
    fetchTrackDetails(); 
  };

  const handleSeek = async (newPosition) => {
    setIsSeeking(false);
    await apiService.sendDeviceCommand(device, "seek", newPosition);
    setPosition(newPosition);
  };

  return (
    <section className="relative mx-auto mb-5 flex h-full max-h-[4.313rem] w-full max-w-[31.125rem] justify-between rounded-[8px] border-[1px] border-[#7c7c7c3e] bg-white px-3 py-2 text-black">
      <div className="bg-opacity-20 h-1 absolute bottom-[0.5px] w-[95%] rounded-full bg-[#ffffff42]">
        {currentTrack && (
          <Slider
            value={[position]}
            max={currentTrack.currentTrack.duration}
            step={1}
            className="h-1 rounded-full"
            onValueChange={(val) => {
              setIsSeeking(true);
              setPosition(val[0]);
            }}
            onValueCommit={(val) => handleSeek(val[0])}
          />
        )}
      </div>

      <div className="flex h-full w-full font-semibold">
        {currentTrack?.currentTrack.albumArt && (
          <img
            src={currentTrack.currentTrack.albumArt}
            alt={`${currentTrack.currentTrack.title} album art`}
            className="h-full w-1/5 rounded-[6px]"
          />
        )}
        <div className="pl-2">
          <h1 className="pb-[0.5px] text-[0.625rem] font-medium">
            {device.model} - {device.roomName}
          </h1>
          <h1 className="text-[0.688rem] font-bold text-nowrap">
            {currentTrack?.currentTrack.title}
          </h1>
          <h1 className="text-[0.625rem] font-medium text-nowrap">
            {currentTrack?.currentTrack.album}
          </h1>
        </div>
      </div>
      <div className="flex h-full w-full items-center justify-end gap-x-5">
        <div>
          <svg
            width="26"
            height="22"
            viewBox="0 0 26 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6C18 6.27614 17.7761 6.5 17.5 6.5C17.2239 6.5 17 6.27614 17 6C17 5.72386 17.2239 5.5 17.5 5.5C17.7761 5.5 18 5.72386 18 6Z"
              fill="black"
            />
            <path
              d="M4 21H7M7 1H2C1.44772 1 1 1.44772 1 2V14.5C1 15.0523 1.44772 15.5 2 15.5H7M17.5 17C19.1569 17 20.5 15.6569 20.5 14C20.5 12.3431 19.1569 11 17.5 11C15.8431 11 14.5 12.3431 14.5 14C14.5 15.6569 15.8431 17 17.5 17ZM18 6C18 6.27614 17.7761 6.5 17.5 6.5C17.2239 6.5 17 6.27614 17 6C17 5.72386 17.2239 5.5 17.5 5.5C17.7761 5.5 18 5.72386 18 6ZM13 21H22C23.3807 21 24.5 19.8807 24.5 18.5V3.5C24.5 2.11929 23.3807 1 22 1H13C11.6193 1 10.5 2.11929 10.5 3.5V18.5C10.5 19.8807 11.6193 21 13 21Z"
              stroke="black"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div>
          <button onClick={onTogglePlayPause} className="mt-2 border-none">
            {isPlaying ? (
              <Pause />
            ) : (
              <svg
                width="15"
                height="19"
                viewBox="0 0 15 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.155762 1.84614C0.155762 1.05199 1.0369 0.574707 1.70207 1.00855L13.4369 8.66241C14.0418 9.05697 14.0418 9.94303 13.4369 10.3376L1.70207 17.9914C1.0369 18.4253 0.155762 17.948 0.155762 17.1539L0.155762 1.84614Z"
                  fill="black"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
