import { Sonos } from 'sonos';
export default class DeviceController {
    device: any;
    constructor(ip) {
        this.device = new Sonos(ip);
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
        console.log("play method invoked")
        try {
            if (!spotifyUri) {
                console.log("No url provided")
                const currentTrack = await this.device.currentTrack();
                if (!currentTrack || !currentTrack.uri) {
                    throw new Error("No media found to play.");
                }
                await this.device.play();
            } else {
                //await this.device.setAVTransportURI(spotifyUri);
                await this.device.play(spotifyUri);
                //await this.device.getPlaybackState()
                console.log("url provided")
                const track = await this.device.currentTrack();
                return this.device.currentTrack()
            }
            return true;
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
                    title: currentTrack.title || "Bylgjan",
                    artist: currentTrack.artist,
                    album: currentTrack.album,
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
