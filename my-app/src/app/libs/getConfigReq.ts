"use client"
import { useEffect, useState } from "react";

// Returns localStorage items
export default function getConfigReq() {
  const [spotifyEnvVariable, setSpotifyEnvVariable] = useState("");
  const [favSpeaker, setFavSpeaker] = useState("");

  useEffect(() => {
    const storedSpotifyEnvVariable = localStorage.getItem("spotifyId") || "";
    const storedFavSpeaker = localStorage.getItem("favSpeaker") || "";

    setSpotifyEnvVariable(storedSpotifyEnvVariable);
    setFavSpeaker(storedFavSpeaker);
  }, []);

  return { spotifyEnvVariable, favSpeaker };
}
