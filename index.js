require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();
const dns = require("dns");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const { Schema } = mongoose;

const urlSchema = new Schema({
  original_url : {
    type: String,
    required: true
  },
  short_url : {
    type: Number
  }
})


let Url = mongoose.model("Url", urlSchema);

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.route("/api/shorturl").post( async (req, res) => {
  console.log(req.body);
  const original_url = req.body.url;

  if(!original_url.includes("http://") && !original_url.includes("https://")){
    return res.status(200).json({
      error:	"Invalid URL"
    })
  }

  let testUrl = original_url.replace("https://", "").replace("http://", "");
  testUrl = testUrl.split("/")[0];
  dns.lookup(testUrl, async (err, data) => {
    if(err){
      return res.status(200).json({
        error:	"Invalid URL"
      })
    }

    const newUrl = new Url({
      original_url
    })

    const count = await Url.countDocuments();
    console.log(count);

    const short_url = count + 1;

    newUrl.short_url = short_url;

    await newUrl.save();
    
    return res.json({
      original_url,
      short_url
    })
  })
  
})

app.get("/api/shorturl/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  console.log();
  const url = await Url.findOne({short_url: Number(id)});
  //res.redire
  res.redirect(url.original_url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
