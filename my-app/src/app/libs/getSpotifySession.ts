import getConfigReq from "./getConfigReq";

export function spotifySession() {
    const { spotifyEnvVariable: token } = getConfigReq();
    console.log(token)
}