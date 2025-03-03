"use client";
import { useEffect } from "react";
import useFetchSystem from "@/app/libs/useSystem";
import DevicesAndGroups from "./devicesAndGroups";
import Header from "./header";
import SpotifyList from "./spotifyList";
import { config } from "@/app/libs/config";
import { SystemProvider } from "@/app/libs/systemContext";

export default function SystemsList() {
  const { systems, isLoading, error } = useFetchSystem();

  useEffect(() => {
    if (!isLoading && !error) {
      config(systems);
      console.log("initialize sonos system");
    }
  }, [isLoading, systems]);

  return (
    <SystemProvider>
      <div>
        {isLoading && (
          <section className="h-screen w-full flex justify-center items-center">
            <div className="size-24 border-t-2 border-r-2 border-black rounded-full animate-spin"></div>
          </section>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading &&
          !error &&
          Array.isArray(systems) &&
          systems.length === 0 && <p>No system found on your network</p>}
        {!isLoading &&
          !error &&
          Array.isArray(systems) &&
          systems.length > 0 && (
            <>
              <Header />
              <SpotifyList />
              <DevicesAndGroups systems={systems} />
            </>
          )}
      </div>
    </SystemProvider>
  );
}
