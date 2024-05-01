var child_process = require("child_process");
var process = require("process");
var websocket = require("ws");
var dns = require('bonjour-service');


var regexIP=/(\d+)\.(\d+)\.(\d+)\.(\d+)/g;
var regexMAC=/(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/g;

function createDeviceList(ips, macs) {
    const devicesList = [];
    for (let i = 0; i < ips.length; i++) {
        const ip = ips[i];
        const mac = macs[i].toUpperCase();
        devicesList.push({ ip, mac });
    }
    return devicesList;
}

async function scanDevices(){
    var command = "arp"
    var args = []
    var options = {}
    const arpRegex = "'([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})'"

    if (process.platform == "win32"){
        command = "powershell.exe";
        args.push(`arp -a | Where-Object { $_ -match ${arpRegex} }`)
        options = { shell: false };
    }else if (process.platform == "linux"){
        command = "sudo";
        args.push(`arp -a | grep -E ${arpRegex}`)
        options = { shell: true };
    }

    return new Promise ((resolve, reject) =>{
        const arp = child_process.spawn(command, args, options);

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

async function findByScan(){
    const devices = await scanDevices();
    const arrayEsp = [];

    let connectionPromises = devices.map(async esp => {
        try {
            let ws = new websocket.WebSocket(`ws://${esp.ip}/ws`);

            let messagePromise = new Promise((resolve, reject) => {
                let timeout = setTimeout(() => {
                    reject(new Error('Conexão com o WebSocket excedeu o tempo limite'));
                    ws.close();
                }, 5000);
                
                ws.onmessage = event => {
                    if (event.data === "data") {
                        arrayEsp.push(esp);
                        clearTimeout(timeout);
                        resolve();
                    }
                };
                ws.onerror = reject;
                ws.onclose = () => {
                    clearTimeout(timeout);
                    reject(new Error("Conexão com o WebSocket fechada"));
                };
            });

            await messagePromise;
            return null;

        } catch (error) {
            console.error("Erro: ", error);
            return null;
        }
    });

    await Promise.all(connectionPromises);

    return arrayEsp;
}

function newCache(){
    let command = "ping"
    console.log(process.platform)
    if (process.platform == "win32"){
        command = "powershell.exe -File ./ping.ps1"
    }else{
        command = "sh ./ping.sh"
    }
    return new Promise ((resolve, reject) =>{
    	child_process.exec(command, (error, stdout, stderr) => {
  		if (error) {
    			console.error(`Erro ao executar o script: ${error}`);
    			return;
  		}
  		console.log(`Saída do script: ${stdout}`);
		resolve();
    	});
    });
}

async function findByService(){
    var service = new dns.Bonjour()
    
    const hostnames = []
    const macs = []

    return new Promise ((resolve, reject) =>{
        service.find({ type: 'cliyo-sphynx' }, function (service) {
            let timeout = setTimeout(() => {
                const devices = createDeviceList(hostnames, macs);
                resolve(devices);
            }, 10000);
            if (service.txt.mac){
                hostnames.push(service.host);
                macs.push(service.txt.mac);
            }
        })
    });
}

module.exports = {
    findByScan: findByScan,
    newCache: newCache,
    findByService: findByService
  };