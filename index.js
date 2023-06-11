require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const {MongoClient} = require('mongodb');
var bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');
const urlparser = require('url');

const client = new MongoClient(process.env.MONGO_URL);
const db = client.db("urlshortener");
const urls = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req, res) {

    const oUrl = req.body.url;

    const dnslookup = dns.lookup(urlparser.parse(oUrl).hostname, async(err, address) => {
        if(!address){
          res.json({error: "Invalid url"});
        } else {

          const urlCount = await urls.countDocuments({});
          const urlDoc = {
            oUrl,
            short_url: urlCount
          }

          const result = await urls.insertOne(urlDoc);
          console.log(result);

          res.json({

            original_url: oUrl,
            short_url: urlCount
          })

        }

      });

});

app.get('/api/shorturl/:short_url', async function(req, res) {

  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({short_url: +shorturl});
  res.redirect(urlDoc.oUrl);

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
