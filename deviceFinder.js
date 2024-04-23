import {exec, execFileSync} from "child_process"
import {platform} from "process"
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

export async function scanDevices(){
    return new Promise ((resolve, reject) =>{
        exec("arp -a", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        const ips = stdout.match(regexIP)

        ips.forEach(function(ip, indice){
            ip = ip.replace("(","")
            ip = ip.replace(")","")
            ips[indice] = ip
        })

        const macs = stdout.match(regexMAC)

        const devicesList = createDeviceList(ips,macs);

        resolve(devicesList);
        })
    });
}

export function newCache(){
    let command = "ping"
    console.log(platform)
    if (platform == "win32"){
        command = "./ping.ps1"
    }else{
        command = "./ping.sh"
    }
    // let executar = promisify(execFile)
    // const { stdout } = await executar(command);
    const {stdout} = execFileSync(command);
    console.log(stdout);
}

