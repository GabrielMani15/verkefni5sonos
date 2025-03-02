import DeviceController from '@/app/libs/sonosController';

export async function POST(req) {
    const { host, action, seconds, spotifyUri } = await req.json();
    
    const device = new DeviceController(host);

    try {
        let result;
        switch (action) {
            case 'play':
                result = await device.play(spotifyUri);
                break;
            case 'stop':
                result = await device.stop();
                break;
            case 'nextTrack':
                result = await device.nextTrack();
                break;
            case 'previousTrack':
                result = await device.previousTrack();
                break;
            case 'volumeUp':
                result = await device.volumeUp();
                break;
            case 'volumeDown':
                result = await device.volumeDown();
                break;
            case 'getPlaybackState':
                result = await device.getPlaybackState();
                break;
            case 'getDeviceInfo':
                result = await device.getDeviceInfo();
                break;
            case 'getSongPosition':
                result = await device.getSongPosition();
                break;
            case 'getLibary':
                result = await device.getFavorites();
                break
            case 'seek':
                if (typeof seconds !== 'number') {
                    return new Response(JSON.stringify({ error: 'Invalid seconds value' }), { status: 400 });
                }
                result = await device.seek(seconds);
                break;
            default:
                return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true, result }), { status: 200 });
    } catch (error) {
        console.error("Error occurred:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
