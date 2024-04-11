import express from 'express';
import cors from 'cors';
import scanNetwork from './deviceFinder.js';

var app = express();
app.use(cors());

app.get("/", async function (req, res) {
    let scan = await scanNetwork();
    res.json((scan))
});

app.listen(3000, function () {
  console.log("Sphynx Finder rodando na porta 3000!");
});
