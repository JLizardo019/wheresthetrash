let data;
let mymap;

let bxMarkers =[];
let qnMarkers=[];
let mnMarkers=[];
let stMarkers=[];
let bkMarkers=[];

let cityMarkers=[];

let base;
let boroughs;

window.addEventListener('DOMContentLoaded', async() => {

    // initialize map and go to New York City coordinates
    mymap = L.map('mapid').setView([40.7127281, -74.0060152], 10);
    base = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', 
        {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiamxpejAxOSIsImEiOiJjazgyNnZvb3UwaXloM21xcXRzNHF2ZDloIn0.STeSHpfvDnehRwvb_fA7Dw'
    }).addTo(mymap);

    // use geolocation to show the closest bin
    let lc =L.control.locate({flyTo:true, returnToPrevBounds: true,strings: {title: "My Location"}, locateOptions: {maxZoom:15, enableHighAccuracy: true}}).addTo(mymap);

    // Setting up sidebar
    var sidebar = L.control.sidebar({
        autopan: false,       // whether to maintain the centered map point when opening the sidebar
        closeButton: true,    // whether t add a close button to the panes
        container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
        position: 'left',     // left or right
    }).addTo(mymap);

    /* open a panel */
    sidebar.open('home');

    //fetching data
    mymap.spin(true, {lines: 12, length: 15, width:8, radius:18, scale:0.9, corners:1, speed:1, rotate:0, color:"#493547"});
    await retrievingDB();
    settingMarkers();
    await settingBoundaries();
    mymap.spin(false);
    
    // layers
    let baseMaps = {
        //can contain html in titles
        "Citywide": cityMarkers,
        "By Borough": boroughs
    };

    let overlayMaps={
        "Brooklyn": bkMarkers,
        "Bronx": bxMarkers,
        "Manhattan": mnMarkers,
        "Queens": qnMarkers,
        "Staten Island": stMarkers
    }

    // adding the control panel
    L.control.layers(baseMaps,overlayMaps, {collapsed:false}).addTo(mymap);
    cityMarkers.addTo(mymap);

});

async function retrievingDB()
{
    let response = await fetch('/litter',{method:"GET"});
    data = await response.json();
}

async function settingBoundaries()
{
    // get boundary points from json;
    let response = await fetch('Borough Boundaries.geojson');
    let borough = await response.json();
    let results = borough.features;

    // render geometries
    let boundaries =[];

    results.forEach(each =>{
        let polygon = L.geoJSON(each.geometry, {
            style: function (feature) {
                return {color: "#493547"};
            }});
        polygon.bindPopup(`<b>${each.properties.boro_name}<b>`)
        boundaries.push(polygon);
    });

    boroughs= L.layerGroup(boundaries);
}

function settingMarkers()
{
    let bxBins =[];
    let qnBins=[];
    let mnBins=[];
    let stBins=[];
    let bkBins=[];
    let cityBins=[];

    //iterate over the data and make markers
    data.forEach(each => {
        let geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#a1e88c",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        
        let marker = L.geoJSON(each.bin.geometry, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        });

        marker.bindPopup(`<b>_id: ${each._id}</b><br>Basket ID: ${each.bin.basketid}<br>Basket Type: ${each.bin.baskettype}<br>Borough: ${each.bin.borough}`);
        cityBins.push(marker);
        if (each.bin.borough ==="Queens")
        {
            qnBins.push(marker);
        }
        else if (each.bin.borough ==="Brooklyn")
        {
            bkBins.push(marker);
        }
        else if (each.bin.borough ==="Manhattan")
        {
            mnBins.push(marker);
        }
        else if (each.bin.borough ==="Bronx")
        {
            bxBins.push(marker);
        }
        else if (each.bin.borough ==="Staten Island")
        {
            stBins.push(marker);
        }
        else
        {
            console.log("error", each.bin.borough);
        }
    });

    // group markers into layers
    qnMarkers = L.layerGroup(qnBins);
    bkMarkers = L.layerGroup(bkBins);
    mnMarkers = L.layerGroup(mnBins);
    bxMarkers = L.layerGroup(bxBins);
    stMarkers = L.layerGroup(stBins);
    cityMarkers = L.layerGroup(cityBins);
}
