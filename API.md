# API Documentation

## About

This is a API that returns users with an array of 23,419 objects. Each object represents a public trash bin in NY from [NYC Open Data] (https://data.cityofnewyork.us/dataset/DSNY-Litter-Basket-Inventory/uhim-nea2) and contains 4 attributes: _id, bin, createdAt, and updatedAt.

Example object:
<code>
{
    _id: "5e76a0c4ac185f394084326e",
    bin: {
            basketid: 10230040,
        
            geometry: 
            {
                type: "Point",
                coordinates: [[-74.00332376829073,40.73863985524612]
            },

            baskettype: "Standard Wire Basket",
            
            borough: "Manhattan"
        }
    createdAt: timestamp,
    updatedAt: timestamp
}
</code>

## Endpoints

### GET
GET : https://jlizardo019-firstapi.glitch.me/litter 

Response: returns entire database in form of a json

### POST
POST : https://jlizardo019-firstapi.glitch.me/litter 

*In the body, list the new bin object you would like to add to the API*

Body: 
<code>
{
    basketid: integer,

    geometry: 
    {
        type: "Point",
        coordinates: [x,y]
    },

    baskettype: "string",
    
    borough: "string" 
}
</code>

Response: updates database

### PUT
PUT : https://jlizardo019-firstapi.glitch.me/plants/binidyouwantupdate

*In the url, enter the bin id of the bin object you would like to update in the API*
*In the body, list the attribute of the bin object you would like to change and its new value*

Body: 
<code>
{
    "attribute": "string",
    
    "value": newValue
}
</code>

Response: updates database

### DELETE
DELETE : https://jlizardo019-firstapi.glitch.me/plants/binidyouwantremoved 

*In the url, enter the bin id of the object you would like to remove from the API*

Response: updates database


