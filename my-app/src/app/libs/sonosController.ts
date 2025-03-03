import { Sonos } from 'sonos';
export default class DeviceController {
    device: any;
    constructor(ip) {
        this.device = new Sonos(ip);
    }

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
    
                // Use the correct API call for Spotify
                //let accessToken = "AQD7Nm8DgeVLsM5lqMCDx5tGHH3chIkly8q8bqMnkdmiZHL1_3my4jNiCGq42X6il94nLA2N7Q2wO5djFBZ7vgZZXCfqPjXUNT6I-LTBZ6WXExPAjDnbp94wzxyPfFsAIujmvLlk08y9UJxudFwrxvtNHx9BLtG5cRYYcluZFqFJuXcD7Ue9M9FuWUyOFnoTBoj2S_eEgb4gJmoxFVgsLHWbnO5xx42acOcMTYqTCZiMjsai1WypgJiTm_kmzYjfpVKH6rQweMsW8S3ao3OdSmc"
                
                const formattedUri = `x-sonos-spotify:${spotifyUri}?sid=9&flags=8224&sn=7`;
                await this.device.play(formattedUri);
                /* this.device.on('AVTransport', (data) => {
                    console.log("Transport state changed:", data);
                    // This event fires when playback state changes
                  }); */
                //let accessToken = localStorage.getItem("accessToken")
                //await this.device.play(`x-sonos-spotify:${encodedSpotifyUri}`, { headers: { Authorization: `Bearer ${accessToken}` } });

                console.log("Spotify track started.");

                const trackId = spotifyUri.split(':').pop();
                console.log("trackid",trackId)
                const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
                  headers: {
                    'Authorization': `Bearer ${"AQD7Nm8DgeVLsM5lqMCDx5tGHH3chIkly8q8bqMnkdmiZHL1_3my4jNiCGq42X6il94nLA2N7Q2wO5djFBZ7vgZZXCfqPjXUNT6I"}`
                  }
                });
                
                const spotifyMetadata = await response.json();
                
                // Step 3: Store the enhanced metadata in your application
                // (You can't push this to Sonos, but you can use it in your UI)
                const enhancedTrackInfo = {
                  // Basic info from Sonos (may be partial)
                  sonosInfo: await this.device.currentTrack(),
                  
                  // Rich info from Spotify
                  title: spotifyMetadata.name,
                  artist: spotifyMetadata.artists.map(a => a.name).join(', '),
                  album: spotifyMetadata.album.name, 
                  albumArtURL: spotifyMetadata.album.images[0]?.url,
                  duration: spotifyMetadata.duration_ms,
                  
                  // Original URI for reference
                  spotifyUri: spotifyUri
                };
                console.log(spotifyMetadata)
            }
    
            // Return the current track after playing, in case of a URL
            const track = await this.device.currentTrack();
            console.log("track updates:",track)
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

    async getPlaybackState() {
        try {
            const [currentTrack, state, volume] = await Promise.all([
                this.device.currentTrack(),
                this.device.getCurrentState(),
                this.device.getVolume(),
            ]);
            return {
                currentTrack: {
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
