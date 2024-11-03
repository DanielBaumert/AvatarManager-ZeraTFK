import { invoke } from "@tauri-apps/api/core"


export const connect = (username: string) => { 
    invoke("connect", { username: username });
}