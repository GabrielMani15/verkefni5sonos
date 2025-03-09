import React, { useState, useEffect, useRef } from "react";
import useDevice from "@/app/libs/useDevice";
import { useSystemContext } from "@/app/libs/systemContext";
// Types for playlist and track data
import { Playlist, Track, Profile } from "@/app/api/types/discoveryType";
import { SearchIcon, XIcon, ArrowLeftIcon } from "lucide-react";

type PlaylistTapProps = {
  playlist: Playlist;
  openPlaylist: any;
};

const SearchBar = () => {
  const [searchText, setSearchText] = useState("");

  return (
    <div className="relative pb-4 mb-4 group">
      <input
        className="h-12 w-full bg-transparent border-[#7c7c7c3e] border-[2px] rounded-full font-semibold pl-12 pr-12 mt-4 text-sm text-black transition-all focus:outline-none"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <SearchIcon className="absolute left-3 group-hover:left-6 transition-all size-5 top-1/2 transform -translate-y-1/2 text-black" />

      {/* Conditionally show the search button on the right when text is entered */}
      {searchText && (
        <button
          className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-blue-700 text-white font-medium py-2 px-4 rounded-full transition-all h-8 flex justify-center items-center text-sm w-18 hover:bg-blue-800"
          onClick={() => console.log("Searching:", searchText)}
        >
          Search
        </button>
      )}
    </div>
  );
};

const PlaylistTap: React.FC<PlaylistTapProps> = ({
  playlist,
  openPlaylist,
}) => {
  return (
    <div
      key={playlist.id}
      onClick={() => openPlaylist(playlist.href)}
      className="flex h-full items-center py-2 transition px-3 duration-300 border-[#7c7c7c3e] border-[1px] hover:bg-slate-50 text-black rounded-full cursor-pointer"
    >
      <div className="flex gap-x-4 items-center">
        {playlist.images[0]?.url ? (
          <img
            src={playlist.images[0]?.url}
            alt={playlist.name}
            className="size-10 object-cover rounded-[6px]"
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-gray-600 rounded-md">
            <span className="text-xl text-white">🎵</span>
          </div>
        )}
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold truncate">
            {playlist.name.length > 8
              ? playlist.name.slice(0, playlist.name.lastIndexOf(" ", 8)) +
                "..."
              : playlist.name}
          </h3>

          <p className="text-xs font-medium text-slate-900">{`By ${playlist.owner}`}</p>
        </div>
      </div>
    </div>
  );
};

const PlayListHolder: React.FC<{
  playlists: Playlist[];
  openPlaylist: Function;
}> = ({ playlists, openPlaylist }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const scrollContainer = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    scrollTop.current = scrollContainer.current!.scrollTop;
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const distance = e.clientY - startY.current;
    if (scrollContainer.current) {
      scrollContainer.current.scrollTop = scrollTop.current - distance;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = "auto";
  };

  return playlists.length > 0 ? (
    <div
      className="relative overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={scrollContainer}
        className="overflow-y-auto h-36  scrollbar-hidden gap-y-4 gap-x-4 smooth-scroll grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 md:grid-cols-4 2xl:grid-cols-8 mx-auto place-items-center"
        style={{ WebkitOverflowScrolling: "touch" }}
        tabIndex={0}
      >
        {playlists.map((playlist) => (
          <PlaylistTap
            key={playlist.id}
            playlist={playlist}
            openPlaylist={openPlaylist}
          />
        ))}
      </div>
      <SearchBar />
    </div>
  ) : (
    <SpotfiyPlaylistZeroError />
  );
};

const SpotifyLoading = (authInProgress) => {
  return (
    <div className="flex justify-center items-center h-64">
      <p className="text-white text-xl">
        {authInProgress ? (
          <div className="border-r-2 border-t-2 border-blue-500 w-24 h-24 rounded-full animate-spin"></div>
        ) : (
          <div className="border-r-2 border-t-2 border-blue-500 w-24 h-24 rounded-full animate-spin"></div>
        )}
      </p>
    </div>
  );
};

const SpotifyError = () => {
  return (
    <div className="my-5 bg-[#121212] rounded-full text-white py-3 px-8">
      <h1 className="font-semibold text-base">Set your client id</h1>
      <p className="text-sm font-medium">
        You need to set your client id for spotify
      </p>
    </div>
  );
};

const SpotfiyPlaylistZeroError = () => {
  return (
    <div className="col-span-3 text-center py-8">
      <p className="text-xl">No playlists found</p>
    </div>
  );
};

const TracksHolder = ({
  tracks,
  handlePlayTrack,
  currentPlaylist,
  goBackToPlaylists,
}) => {
  return (
    tracks.length > 0 && (
      <div className="text-black rounded-[6px] h-fit px-4 py-3 w-full">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goBackToPlaylists}
            className="flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-full font-semibold transition-colors"
          >
            <ArrowLeftIcon size={18} />
            <span>Back to playlists</span>
          </button>

          <h2 className="text-lg font-semibold">
            {currentPlaylist && currentPlaylist.name}
          </h2>
        </div>

        <div
          id="tracks-container"
          className="rounded-[12px] py-4 pr-3 overflow-y-auto h-72 sm:h-96
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-black"
        >
          {tracks.map((track, index) => (
            <Tracks
              key={track.track.id || index}
              track={track}
              handlePlayTrack={handlePlayTrack}
              index={index}
            />
          ))}
        </div>
      </div>
    )
  );
};

const Tracks = ({ track, handlePlayTrack, index }) => {
  return (
    <div
      className="flex items-center p-3 hover:bg-slate-50 transition duration-200 rounded-md cursor-pointer w-full z-50"
      onClick={() => handlePlayTrack(track)}
    >
      <div className="mr-2 sm:mr-4">{index + 1}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">
          {track.track.name.length > 12
            ? track.track.name.slice(0, track.track.name.lastIndexOf(" ", 12)) +
              "..."
            : track.track.name}
        </p>

        <p className="text-sm truncate">
          {track.track.artists.map((artist) => artist.name).join(", ")}
        </p>
      </div>
      <div className="hidden sm:block flex-grow text-sm truncate">
        {track.track.album.name}
      </div>
      <div className="ml-2 sm:ml-4 flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
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
  );
};

const PlaylistComponent: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [authInProgress, setAuthInProgress] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [showTracks, setShowTracks] = useState<boolean>(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { selectedDevice } = useSystemContext(); // Use context

  const { sendDeviceCommand, errors } = useDevice(selectedDevice);

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

  // Find playlist by href
  const findPlaylistByHref = (href: string) => {
    return playlists.find((playlist) => playlist.href === href) || null;
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
      setCurrentPlaylist(findPlaylistByHref(href));
      setShowTracks(true);
    } catch (error) {
      console.error("Error opening playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  // Go back to playlists view
  const goBackToPlaylists = () => {
    setShowTracks(false);
    setCurrentPlaylist(null);
  };

  // Function to handle track selection and play on Sonos
  const handlePlayTrack = (track: Track) => {
    // Extract the Spotify URL from the track
    const trackUrl = track.track.external_urls.spotify;
    const trackUri = track.track.uri;
    playSonosTrack(trackUrl, trackUri);
  };

  // Function to send track to Sonos
  const playSonosTrack = async (trackUrl: string, trackUri: string) => {
    const response = await sendDeviceCommand("play", undefined, trackUri);

    if (!response) {
      setErrorMessage("Please select a device");
      setTimeout(() => setErrorMessage(null), 3000);
    }
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
        throw new Error("No client id provided, go to settings and add it.");
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
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-black font-semibold text-white z-50 px-4 py-2 rounded-full shadow-md transition-all ease-in-out">
          {errorMessage}
        </div>
      )}

      {!error ? (
        <div
          className="w-fit overflow-hidden text-white bg-white z-50 min-h-32 h-64 overflow-y-none rounded-[6px] mb-5 
        [&::-webkit-scrollbar]:w-2 mx-auto
        [&::-webkit-scrollbar-track]:bg-black-100
        [&::-webkit-scrollbar-thumb]:bg-blue-500
        [&::-webkit-scrollbar-thumb]:rounded-full
        dark:[&::-webkit-scrollbar-track]:bg-black-700
        dark:[&::-webkit-scrollbar-thumb]:bg-blue-500"
        >
          {loading ? (
            <SpotifyLoading authInProgress={authInProgress} />
          ) : (
            <div className="h-full overflow-hidden flex md:flex-row flex-col justify-between gap-5 max-md:gap-y-5">
              {showTracks ? (
                <TracksHolder
                  tracks={tracks}
                  handlePlayTrack={handlePlayTrack}
                  currentPlaylist={currentPlaylist}
                  goBackToPlaylists={goBackToPlaylists}
                />
              ) : (
                <div
                  id="playlist-container"
                  className="text-black overflow-hidden pt-3 h-auto md:h-96"
                >
                  <h1 className="text-lg font-semibold py-2">Your Library</h1>

                  <PlayListHolder
                    playlists={playlists}
                    openPlaylist={openPlaylist}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <SpotifyError />
      )}
    </>
  );
};

export default PlaylistComponent;
