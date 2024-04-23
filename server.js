import express from 'express';
import cors from 'cors';
import {scanDevices, newCache} from './deviceFinder.js';

var app = express();
app.use(cors());

const corsOptions = {
  "Access-Control-Allow-Origin": "*"
}

app.get("/", cors(corsOptions), async function (req, res) {
    let ping = await newCache();
    let scan = await scanDevices();
    console.log("scan", scan)
    res.json(scan)
});

app.listen(3000, function () {
  console.log("Sphynx Finder rodando na porta 3000!");
});
