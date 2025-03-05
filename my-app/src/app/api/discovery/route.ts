"use client"
import { NextResponse } from "next/server";
import { AsyncDeviceDiscovery } from "sonos";
import { DeviceInfo } from "../types/discoveryType";

async function discoverSonosHosts() {
    const discovery = new AsyncDeviceDiscovery();
    try {
        const devices = await discovery.discoverMultiple();

        const deviceList: DeviceInfo[] = await Promise.all(
            devices.map(async (device) => {
                try {
                    const [deviceInfo, state] = await Promise.all([
                        device.deviceDescription(),
                        device.getCurrentState(),
                    ]);
                    console.log(deviceInfo)
                    const imgUrl = "http://"+deviceInfo.friendlyName.slice(0,13)+deviceInfo.iconList.icon.url
                    return {
                        host: device.host,
                        name: deviceInfo.displayName,
                        model: deviceInfo.modelName,
                        roomName: deviceInfo.roomName,
                        id: deviceInfo.serialNum,
                        isReady: state,
                        macAddress: deviceInfo.MACAddress,
                        houseHoldId: deviceInfo.UDN.slice(-4),
                        deviceImgUrl: imgUrl
                    };
                } catch (error: unknown) {
                    console.warn("Error fetching device info:", error);
                    return null;
                }
            })
        );

        const validDevices = deviceList.filter(Boolean);

        const systemSet = new Set<string>();

        const systemMap = new Map<string, { systemName: string; devices: DeviceInfo[] }>();

        validDevices.forEach((device) => {
            const systemId = device.houseHoldId;

            if (!systemMap.has(systemId)) {
                systemMap.set(systemId, {
                    systemName: device.roomName,
                    devices: [],
                });

                systemSet.add(systemId);
            }

            systemMap.get(systemId)?.devices.push(device);
        });

        const systems = Array.from(systemMap, ([systemId, { systemName, devices }]) => ({
            systemId,
            systemName,
            devices,
        }));

        return {
            success: true,
            systemCount: systemSet.size,
            systems,
        };
    } catch (error: any | unknown) {
        return {
            success: false,
            error: error.message,
            systemCount: 0,
            systems: [],
        };
    }
}

export async function GET() {
    const response = await discoverSonosHosts();
    return NextResponse.json(response);
}
