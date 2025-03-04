import { Sonos } from 'sonos';
export default class DeviceController {
    device: any | unknown;
    private spotifyTokenData: {
        accessToken: string | null;
        refreshToken: string | null;
        expiresAt: number | null;
    };

    constructor(ip) {
        this.device = new Sonos(ip);
        this.spotifyTokenData = {
            accessToken: null,
            refreshToken: null, 
            expiresAt: null
        };
    }

    // Existing methods remain unchanged...
    async playStateHandler() {
        const currentState = await this.device.getCurrentState();
        if (currentState === 'playing') {
            await this.device.pause();
        } else {
            await this.device.play();
        }
        // Directly return the toggled state after the action
        return currentState === 'playing' ? false : true;
    }
    
    async adjustVolume(amount) {
        const currentVolume = await this.device.getVolume();
        const newVolume = Math.max(0, Math.min(100, currentVolume + amount));
        await this.device.setVolume(newVolume);
        return newVolume;
    }

    async volumeUp(amount = 5) {
        return this.adjustVolume(amount);
    }

    async volumeDown(amount = 5) {
        return this.adjustVolume(-amount);
    }

    async nextTrack() {
        await this.device.next();
        return true;
    }

    async previousTrack() {
        await this.device.previous();
        return true;
    }

    async stop() {
        await this.device.pause();
        return true;
    }

    // New function to handle Spotify token acquisition
    async getSpotifyAccessToken() {
        try {
            // Check if we have a valid token already
            if (this.spotifyTokenData.accessToken && this.spotifyTokenData.expiresAt && 
                Date.now() < this.spotifyTokenData.expiresAt) {
                return this.spotifyTokenData.accessToken;
            }
            
            // Get client credentials from environment variables
            const clientId = "08e18a1d3e41466b9ff8bff566f9e795";
            const clientSecret = "fcd342044cdf4287b82eb549d84f8f58";
            
            if (!clientId || !clientSecret) {
                throw new Error('Spotify credentials not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your environment variables.');
            }
            
            // Create base64 encoded auth string
            const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            
            // Make token request
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Spotify token request failed: ${errorData.error}`);
            }
            
            const data = await response.json();
            
            // Store the token data
            this.spotifyTokenData = {
                accessToken: data.access_token,
                refreshToken: null, // Client credentials flow doesn't provide refresh tokens
                expiresAt: Date.now() + (data.expires_in * 1000) - 60000 // Subtract 1 minute for safety
            };
            
            return data.access_token;
        } catch (error) {
            console.error('Error getting Spotify access token:', error);
            throw error;
        }
    }
    
    // Function to get track metadata from Spotify
    async getSpotifyTrackMetadata(trackId) {
        try {
            const accessToken = await this.getSpotifyAccessToken();
            
            const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to get track data: ${errorData.error?.message || 'Unknown error'}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching Spotify track metadata:', error);
            throw error;
        }
    }
    
    // Updated play function to use the new token management
    async play(spotifyUri?: string) {
        console.log("play method invoked");
    
        try {
            if (!spotifyUri) {
                console.log("No URL provided, attempting to play current track...");
    
                // Fetch current track
                const currentTrack = await this.device.currentTrack();
                if (!currentTrack || !currentTrack.uri) {
                    throw new Error("No media found to play.");
                }
    
                // Play current track
                await this.device.play();
                console.log("Playing current track...");
            } else {
                console.log("URL provided, playing specific track...");
    
                // Ensure spotifyUri is in the correct format
                // Example: spotifyUri should be like "spotify:track:6rqhFgbbKwnb9MLmUQDh9A"
                const encodedSpotifyUri = encodeURIComponent(spotifyUri);
                console.log("Encoded Spotify URI:", encodedSpotifyUri);
    
                //Use encode or def spotify uri !
                const formattedUri = `x-sonos-spotify:${encodedSpotifyUri}?sid=9&flags=8224&sn=7`;
                await this.device.play(formattedUri);
                console.log("Spotify track started.");

                // Extract track ID from URI
                const trackId = spotifyUri.split(':').pop();
                console.log("trackid", trackId);
                
                // Get metadata using the new method
                try {
                    const spotifyMetadata = await this.getSpotifyTrackMetadata(trackId);
                    console.log("spotifyMetadata:", spotifyMetadata);
                    
                    // Store the enhanced metadata in your application
                    const enhancedTrackInfo = {
                        // Basic info from Sonos (may be partial)                        
                        // Rich info from Spotify
                        title: spotifyMetadata.name,
                        artist: spotifyMetadata.artists.map(a => a.name).join(', '),
                        album: spotifyMetadata.album.name, 
                        albumArtURL: spotifyMetadata.album.images[0]?.url,
                        duration: spotifyMetadata.duration_ms,
                        
                        // Original URI for reference
                        spotifyUri: spotifyUri
                    };
                    //console.log("before:",encodedSpotifyUri)
                    //await this.device.currentTrack(spotifyMetadata);

                    console.log("Enhanced track info:", enhancedTrackInfo);
                    return enhancedTrackInfo;  // Return the enhanced info
                } catch (metadataError) {
                    console.warn("Failed to get Spotify metadata:", metadataError);
                    // Continue despite metadata failure - at least playback started
                }
            }
    
            // Return the current track after playing
            const track = await this.device.currentTrack();
            console.log("track updates:", track);
            return track;  // Return the track info
    
        } catch (error) {
            console.log("Error occurred:", error);
            throw new Error(`Failed to play: ${error.message}`);
        }
    }
    
    async getSongPosition() {
        try {
            const x = await this.device.currentTrack()
            return x.position
        } catch(error) {
            throw new Error(`Failed to get song position: ${error.message}`);
        }
    }

    async getPlaybackState(gotCalledBySpx?) {
        try {
            const [currentTrack, state, volume] = await Promise.all([
                this.device.currentTrack(),
                this.device.getCurrentState(),
                this.device.getVolume(),
            ]);
            return {
                currentTrack: {
                    sptx: gotCalledBySpx || "Nothings",
                    title: currentTrack.title || "No Track",
                    artist: currentTrack.artist || "Unknown Artist",
                    album: currentTrack.album || "Unknown Album",
                    duration: currentTrack.duration,
                    albumArt: currentTrack.albumArtURL,
                    position: currentTrack.position,
                    uri: currentTrack.uri,
                    isplaying: state !== "paused",
                    stated: state,
                },
                volume,
            };
        } catch (error) {
            throw new Error(`Failed to get playback state: ${error.message}`);
        }
    }

    async getFavorites() {
        try {
            const favorites = await this.device.getFavorites();
            return favorites
        } catch (err) {
            console.error('Error occurred:', err);
        }
    }

    async getDeviceInfo() {
        try {
            const zoneInfo = await this.device.getZoneInfo();
            const deviceDescription = await this.device.deviceDescription();

            return {
                macAddress: zoneInfo.MACAddress,
                host: this.device.host,
                model: deviceDescription.modelName,
                room: deviceDescription.roomName,
            };
        } catch (error) {
            throw new Error(`Failed to get device info: ${error.message}`);
        }
    }
    
    async seek(seconds = 1) {
        try {
            await this.device.seek(seconds);
            console.log(`Seeked to ${seconds} seconds`);
        } catch (error) {
            console.error('Error seeking:', error);
        }
    }
}