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

var tracts = L.geoJson();
var tractArray = [];

var highEquity = L.geoJson();
var highEquityArray = [];

var existingStops = L.geoJson();
var existingArray = [];

var potentialStops = L.geoJson();
var potentialArray = [];

var stopIdArray = [];

var unshelteredStops = L.geoJson();
var unshelteredArray = [];

var overlays = L.layerGroup();
var overlaysIDs = [-1, -1, -1, -1, -1];

var colorDict = {"Minority": '#084C8D', "LowIncome": "#D1441E", "LimitedEnglish": "#00BA1B"};
var districtAverageDict = {"Minority": 0.285, "LowIncome": 0.216, "LimitedEnglish": 0.083};

var shelterTypes = [];
var initialShelterLoad = true;

var map = L.map('stop-map', {
    center: [45.45, -122.681944],
    zoom: 11,
    layers: [trimet_base],
    doubleClickZoom: false,
    // scrollWheelZoom: false,
    boxZoom: false,
    zoomControl: false
});

var symbologySelection = "Range";

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
    var shelterTypesString = '<select multiple id="shelterSelection" onchange="if (this.selectedIndex) loadExistingStops();">';
    shelterTypesString += '<option disabled value="">Select Shelter Type(s)</option>';

    shelterTypes.splice(0, 0, "ALL");
    shelterTypesString += '<option value="' + shelterTypes[0].toString() + '" selected>' + shelterTypes[0].toString() + '</option>';

    for (var i = 1; i < shelterTypes.length; i++){
        shelterTypesString += '<option value="' + shelterTypes[i].toString() + '">' + shelterTypes[i].toString() + '</option>';
    }
    shelterTypesString += '</select>';

    this._div.innerHTML = '<p class="legendHeading" id="mapLegendTitle">Stop Equity</p><br><p>&nbsp;</p><p id="mapLegendText"></p>' + '<p><a href="#" id="rangeAnchor" class="symbologyAnchors" onclick="changeCensusSymbology(0);">All Tracts</a><a href="#" class="symbologyAnchors" id="averageAnchor" onclick="changeCensusSymbology(1);">Compare to District Avg.</a><a href="#" id="equityNeedsAnchor" class="symbologyAnchors" onclick="changeCensusSymbology(2);">Equity Areas</a></p><br>' + '<label class="selectionTypeLabel"><input type="radio" class="selectionInput" name="selectionRadio" value="Minority" checked onclick="loadCensusData();"><span class="selectionTypeSpan" id="MinoritySpan">Minority</span></label>' +
    '<label class="selectionTypeLabel"><input type="radio" class="selectionInput" name="selectionRadio" value="LowIncome" onclick="loadCensusData();"><span class="selectionTypeSpan" id="LowIncomeSpan">Low&dash;Income</span></label>' + '<label class="selectionTypeLabel"><input type="radio" class="selectionInput" name="selectionRadio" value="LimitedEnglish" onclick="loadCensusData();"><span class="selectionTypeSpan" id="LimitedEnglishSpan">LEP</span></label>' + '</p><br><p><div id="mapLegend"></div></p><br>' + shelterTypesString;
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
    layer.showDelay = 800; //use 0 for no delay behavior
    layer.hideDelay = 0; //use 0 for normal behavior
    layer.bindTooltipDelayed("Click to view details about this Census tract.");

    var selectionValue = $("input:checked")[0].value;

    var currentTotalPop = parseFloat(feature.properties.Total_Pop_);
    if (selectionValue == "Minority") {
        var currentMinorityTotal = (parseFloat(feature.properties.African_Am) +
                                    parseFloat(feature.properties.Hispanic) +
                                    parseFloat(feature.properties.Asian) +
                                    parseFloat(feature.properties.Native_Ame) +
                                    parseFloat(feature.properties.Pacific_Is) +
                                    parseFloat(feature.properties.Other) +
                                    parseFloat(feature.properties.Two_or_mor));

        var popupContent = '<span style="font-weight: 800; display: inline-block; width: 100%;">' +
        feature.properties.Name + '</span><br><span style="font-weight: 800;">Total Population: </span>' +
        currentTotalPop.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        '<br><span style="font-weight: 800;">White: </span>' + ((parseFloat(feature.properties.White) / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Total Minority: </span>' + ((currentMinorityTotal / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">African American: </span>' + ((parseFloat(feature.properties.African_Am) / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Hispanic: </span>' + ((parseFloat(feature.properties.Hispanic) / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Asian: </span>' + ((parseFloat(feature.properties.Asian) / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Native American: </span>' + ((parseFloat(feature.properties.Native_Ame) / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Hawaiian Native and Pacific Islander: </span>' + ((parseFloat(feature.properties.Pacific_Is) / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Other (Including Mixed Race): </span>' + ((parseFloat(feature.properties.Pacific_Is) / currentTotalPop) * 100).toFixed(1) + '%';
    } else if (selectionValue == "LowIncome") {
        var below150poverty = (parseFloat(feature.properties.Under_50) +
                               parseFloat(feature.properties.Ratio_50_9) +
                               parseFloat(feature.properties.Ratio_100_) +
                               parseFloat(feature.properties.Ratio_125_));
        var above150poverty = (parseFloat(feature.properties.Ratio_150_) +
                              parseFloat(feature.properties.Ratio_185_) +
                              parseFloat(feature.properties.Ratio_200_));
        var below200poverty = (below150poverty + parseFloat(feature.properties.Ratio_150_) + parseFloat(feature.properties.Ratio_185_));
        var above200poverty = (parseFloat(feature.properties.Ratio_200_));

        var popupContent = '<span style="font-weight: 800; display: inline-block; width: 100%;">' +
        feature.properties.Name + '</span><br><span style="font-weight: 800;">Total Population: </span>' +
        currentTotalPop.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        '<br><span style="font-weight: 800;">Total Below 150&#37; of Poverty Level: </span>' + ((below150poverty / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Total Above 150&#37; of Poverty Level: </span>' + ((above150poverty / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Total Below 200&#37; of Poverty Level: </span>' + ((below200poverty / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Total Above 200&#37; of Poverty Level: </span>' + ((above200poverty / currentTotalPop) * 100).toFixed(1) + '%';
    } else if (selectionValue == "LimitedEnglish") {
        var lepPercentage = (parseFloat(feature.properties.LEP_Pct));
        var popupContent = '<span style="font-weight: 800; display: inline-block; width: 100%;">' +
        feature.properties.Name + '</span><br><span style="font-weight: 800;">Total Population: </span>' +
        currentTotalPop.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        '<br><span style="font-weight: 800;">Total LEP Percentage: </span>' + (lepPercentage * 100.0).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Spanish: </span>' + ((feature.properties.Spanish / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Vietnamese: </span>' + ((feature.properties.Vietnamese / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Other Asian and Pacific Island languages: </span>' + ((feature.properties.Other_Asia / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Russian, Polish or other Slavic languages: </span>' + ((feature.properties.Russian / currentTotalPop) * 100).toFixed(1) + '%' +
        '<br><span style="font-weight: 800;">Chinese, including Mandarin and Cantonese: </span>' + ((feature.properties.Chinese / currentTotalPop) * 100).toFixed(1) + '%';
    }

    var popup = L.popup().setContent(popupContent);

    layer.bindPopup(popup)

    var currentStyle = tractStyle(feature);

    var clickedTract = false;

    layer.on('mouseover', function(e) {
        this.setStyle({color: '#000', weight: 1});
    });

    layer.on('mouseout', function(e) {
        if (clickedTract == false) {
            this.setStyle(currentStyle);
        }
    });

    layer.on('click', function (e) {
        clickedTract = true;
        this.openPopup();
        this.setStyle({opacity: 1, fillOpacity: 1, color: '#000', weight: 2});
    });

    layer.on('popupclose', function (e) {
        clickedTract = false;
        this.setStyle(currentStyle);
    });
}

function createExistingStopsPopup(feature, layer){
    var notes = feature.properties.Notes;
    if (notes == null) {
        notes = 'None';
    }

    var popupContent = '<span style="font-weight: 800;">Stop ID: </span>' + parseInt(feature.properties.Stop_ID).toString() + '<br><span style="font-weight: 800;">Travel Street: </span>' + feature.properties.Travel_St + '<br><span style="font-weight: 800;">Rel Posn: </span>' + feature.properties.Rel_Posn + '<br><span style="font-weight: 800;">Cross St/Landmark: </span>' + feature.properties.Cross_St_L + '<br><span style="font-weight: 800;">St Dir: </span>' + feature.properties.St_Dir + '<br><span style="font-weight: 800;">Passenger Access: </span>' + feature.properties.Passenger + '<br><span style="font-weight: 800;">Jurisdiction: </span>';
    popupContent += feature.properties.Jurisdicti + '<br><span style="font-weight: 800;">Shelter Type: </span>' + feature.properties.Shelter_Ty + '<br><span style="font-weight: 800;">Notes: </span>' + notes;
    var popup = L.popup().setContent(popupContent);

    layer.bindPopup(popup);

    layer.on('mouseover', function(e) {
        this.openPopup();
    });

    layer.on('mouseout', function(e) {
        this.closePopup();
    });
}

function createPotentialStopsPopup(feature, layer){
    var notes = feature.properties.Notes;
    if (notes == null) {
        notes = 'None';
    }

    var popupContent = '<span style="font-weight: 800;">Stop ID: </span>' + parseInt(feature.properties.stop_id).toString() + '<br><span style="font-weight: 800;">Stop Name: </span>' + feature.properties.stop_name + '<br><span style="font-weight: 800;">Route: </span>' + feature.properties.rte_desc + '<br><span style="font-weight: 800;">Direction: </span>' + feature.properties.dir_desc + '<br><span style="font-weight: 800;">Jurisdiction: </span>' + feature.properties.jurisdic + '<br><span style="font-weight: 800;">Frequent: </span>' + feature.properties.frequent;
    popupContent += '<br><span style="font-weight: 800;">Notes: </span>' + notes;
    var popup = L.popup().setContent(popupContent);

    layer.bindPopup(popup);

    layer.on('mouseover', function(e) {
        this.openPopup();
    });

    layer.on('mouseout', function(e) {
        this.closePopup();
    });
}

function createUnshelteredStopsPopup(feature, layer){

    var popupContent = '<span style="font-weight: 800;">Stop ID: </span>' + parseInt(feature.properties.stop_id).toString() + '<br><span style="font-weight: 800;">Stop Name: </span>' + feature.properties.stop_name + '<br><span style="font-weight: 800;">Route: </span>' + feature.properties.rte_desc + '<br><span style="font-weight: 800;">Direction: </span>' + feature.properties.dir_desc + '<br><span style="font-weight: 800;">Jurisdiction: </span>' + feature.properties.jurisdic + '<br><span style="font-weight: 800;">Frequent: </span>' + feature.properties.frequent;
    var popup = L.popup().setContent(popupContent);

    layer.bindPopup(popup);

    layer.on('mouseover', function(e) {
        this.openPopup();
    });

    layer.on('mouseout', function(e) {
        this.closePopup();
    });
}

var minMaxValues = {"Minority": [1, 0], "LowIncome": [1, 0], "LimitedEnglish": [1, 0]};
var selectedGradient = '';

function tractStyle(feature) {
    var blueGradient = ["#FFFFFF", "#F2F5F9", "#E5ECF3", "#D8E2ED", "#CBD9E7", "#BECFE1", "#B1C6DB", "#A4BDD5", "#97B3CF", "#8AAAC9", "#7DA0C3", "#7097BD", "#638DB7", "#5684B1", "#497BAB", "#3C71A5", "#2F689F", "#225E99", "#155593", "#084C8D"];

    var orangeGradient = ["#FFFFFF", "#FCF5F3", "#FAEBE7", "#F7E1DB", "#F5D7CF", "#F2CDC3", "#F0C3B7", "#EEBAAC", "#EBB0A0", "#E9A694", "#E69C88", "#E4927C", "#E18870", "#DF7F65", "#DD7559", "#DA6B4D", "#D86141", "#D55735", "#D34D29", "#D1441E"];

    var greenGradient = ["#FFFFFF", "#F1FBF3", "#E4F7E7", "#D6F4DB", "#C9F0CF", "#BBECC3", "#AEE9B7", "#A1E5AB", "#93E19F", "#86DE93", "#78DA87", "#6BD77B", "#5DD36F", "#50CF63", "#43CC57", "#35C84B", "#28C43F", "#1AC133", "#0DBD27", "#00BA1B"];

    var selectionValue = $("input:checked")[0].value;

    if (symbologySelection == "Range") {
        if (selectionValue == "Minority") {
            selectedGradient = blueGradient;
        } else if (selectionValue == "LowIncome") {
            selectedGradient = orangeGradient;
        } else if (selectionValue == "LimitedEnglish") {
            selectedGradient = greenGradient;
        }
    } else if (symbologySelection == "Average") {
        if (selectionValue == "Minority") {
            selectedGradient = [blueGradient[0], blueGradient[blueGradient.length - 1]];
        } else if (selectionValue == "LowIncome") {
            selectedGradient = [orangeGradient[0], orangeGradient[orangeGradient.length - 1]];
        } else if (selectionValue == "LimitedEnglish") {
            selectedGradient = [greenGradient[0], greenGradient[greenGradient.length - 1]];
        }
    }

    var minColorIndex = 0;
    if (selectedGradient.length > 1) {
        var maxColorIndex = selectedGradient.length - 1;
    } else {
        var maxColorIndex = 1;
    }

    var selectionValue = $("input:checked")[0].value;

    var currentTotalPop = parseFloat(feature.properties.Total_Pop_);

    if (selectionValue == "Minority") {
        var currentMinorityTotal = (parseFloat(feature.properties.African_Am) +
                                    parseFloat(feature.properties.Hispanic) +
                                    parseFloat(feature.properties.Asian) +
                                    parseFloat(feature.properties.Native_Ame) +
                                    parseFloat(feature.properties.Pacific_Is) +
                                    parseFloat(feature.properties.Other) +
                                    parseFloat(feature.properties.Two_or_mor)) / currentTotalPop;

        if (symbologySelection == "Range") {
            var rateOfChange = (maxColorIndex - minColorIndex) / (minMaxValues["Minority"][1] - minMaxValues["Minority"][0]);
            var selectedIndex = Math.round(rateOfChange * currentMinorityTotal);
        } else if (symbologySelection == "Average") {
            if (currentMinorityTotal > districtAverageDict[selectionValue]) {
                var selectedIndex = 1;
            } else {
                var selectedIndex = 0;
            }
        }


    } else if (selectionValue == "LowIncome") {
        var below150poverty = (parseFloat(feature.properties.Under_50) +
                               parseFloat(feature.properties.Ratio_50_9) +
                               parseFloat(feature.properties.Ratio_100_) +
                               parseFloat(feature.properties.Ratio_125_)) / currentTotalPop;
        // var above150poverty = (parseFloat(feature.properties.Ratio_150_) +
        //                        parseFloat(feature.properties.Ratio_185_) +
        //                        parseFloat(feature.properties.Ratio_200_));
        // var below200poverty = (below150poverty + parseFloat(feature.properties.Ratio_150_) + parseFloat(feature.properties.Ratio_185_));
        // var above200poverty = (parseFloat(feature.properties.Ratio_200_));

        if (symbologySelection == "Range") {
            var rateOfChange = (maxColorIndex - minColorIndex) / (minMaxValues["LowIncome"][1] - minMaxValues["LowIncome"][0]);
            var selectedIndex = Math.round(rateOfChange * below150poverty);
        } else if (symbologySelection == "Average") {
            if (below150poverty > districtAverageDict[selectionValue]) {
                var selectedIndex = 1;
            } else {
                var selectedIndex = 0;
            }
        }

    } else if (selectionValue == "LimitedEnglish") {
        var lepPercentage = (parseFloat(feature.properties.LEP_Pct));

        if (symbologySelection == "Range") {
            var rateOfChange = (maxColorIndex - minColorIndex) / (minMaxValues["LimitedEnglish"][1] - minMaxValues["LimitedEnglish"][0]);
            var selectedIndex = Math.round(rateOfChange * lepPercentage);
        } else if (symbologySelection == "Average") {
            if (lepPercentage > districtAverageDict[selectionValue]) {
                var selectedIndex = 1;
            } else {
                var selectedIndex = 0;
            }
        }
    }

    if (selectedIndex > maxColorIndex) {
        selectedIndex = maxColorIndex;
    }
    if (selectedIndex < minColorIndex){
        selectedIndex = minColorIndex;
    }
    var colorValue = selectedGradient[selectedIndex];

    return {
        fillColor: colorValue,
        color: "#fff",
        weight: 0.5,
        opacity: 1.0,
        fillOpacity: 0.65
    }
}

function existingStopStyle() {
    return {
        radius: 3,
        fillColor: "#555",
        color: "#fff",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 1
    }
}

function PotentialStopStyle() {
    return {
        radius: 3,
        fillColor: "red",
        color: "#fff",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 1
    }
}

function unshelteredStopStyle() {
    return {
        radius: 3,
        fillColor: "#eee",
        color: "#000",
        weight: 0.8,
        opacity: 0.25,
        fillOpacity: 0
    }
}

function loadCensusData() {
    tractArray = [];

    var jsonFileName = 'json/census.json';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                tractArray.push(feature);
                var propertiesArray = feature.properties;
                var propertiesKeys = Object.keys(propertiesArray);

                for (var j = 0; j < propertiesKeys.length; j++) {
                    var currentValue = parseFloat(feature.properties[propertiesKeys[j]]);
                    var minMaxValuesKeys = Object.keys(minMaxValues);
                    if ($.inArray(propertiesKeys[j], minMaxValuesKeys) == -1) {
                        minMaxValues[propertiesKeys[j]] = [currentValue, currentValue];
                    }

                    if (currentValue < minMaxValues[propertiesKeys[j]][0]) {
                        minMaxValues[propertiesKeys[j]][0] = currentValue;
                    } else if (currentValue > minMaxValues[propertiesKeys[j]][1]) {
                        minMaxValues[propertiesKeys[j]][1] = currentValue;
                    }
                }

                var currentTotalPop = parseFloat(feature.properties.Total_Pop_);

                var currentMinorityTotal = (parseFloat(feature.properties.African_Am) +
                                            parseFloat(feature.properties.Hispanic) +
                                            parseFloat(feature.properties.Asian) +
                                            parseFloat(feature.properties.Native_Ame) +
                                            parseFloat(feature.properties.Pacific_Is) +
                                            parseFloat(feature.properties.Other) +
                                            parseFloat(feature.properties.Two_or_mor)) / currentTotalPop;

                if (currentMinorityTotal < minMaxValues["Minority"][0]){
                    minMaxValues["Minority"][0] = currentMinorityTotal;
                } else if (currentMinorityTotal > minMaxValues["Minority"][1]){
                    minMaxValues["Minority"][1] = currentMinorityTotal;
                }

                var currentBelow150poverty = (parseFloat(feature.properties.Under_50) +
                                              parseFloat(feature.properties.Ratio_50_9) +
                                              parseFloat(feature.properties.Ratio_100_) +
                                              parseFloat(feature.properties.Ratio_125_)) / currentTotalPop;

                if (currentBelow150poverty < minMaxValues["LowIncome"][0]){
                  minMaxValues["LowIncome"][0] = currentBelow150poverty;
                } else if (currentBelow150poverty > minMaxValues["LowIncome"][1]){
                  minMaxValues["LowIncome"][1] = currentBelow150poverty;
                }

                var currentLEP = (parseFloat(feature.properties.LEP_Pct));

                if (currentLEP < minMaxValues["LimitedEnglish"][0]){
                  minMaxValues["LimitedEnglish"][0] = currentLEP;
                } else if (currentLEP > minMaxValues["LimitedEnglish"][1]){
                  minMaxValues["LimitedEnglish"][1] = currentLEP;
                }
            }
        }
    });

    tracts = L.geoJSON(tractArray, {
        onEachFeature: createPopup,
        style: tractStyle
    });

    if (overlaysIDs[0] != -1){
        overlays.removeLayer(overlaysIDs[0]);
        overlaysIDs[0] = -1;
    }

    if (overlaysIDs[3] != -1){
        overlays.removeLayer(overlaysIDs[3]);
        overlaysIDs[3] = -1;
    }

    overlays.addLayer(tracts).addTo(map);
    overlaysIDs[0] = tracts._leaflet_id;

    tracts.bringToBack();

    $(document).ready(function(){
        var selectionValue = $("input:checked")[0].value;

        if (symbologySelection == "Range") {
            var minValue = minMaxValues[selectionValue][0];
            var maxValue = minMaxValues[selectionValue][1];

            minValue = (minValue * 100.0).toFixed(1) + "%";
            maxValue = (maxValue * 100.0).toFixed(1) + "%";

            $('#mapLegend').css({'flex-direction': 'row'});

            var mapLegendInnerHtml = '<span style="background-image: linear-gradient(' + selectedGradient[0] + ', ' + selectedGradient[selectedGradient.length - 1] + '); display: block; height: 100px; width: 20px; margin-left: 5px;"></span><span id="minText">Minimum: ' + minValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span><br><span id="maxText">Maximum: ' + maxValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>';

        } else if (symbologySelection == "Average") {
            $('#mapLegend').css({'flex-direction': 'column'});

            var mapLegendInnerHtml = '<span style="background-color: ' + selectedGradient[0] + '; display: block; height: 20px; width: 20px; margin-left: 5px; border: 1px solid #ccc;"></span><span id="minText">Below District Avg. ('  + (districtAverageDict[selectionValue] * 100).toFixed(1) + '%)</span><br><span id="avgBottomText" style="background-color: ' + selectedGradient[1] + '; display: block; height: 20px; width: 20px; margin-left: 5px; border: 1px solid #ccc;"></span><span id="avgBottomText">Above District Avg. (' + (districtAverageDict[selectionValue] * 100).toFixed(1) + '%)</span>';
        }

        mapLegendInnerHtml += '<a href="#" onclick="toggleExistingStops();"><span id="existingStops" style="background-color: #555; display: block; height: 5px; width: 5px; border-radius: 50%;"></span><span id="existingStopsText">Existing Bus Stops</span></a>';

        mapLegendInnerHtml += '<a href="#" onclick="togglePotentialStops();"><span id="potentialStops" style="background-color: red; display: block; height: 5px; width: 5px; border-radius: 50%;"></span><span id="potentialStopsText">Potential Bus Stops</span></a>';

        mapLegendInnerHtml += '<a href="#" onclick="toggleUnshelteredStops();"><span id="unshelteredStops" style="display: block; height: 5px; width: 5px; border: 1px solid #888; border-radius: 50%; opacity: 0.75"></span><span id="unshelterdStopsText">Stops without Shelters<br>(click to display)</span></a>';

        $('#mapLegend').html(mapLegendInnerHtml);

        var titleDict = {"Minority": "Minority Populations and Shelter Equity",
                        "LowIncome": "Low&dash;Income Populations and Shelter Equity",
                        "LimitedEnglish": "Limited English Proficiency and Shelter Equity"}

        var legendTextDict = {"Minority": "This map displays the minority populations within TriMet&rsquo;s service district by Census tract.<br><br>Source: 2012-2016 ACS, US Census Bureau, Sequence 5.",
                              "LowIncome": "This map displays the low&rsquo;income populations within TriMet&rsquo;s service district by Census tract. The symbology is based on the percentage of the population whose income is below 150% of the federal poverty level.<br><br>Source: 2012-2016 ACS, US Census Bureau, Sequence 50.",
                              "LimitedEnglish": "This map displays the populations with limited English proficiency within TriMet&rsquo;s service district by Census tract.<br><br>Source: 2012-2016 ACS, US Census Bureau, Sequence 45."}

        $('#mapLegendTitle').html(titleDict[selectionValue]);
        $('#mapLegendText').html(legendTextDict[selectionValue]);
    });
}

loadCensusData();

function loadExistingStops(){
    existingArray = [];

    var jsonFileName = 'json/existing_stops.json';

    var options = $('#shelterSelection option:selected');

    var selectedShelterTypes = $.map(options ,function(option) {
        return option.value;
    });

    shelterTypes = [];
    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                if ($.inArray("ALL", selectedShelterTypes) > -1){
                    existingArray.push(feature);
                } else {
                    if ($.inArray(feature.properties.Shelter_Ty, selectedShelterTypes) > -1){
                        existingArray.push(feature);
                    }
                }
                if ($.inArray(parseInt(feature.properties.Stop_ID), stopIdArray) == -1) {
                    stopIdArray.push(parseInt(feature.properties.Stop_ID));
                }
            }
        }
    });

    existingStops = L.geoJSON(existingArray, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng)
        },
        onEachFeature: createExistingStopsPopup,
        style: existingStopStyle
    });

    if (overlaysIDs[1] != -1){
        overlays.removeLayer(overlaysIDs[1]);
        overlaysIDs[1] = -1;
    }

    overlays.addLayer(existingStops).addTo(map);
    overlaysIDs[1] = existingStops._leaflet_id;

    if (overlaysIDs[2] != -1){
        potentialStops.bringToFront();
    }
}

loadExistingStops();

function toggleExistingStops() {
    if (overlaysIDs[1] != -1){
        overlays.removeLayer(overlaysIDs[1]);
        overlaysIDs[1] = -1;
    } else {
        loadExistingStops();
    }
}

function getShelterInfo() {
    for (var i = 0; i < existingArray.length; i++){
        if ($.inArray(existingArray[i].properties.Shelter_Ty, shelterTypes) == -1){
            shelterTypes.push(existingArray[i].properties.Shelter_Ty);
        }
    }

    shelterTypes.sort();
    legend.initializeInfo();
}
getShelterInfo();
updateInputSelection();

function loadPotentialStops(){
    potentialArray = [];
    var jsonFileName = 'json/potential_stops.json';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                potentialArray.push(feature);
                if ($.inArray(parseInt(feature.properties.stop_id), stopIdArray) == -1) {
                    stopIdArray.push(parseInt(feature.properties.stop_id));
                }
            }
        }
    });

    potentialStops = L.geoJSON(potentialArray, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng)
        },
        onEachFeature: createPotentialStopsPopup,
        style: PotentialStopStyle
    });

    if (overlaysIDs[2] != -1){
        overlays.removeLayer(overlaysIDs[2]);
        overlaysIDs[2] = -1;
    }

    overlays.addLayer(potentialStops).addTo(map);
    overlaysIDs[2] = potentialStops._leaflet_id;
}

loadPotentialStops();

function togglePotentialStops() {
    if (overlaysIDs[2] != -1){
        overlays.removeLayer(overlaysIDs[2]);
        overlaysIDs[2] = -1;
    } else {
        loadPotentialStops();
    }
}

function loadUnshelteredStops(){
    unshelteredArray = [];
    var jsonFileName = 'json/all_stops.json';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                if ($.inArray(parseInt(feature.properties.stop_id), stopIdArray) == -1) {
                    unshelteredArray.push(feature);
                }
            }
        }
    });

    unshelteredStops = L.geoJSON(unshelteredArray, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng)
        },
        onEachFeature: createUnshelteredStopsPopup,
        style: unshelteredStopStyle
    });

    if (overlaysIDs[4] != -1){
        overlays.removeLayer(overlaysIDs[4]);
        overlaysIDs[4] = -1;
    }

    overlays.addLayer(unshelteredStops).addTo(map);
    overlaysIDs[4] = unshelteredStops._leaflet_id;

    unshelteredStops.bringToFront();

    if (overlaysIDs[1] != -1){
        existingStops.bringToFront();
    }

    if (overlaysIDs[2] != -1){
        potentialStops.bringToFront();
    }
}

// loadUnshelteredStops();

function toggleUnshelteredStops() {
    if (overlaysIDs[4] != -1){
        overlays.removeLayer(overlaysIDs[4]);
        overlaysIDs[4] = -1;
    } else {
        loadUnshelteredStops();
    }
}

function equityStyle() {
    return {
        fillColor: '#824700',
        color: "#fff",
        weight: 0.5,
        opacity: 1.0,
        fillOpacity: 0.65
    }
}

function loadHighEquityNeedsAreas() {
    highEquityArray = [];

    var jsonFileName = 'json/high_equity_needs.json';

    $.ajax({
        url: jsonFileName,
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                highEquityArray.push(feature);
            }
        }
    });

    highEquity = L.geoJSON(highEquityArray, {
        style: equityStyle
    });

    if (overlaysIDs[3] != -1){
        overlays.removeLayer(overlaysIDs[3]);
        overlaysIDs[3] = -1;
    }

    if (overlaysIDs[0] != -1){
        overlays.removeLayer(overlaysIDs[0]);
        overlaysIDs[0] = -1;
    }

    overlays.addLayer(highEquity).addTo(map);
    overlaysIDs[3] = highEquity._leaflet_id;

    highEquity.bringToBack();

    $('#mapLegendTitle').html('High Equity Needs and Shelter Equity');
    $('#mapLegendText').html('This map displays the Census block groups with high equity needs (as defined by Carl Green, the Title VI Administrator).<br><br>Source: T. Mills, Manager, Service Planning');
}

function changeCensusSymbology(in_selection) {
    if (in_selection == 0) {
        symbologySelection = "Range";
        var selectedAnchor = "#rangeAnchor";
        $('#rangeAnchor').css({'color': '#fff', 'background-color': '#000'});
        $('#averageAnchor').css({'color': '#000', 'background-color': '#fff'});
        $('#equityNeedsAnchor').css({'color': '#000', 'background-color': '#fff'});

        document.getElementById("MinoritySpan").style.cssText = 'display: inline-block;';
        document.getElementById("LowIncomeSpan").style.cssText = 'display: inline-block;';
        document.getElementById("LimitedEnglishSpan").style.cssText = 'display: inline-block;';

        updateInputSelection();

        loadCensusData();
    } else if (in_selection == 1) {
        symbologySelection = "Average";
        var selectedAnchor = "#averageAnchor";
        $('#rangeAnchor').css({'color': '#000', 'background-color': '#fff'});
        $('#averageAnchor').css({'color': '#fff', 'background-color': '#000'});
        $('#equityNeedsAnchor').css({'color': '#000', 'background-color': '#fff'});

        document.getElementById("MinoritySpan").style.cssText = 'display: inline-block;';
        document.getElementById("LowIncomeSpan").style.cssText = 'display: inline-block;';
        document.getElementById("LimitedEnglishSpan").style.cssText = 'display: inline-block;';

        updateInputSelection();

        loadCensusData();
    } else if (in_selection == 2) {
        symbologySelection = "Equity";
        $('#rangeAnchor').css({'color': '#000', 'background-color': '#fff'});
        $('#averageAnchor').css({'color': '#000', 'background-color': '#fff'});
        $('#equityNeedsAnchor').css({'color': '#fff', 'background-color': '#000'});

        $('#mapLegend').css({'flex-direction': 'column'});

        var mapLegendInnerHtml = '<span style="background-color: #824700; display: block; height: 20px; width: 20px; margin-left: 5px; margin-bottom: 20px; border: 1px solid #ccc;"></span><span id="minText">High Equity Needs</span>';

        mapLegendInnerHtml += '<a href="#" onclick="toggleExistingStops();"><span id="existingStops" style="background-color: #555; display: block; height: 5px; width: 5px; border-radius: 50%;"></span><span id="existingStopsText">Existing Bus Stops</span></a>';

        mapLegendInnerHtml += '<a href="#" onclick="togglePotentialStops();"><span id="potentialStops" style="background-color: red; display: block; height: 5px; width: 5px; border-radius: 50%;"></span><span id="potentialStopsText">Potential Bus Stops</span></a>';

        mapLegendInnerHtml += '<a href="#" onclick="toggleUnshelteredStops();"><span id="unshelteredStops" style="display: block; height: 5px; width: 5px; border: 1px solid #888; border-radius: 50%; opacity: 0.75"></span><span id="unshelterdStopsText">Stops without Shelters<br>(click to display)</span></a>';

        $('#mapLegend').html(mapLegendInnerHtml);

        document.getElementById("MinoritySpan").style.cssText = 'visibility: hidden;';
        document.getElementById("LowIncomeSpan").style.cssText = 'visibility: hidden;';
        document.getElementById("LimitedEnglishSpan").style.cssText = 'visibility: hidden;';
        loadHighEquityNeedsAreas();
    }
}

map.on('moveend', function() {
    if (map.getZoom() >= 15) {
    }
    else {
    }
});

function updateInputSelection(){
    document.getElementById("MinoritySpan").style.cssText = 'background-color: #fff; color: #000; border-radius: 5px; border: 1px solid #aaa;';
    document.getElementById("LowIncomeSpan").style.cssText = 'background-color: #fff; color: #000; border-radius: 5px; border: 1px solid #aaa;';
    document.getElementById("LimitedEnglishSpan").style.cssText = 'background-color: #fff; color: #000; border-radius: 5px; border: 1px solid #aaa;';

    var selectionValue = $("input:checked")[0].value;
    var selectedRadioSpan = document.getElementById(selectionValue + "Span");
    selectedRadioSpan.style.cssText = 'background-color: ' + colorDict[selectionValue] + '; color: #fff; border: 1px solid #fff';
}

$("input[type=radio]").on( "click", updateInputSelection);

legend.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
});

legend.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
});
