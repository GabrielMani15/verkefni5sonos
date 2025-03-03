export function config(systems) {
    if (!systems || systems.length === 0) return;

    const devices = systems[0]?.devices.map(({ host, roomName }) => ({ host, roomName }));
    
    localStorage.setItem("systems", JSON.stringify(devices));
}
