// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::{fs, net::UdpSocket};
use uuid::Uuid;
use md5;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}



#[tauri::command]
fn connect(username: &str) -> String { 

    let uuid = Uuid::new_v4();
    let uuid_str = uuid.hyphenated().to_string();
    let full = format!("@link@{username}{uuid_str}");
    let _ = fs::write("user.txt", full);
    //say(username ,format!("@link@{username}{uuid}").as_str());
    ;
    let mut digest = md5::compute(format!("{full}{}").as_bytes());
    let key = format!("{:x}", digest);

    return  
}

fn say(usr: &str, msg: &str) {     
    let socket = UdpSocket::bind("terabyte-unlimited.com:15101")
        .expect("asd");

    let req: String = format!("{usr}{msg}");
    let req_data: &[u8] = req.as_bytes();

    let _ = socket.send(req_data);
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![connect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
