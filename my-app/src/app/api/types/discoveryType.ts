export interface SystemConfig {
    host: string;
    systemId: string,
    systemName: string;
    devices: DeviceInfo[];
    devicesCount: number;
    succes: boolean;
    errors?: Errors[];
    groups?: [];
    logs?: [];
}

export interface Errors {
    warn: string[];
    errors: string[];
    fatal: string[];
    info: string[];
}

export interface DeviceInfo {
    host: number;
    name: string;
    model: string;
    roomName: string;
    id: string;
    isReady: boolean;
    macAddress: string;
    houseHoldId: string;
}

export interface Playlist {
    name: string;
    owner: string;
    type: string;
    id: string;
    images: Array<{ url: string }>;
    tracks: Track[];
    href: string;
    uri: string;
}
  
export interface Track {
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

export interface Profile {
    id: string;
    display_name?: string;
}