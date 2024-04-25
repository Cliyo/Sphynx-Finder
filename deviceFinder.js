import {exec, spawn} from "child_process"
import {platform} from "process"
import WebSocket from "ws";
import {promisify} from "util"

var regexIP=/(\d+)\.(\d+)\.(\d+)\.(\d+)/g;
var regexMAC=/(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/g;

function createDeviceList(ips, macs) {
    const devicesList = [];
    for (let i = 0; i < ips.length; i++) {
        const ip = ips[i];
        const mac = macs[i];
        devicesList.push({ ip, mac });
    }
    return devicesList;
}

async function scanDevices(){
    var command = "arp"
    var args = []
    var options = {}
    const arpRegex = "'([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})'"

    if (platform == "win32"){
        command = "powershell.exe";
        args.push(`arp -a | Where-Object { $_ -match ${arpRegex} }`)
        options = { shell: false };
    }else if (platform == "linux"){
        command = "sudo";
        args.push(`arp -a | grep -E ${arpRegex}`)
        options = { shell: true };
    }

    return new Promise ((resolve, reject) =>{
        const arp = spawn(command, args, options);

        let stdout = '';
        let stderr = '';

        arp.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        arp.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        arp.on('close', (code) => {
            if (code !== 0) {
                console.error(`${code}`);
                reject(stderr);
                return;
            }

            const ips = stdout.match(regexIP)
            const macs = stdout.match(regexMAC)

            const devicesList = createDeviceList(ips,macs);
            resolve(devicesList);
        });
    });
}

export async function getAllSphynx(){
    const devices = await scanDevices();
    const arrayEsp = [];

    let connectionPromises = devices.map(async esp => {
        try {
            let ws = new WebSocket(`ws://${esp.ip}/ws`);

            let messagePromise = new Promise((resolve, reject) => {
                ws.onmessage = event => {
                    if (event.data === "data") {
                        arrayEsp.push(esp);
                        resolve();
                    }
                };
                ws.onerror = reject;
                ws.onclose = () => {
                    reject(new Error("Conexão com o WebSocket fechada"));
                };
            });

            await messagePromise;

        } catch (error) {
            console.error("Erro: ", error);
        }
    });

    await Promise.all(connectionPromises);

    console.log(arrayEsp);

    return arrayEsp;
}

export function newCache(){
    let command = "ping"
    console.log(platform)
    if (platform == "win32"){
        command = "powershell.exe -File ./ping.ps1"
    }else{
        command = "sh ./ping.sh"
    }
    return new Promise ((resolve, reject) =>{
    	exec(command, (error, stdout, stderr) => {
  		if (error) {
    			console.error(`Erro ao executar o script: ${error}`);
    			return;
  		}
  		console.log(`Saída do script: ${stdout}`);
		resolve();
    	});
    });
}
