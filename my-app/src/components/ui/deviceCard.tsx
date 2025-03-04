"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import useDevice from "@/app/libs/useDevice";

export function DeviceCard({ device }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  const { sendDeviceCommand } = useDevice(device);
  const intervalRef = useRef(null);
  const fetchTimerRef = useRef(null);
  const lastTrackId = useRef(null);
  const localPositionTimer = useRef(null);

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const fetchPlaybackState = async (force = false) => {
    try {
      const { result } = await sendDeviceCommand("getPlaybackState");
      if (!result) return;

      const { currentTrack: deviceTrack, volume } = result;

      if (!deviceTrack) return;
      const trackData = {
        title: deviceTrack?.title,
        artist: deviceTrack?.artist,
        album: deviceTrack?.album,
        albumArtURL: deviceTrack?.albumArt,
        duration: deviceTrack?.duration || 0,
        position: deviceTrack?.position || 0,
        uri: deviceTrack?.uri,
        isPlaying: !!deviceTrack?.isplaying,
        id: deviceTrack?.id || `${deviceTrack?.title}-${deviceTrack?.artist}`,
      };

      const trackChanged =
        lastTrackId.current !== trackData.id ||
        (currentTrack?.uri !== trackData.uri && trackData.uri);

      const needsSync =
        Math.abs((position || 0) - (trackData.position || 0)) > 3;

      if (trackChanged || needsSync || force) {
        if (trackChanged) {
          lastTrackId.current = trackData.id;
          setCurrentTrack(trackData);
        }

        setPosition(trackData.position);
      }

      setIsPlaying(trackData.isPlaying);
    } catch (error) {
      console.error("Error fetching playback state:", error);
    }
  };

  useEffect(() => {
    fetchPlaybackState(true);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => fetchPlaybackState(), 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [device?.id]);

  useEffect(() => {
    if (fetchTimerRef.current) clearInterval(fetchTimerRef.current);

    if (isPlaying) {
      fetchTimerRef.current = setInterval(() => {
        fetchPlaybackState();
      }, 2000);
    }

    return () => {
      if (fetchTimerRef.current) clearInterval(fetchTimerRef.current);
    };
  }, [isPlaying, device?.id]);

  useEffect(() => {
    if (localPositionTimer.current) clearInterval(localPositionTimer.current);

    if (isPlaying && !isSeeking && currentTrack) {
      localPositionTimer.current = setInterval(() => {
        setPosition((prevPosition) => {
          if (currentTrack.duration && prevPosition >= currentTrack.duration) {
            fetchPlaybackState(true);
            return prevPosition;
          }
          return prevPosition + 1;
        });
      }, 1000);
    }

    return () => {
      if (localPositionTimer.current) clearInterval(localPositionTimer.current);
    };
  }, [isPlaying, isSeeking, currentTrack]);

  const togglePlayState = async () => {
    try {
      const { result } = await sendDeviceCommand("playStateHandler");
      setIsPlaying(!!result);

      setTimeout(() => fetchPlaybackState(true), 300);
    } catch (error) {
      console.error("Error toggling play state:", error);
    }
  };

  const handleSeek = async (newPosition) => {
    if (!currentTrack) return;

    try {
      setPosition(newPosition);
      await sendDeviceCommand("seek", newPosition);

      setTimeout(() => fetchPlaybackState(true), 300);
    } catch (error) {
      console.error("Error seeking to position:", error);
    } finally {
      setIsSeeking(false);
    }
  };

  return (
    <section className="relative mx-auto my-5 flex h-full max-h-[4.313rem] w-full max-w-[31.125rem] justify-between rounded-[8px] border-[1px] border-[#7c7c7c3e] bg-white px-3 py-2 text-black shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute bottom-[0.5px] left-0 right-0 w-full px-3">
        {currentTrack && (
          <Slider
            value={[position]}
            max={currentTrack.duration || 100}
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

      <div className="flex h-full items-center w-3/5">
        {currentTrack?.albumArtURL ? (
          <img
            src={currentTrack.albumArtURL}
            alt={`${currentTrack.title} album art`}
            className="h-10 w-10 rounded-[6px] object-cover mr-2"
          />
        ) : (
          <div className="h-10 w-10 rounded-[6px] bg-gray-700 flex items-center justify-center mr-2">
            <Volume2 size={16} className="text-gray-400" />
          </div>
        )}
        <div className="overflow-hidden">
          <h1 className="text-[0.625rem] font-medium text-gray-700">
            {device.model} - {device.roomName}
          </h1>
          <h2 className="text-[0.688rem] font-bold truncate">
            {currentTrack?.title || "No Track"}
          </h2>
          <h3 className="text-[0.625rem] font-medium truncate">
            {currentTrack?.artist && currentTrack?.album
              ? `${currentTrack.artist} • ${currentTrack.album}`
              : currentTrack?.artist || currentTrack?.album || "Unknown"}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-end w-2/5 gap-x-3">
        <div className="text-xs text-gray-200 mr-1 hidden sm:block">
          {formatTime(position)} / {formatTime(currentTrack?.duration)}
        </div>

        <div className="flex items-center">
          <button
            className="p-1 rounded-full transition-colors"
            title="Cast to device"
            onClick={() => fetchPlaybackState(true)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 26 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M18 6C18 6.27614 17.7761 6.5 17.5 6.5C17.2239 6.5 17 6.27614 17 6C17 5.72386 17.2239 5.5 17.5 5.5C17.7761 5.5 18 5.72386 18 6Z"
                fill="currentColor"
              />
              <path
                d="M4 21H7M7 1H2C1.44772 1 1 1.44772 1 2V14.5C1 15.0523 1.44772 15.5 2 15.5H7M17.5 17C19.1569 17 20.5 15.6569 20.5 14C20.5 12.3431 19.1569 11 17.5 11C15.8431 11 14.5 12.3431 14.5 14C14.5 15.6569 15.8431 17 17.5 17ZM18 6C18 6.27614 17.7761 6.5 17.5 6.5C17.2239 6.5 17 6.27614 17 6C17 5.72386 17.2239 5.5 17.5 5.5C17.7761 5.5 18 5.72386 18 6ZM13 21H22C23.3807 21 24.5 19.8807 24.5 18.5V3.5C24.5 2.11929 23.3807 1 22 1H13C11.6193 1 10.5 2.11929 10.5 3.5V18.5C10.5 19.8807 11.6193 21 13 21Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>

        <button
          onClick={togglePlayState}
          className="p-2 rounded-full transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
    </section>
  );
}
