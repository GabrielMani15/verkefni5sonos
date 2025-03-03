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