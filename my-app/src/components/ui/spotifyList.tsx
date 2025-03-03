import React, { useState, useEffect } from "react";
import useDevice from "@/app/libs/useDevice";
import { useSystemContext } from "@/app/libs/systemContext";
// Types for playlist and track data
interface Playlist {
  name: string;
  owner: string;
  type: string;
  id: string;
  images: Array<{ url: string }>;
  tracks: any;
  href: string;
  uri: string;
}

interface Track {
  track: {
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string };
    uri: string;
    external_urls: {
      spotify: string;
    };
  };
}

interface Profile {
  id: string;
  display_name?: string;
}

const PlaylistComponent: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [authInProgress, setAuthInProgress] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const { selectedDevice } = useSystemContext(); // Use context

  const { sendDeviceCommand } = useDevice(selectedDevice);
  console.log(selectedDevice);

  const clientId = localStorage.getItem("spotifyId");
  const redirectUri = "http://localhost:3000/";

  // Helper functions to generate code verifier and challenge
  const generateCodeVerifier = (length: number): string => {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const generateCodeChallenge = async (
    codeVerifier: string
  ): Promise<string> => {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  // Redirect user to Spotify's authorization flow
  const redirectToAuthCodeFlow = async () => {
    // Set a flag in localStorage to prevent redirect loops
    localStorage.setItem("auth_in_progress", "true");
    setAuthInProgress(true);

    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri);
    params.append(
      "scope",
      "user-read-private user-read-email playlist-read-private playlist-read-collaborative"
    );
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  // Get access token after authentication
  const getAccessToken = async (code: string): Promise<string> => {
    const verifier = localStorage.getItem("verifier");

    if (!verifier) {
      throw new Error("Code verifier not found in localStorage");
    }

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier);

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Token error: ${errorData.error} - ${errorData.error_description}`
        );
      }

      const data = await response.json();
      // Store token in localStorage so it persists between refreshes
      localStorage.setItem("spotify_access_token", data.access_token);
      // Clear the auth in progress flag
      localStorage.removeItem("auth_in_progress");
      return data.access_token;
    } catch (error) {
      console.error("Error getting access token:", error);
      localStorage.removeItem("auth_in_progress");
      throw error;
    }
  };

  // Fetch the profile information
  const fetchProfile = async (token: string): Promise<Profile> => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Profile fetch failed: ${response.status}`);
      }

      const data = await response.json();
      setUserId(data.id);
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  };

  // Fetch playlists from Spotify
  const fetchPlaylists = async (token: string, id: string) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/users/${id}/playlists?limit=50`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Playlists fetch failed: ${response.status}`);
      }

      const data = await response.json();
      buildPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  // Build playlists UI and state
  const buildPlaylists = (data: any) => {
    const startingData = data.items || [];
    const playlists: Playlist[] = startingData.map((item: any) => ({
      name: item.name,
      owner: item.owner.display_name,
      type: item.type,
      id: item.id,
      images: item.images,
      tracks: item.tracks,
      href: item.href,
      uri: item.uri,
    }));
    setPlaylists(playlists);
    setLoading(false);
  };

  // Open a specific playlist and fetch tracks
  const openPlaylist = async (href: string) => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await fetch(href, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Playlist details fetch failed: ${response.status}`);
      }

      const data = await response.json();
      setTracks(data.tracks.items);
    } catch (error) {
      console.error("Error opening playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle track selection and play on Sonos
  const handlePlayTrack = (track: Track) => {
    // Extract the Spotify URL from the track
    const trackUrl = track.track.external_urls.spotify;
    const trackUri = track.track.uri;

    console.log("Track URL for Sonos:", trackUrl);
    console.log("Track URI:", trackUri);

    // This is where you would call your Sonos play function
    playSonosTrack(trackUrl, trackUri);
  };

  // Function to send track to Sonos
  const playSonosTrack = (trackUrl: string, trackUri: string) => {
    // Implementation depends on your Sonos API integration
    // This is a placeholder for your actual Sonos play function
    console.log("Playing on Sonos:", trackUri);
    sendDeviceCommand("play", undefined, trackUri);
  };

  // Initialize the application
  useEffect(() => {
    const initialize = async () => {
      // First check if we have a stored token
      const storedToken = localStorage.getItem("spotify_access_token");
      if (storedToken) {
        setAccessToken(storedToken);
        try {
          const profile = await fetchProfile(storedToken);
          await fetchPlaylists(storedToken, profile.id);
          return;
        } catch (error) {
          // Token might be expired, clear it and continue with auth flow
          console.error("Stored token invalid:", error);
          localStorage.removeItem("spotify_access_token");
        }
      }

      // Check if auth is in progress to prevent redirect loops
      const authInProgress = localStorage.getItem("auth_in_progress");
      if (!clientId) {
        setError(true);
        throw new Error("No client id provied, go to settings and add it.");
      }
      // Check for authorization code in URL
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Clear the URL parameters without refreshing
      if (code) {
        window.history.replaceState({}, document.title, redirectUri);
      }

      // If no code and not currently authenticating, start auth flow
      if (!code && !authInProgress) {
        await redirectToAuthCodeFlow();
        return;
      }

      // If we have a code, exchange it for a token
      if (code) {
        try {
          setLoading(true);
          const token = await getAccessToken(code);
          setAccessToken(token);

          const profile = await fetchProfile(token);
          await fetchPlaylists(token, profile.id);
        } catch (error) {
          console.error("Initialization error:", error);
          // Clear auth flags to allow retrying
          localStorage.removeItem("auth_in_progress");
          setLoading(false);
        }
      } else {
        // If we have neither token nor code, but auth is in progress
        // Just show loading and wait for redirect to complete
        setLoading(true);
      }
    };

    initialize();
    console.log("initialize spotify");
  }, []);

  return (
    <>
      {!error ? (
        <div className="bg-white border-[#7c7c7c3e] border-2 min-h-[96] h-fit p-8 rounded-[15px] mb-5">
          <h1 className="text-3xl font-bold mb-6">Spotify Playlists</h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-white text-xl">
                {authInProgress ? (
                  "Authenticating with Spotify..."
                ) : (
                  <div className="border-r-2 border-t-2 border-green-500 w-24 h-24 rounded-full animate-spin"></div>
                )}
              </p>
            </div>
          ) : (
            <>
              <div
                id="playlist-container"
                className="grid max-[600px]:grid-cols-1 grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6"
              >
                {playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => openPlaylist(playlist.href)}
                      className="h-16 border-[#7c7c7c3e] border-[1px] transition duration-300 flex items-center pl-7 rounded-full cursor-pointer hover:bg-slate-50"
                    >
                      <div className="flex gap-x-2">
                        {playlist.images[0]?.url ? (
                          <img
                            src={playlist.images[0]?.url}
                            alt={playlist.name}
                            className="size-12 object-cover rounded-[6px]"
                          />
                        ) : (
                          <div className="w-full h-40 rounded-md flex items-center justify-center">
                            <span className="text-3xl">🎵</span>
                          </div>
                        )}
                        <div className="pt-1">
                          <h3 className="text-sm font-semibold truncate">
                            {playlist.name.length > 12
                              ? playlist.name.slice(
                                  0,
                                  playlist.name.lastIndexOf(" ", 26)
                                )
                              : playlist.name}
                          </h3>
                          <h3 className="text-sm font-medium">
                            By {playlist.owner}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-xl">No playlists found</p>
                  </div>
                )}
              </div>

              {tracks.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-4">Tracks</h2>
                  <div
                    id="tracks-container"
                    className="bg-[#121212] rounded-[12px] p-4 overflow-y-auto h-96  
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                  >
                    {tracks.map((track, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 hover:bg-[#282828] transition duration-200 rounded-md cursor-pointer "
                        onClick={() => handlePlayTrack(track)}
                      >
                        <div className="text-gray-400 mr-4">{index + 1}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">
                            {track.track.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {track.track.artists
                              .map((artist) => artist.name)
                              .join(", ")}
                          </p>
                        </div>
                        <div className="text-gray-400 text-sm hidden md:block flex-grow">
                          {track.track.album.name}
                        </div>
                        <div className="ml-4 text-green-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="my-5">
          <h1 className="font-semibold">Set your client id</h1>
          <p className="text-sm">
            Client id is needed to use spotify, go to settings third icon in
            header
          </p>
        </div>
      )}
    </>
  );
};

export default PlaylistComponent;
