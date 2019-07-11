var stamen = L.tileLayer("http://tile.stamen.com/toner-lite/{z}/{x}/{y}.png", {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
});

var trimet_base = L.tileLayer('http://{s}.trimet.org/tilecache/tilecache.py/1.0.0/currentOSM/{z}/{x}/{y}', {
    subdomains: ["tilea","tileb","tilec","tiled"],
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var baseMaps = {
    "Stamen Base": stamen,
    "TriMet Base Map": trimet_base
};

var reserves = L.geoJson();
var reservesArray = [];

var smartDistrict = L.geoJson();
var smartDistrictArray = [];

var taxlots = L.geoJson();
var taxlotsArray = [];

var ugb = L.geoJson();
var ugbArray = [];

var hb2017 = L.geoJson();
var hb2017Array = [];

var sep = L.geoJson();
var sepArray = [];

var overlays = L.layerGroup();
var overlaysIDs = [];

var map = L.map('ugb-map', {
    center: [45.441808, -122.865883],
    zoom: 14,
    layers: [trimet_base],
    doubleClickZoom: false,
    // scrollWheelZoom: false,
    boxZoom: false,
    zoomControl: false
});

L.control.zoom({
     position:'topright'
}).addTo(map);

// var control = L.control.layers(baseMaps, null, {collapsed: true, position: 'topright'});
// control.addTo(map);

L.control.scale().addTo(map);

var corner1 = L.latLng(45.232664,-123.160144);
var corner2 = L.latLng(45.659631,-122.248212);
var boundary = L.latLngBounds(corner1, corner2)

var geocoderOptions = {
    autocomplete: true,
    collapsible: false,
    expanded: true,
    placeholder: 'Enter address...',
    bounds: boundary,
    panToPoint: true,
    markers: true,
    position: 'topleft',
    attribution: 'Geocoding by Pelias',
    url: "https://ws-st.trimet.org/pelias/v1"
};

L.Layer.include({

     showDelay: 1200,
     hideDelay: 100,

     bindTooltipDelayed: function (content, options) {

         if (content instanceof L.Tooltip) {
             L.setOptions(content, options);
             this._tooltip = content;
             content._source = this;
         } else {
             if (!this._tooltip || options) {
                 this._tooltip = new L.Tooltip(options, this);
             }
             this._tooltip.setContent(content);

         }

         this._initTooltipInteractionsDelayed();

         if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
             this.openTooltipWithDelay();
         }

         return this;
     },

     _openTooltipDelayed: function (e) {
         var layer = e.layer || e.target;

         if (!this._tooltip || !this._map) {
             return;
         }
         this.openTooltipWithDelay(layer, this._tooltip.options.sticky ? e.latlng : undefined);
     },

     openTooltipDelayed: function (layer, latlng) {
         if (!(layer instanceof L.Layer)) {
             latlng = layer;
             layer = this;
         }
         if (layer instanceof L.FeatureGroup) {
             for (var id in this._layers) {
                 layer = this._layers[id];
                 break;
             }
         }
         if (!latlng) {
             latlng = layer.getCenter ? layer.getCenter() : layer.getLatLng();
         }
         if (this._tooltip && this._map) {
             this._tooltip._source = layer;
             this._tooltip.update();
             this._map.openTooltip(this._tooltip, latlng);
             if (this._tooltip.options.interactive && this._tooltip._container) {
                 addClass(this._tooltip._container, 'leaflet-clickable');
                 this.addInteractiveTarget(this._tooltip._container);
             }
         }

         // layer.fireEvent('mousemove', lastMouseEvent);

         return this;
     },
     openTooltipWithDelay: function (t, i) {
         this._delay(this.openTooltipDelayed, this, this.showDelay, t, i);
     },
     closeTooltipDelayed: function () {
         if (this._tooltip) {
             this._tooltip._close();
             if (this._tooltip.options.interactive && this._tooltip._container) {
                 removeClass(this._tooltip._container, 'leaflet-clickable');
                 this.removeInteractiveTarget(this._tooltip._container);
             }
         }
         return this;
     },
     closeTooltipWithDelay: function () {
         clearTimeout(this._timeout);
         this._delay(this.closeTooltipDelayed, this, this.hideDelay);
     },
     _delay: function (func, scope, delay, t, i) {
         var me = this;
         if (this._timeout) {
             clearTimeout(this._timeout)
         }
         this._timeout = setTimeout(function () {
             func.call(scope, t, i);
             delete me._timeout
         }, delay)
     },
     _initTooltipInteractionsDelayed: function (remove$$1) {
         if (!remove$$1 && this._tooltipHandlersAdded) { return; }
         var onOff = remove$$1 ? 'off' : 'on',
            events = {
                remove: this.closeTooltipWithDelay,
                move: this._moveTooltip
            };
         if (!this._tooltip.options.permanent) {
             events.mouseover = this._openTooltipDelayed;
             events.mouseout = this.closeTooltipWithDelay;
             events.click = this.closeTooltipWithDelay;
             if (this._tooltip.options.sticky) {
                 events.mousemove = this._moveTooltip;
             }
             if (L.touch) {
                 events.click = this._openTooltipDelayed;
             }
         } else {
             events.add = this._openTooltipDelayed;
         }
         this[onOff](events);
         this._tooltipHandlersAdded = !remove$$1;
     }
 });

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'legendDiv');
    this.initializeInfo();
    return this._div;
};

legend.initializeInfo = function () {
    this._div.innerHTML = '<p class="legendHeading">Urban Growth Boundary Expansion</p><br><p>&nbsp;</p><p>This map displays the proposed UGB expansion areas.</p><br><p><div  id="radioSelectors">' + '<input type="radio" id="beaverton" name="areaNames" value="beaverton" checked /><label for="beaverton">Beaverton: Cooper Mountain</label><br>' +
    '<input type="radio" id="hillsboro" name="areaNames" value="hillsboro" /><label for="hillsboro">Hillsboro: Witch Hazel Village South</label><br>' +
    '<input type="radio" id="kingcity" name="areaNames" value="kingcity" /><label for="kingcity">King City: Beef Bend South</label><br>' +
    '<input type="radio" id="wilsonville" name="areaNames" value="wilsonville" /><label for="wilsonville">Wilsonville: Frog Pond</label>' +'</div><br><div style="flex-direction: row; margin-bottom: 10px;"><a href="#" onclick="toggleLayer(1);"><span id="taxlotLegend" style="background-color: #ffa228; display: inline-block; height: 20px; width: 20px; margin-left: 5px; border: 1px solid #fff;"></span><span style="position: absolute; margin-left: 5px; margin-top: 1px;">Tax Lots</span></a>' +
    '<a href="#" onclick="toggleLayer(2)"><span style="background-color: #fff; display: inline-block; height: 20px; width: 20px; margin-left: 75px; border: 1px dashed red;"></span><span style="position: absolute; margin-left: 5px; margin-top: 1px;">UGB Boundary</span></a>' + '<a href="#" onclick="toggleLayer(0);"><span style="background-color: #fff; display: inline-block; height: 20px; width: 20px; margin-left: 95px; border: 1px solid cyan;"></span><span style="position: absolute; margin-left: 5px; margin-top: 1px;">UGB Expansion Area</span></a>' + '<br><br><a href="#" onclick="toggleLayer(3);"><span style="background-color: #fff; display: inline-block; height: 20px; width: 20px; margin-left: 5px; border: 1px dashed #009933;"></span><span style="position: absolute; margin-left: 5px; margin-top: 1px;">SMART District</span></a>' +
    '<span style="background-color: #fff; display: inline-block; height: 20px; width: 20px; margin-left: 105px; border: 1px dashed #825a3b;"></span><span style="position: absolute; margin-left: 5px; margin-top: 1px;">TriMet District</span>' + '<br><br><a href="#" onclick="toggleLayer(4);"><span style="background-color: #fff; display: inline-block; height: 20px; width: 20px; margin-left: 5px; margin-top: 8px; border-top: 3px solid #78ff30;"></span><span style="position: absolute; margin-left: 5px; margin-top: 1px;">HB2017 Service</span></a>' + '<a href="#" onclick="toggleLayer(5);"><span style="background-color: #fff; display: inline-block; height: 20px; width: 20px; margin-left: 105px; margin-top: 8px; border-top: 3px solid #f830ff;"></span><span style="position: absolute; margin-left: 5px; margin-top: 1px;">Original SEP (click to add)</span></a>' + '</div></p>';
}

legend.addTo(map);

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
    var popupContent = '<span style="font-weight: 600;">TLID: </span>' + feature.properties.TLID +
    '<br><span style="font-weight: 600;">Site Address: </span>' + feature.properties.SITEADDR +
    '<br><span style="font-weight: 600;">Site City: </span>' + feature.properties.SITECITY +
    '<br><span style="font-weight: 600;">Site ZIP: </span>' + feature.properties.SITEZIP;

    var popup = L.popup().setContent(popupContent);

    layer.bindPopup(popup)

    layer.on('mouseover', function (e) {
        this.openPopup();
        this.setStyle({opacity: 0.5, fillOpacity: 0.85});
    });

    // layer.on('click', function (e) {
    //     this.openPopup();
    //     this.setStyle({opacity: 0.5, fillOpacity: 0.85});
    // });

    layer.on('mouseout', function (e) {
        this.closePopup();
        this.setStyle({opacity: 0.5, fillOpacity: 0.5});
    });
}

function hbPopup(feature, layer) {
    layer.showDelay = 800; //use 0 for no delay behavior
    layer.hideDelay = 0; //use 0 for normal behavior
    layer.bindTooltipDelayed("Click to view details about this HB2017 Improvement.");

    var rteDesc = feature.properties.rte_desc;
    var popupContent = '<span style="font-weight: 600;">Route: </span>' + feature.properties.public_rte + ' - ' + rteDesc.replace(/_/g, ' ') + '<br>' +
                       '<span style="font-weight: 600;">Improvement: </span>' + feature.properties.improvemen;

    var popup = L.popup().setContent(popupContent);

    layer.bindPopup(popup)

    layer.on('click', function (e) {
        this.openPopup();
        this.setStyle({weight: 10});
    });

    layer.on('popupclose', function (e) {
        this.setStyle({weight: 3});
    });
}

function sepPopup(feature, layer) {
    layer.showDelay = 800; //use 0 for no delay behavior
    layer.hideDelay = 0; //use 0 for normal behavior
    layer.bindTooltipDelayed("Click to view details about this SEP Improvement.");

    var desc = feature.properties.Layer_name;
    var popupContent = '<span style="font-weight: 600;">Route: </span>' + feature.properties.Route + '<br>' +
                       '<span style="font-weight: 600;">Description: </span>' + desc.replace(/_/g, ' ') + '<br>' +
                       '<span style="font-weight: 600;">Improvement: </span>' + feature.properties.Improvemen + '<br>' +
                       '<span style="font-weight: 600;">Fiscal Year: </span>20' + parseInt(feature.properties.fiscal_yea).toString() + '<br>' +
                       '<span style="font-weight: 600;">Annual Cost: </span>' + parseFloat(feature.properties.yearly_cos).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) + '<br>' +
                       '<span style="font-weight: 600;">Notes: </span>' + feature.properties.notes;

    var popup = L.popup().setContent(popupContent);

    layer.bindPopup(popup)

    layer.on('click', function (e) {
        this.openPopup();
        this.setStyle({weight: 10});
    });

    layer.on('popupclose', function (e) {
        this.setStyle({weight: 3});
    });
}

function reserveStyle(feature) {
    return {
        color: "cyan",
        weight: 2,
        opacity: 1,
        fill: false
    }
};

function taxlotStyle(feature) {
    return {
        fillColor: "#ffa228",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    }
};

function ugbStyle(feature) {
    return {
        fill: false,
        color: "red",
        weight: 1,
        opacity: 1,
        dashArray: "4"
    }
};

function smartStyle(feature) {
    return {
        fill: false,
        color: "#009933",
        weight: 1,
        opacity: 1,
        dashArray: "6"
    }
};

function hb2017Style(feature) {
    return {
        fill: false,
        color: "#78ff30",
        weight: 3,
        opacity: 1
    }
};

function sepStyle(feature) {
    return {
        fill: false,
        color: "#f830ff",
        weight: 3,
        opacity: 1
    }
};

function loadData() {

    var jsonFileName = 'json/reserves.json';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                reservesArray.push(feature);
            }
        }
    });

    reserves = L.geoJSON(reservesArray, {
        style: reserveStyle
    });

    overlays.addLayer(reserves).addTo(map);
    overlaysIDs[0] = reserves._leaflet_id;

    var jsonFileName = 'json/taxlots.json';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                taxlotsArray.push(feature);
            }
        }
    });

    taxlots = L.geoJSON(taxlotsArray, {
        onEachFeature: createPopup,
        style: taxlotStyle
    });

    overlays.addLayer(taxlots).addTo(map);
    overlaysIDs[1] = taxlots._leaflet_id;

    var jsonFileName = 'json/ugb.json';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                ugbArray.push(feature);
            }
        }
    });

    ugb = L.geoJSON(ugbArray, {
        style: ugbStyle
    });

    overlays.addLayer(ugb).addTo(map);
    overlaysIDs[2] = ugb._leaflet_id;

    var jsonFileName = 'json/smart.json';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                smartDistrictArray.push(feature);
            }
        }
    });

    smartDistrict = L.geoJSON(smartDistrictArray, {
        style: smartStyle
    });

    overlays.addLayer(smartDistrict).addTo(map);
    overlaysIDs[3] = smartDistrict._leaflet_id;

    var jsonFileName = 'json/hb2017.json';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                hb2017Array.push(feature);
            }
        }
    });

    hb2017 = L.geoJSON(hb2017Array, {
        style: hb2017Style,
        onEachFeature: hbPopup
    });

    overlays.addLayer(hb2017).addTo(map);
    overlaysIDs[4] = hb2017._leaflet_id;

    var jsonFileName = 'json/original_sep.json';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                sepArray.push(feature);
            }
        }
    });

    sep = L.geoJSON(sepArray, {
        style: sepStyle,
        onEachFeature: sepPopup
    });

    overlaysIDs[5] = sep._leaflet_id;

    reserves.bringToFront();
}

loadData();

$('input[type=radio][name=areaNames]').change(function() {
    var centroidDict = {"kingcity": [45.398421, -122.835138],
                        "beaverton": [45.442172, -122.866710],
                        "hillsboro": [45.487071, -122.933867],
                        "wilsonville": [45.319389, -122.737367]}
    map.setView([centroidDict[this.value][0], centroidDict[this.value][1]], 14);
});

function toggleLayer(indexNumber) {
    switch(indexNumber){
        case 0:
            if (map.hasLayer(reserves)) {
                overlays.removeLayer(overlaysIDs[indexNumber]);
            } else {
                overlays.addLayer(reserves);
            }
            break;
        case 1:
            if (map.hasLayer(taxlots)) {
                overlays.removeLayer(overlaysIDs[indexNumber]);
            } else {
                overlays.addLayer(taxlots);
            }
            break;
        case 2:
            if (map.hasLayer(ugb)) {
                overlays.removeLayer(overlaysIDs[indexNumber]);
            } else {
                overlays.addLayer(ugb);
            }
            break;
        case 3:
            if (map.hasLayer(smartDistrict)) {
                overlays.removeLayer(overlaysIDs[indexNumber]);
            } else {
                overlays.addLayer(smartDistrict);
            }
            break;
        case 4:
            if (map.hasLayer(hb2017)) {
                overlays.removeLayer(overlaysIDs[indexNumber]);
            } else {
                overlays.addLayer(hb2017);
            }
            break;
        case 5:
            if (map.hasLayer(sep)) {
                overlays.removeLayer(overlaysIDs[indexNumber]);
            } else {
                overlays.addLayer(sep);
            }
            break;
    }

}
