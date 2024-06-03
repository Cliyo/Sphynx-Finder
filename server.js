var express = require("express");
var cors = require("cors");
var finder = require("./deviceFinder.js")
var dns = require('bonjour-service');

const service = new dns.Bonjour()

service.publish({ name: 'sphynx-finder', type: 'cliyo-sphynx', port: 57127, host: 'sphynx-finder.local', disableIPv6: true})
service.publish({ name: 'sphynx', type: 'cliyo-sphynx', port: 57129, host: 'sphynx.local', disableIPv6: true})

var app = express();
app.use(cors());

const corsOptions = {
  "Access-Control-Allow-Origin": "*"
}

app.get("/online", cors(corsOptions), async function (req, res){
  console.log("status requested: API ONLINE")
  res.status(200).json()
});

app.get("/scan", cors(corsOptions), async function (req, res) {
  await finder.newCache();

  let scan = await finder.findByScan();

  console.log("scan", scan);

  res.status(200).json(scan);
});

app.get("/services", cors(corsOptions), async function (req, res) {
  let services = await finder.findByService();

  console.log("services", services);

  res.status(200).json(services);
});

app.listen(57127, function () {
  console.log("Sphynx Finder rodando na porta 57127!");
});
