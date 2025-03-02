import React, { useState, useEffect } from "react";

// Playlist component to display individual playlist details
const Playlist = ({ playlist, onViewTracks }) => {
  return (
    <div className="playlist">
      <h3>{playlist.name}</h3>
      <p>Owner: {playlist.owner}</p>
      <button onClick={() => onViewTracks(playlist.tracks.href)}>
        View Tracks
      </button>
    </div>
  );
};

// Tracks component to display the list of tracks in a playlist
const Tracks = ({ tracks }) => {
  if (tracks.length === 0) {
    return <p>No tracks available.</p>;
  }

  return (
    <div id="tracks-container">
      <ul>
        {tracks.map((track, index) => (
          <li key={index}>{track.name}</li>
        ))}
      </ul>
    </div>
  );
};

// Main component that handles the authorization, playlist fetching, and displaying
const SpotifyPlaylistViewer = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state for better UX

  const clientId = "08e18a1d3e41466b9ff8bff566f9e795";

  // UseEffect to handle OAuth code flow and fetching playlists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    const fetchData = async () => {
      if (!code) {
        redirectToAuthCodeFlow(clientId);
      } else {
        setLoading(true); // Set loading state to true when starting the fetch process
        try {
          const token = await getAccessToken(clientId, code);
          setAccessToken(token);
          const profile = await fetchProfile(token);
          const playlistsData = await fetchPlaylists(profile.id, token);
          setPlaylists(playlistsData);
          setFilteredPlaylists(playlistsData);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false); // Set loading state to false after data fetching is done
        }
      }
    };

    fetchData();
  }, []);

  // UseEffect to filter playlists based on search query
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredPlaylists(playlists);
    } else {
      setFilteredPlaylists(
        playlists.filter((playlist) =>
          playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, playlists]);

  // Fetch playlists from Spotify API
  const fetchPlaylists = async (userId, token) => {
    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    return data.items.map((item) => ({
      name: item.name,
      owner: item.owner.display_name,
      tracks: item.tracks,
      href: item.tracks.href,
    }));
  };

  // Show tracks for a specific playlist
  const showTracks = async (href) => {
    try {
      const response = await fetch(href, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setTracks(data.items);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  // Redirect to the Spotify authorization URL
  const redirectToAuthCodeFlow = (clientId) => {
    const verifier = generateCodeVerifier(128);
    generateCodeChallenge(verifier).then((challenge) => {
      localStorage.setItem("verifier", verifier);

      const params = new URLSearchParams();
      params.append("client_id", clientId);
      params.append("response_type", "code");
      params.append("redirect_uri", "http://localhost:3000/connected");
      params.append("scope", "user-read-private user-read-email");
      params.append("code_challenge_method", "S256");
      params.append("code_challenge", challenge);

      document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    });
  };

  // Get access token using the code from Spotify
  const getAccessToken = async (clientId, code) => {
    const verifier = localStorage.getItem("verifier");
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:3000/connected/");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const { access_token } = await result.json();
    return access_token;
  };

  // Generate code verifier for PKCE flow
  const generateCodeVerifier = (length) => {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  // Generate code challenge for PKCE flow
  const generateCodeChallenge = async (codeVerifier) => {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  // Fetch user profile from Spotify
  const fetchProfile = async (token) => {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return await result.json();
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search playlists"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {loading && <p>Loading...</p>} {/* Loading state */}
      <div id="playlist-container">
        {filteredPlaylists.map((playlist, index) => (
          <Playlist key={index} playlist={playlist} onViewTracks={showTracks} />
        ))}
      </div>
      <Tracks tracks={tracks} />
    </div>
  );
};

export default SpotifyPlaylistViewer;
