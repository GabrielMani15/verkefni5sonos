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
      <main className="h-screen">
        {isLoading && (
          <section className="h-full w-full flex justify-center items-center flex-col">
            <div className="size-24 border-t-2 border-r-2 border-blue-600 rounded-full animate-spin"></div>
            <h1 className="font-semibold py-4">Fetching systems</h1>
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
      </main>
    </SystemProvider>
  );
}
