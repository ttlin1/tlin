var stamen = L.tileLayer("http://tile.stamen.com/toner-lite/{z}/{x}/{y}.png", {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
});

var osm_map = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var trimet_base = L.tileLayer('http://{s}.trimet.org/tilecache/tilecache.py/1.0.0/currentOSM/{z}/{x}/{y}', {
    subdomains: ["tilea","tileb","tilec","tiled"],
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var baseMaps = {
    "Stamen Base": stamen,
    "OSM Base Map": osm_map,
    "TriMet Base Map": trimet_base
};

var taz = L.geoJson();
var allShapes = [];

var overlays = L.layerGroup();
var overlaysIDs = [-1, -1];

var map = L.map('lift-map', {
    center: [45.48,-122.6765],
    zoom: 11,
    layers: [stamen],
    doubleClickZoom: false,
    // scrollWheelZoom: false,
    boxZoom: false,
    zoomControl: false
});

L.control.zoom({
     position:'topright'
}).addTo(map);

var lowValue = 0;
var highValue = 100;

var lowDollarCost = -99999999;
var highDollarCost = 99999999;

var control = L.control.layers(baseMaps, null, {collapsed: true, position: 'topright'});
control.addTo(map);

L.control.scale().addTo(map);

var corner1 = L.latLng(45.232664,-123.160144);
var corner2 = L.latLng(45.659631,-122.248212);
var boundary = L.latLngBounds(corner1, corner2)

var faqInfo = L.control({position: 'bottomleft'});

faqInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'faqInfoDiv');
    this.initializeInfo();
    return this._div;
};

faqInfo.initializeInfo = function () {
    this._div.innerHTML = '<h5>Lift Deadhead Analysis</h5>' +
    '<p>&nbsp;</p>' +
    '<p class="percentileRangeLabel"><label for="amount">Percentile Range:</label><input type="text" id="amount" readonly style="border:0; color:#084C8D; font-weight:bold;"></p><div id="percentile-slider"></div>' +
    '<br>' +
    '<p class="costRangeLabel"><label for="cost">Potential Annual Savings (from current):</label><input type="text" id="cost" readonly style="border:0; color:#084C8D; font-weight:bold;"></p><div id="cost-slider"></div><br>' +
    '<p class="faq-text"><a href="#" onclick="resetMap();">Reset Map</a></p>';
}

faqInfo.addTo(map);

faqInfo.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
});

faqInfo.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
});

var methodInfo = L.control({position: 'bottomright'});

methodInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'methodInfoDiv');
    this.initializeInfo();
    return this._div;
};

methodInfo.initializeInfo = function () {
    this._div.innerHTML = '<h5 style="margin-bottom: 10px;">Methodology<span class="cardController" onclick="toggleQueryBox(1);"></span></h5>' +
    '<p class="faq-text"><br>Using the Lift ridership data from 5/1/2017 to 4/30/2018, this map estimates the total system deadhead miles if a new yard was located in a particular TAZ instead of Nela.<br><br>The analysis sought to reduce the overall system-wide deadhead mileage.<br><br>Powell&#8217;s usage was capped at current levels.</p><br>' +
    '<p class="faq-text">Potential Annual Savings compares the total deadhead miles for a given TAZ to the current scenario based on a cost of $4.31/mile.</p>';
}

methodInfo.addTo(map);

methodInfo.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
});

methodInfo.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
});

var tazInfo = L.control({position: 'bottomleft'});

tazInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'tazInfoDiv');
    this.initializeInfo();
    return this._div;
};

tazInfo.initializeInfo = function () {
    this._div.innerHTML = '<h5 id="tazID"><span style="font-weight: 600;">TAZ: </span></h5><br>' +
    '<p>&nbsp;</p>'
    + '<p id="percentileID" class="taz-text"><span style="font-weight: 600;">Percentile of Total</span>: </p>'
    + '<p id="deadheadMilesID" class="taz-text"><span style="font-weight: 600;">Total Deadhead Miles</span>: </p>'
    + '<p id="merloPullID" class="taz-text"><span style="font-weight: 600;">Merlo Pull Total</span>: </p>'
    + '<p id="powellPullID" class="taz-text"><span style="font-weight: 600;">Powell Pull Total</span>: </p>'
    + '<p id="tazPullID" class="taz-text"><span style="font-weight: 600;">TAZ Pull Total</span>: </p>'
    + '<p id="savingsID" class="taz-text"><span style="font-weight: 600;">Potential Annual Savings</span>: </p>'
}

tazInfo.addTo(map);

tazInfo.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
});

tazInfo.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
});

$(function() {
     $( ".tazInfoDiv" ).draggable();
 });

var geocoderOptions = {
    autocomplete: true,
    collapsible: false,
    expanded: true,
    placeholder: 'Enter address...',
    bounds: boundary,
    panToPoint: true,
    markers: false,
    position: 'bottomleft',
    attribution: 'Geocoding by Pelias',
    url: "https://ws-st.trimet.org/pelias/v1"
};

var geocoder = L.control.geocoder('search-jXrqfdD', geocoderOptions);
geocoder.addTo(map);

geocoder.on('select', function (e) {
    map.setView([e.latlng.lat, e.latlng.lng], 17);
  });

geocoder.on('reset', function(e) {
    map.setView([45.45,-122.681944], 11);
    map.closePopup();
});

geocoder.on('popupclose', function (e) {
    map.setView([45.45,-122.681944], 11);
});

function createPopup(feature, layer) {
    var percentileNumber = parseFloat(feature.properties.PCTILE).toFixed(2).toString() + "%";
    if (percentileNumber == '-1.00%') {
        percentileNumber = "N/A";
    }

    var deadheadMiles = Math.round(parseInt(feature.properties.TOT_DEADHD));
    var merloPulls = parseInt(feature.properties.MERLO_IN) + parseInt(feature.properties.MERLO_OUT);
    var powellPulls = parseInt(feature.properties.POWELL_IN) + parseInt(feature.properties.POWELL_OUT);
    var tazPulls = parseInt(feature.properties.TAZ_IN) + parseInt(feature.properties.TAZ_OUT);

    var popup = L.popup({autoPan: false}).setContent('<span style="font: bold 12px arial, sans-serif; color: #fff; background-color: #000; padding: 3px; display: inline-block; width: 100%;">TOTAL DEADHEAD MILES: '
    + deadheadMiles.toLocaleString('en-US')
    + '</span><br><span style="font: bold 12px arial, sans-serif">TAZ: </span>'
    + feature.properties.TAZ2162
    + '<br><span style="font: bold 12px arial, sans-serif">PERCENTILE</span>: '
    + percentileNumber
    + '</span><br><span style="font: bold 12px arial, sans-serif">MERLO PULL TOTAL</span>: '
    + merloPulls.toLocaleString('en-US')
    + '<br><span style="font: bold 12px arial, sans-serif">POWELL PULL TOTAL</span>: '
    + powellPulls.toLocaleString('en-US')
    + '<br><span style="font: bold 12px arial, sans-serif">TAZ PULL TOTAL</span>: '
    + tazPulls.toLocaleString('en-US')
    + '<br><span style="font: bold 12px arial, sans-serif">POTENTIAL ANNUAL SAVINGS</span>: '
    + ((739106 - deadheadMiles) / 4.31).toLocaleString('en-US', { style: 'currency', currency: 'USD' }));

    layer.bindPopup(popup);

    layer.on('mouseover', function (e) {
        this.setStyle({weight: 2, color: '#000'});
        // this.openPopup();
        document.getElementById("tazID").innerHTML = '<span style="font-weight: 600;">TAZ ID ' + feature.properties.TAZ2162 + '</span>';
        document.getElementById("deadheadMilesID").innerHTML = '<span style="font-weight: 600;">Total Deadhead Miles</span>: ' + deadheadMiles.toLocaleString('en-US');
        document.getElementById("percentileID").innerHTML = '<span style="font-weight: 600;">Percentile of Total</span>: ' + percentileNumber;
        document.getElementById("merloPullID").innerHTML = '<span style="font-weight: 600;">Merlo Pull Total</span>: ' + merloPulls.toLocaleString('en-US');
        document.getElementById("powellPullID").innerHTML = '<span style="font-weight: 600;">Powell Pull Total</span>: ' + powellPulls.toLocaleString('en-US');
        document.getElementById("tazPullID").innerHTML = '<span style="font-weight: 600;">TAZ Pull Total</span>: ' + tazPulls.toLocaleString('en-US');
        document.getElementById("savingsID").innerHTML = '<span style="font-weight: 600;">Potential Annual Savings</span>: ' + ((739106 - deadheadMiles) / 4.31).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    });

    layer.on('mouseout', function (e) {
        this.setStyle({weight: 0.25, color: '#fff'});
        document.getElementById("tazID").innerHTML = '<span style="font-weight: 600;">TAZ ID ' + '</span>';
        document.getElementById("deadheadMilesID").innerHTML = '<span style="font-weight: 600;">Total Deadhead Miles</span>: ';
        document.getElementById("percentileID").innerHTML = '<span style="font-weight: 600;">Percentile of Total</span>: ';
        document.getElementById("merloPullID").innerHTML = '<span style="font-weight: 600;">Merlo Pull Total</span>: ';
        document.getElementById("powellPullID").innerHTML = '<span style="font-weight: 600;">Powell Pull Total</span>: ';
        document.getElementById("tazPullID").innerHTML = '<span style="font-weight: 600;">TAZ Pull Total</span>: ';
        document.getElementById("savingsID").innerHTML = '<span style="font-weight: 600;">Potential Annual Savings</span>: ';
    });

    layer.on('click', function (e) {
        this.openPopup();
    });
}

function createGaragePopup(feature, layer) {

    var popup = L.popup({autoPan: false}).setContent('<span style="font: bold 12px arial, sans-serif; color: #fff; background-color: #000; padding: 3px; display: inline-block; width: 100%;">' + feature.properties.Garage.toUpperCase() + '</span>');

    layer.bindPopup(popup);

    layer.on('mouseover', function (e) {
        this.setStyle({weight: 2, color: '#eee'});
        this.openPopup();
    });

    layer.on('mouseout', function (e) {
        this.setStyle(garageStyle(this.feature));
        this.closePopup();
    });

    layer.on('click', function (e) {
        returnTazFromAddress(e.latlng.lat, e.latlng.lng, this.feature.properties.Garage.toUpperCase() + ' GARAGE');
    });
}

var colorList = ["#084C8D", "#155593", "#225E99", "#2F689F", "#3C71A5", "#497BAB", "#5684B1", "#638DB7", "#7097BD", "#7DA0C3", "#8AAAC9", "#97B3CF", "#A4BDD5", "#B1C6DB", "#BECFE1", "#CBD9E7", "#D8E2ED", "#E5ECF3", "#F2F5F9"];

function myStyle(feature) {
    var ridershipSelection = feature.properties.PCTILE;
    var colorIndex = Math.round((100 - ridershipSelection) / 5.0)

    return {
        weight: 0.5,
        fillColor: colorList[colorIndex],
        fillOpacity: 0.85,
        color: '#fff',
        opacity: 0.7
    };
}

function garageStyle(feature) {
    var garage = feature.properties.Garage;
    if (garage == "Merlo" || garage == "Powell") {
        var circleColor = '#d1441e';
    } else {
        var circleColor = '#000';
    }

    return {
        radius: 5,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 1,
        stroke: true
    };
}

var costArray = [];

function loadData() {

    if (overlaysIDs[0] != -1) {
        overlays.removeLayer(overlaysIDs[0]);
        overlaysIDs[0] = -1;
    }

    if (overlaysIDs[1] != -1) {
        overlays.removeLayer(overlaysIDs[1]);
        overlaysIDs[1] = -1;
    }

    var jsonFileName = 'json/taz.json';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                allShapes.push(feature);
                if (feature.properties.TOT_DEADHD > 0) {
                    var currentMiles = Math.round(parseInt(feature.properties.TOT_DEADHD));
                    var currentCost = (739106 - currentMiles) / 4.31;
                    costArray.push(currentCost);
                }
            }
        }
    });

    taz = L.geoJson(allShapes, {
        style: myStyle,
        onEachFeature: createPopup
    });

    overlays.addLayer(taz).addTo(map);
    if (overlaysIDs.length == 0) {
        overlaysIDs.push(taz._leaflet_id);
    }
    else {
        overlaysIDs[0] = taz._leaflet_id;
    }

    var garageJson = 'json/garages.json';

    var garages = [];
    $.ajax({
        url: garageJson,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                garages.push(feature);
            }
        }
    });

    garage = L.geoJson(garages, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
       onEachFeature: createGaragePopup,
       style: garageStyle
    });

    overlays.addLayer(garage).addTo(map);
    overlaysIDs.push(garage._leaflet_id);

}

loadData();
createSliders();

function updateData() {
    if (overlaysIDs[0] != -1) {
        overlays.removeLayer(overlaysIDs[0]);
        overlaysIDs[0] = -1;
    }

    if (overlaysIDs[1] != -1) {
        overlays.removeLayer(overlaysIDs[1]);
        overlaysIDs[1] = -1;
    }

    var queryShapes = [];

    for (i = 0; i < allShapes.length; i++){
        var currentPercentile = parseFloat(allShapes[i].properties.PCTILE);
        if ((currentPercentile >= lowValue) && (currentPercentile <= highValue)) {
            if (allShapes[i].properties.TOT_DEADHD > 0) {
                var currentMiles = Math.round(parseInt(allShapes[i].properties.TOT_DEADHD));
                var currentCost = (739106 - currentMiles) / 4.31;
                if (((currentCost + 1) >= lowDollarCost) && ((currentCost - 1) <= highDollarCost)) {
                    queryShapes.push(allShapes[i]);
                }
            }
        }
    }

    taz = L.geoJson(queryShapes, {
        style: myStyle,
        onEachFeature: createPopup
    });

    overlays.addLayer(taz).addTo(map);
    if (overlaysIDs.length == 0) {
        overlaysIDs.push(taz._leaflet_id);
    }
    else {
        overlaysIDs[0] = taz._leaflet_id;
    }

    var garageJson = 'json/garages.json';

    var garages = [];
    $.ajax({
        url: garageJson,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                garages.push(feature);
            }
        }
    });

    garage = L.geoJson(garages, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
       onEachFeature: createGaragePopup,
       style: garageStyle
    });

    overlays.addLayer(garage).addTo(map);
    overlaysIDs.push(garage._leaflet_id);
}



function createSliders() {
    costArray.sort(function(a, b){return a - b});

    $( function() {
        $( "#cost-slider" ).slider({
            range: true,
            min: costArray[0],
            max: costArray[costArray.length - 1],
            values: [ costArray[0], costArray[costArray.length - 1] ],
            slide: function( event, ui ) {
                $( "#cost" ).val( ui.values[ 0 ].toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                + " to " + ui.values[ 1 ].toLocaleString('en-US', { style: 'currency', currency: 'USD' }) );
            },
            stop: function( event, ui) {
                lowDollarCost = $('#cost-slider').slider("values")[0];
                highDollarCost = $('#cost-slider').slider("values")[1];
                updateData();
            }
        });
        $( "#cost" ).val($( "#cost-slider" ).slider( "values", 0 ).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) +
        " to " + $( "#cost-slider" ).slider( "values", 1 ).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) );
    });

    $( function() {
        $( "#percentile-slider" ).slider({
            range: true,
            min: 0,
            max: 100,
            values: [ 0, 100 ],
            slide: function( event, ui ) {
                $( "#amount" ).val( ui.values[ 0 ] + " to " + ui.values[ 1 ] );
            },
            stop: function( event, ui) {
                lowValue = $('#percentile-slider').slider("values")[0];
                highValue = $('#percentile-slider').slider("values")[1];
                updateData();
            }
        });
        $( "#amount" ).val($( "#percentile-slider" ).slider( "values", 0 ) +
        " to " + $( "#percentile-slider" ).slider( "values", 1 ) );
    });
}

function returnTazFromAddress(ptLat, ptLng, address) {
    var pt = {
        "type": "Feature",
        "properties": {
            "marker-color": "#f00"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [ptLng, ptLat]
        }
    };

    var selectedTaz;

    for (var i = 0; i < allShapes.length; i++) {
        var poly = allShapes[i];

        if (turf.booleanPointInPolygon(pt, poly)) {
            selectedTaz = allShapes[i];
            break;
        }
    }

    var bbox = turf.bbox(selectedTaz);
    map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
    var popupLatLng = L.latLng(ptLat, ptLng);

    var percentileNumber = parseFloat(selectedTaz.properties.PCTILE).toFixed(2).toString() + "%";
    if (percentileNumber == '-1.00%') {
        percentileNumber = "N/A";
    }

    var deadheadMiles = Math.round(parseInt(selectedTaz.properties.TOT_DEADHD));
    var merloPulls = parseInt(selectedTaz.properties.MERLO_IN) + parseInt(selectedTaz.properties.MERLO_OUT);
    var powellPulls = parseInt(selectedTaz.properties.POWELL_IN) + parseInt(selectedTaz.properties.POWELL_OUT);
    var tazPulls = parseInt(selectedTaz.properties.TAZ_IN) + parseInt(selectedTaz.properties.TAZ_OUT);

    var content = '<span style="font: bold 12px arial, sans-serif; color: #fff; background-color: #000; padding: 3px; display: inline-block; width: 100%;">'
    + address
    + '</span><br><span style="font: bold 12px arial, sans-serif">TOTAL DEADHEAD MILES: '
    + deadheadMiles.toLocaleString('en-US')
    + '</span><br><span style="font: bold 12px arial, sans-serif">TAZ: </span>'
    + selectedTaz.properties.TAZ2162
    + '<br><span style="font: bold 12px arial, sans-serif">PERCENTILE</span>: '
    + percentileNumber
    + '</span><br><span style="font: bold 12px arial, sans-serif">MERLO PULL TOTAL</span>: '
    + merloPulls.toLocaleString('en-US')
    + '<br><span style="font: bold 12px arial, sans-serif">POWELL PULL TOTAL</span>: '
    + powellPulls.toLocaleString('en-US')
    + '<br><span style="font: bold 12px arial, sans-serif">TAZ PULL TOTAL</span>: '
    + tazPulls.toLocaleString('en-US')
    + '<br><span style="font: bold 12px arial, sans-serif">POTENTIAL ANNUAL SAVINGS</span>: '
    + ((739106 - deadheadMiles) / 4.31).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    L.popup().setLatLng(popupLatLng)
        .setContent(content)
        .openOn(map);
}


geocoder.on('select', function (e) {
    // map.setView([e.latlng.lat, e.latlng.lng], 17);
    returnTazFromAddress(e.latlng.lat, e.latlng.lng, e.feature.properties.name);
});

geocoder.on('reset', function(e) {
    map.setView([45.48,-122.6765], 11);
    map.closePopup();
});

function toggleQueryBox(selectNumber) {
    function changeMarker(currentDivClass, markerClass) {
        var tr = $(currentDivClass + markerClass).css("transform") ||
                 $(currentDivClass + markerClass).css("-webkit-transform") ||
                 $(currentDivClass + markerClass).css("-moz-transform") ||
                 $(currentDivClass + markerClass).css("-ms-transform") ||
                 $(currentDivClass + markerClass).css("-o-transform") ||
                 $(currentDivClass + markerClass).css("transform");

    var values = tr.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];

    var scale = Math.sqrt(a*a + b*b);
    var sin = b/scale;
    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    var newAngle = 180 + angle;

    var newRotation = 'rotate(' + newAngle + 'deg)';

    $(currentDivClass + markerClass).css({
      '-webkit-transform' : newRotation,
      '-moz-transform'    : newRotation,
      '-ms-transform'     : newRotation,
      '-o-transform'      : newRotation,
      'transform'         : newRotation
    });
    }

    switch (selectNumber){
        case 1:
            $(".methodInfoDiv p").toggle();
            changeMarker('.methodInfoDiv', ' .cardController');
            break;
    }
};

function resetMap() {
    map.closePopup();
    map.setView(L.latLng([45.48, -122.6765]), 11);
    costArray = [];
    loadData();
    createSliders();
}
