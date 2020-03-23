// set up server
const fs = require('fs');
const path = require('path');
const express = require("express");
const app = express();

// create connection to mongoDB
const mongoose = require("mongoose");
require('dotenv').config();
const MONGO_URL=process.env.MONGO_URL || 'mongodb://localhost:27017/test';
// prevent deprecation warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(MONGO_URL, {usedNewURLParser:true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to database")
  //refreshData();
});

// creating data schema
const DSNYSchema = mongoose.Schema({
    bin: {type: Object, unique:true},
  }, {timestamps:true});

const litterDB =mongoose.model("litter", DSNYSchema); // setting the model up
module.exports =litterDB;

// static file server
app.use(express.static('public'));
app.use(express.json());

// add file once to the database
async function refreshData()
{
    const content = fs.readFileSync('DSNY Litter Basket Inventory.geojson');
    let litterObj = JSON.parse(content);
    let litter = litterObj.features;

    // add individual bin data
    let num= 0;
    console.log("refreshing data..... Please wait.....");
    await litter.forEach(element => {
        let borough = "";
        num+=1;
        let section = (element.properties.section).toString().trim();

        // 7 operation zones (Manhattan, Bronx, Brooklyn North, Brooklyn South, Queens West, Queens East, and Staten Island)
        if (section.includes("MN"))
        {    borough = "Manhattan";}
        else if (section.includes("BX"))
        {    borough = "Bronx";}
        else if (section.includes("BK"))
        {    borough = "Brooklyn";}
        else if (section.includes("QW") || section.includes("QE"))
        {    borough = "Queens";}
        else if (section.includes("SI"))
        {    borough = "Staten Island";}

        let newData = {
            basketid: element.properties.basketid,
            geometry: {
                type: "Point",
                coordinates: element.geometry.coordinates
            },
            baskettype: element.properties.baskettype,
            borough: borough
        };

        litterDB.create({bin: newData}, (err, newBin) => {
            if (err) {
              console.log(err);
            }
          });
    });
    console.log("Refreshing data complete.")

}

// endpoints
//GET
app.get("/litter", async (req, res) => {
    litterDB.find({}, (err, result) => {
        if (err) {
          console.log(err);
          res.json(err);
        }
        console.log("Data requested");
        res.json(result);

      });
  });

app.get("/stats", async (req, res) => {
    litterDB.find({"_id":"5e768f1a64e97737b0960ffe"}, (err, result) => {
        if (err) {
          console.log(err);
          res.json(err);
        }
        console.log("Statistics requested");
        res.json(result);

      });
  });

//POST
app.post("/litter", async (req, res) => {
    try{
        const newData ={
            "bin": req.body
        };
        const data = await litterDB.create(newData);
        console.log("adding new data");
        res.json(data);
    } catch(error){
        console.error(error);
        res.json(error);
    }
    });

//PUT
app.put("/litter/:id", async (req, res) => {
    try{
        let itemToModify =req.body.attribute;
        let newValue = req.body.value;
        let changed;
        await litterDB.findOne({"_id": req.params.id}, (err, result) => {
            if (err) {
              console.log(err);
            }
            if (itemToModify === "basketid")
            {
                result.bin.basketid = newValue;
            }
            else if (itemToModify === "coordinates")
            {
                result.bin.coordinates = newValue;
            }
            else if (itemToModify === "baskettype")
            {
                result.bin.baskettype = newValue;
            }
            else if (itemToModify === "borough")
            {
                result.bin.borough = newValue;
            }
            else
            {
                console.log("trying to change an attribute I don't understand");
            }
            changed = result;
          });

        const data = await litterDB.findOneAndUpdate({_id: req.params.id}, changed, {new:true});
        res.json(data);
        console.log( "making changes to data");
    } catch(error){
        console.error(error);
        res.json(error);
    }
    });

//DELETE
app.delete("/litter/:id", async (req, res) => {
    try {
        const deletedDocument = await litterDB.findOneAndDelete({"_id" :req.params.id});
        res.json({"message":"successfully removed item", "data": JSON.stringify(deletedDocument) });
        } catch (error) {
          res.json({ error: JSON.stringify(error) });
        }
    console.log("deleting data");
  });

app.listen(3000, () => {
    console.log("Server listening at http://localhost:3000!") //need this to keep it open to request
    });