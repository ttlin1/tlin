var stamen = L.tileLayer("http://tile.stamen.com/toner-lite/{z}/{x}/{y}.png", {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
});

var baseMaps = {
    "Stamen Base": stamen,
};

var hexes = L.geoJson();
var hexArray = [];

var heatMapPoints = L.geoJson();
var heatArray = [];
var heat = new L.heatLayer(null, {radius: 5, blur: 11, maxZoom: 12});

var overlays = L.layerGroup();
var overlaysIDs = [-1, -1, -1, -1, -1];

var map = L.map('spokane-map', {
    center: [47.6588, -117.4260],
    zoom: 13,
    layers: [stamen],
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
    //
    // var modeTypes = Object.keys(modeDict);
    // var modeString = '<p><div class= "modeLabelSpan">';
    //
    // // Square checkboxes
    // // for (var i = 0; i < modeTypes.length; i++){
    // //     modeString += '<label class="modeLabel"><input type="checkbox" class="modeInput" name="modeCheckbox" value="' + modeTypes[i] + '" checked onclick="updateData();"><span class="modeLabelSpan">' + modeTypes[i] + '</span></label>';
    // // }
    //
    // // Legend as selectors
    // for (var i = 0; i < modeTypes.length; i++){
    //     modeString += '<label class="modeLabel"><input type="checkbox" class="modeInput" name="modeCheckbox" value="' + modeTypes[i] + '" checked onclick="updateData();">' +
    //     '<span style="background-color: ' + modeDict[modeTypes[i]] + '; display: block; height: 7px; width: 7px; border-radius: 50%; position: relative; top: 8px; left: 0 px;"></span>' +
    //     '<span style="padding-left: 15px; font-size: 12px; font-weight: 500;">' + modeTypes[i] + '</span></label>';
    // }
    //
    // modeString += '</div></p>';
    //
    // var severityTypes = Object.keys(severityDict);
    // var severityString = '<p><div class= "modeLabelSpan">';
    //
    // for (var i = 0; i < severityTypes.length; i++) {
    //     severityString += '<label class="severityLabel"><input type="checkbox" class="modeInput" name="severityCheckbox" value="' + severityTypes[i] + '" checked onclick="updateData();">' +
    //     '<div style="background-color: #fff; opacity: 0.5; display: block; height: ' + severityRadiusDict[severityTypes[i]] * 4 + 'px; width: ' +
    //     severityRadiusDict[severityTypes[i]] * 4 + 'px; border: 1px solid #000; border-radius: 50%; position: relative; top: 8px; right: ' + severityRadiusDict[severityTypes[i]] * 1.5 + 'px; padding-bottom: 2px;"></div>' +
    //     '<div style="position: relative; left: ' + (22 - severityRadiusDict[severityTypes[i]]).toString() + 'px; top: 7px; font-size: 12px; font-weight: 500; padding-bottom: 2px;">' + severityTypes[i].substring(0, 20) +
    //     '</div></label>';
    // }
    //
    // severityString += '</div></p>';
    //
    // this._div.innerHTML = '<p class="legendHeading" id="mapLegendTitle"><img style="vertical-align: top" src="img/logo.png" alt="Jersey City"><span style="float: right;">Vision Zero</span><br><span style="position: relative; bottom: 40px; float: right;">Crash Map</span></p>' +
    // '<br><p>&nbsp;</p><p>This map displays the crash modes and severity that have occurred in Jersey City.</p><p style="font-size: 12px; font-weight: 500; padding: 5px;">Filter Modes:<br><div style="display: flex; flex-direction: row;"' + modeString + severityString + '</div>';
}

legend.addTo(map);

function createPopup(feature, layer) {
    layer.showDelay = 800; //use 0 for no delay behavior
    layer.hideDelay = 0; //use 0 for normal behavior
    layer.bindTooltipDelayed("Click to view crash details.");

    var currentStyle = "";

    var popup = L.popup().setContent('Date: ' + feature.properties.DATE_STR + '<br>Time: ' + feature.properties.TIME_STR + '<br>Mode: ' + feature.properties.MODE + '<br>Severity: ' + feature.properties.SEVERITY);

    layer.bindPopup(popup);

    // layer.on('mouseover', function(e) {
    //     this.openPopup();
    //     this.setStyle({color: '#000', weight: 1});
    // });

    // layer.on('mouseout', function(e) {
    //     this.closePopup();
    //     this.setStyle(currentStyle);
    // });

    layer.on('click', function (e) {
        this.openPopup();
        // this.setStyle({opacity: 1, fillOpacity: 1, color: '#000', weight: 1});
    });

    layer.on('popupclose', function (e) {
        // this.setStyle(currentStyle);
    });
}

function crashStyle(feature) {
    return {
        radius: 2 * severityRadiusDict[feature.properties.SEVERITY],
        color: '#fff',
        fill: true,
        fillColor: modeDict[feature.properties.MODE],
        fillOpacity: severityDict[feature.properties.SEVERITY],
        stroke: true,
        weight: 1
   }
}

function hexStyle(feature) {
    return {
        color: '#fff',
        fillOpacity: 0,
        color: '#000',
        opacity: 0.5
    }
}

function loadCrashData() {
    routesArray = [];

    var jsonFileName = 'json/hexes.geojson';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                hexArray.push(feature);
            }
        }
    });

    hexes = L.geoJSON(hexArray, {
        onEachFeature: createPopup,
        style: hexStyle
    });

    if (overlaysIDs[0] != -1){
        overlays.removeLayer(overlaysIDs[0]);
        overlaysIDs[0] = -1;
    }

    overlays.addLayer(hexes).addTo(map);
    overlaysIDs[0] = hexes._leaflet_id;

    // heat.setLatLngs(heatArray);
    // heat.addTo(map);
}
loadCrashData();

map.on('moveend', function() {
    if (map.getZoom() >= 15) {
    }
    else {
    }
});

legend.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
});

legend.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
});
