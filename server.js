import express from 'express';
import cors from 'cors';
import {getAllSphynx, newCache} from './deviceFinder.js';

var app = express();
app.use(cors());

const corsOptions = {
  "Access-Control-Allow-Origin": "*"
}

app.get("/sphynx", cors(corsOptions), async function (req, res) {
  await newCache();
  let scan = await getAllSphynx();

  console.log("scan", scan);

  res.status(200).json(scan);
});

app.listen(3000, function () {
  console.log("Sphynx Finder rodando na porta 3000!");
});
