import child_process from "child_process"

var expRegularIP=/\((.*?)\)/g;
var expRegularMAC=/(?:[0-9a-fA-F]:?){12}/g;

function createDeviceList(ips, macs) {
    const devicesList = [];
    for (let i = 0; i < ips.length; i++) {
        const ip = ips[i];
        const mac = macs[i];
        devicesList.push({ ip, mac });
    }
    return devicesList;
}

function scanDevices(){
    child_process.exec("arp -a", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    const ips = stdout.match(expRegularIP)
    ips.forEach(function(ip, indice){
        ip = ip.replace("(","")
        ip = ip.replace(")","")
        ips[indice] = ip
    })

    const macs = stdout.match(expRegularMAC)

    const deviceList = createDeviceList(ips,macs);

    console.log(deviceList);
    return deviceList


    });
}

export default scanDevices;
