var stamen = L.tileLayer("http://tile.stamen.com/toner-lite/{z}/{x}/{y}.png", {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
});

var osm_map = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var carto = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
  attribution: "Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL."
});

var baseMaps = {
  "Stamen Base": stamen,
  "Carto Dark": carto
};

var census = L.geoJson();
var censusArray = [];
var updatedCensusArray = [];

var adt = L.geoJson();
var adtArray = [];
var updatedAdtArray = [];

var vmt = L.geoJson();
var vmtArray = [];
var updatedVmtArray = [];

var collisions = L.geoJson();
var collisionsArray = [];
var updatedCollisionsArray = [];

var crosswalk = L.geoJson();
var crosswalkArray = [];
var updatedCrosswalkArray = [];

var pavement = L.geoJson();
var pavementArray = [];
var updatedPavementArray = [];

var sidewalk = L.geoJson();
var sidewalkArray = [];
var updatedSidewalkArray = [];

var turfLayer = L.geoJson();
var turfLayerArray = [];
var turfDict = {};

var heat = new L.heatLayer(null, {radius: 6, blur: 11, maxZoom: 12, max: 10});
var heatArray = [];

var blueGradient = ["#FFFFFF", "#F2F5F9", "#E5ECF3", "#D8E2ED", "#CBD9E7", "#BECFE1", "#B1C6DB", "#A4BDD5", "#97B3CF", "#8AAAC9", "#7DA0C3", "#7097BD", "#638DB7", "#5684B1", "#497BAB", "#3C71A5", "#2F689F", "#225E99", "#155593", "#084C8D"];

var gradient = {};
for (var i = 0; i < blueGradient.length; i++){
  var numberBreak = i / parseFloat(blueGradient.length) * 10;
  gradient[numberBreak] = blueGradient[i];
}

var overlays = L.layerGroup();
var overlaysIDs = [-1, -1, -1, -1, -1, -1, -1]; // [census, collisions]

var map = L.map('pasadenaMap', {
  center: [34.1482,-118.1445],
  zoom: 13,
  layers: [stamen],
  doubleClickZoom: false,
  boxZoom: false,
  zoomControl: false
  // maxZoom: 15
});

map.createPane('heat');
map.getPane('heat').style.zIndex = 650;
map.getPane('heat').style.pointerEvents = 'none';

map.attributionControl.setPrefix('<a href="https://tooledesign.com/">Toole Design</a> | <a href="https://leafletjs.com">Leaflet</a>');

function sortNumber(a,b) {
  return a - b;
}

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

 ///////////////////////////////// lEGEND

var legend = L.control({position: 'topright'});

legend.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'legendDiv');
  this.initializeInfo();
  return this._div;
};

legend.initializeInfo = function () {
  this._div.innerHTML = /* @html */`<div class="row">
                        <div class="col">
                          <img class="img-fluid logoImage" src="img/logo.png">
                        </div>
                      </div>

                      <br>

                      <div class="container addScroll">
                        <div class="row">
                          <div class="col">
                            <div id="ridershipSelector" class="layerSelector">
                              <label for="ridershipCheckbox"><input type="checkbox" id="ridershipCheckbox" class="ridershipCheckboxes" name="Ridership" checked><span class="layerSpan">Transit Ridership</span></label>
                              <p class="text-center"><label for="ridershipAmount"><input type="text" class="text-center" id="ridershipAmount" readonly style="border:0;"></label></p>
                              <div id="ridershipSlider" class="layerSlider"></div>
                            </div><hr>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <div id="densitySelector" class="layerSelector">
                              <label for="densityCheckbox"><input type="checkbox" id="densityCheckbox" class="censusCheckboxes" name="Density" checked><span class="layerSpan">Population Density</span></label>
                              <p class="text-center"><label for="densityAmount"><input type="text" class="text-center" id="densityAmount" readonly style="border:0;"></label></p>
                              <div id="densitySlider" class="layerSlider"></div>
                            </div><hr>
                          </div>
                        </div>

                      <!-- <div class="container addScroll">
                        <div class="row">
                          <div class="col">
                            <div id="commuteSelector" class="layerSelector">
                              <label for="commuteCheckbox"><input type="checkbox" id="commuteCheckbox" class="censusCheckboxes" name="Commute" checked><span class="layerSpan">Bike or Walk to Work</span></label>
                              <p class="text-center"><label for="commuteAmount"><input type="text" class="text-center" id="commuteAmount" readonly style="border:0;"></label></p>
                              <div id="commuteSlider" class="layerSlider"></div>
                            </div><hr>
                          </div>
                        </div> -->

                        <!-- <div class="row">
                          <div class="col">
                            <div id="incomeSelector" class="layerSelector">
                              <label for="incomeCheckbox"><input type="checkbox" id="incomeCheckbox" class="censusCheckboxes" name="Income" checked><span class="layerSpan">Household Income</span></label>
                              <p class="text-center"><label for="incomeAmount"><input type="text" class="text-center" id="incomeAmount" readonly style="border:0;"></label></p>
                              <div id="incomeSlider" class="layerSlider"></div>
                            </div><hr>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <div id="minoritySelector" class="layerSelector">
                              <label for="minorityCheckbox"><input type="checkbox" id="minorityCheckbox" class="censusCheckboxes" name="Minority" checked><span class="layerSpan">Minority Percentage</span></label>
                              <p class="text-center"><label for="minorityAmount"><input type="text" class="text-center" id="minorityAmount" readonly style="border:0;"></label></p>
                              <div id="minoritySlider" class="layerSlider"></div>
                            </div><hr>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <div id="lepSelector" class="layerSelector">
                              <label for="lepCheckbox"><input type="checkbox" id="lepCheckbox" class="censusCheckboxes" name="LEP" checked><span class="layerSpan">Limited English Proficiency Percentage</span></label>
                              <p class="text-center"><label for="lepAmount"><input type="text" class="text-center" id="lepAmount" readonly style="border:0;"></label></p>
                              <div id="lepSlider" class="layerSlider"></div>
                            </div><hr>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <div id="youthSelector" class="layerSelector">
                              <label for="youthCheckbox"><input type="checkbox" id="youthCheckbox" class="censusCheckboxes" name="Youth" checked><span class="layerSpan">Youth Percentage</span></label>
                              <p class="text-center"><label for="youthAmount"><input type="text" class="text-center" id="youthAmount" readonly style="border:0;"></label></p>
                              <div id="youthSlider" class="layerSlider"></div>
                            </div><hr>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <div id="elderlySelector" class="layerSelector">
                              <label for="elderlyCheckbox"><input type="checkbox" id="elderlyCheckbox" class="censusCheckboxes" name="Elderly" checked><span class="layerSpan">Elderly Percentage</span></label>
                              <br>
                              <p><label for="elderlyAmount"><input type="text" class="text-center" id="elderlyAmount" readonly style="border:0;"></label></p>
                              <div id="elderlySlider" class="layerSlider"></div>
                            </div><hr>
                          </div>
                        </div> -->
                      </div>`;
}

legend.addTo(map);

legend.getContainer().addEventListener('mouseover', function () {
  map.dragging.disable();
});

legend.getContainer().addEventListener('mouseout', function () {
  map.dragging.enable();
});

$('.legendDiv').bind('selectstart dragstart', function(e) {
  e.preventDefault();
  return false;
});

///////////////////////////////// WEIGHTINGS

var weightings = L.control({position: 'topleft'});

weightings.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'weightingsDiv');
  this.initializeInfo();
  return this._div;
};

weightings.initializeInfo = function () {
  this._div.innerHTML = /* @html */`<div class="container addScroll">
                            <div class="row">
                              <div class="col">
                                <p>&nbsp;</p>
                                <div id="collisionsSelector" class="layerSelector">
                                  <label for="collisionsCheckbox"><input type="checkbox" id="collisionsCheckbox" class="leftCheckboxes" name="Collisions" checked><span class="layerSpan">Collisions Mode</span></label>
                                  <div class="modeSelector row mx-auto">
                                    <div class="col text-center">
                                      <label for="bikeCheckbox"><input type="checkbox" id="bikeCheckbox" class="modeCheckboxes" name="Bicycle" checked><span class="modeIcon"><i class="fa fa-bicycle fa-sm" aria-hidden="true"></i></span></label>
                                      <label for="pedCheckbox"><input type="checkbox" id="pedCheckbox" class="modeCheckboxes" name="Pedestrian" checked><span class="modeIcon"><i class="fa fa-street-view fa-sm" aria-hidden="true"></i></span></label>
                                      <label for="mvCheckbox"><input type="checkbox" id="mvCheckbox" class="modeCheckboxes" name="Other Motor Vehicle" checked><span class="modeIcon"><i class="fa fa-car fa-sm" aria-hidden="true"></i></span></label>
                                    </div>
                                  </div>
                                  <br>
                                  <div class="modeSelector row mx-auto">
                                    <div class="col text-center">
                                      <label for="painCheckbox"><input type="checkbox" id="painCheckbox" class="severityCheckboxes" name="Complaint of Pain" checked><span class="modeIcon">Pain</span></label>
                                      <label for="injuryCheckbox"><input type="checkbox" id="injuryCheckbox" class="severityCheckboxes" name="Other Visible Injury" checked><span class="modeIcon">Injury</span></label>
                                      <label for="severeCheckbox"><input type="checkbox" id="severeCheckbox" class="severityCheckboxes" name="Severe Injury" checked><span class="modeIcon">Severe</span></label>
                                      <label for="fatalCheckbox"><input type="checkbox" id="fatalCheckbox" class="severityCheckboxes" name="Fatal" checked><span class="modeIcon">Fatal</span></label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div><hr>

                            <div class="row">
                              <div class="col">
                                <div id="crosswalkSelector" class="layerSelector">
                                  <label for="crosswalkCheckbox"><input type="checkbox" id="crosswalkCheckbox" class="leftCheckboxes" name="Crosswalks" checked><span class="layerSpan">Marked Crosswalks</span></label>
                                  <br>
                                  <div class="modeSelector">
                                    <label for="brickCheckbox"><input type="checkbox" id="brickCheckbox" class="crosswalkCheckboxes" name="Brick"><span class="modeIcon">Brick</span></label>
                                    <label for="decorativeCheckbox"><input type="checkbox" id="decorativeCheckbox" class="crosswalkCheckboxes" name="Decorative"><span class="modeIcon">Decorative</span></label>
                                    <label for="ladderCheckbox"><input type="checkbox" id="ladderCheckbox" class="crosswalkCheckboxes" name="Ladder"><span class="modeIcon">Ladder</span></label>
                                    <label for="standardCheckbox"><input type="checkbox" id="standardCheckbox" class="crosswalkCheckboxes" name="Standard" checked><span class="modeIcon">Standard</span></label>
                                    <label for="otherCheckbox"><input type="checkbox" id="otherCheckbox" class="crosswalkCheckboxes" name="Other"><span class="modeIcon">Other</span></label>
                                  </div><hr>
                                </div>
                              </div>
                            </div>

                            <div class="row">
                              <div class="col">
                                <div id="pavementSelector" class="layerSelector">
                                  <label for="pavementCheckbox"><input type="checkbox" id="pavementCheckbox" class="rightOfWayCheckboxes" name="PavementWidth" checked><span class="layerSpan">Pavement Width</span></label>
                                  <br>
                                  <p><label for="pavementAmount"><input type="text" id="pavementAmount" readonly style="border:0;"></label></p>
                                  <div id="pavementSlider" class="rowSlider"></div><hr>
                                </div>
                              </div>
                            </div>

                            <div class="row">
                              <div class="col">
                                <div id="sidewalkSelector" class="layerSelector">
                                  <label for="sidewalkCheckbox"><input type="checkbox" id="sidewalkCheckbox" class="rightOfWayCheckboxes" name="SidewalkWidth" checked><span class="layerSpan">Sidewalk Width</span></label>
                                  <br>
                                  <p><label for="sidewalkAmount"><input type="text" id="sidewalkAmount" readonly style="border:0;"></label></p>
                                  <div id="sidewalkSlider" class="rowSlider"></div><hr>
                                </div>
                              </div>
                            </div>

                            <div class="row">
                              <div class="col">
                                <div id="adtSelector" class="layerSelector">
                                  <label for="adtCheckbox"><input type="checkbox" id="adtCheckbox" class="adtCheckbox" name="ADT" checked><span class="layerSpan">ADT (average)</span></label>
                                  <br>
                                  <p><label for="adtAmount"><input type="text" id="adtAmount" readonly style="border:0;"></label></p>
                                  <div id="adtSlider" class="layerSlider"></div>
                                </div><hr>
                              </div>
                            </div>

                            <!-- <div class="row">
                              <div class="col">
                                <div id="vmtSelector" class="layerSelector">
                                  <label for="vmtCheckbox"><input type="checkbox" id="vmtCheckbox" class="vmtCheckbox" name="VMT" checked><span class="layerSpan">VMT (daily)</span></label>
                                  <br>
                                  <p><label for="vmtAmount"><input type="text" id="vmtAmount" readonly style="border:0;"></label></p>
                                  <div id="vmtSlider" class="layerSlider"></div>
                                </div>
                              </div>
                            </div> -->
                            <hr>
                          </div>`;
}

weightings.addTo(map);

weightings.getContainer().addEventListener('mouseover', function () {
  map.dragging.disable();
});

weightings.getContainer().addEventListener('mouseout', function () {
  map.dragging.enable();
});

$('.weightingsDiv').bind('selectstart dragstart', function(e) {
  e.preventDefault();
  return false;
});

///////////////////////////////// MAP CONTROLS

// L.control.zoom({
//    position:'bottomright'
// }).addTo(map);
//
// L.control.scale().addTo(map);

// var control = L.control.layers(baseMaps, null, {collapsed: true, position: 'bottomright'});
// control.addTo(map);

///////////////////////////////// POPUPS

function createCensusPopup(feature, layer) {
  layer.showDelay = 800; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed("Click to view demographic details.");

  var currentYouth = (parseInt(feature.properties.B01001_003) +
                                parseInt(feature.properties.B01001_004) +
                                parseInt(feature.properties.B01001_005) +
                                parseInt(feature.properties.B01001_006) +
                                parseInt(feature.properties.B01001_007) / 2.0 +
                                parseInt(feature.properties.B01001_027) +
                                parseInt(feature.properties.B01001_028) +
                                parseInt(feature.properties.B01001_029) +
                                parseInt(feature.properties.B01001_030) +
                                parseInt(feature.properties.B01001_031) / 2.0 ) / parseFloat(feature.properties.B01001_001);

  var currentElderlyPercentage = (parseInt(feature.properties.B01001_020) +
                                  parseInt(feature.properties.B01001_021) +
                                  parseInt(feature.properties.B01001_022) +
                                  parseInt(feature.properties.B01001_023) +
                                  parseInt(feature.properties.B01001_024) +
                                  parseInt(feature.properties.B01001_025) +
                                  parseInt(feature.properties.B01001_044) +
                                  parseInt(feature.properties.B01001_045) +
                                  parseInt(feature.properties.B01001_046) +
                                  parseInt(feature.properties.B01001_047) +
                                  parseInt(feature.properties.B01001_048) +
                                  parseInt(feature.properties.B01001_049)) / parseFloat(feature.properties.B01001_001);

  var currentLepPercentage = (parseInt(feature.properties.C16002_004) + parseInt(feature.properties.C16002_007) + parseInt(feature.properties.C16002_010) + parseInt(feature.properties.C16002_013)) / parseFloat(feature.properties.C16002_001);

  var popupContent = '<span style="font-weight: 800;">Population Density (people/acre): </span>' + (parseFloat(feature.properties.pop_densit)).toFixed(1) + '<br>' +
                     '<span style="font-weight: 800;">Bike or Walk to Work: </span>' + (((parseInt(feature.properties.B08301_018) + parseInt(feature.properties.B08301_019)) / parseFloat(feature.properties.B08301_001)) * 100).toFixed(2) + "%" + '<br>' +
                     '<span style="font-weight: 800;">Median Household Income: </span>$' + (feature.properties.B19013_001).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<br>' +
                     '<span style="font-weight: 800;">Total Population: </span>' + (feature.properties.B02001_001).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<br>' +
                     '<br>' +
                     '<span style="font-weight: 800;">White alone: </span>' + ((parseInt(feature.properties.B02001_002) / parseFloat(feature.properties.B02001_001)) * 100).toFixed(2) + "%" + '<br>' +
                     '<span style="font-weight: 800;">Black or African American alone: </span>' + ((parseInt(feature.properties.B02001_003) / parseFloat(feature.properties.B02001_001)) * 100).toFixed(2) + "%" + '<br>' +
                     '<span style="font-weight: 800;">American Indian and Alaska Native alone: </span>' + ((parseInt(feature.properties.B02001_004) / parseFloat(feature.properties.B02001_001)) * 100).toFixed(2) + "%" + '<br>' +
                     '<span style="font-weight: 800;">Asian alone: </span>' + ((parseInt(feature.properties.B02001_005) / parseFloat(feature.properties.B02001_001)) * 100).toFixed(2) + "%" + '<br>' +
                     '<span style="font-weight: 800;">Native Hawaiian and Other Pacific Islander alone: </span>' + ((parseInt(feature.properties.B02001_006) / parseFloat(feature.properties.B02001_001)) * 100).toFixed(2) + "%" + '<br>' +
                     '<span style="font-weight: 800;">Some other race alone: </span>' + ((parseInt(feature.properties.B02001_007) / parseFloat(feature.properties.B02001_001)) * 100).toFixed(2) + "%" + '<br>' +
                     '<span style="font-weight: 800;">Two or more races: </span>' + ((parseInt(feature.properties.B02001_008) / parseFloat(feature.properties.B02001_001)) * 100).toFixed(2) + "%" + '<br>' +
                     '<span style="font-weight: 800;">Two or more races: </span>' + ((parseInt(feature.properties.B02001_008) / parseFloat(feature.properties.B02001_001)) * 100).toFixed(2) + "%" + '<br>' +
                     '<br>' +
                     '<span style="font-weight: 800;">Limited&dash;English Proficiency: </span>' + (currentLepPercentage * 100).toFixed(2) + "%" + '<br>' +
                     '<span style="font-weight: 800;">Population 18 and under: </span>' + (currentYouth * 100).toFixed(2) + "%" + '<br>' +
                     '<span style="font-weight: 800;">Population 65 and over: </span>' + (currentElderlyPercentage * 100).toFixed(2) + "%" + '<br>'
                     ;
  var popup = L.popup({minWidth: 400, autoPan: false}).setContent(popupContent);

  layer.bindPopup(popup);

  layer.on('click', function(e) {
      this.setStyle({weight: 5});
      this.bringToFront();
      this.openPopup();
  });

  layer.on('popupclose', function(e) {
      this.setStyle({weight: 0});
  });
}

///////////////////////////////// CENSUS

function censusStyle(feature) {
  var colorArray = ["#FFFFFF", "#F2F5F9", "#E5ECF3", "#D8E2ED", "#CBD9E7", "#BECFE1", "#B1C6DB", "#A4BDD5", "#97B3CF", "#8AAAC9", "#7DA0C3", "#7097BD",
                    "#638DB7", "#5684B1", "#497BAB", "#3C71A5", "#2F689F", "#225E99", "#155593", "#084C8D"];
  var fillColorVariable;

  return {
    fillColor: '#000',
    color: '#fff',
    weight: 0,
    opacity: 1,
    fillOpacity: 0.35
  }
}

function loadCensusData() {
  var censusFile = 'json/census.json';
  var currentMinorityArray = [];
  var incomesArray = [];
  var bikeWalkArray = [];
  var lepArray = [];
  var youthArray = [];
  var elderlyArray = [];

  censusArray = [];
    $.ajax({
      url: censusFile,
      dataType: 'json',
      async: false,
      success: function(data) {
        for (var i = 0; i < data.features.length; i++) {
          var feature = data.features[i];
          censusArray.push(feature);

          var currentMinorityPercentage = (parseInt(feature.properties.B02001_001) - parseInt(feature.properties.B02001_002)) / parseFloat(feature.properties.B02001_001);
          var currentBikeWalkPercentage = (parseInt(feature.properties.B08301_018) + parseInt(feature.properties.B08301_019)) / parseFloat(feature.properties.B08301_001);
          var currentLepPercentage = (parseInt(feature.properties.C16002_004) + parseInt(feature.properties.C16002_007) + parseInt(feature.properties.C16002_010) + parseInt(feature.properties.C16002_013)) / parseFloat(feature.properties.C16002_001);
          var currentYouthPercentage = (parseInt(feature.properties.B01001_003) +
                                        parseInt(feature.properties.B01001_004) +
                                        parseInt(feature.properties.B01001_005) +
                                        parseInt(feature.properties.B01001_006) +
                                        parseInt(feature.properties.B01001_007) / 2.0 +
                                        parseInt(feature.properties.B01001_027) +
                                        parseInt(feature.properties.B01001_028) +
                                        parseInt(feature.properties.B01001_029) +
                                        parseInt(feature.properties.B01001_030) +
                                        parseInt(feature.properties.B01001_031) / 2.0 ) / parseFloat(feature.properties.B01001_001);
          var currentElderlyPercentage = (parseInt(feature.properties.B01001_020) +
                                          parseInt(feature.properties.B01001_021) +
                                          parseInt(feature.properties.B01001_022) +
                                          parseInt(feature.properties.B01001_023) +
                                          parseInt(feature.properties.B01001_024) +
                                          parseInt(feature.properties.B01001_025) +
                                          parseInt(feature.properties.B01001_044) +
                                          parseInt(feature.properties.B01001_045) +
                                          parseInt(feature.properties.B01001_046) +
                                          parseInt(feature.properties.B01001_047) +
                                          parseInt(feature.properties.B01001_048) +
                                          parseInt(feature.properties.B01001_049)) / parseFloat(feature.properties.B01001_001);

          currentMinorityArray.push(currentMinorityPercentage);
          incomesArray.push(parseInt(feature.properties.B19013_001));
          bikeWalkArray.push(currentBikeWalkPercentage);
          lepArray.push(currentLepPercentage);
          youthArray.push(currentYouthPercentage);
          elderlyArray.push(currentElderlyPercentage);
        }
      }
  });

  var filteredMinorityPercentage = currentMinorityArray.filter(function(a){return !(isNaN(a))});
  filteredMinorityPercentage.sort(sortNumber);
  var minorityPercentage = filteredMinorityPercentage.map(function(x) { return parseFloat((x * 100).toFixed(2)); });

  var filteredIncomes = incomesArray.filter(function(a){return !(isNaN(a))});
  filteredIncomes.sort(sortNumber);

  var filteredBikeWalkPercentage = bikeWalkArray.filter(function(a){return !(isNaN(a))});
  filteredBikeWalkPercentage.sort(sortNumber);
  var bikeWalkPercentage = filteredBikeWalkPercentage.map(function(x) { return parseFloat((x * 100).toFixed(2)); });

  var filteredLepPercentage = lepArray.filter(function(a){return !(isNaN(a))});
  filteredLepPercentage.sort(sortNumber);
  var lepPercentage = filteredLepPercentage.map(function(x) { return parseFloat((x * 100).toFixed(2)); });

  var filteredYouthPercentage = youthArray.filter(function(a){return !(isNaN(a))});
  filteredYouthPercentage.sort(sortNumber);
  var youthPercentage = filteredYouthPercentage.map(function(x) { return parseFloat((x * 100).toFixed(2)); });

  var filteredElderlyPercentage = elderlyArray.filter(function(a){return !(isNaN(a))});
  filteredElderlyPercentage.sort(sortNumber);
  var elderlyPercentage = filteredElderlyPercentage.map(function(x) { return parseFloat((x * 100).toFixed(2)); });

  // $( function() {
  //   $( "#minoritySlider" ).slider({
  //     range: true,
  //     min: minorityPercentage[0],
  //     max: minorityPercentage[minorityPercentage.length - 1],
  //     values: [ minorityPercentage[0], minorityPercentage[minorityPercentage.length - 1] ],
  //     step: 0.01,
  //     slide: function( event, ui ) {
  //       $( "#minorityAmount" ).val( ui.values[ 0 ] + "% - " + ui.values[ 1 ] + "%");
  //     },
  //     change: function (event, ui) {
  //       updateCensus();
  //     }
  //   });
  //  $( "#minorityAmount" ).val( $( "#minoritySlider" ).slider( "values", 0 ) +
  //    "% - " + $( "#minoritySlider" ).slider( "values", 1 ) + "%");
  //  });
  //
  //  $( function() {
  //    $( "#commuteSlider" ).slider({
  //      range: true,
  //      min: bikeWalkPercentage[0],
  //      max: bikeWalkPercentage[bikeWalkPercentage.length - 1],
  //      values: [ bikeWalkPercentage[0], bikeWalkPercentage[bikeWalkPercentage.length - 1] ],
  //      step: 0.01,
  //      slide: function( event, ui ) {
  //        $( "#commuteAmount" ).val( ui.values[ 0 ] + "% - " + ui.values[ 1 ] + "%");
  //      },
  //      change: function (event, ui) {
  //        updateCensus();
  //      }
  //    });
  //   $( "#commuteAmount" ).val( $( "#commuteSlider" ).slider( "values", 0 ) +
  //     "% - " + $( "#commuteSlider" ).slider( "values", 1 ) + "%");
  //   });
  //
  //  $( function() {
  //   $( "#incomeSlider" ).slider({
  //     range: true,
  //     min: filteredIncomes[0],
  //     max: filteredIncomes[filteredIncomes.length - 1],
  //     values: [ filteredIncomes[0], filteredIncomes[filteredIncomes.length - 1] ],
  //     slide: function( event, ui ) {
  //       $( "#incomeAmount" ).val('$' + ui.values[ 0 ].toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + " - $" + ui.values[ 1 ].toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
  //     },
  //     change: function (event, ui) {
  //       updateCensus();
  //     }
  //   });
  //   $( "#incomeAmount" ).val( '$' + $("#incomeSlider" ).slider( "values", 0 ).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') +
  //     " - $" + $( "#incomeSlider" ).slider( "values", 1 ).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
  //   });
  //
  //   $( function() {
  //    $( "#lepSlider" ).slider({
  //      range: true,
  //      min: lepPercentage[0],
  //      max: lepPercentage[lepPercentage.length - 1],
  //      values: [ lepPercentage[0], lepPercentage[lepPercentage.length - 1] ],
  //      step: 0.01,
  //      slide: function( event, ui ) {
  //        $( "#lepAmount" ).val( ui.values[ 0 ] + "% - " + ui.values[ 1 ] + "%");
  //      },
  //      change: function (event, ui) {
  //        updateCensus();
  //      }
  //    });
  //   $( "#lepAmount" ).val( $( "#lepSlider" ).slider( "values", 0 ) +
  //     "% - " + $( "#lepSlider" ).slider( "values", 1 ) + "%");
  //   });
  //
  //   $( function() {
  //    $( "#youthSlider" ).slider({
  //      range: true,
  //      min: youthPercentage[0],
  //      max: youthPercentage[youthPercentage.length - 1],
  //      values: [ youthPercentage[0], youthPercentage[youthPercentage.length - 1] ],
  //      step: 0.01,
  //      slide: function( event, ui ) {
  //        $( "#youthAmount" ).val( ui.values[ 0 ] + "% - " + ui.values[ 1 ] + "%");
  //      },
  //      change: function (event, ui) {
  //        updateCensus();
  //      }
  //    });
  //   $( "#youthAmount" ).val( $( "#youthSlider" ).slider( "values", 0 ) +
  //     "% - " + $( "#youthSlider" ).slider( "values", 1 ) + "%");
  //   });
  //
  //   $( function() {
  //    $( "#elderlySlider" ).slider({
  //      range: true,
  //      min: elderlyPercentage[0],
  //      max: elderlyPercentage[elderlyPercentage.length - 1],
  //      values: [ elderlyPercentage[0], elderlyPercentage[elderlyPercentage.length - 1] ],
  //      step: 0.01,
  //      slide: function( event, ui ) {
  //        $( "#elderlyAmount" ).val( ui.values[ 0 ] + "% - " + ui.values[ 1 ] + "%");
  //      },
  //      change: function (event, ui) {
  //        updateCensus();
  //      }
  //    });
  //   $( "#elderlyAmount" ).val( $( "#elderlySlider" ).slider( "values", 0 ) +
  //     "% - " + $( "#elderlySlider" ).slider( "values", 1 ) + "%");
  //   });

    $( function() {
     $( "#densitySlider" ).slider({
       range: true,
       min: elderlyPercentage[0],
       max: elderlyPercentage[elderlyPercentage.length - 1],
       values: [ elderlyPercentage[0], elderlyPercentage[elderlyPercentage.length - 1] ],
       step: 0.01,
       slide: function( event, ui ) {
         $( "#densityAmount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ]);
       },
       change: function (event, ui) {
         updateCensus();
       }
     });
    $( "#densityAmount" ).val( $( "#densitySlider" ).slider( "values", 0 ) +
      " - " + $( "#densitySlider" ).slider( "values", 1 ));
    });

  census = L.geoJson(censusArray, {
    style: censusStyle,
    onEachFeature: createCensusPopup
  });

  if (overlaysIDs[0] != -1) {
    overlays.removeLayer(overlaysIDs[0]);
    overlaysIDs[0] = -1;
  }

  overlays.addLayer(census).addTo(map);
  overlaysIDs[0] = census._leaflet_id;

  updatedCensusArray = censusArray;
}

loadCensusData();

function updateCensus() {
  updatedCensusArray = [];

  var checkedLayers = $("input:checkbox[class=censusCheckboxes]:checked");

  function queryCensusArray(censusType, currentQueryArray){
    if (censusType == "Minority") {
      var queriedArray = [];
      var lowValue = $('#minoritySlider').slider("values")[0];
      var highValue = $('#minoritySlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentMinorityPercentage = parseFloat((((parseInt(feature.properties.B02001_001) - parseInt(feature.properties.B02001_002)) / parseFloat(feature.properties.B02001_001)) * 100).toFixed(2));

        if (currentMinorityPercentage >= lowValue && currentMinorityPercentage <= highValue) {
          queriedArray.push(feature);
        }
      }
    } else if (censusType == "Income") {
      var queriedArray = [];
      var lowValue = $('#incomeSlider').slider("values")[0];
      var highValue = $('#incomeSlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentIncome = parseInt(feature.properties.B19013_001);

        if (currentIncome >= lowValue && currentIncome <= highValue) {
          queriedArray.push(feature);
        }
      }
    }

    else if (censusType == "Commute") {
      var queriedArray = [];
      var lowValue = $('#commuteSlider').slider("values")[0];
      var highValue = $('#commuteSlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentBikeWalkPercentage = parseFloat((((parseInt(feature.properties.B08301_018) + parseInt(feature.properties.B08301_019)) / parseFloat(feature.properties.B08301_001)) * 100).toFixed(2));

        if (currentBikeWalkPercentage >= lowValue && currentBikeWalkPercentage <= highValue) {
          queriedArray.push(feature);
        }
      }
    }

    else if (censusType == "LEP") {
      var queriedArray = [];
      var lowValue = $('#lepSlider').slider("values")[0];
      var highValue = $('#lepSlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentLepPercentage = parseFloat(((parseInt(feature.properties.C16002_004) + parseInt(feature.properties.C16002_007) + parseInt(feature.properties.C16002_010) + parseInt(feature.properties.C16002_013)) / parseFloat(feature.properties.C16002_001) * 100).toFixed(2));

        if (currentLepPercentage >= lowValue && currentLepPercentage <= highValue) {
          queriedArray.push(feature);
        }
      }
    }

    else if (censusType == "Youth") {
      var queriedArray = [];
      var lowValue = $('#youthSlider').slider("values")[0];
      var highValue = $('#youthSlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentYouthPercentage = parseFloat(((parseInt(feature.properties.B01001_003) +
                                                parseInt(feature.properties.B01001_004) +
                                                parseInt(feature.properties.B01001_005) +
                                                parseInt(feature.properties.B01001_006) +
                                                parseInt(feature.properties.B01001_007) / 2.0 +
                                                parseInt(feature.properties.B01001_027) +
                                                parseInt(feature.properties.B01001_028) +
                                                parseInt(feature.properties.B01001_029) +
                                                parseInt(feature.properties.B01001_030) +
                                                parseInt(feature.properties.B01001_031) / 2.0 ) / parseFloat(feature.properties.B01001_001) * 100).toFixed(2));

        if (currentYouthPercentage >= lowValue && currentYouthPercentage <= highValue) {
          queriedArray.push(feature);
        }
      }
    }

    else if (censusType == "Elderly") {
      var queriedArray = [];
      var lowValue = $('#elderlySlider').slider("values")[0];
      var highValue = $('#elderlySlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentElderlyPercentage = parseFloat((((parseInt(feature.properties.B01001_020) +
                                                  parseInt(feature.properties.B01001_021) +
                                                  parseInt(feature.properties.B01001_022) +
                                                  parseInt(feature.properties.B01001_023) +
                                                  parseInt(feature.properties.B01001_024) +
                                                  parseInt(feature.properties.B01001_025) +
                                                  parseInt(feature.properties.B01001_044) +
                                                  parseInt(feature.properties.B01001_045) +
                                                  parseInt(feature.properties.B01001_046) +
                                                  parseInt(feature.properties.B01001_047) +
                                                  parseInt(feature.properties.B01001_048) +
                                                  parseInt(feature.properties.B01001_049)) / parseFloat(feature.properties.B01001_001)) * 100).toFixed(2));

        if (currentElderlyPercentage >= lowValue && currentElderlyPercentage <= highValue) {
          queriedArray.push(feature);
        }
      }
    }

    return queriedArray;
  }

  if (checkedLayers.length > 0) {
    updatedCensusArray = queryCensusArray(checkedLayers[0].name, censusArray);
  }

  for (var i = 1; i < checkedLayers.length; i++) {
    updatedCensusArray = queryCensusArray(checkedLayers[i].name, updatedCensusArray);
  }

  census = L.geoJson(updatedCensusArray, {
    style: censusStyle,
    onEachFeature: createCensusPopup
  });

  if (overlaysIDs[0] != -1) {
    overlays.removeLayer(overlaysIDs[0]);
    overlaysIDs[0] = -1;
  }

  overlays.addLayer(census).addTo(map);
  overlaysIDs[0] = census._leaflet_id;

  census.setZIndex(-1);
}

$('input[class=censusCheckboxes]').change(function(){
  updateCensus();

  var checkedLayers = $("input:checkbox[class=censusCheckboxes]:checked");
  if (checkedLayers.length == 0) {
    if (overlaysIDs[0] != -1) {
      overlays.removeLayer(overlaysIDs[0]);
      overlaysIDs[0] = -1;
    }
  }
});

///////////////////////////////// COLLISIONS
function loadCollisionsData(){

  var epdoDict = {"Complaint of Pain": 1, "Other Visible Injury": 3, "Severe Injury": 7, "Fatal": 10};

  var collisionsFile = 'json/collisions.json';
  $.ajax({
    url: collisionsFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        heatArray.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0], epdoDict[feature.properties.Injury]]);
        collisionsArray.push(feature);
      }
    }
  });

  updatedCollisionsArray = collisionsArray;

  heat.setLatLngs(heatArray);
  heat.addTo(map);
}

loadCollisionsData();

function updateCollisions() {
  updatedCollisionsArray = [];
  heatArray = [];

  var epdoDict = {"Complaint of Pain": 1, "Other Visible Injury": 3, "Severe Injury": 7, "Fatal": 10};

  var checkedModes = $("input:checkbox[class=modeCheckboxes]:checked");
  var checkedSeverities = $("input:checkbox[class=severityCheckboxes]:checked");
  var selectedModes = [];
  var selectedSeverities = [];

  for (var m = 0; m < checkedModes.length; m++) {
    selectedModes.push(checkedModes[m].name);
  }

  for (var s = 0; s < checkedSeverities.length; s++) {
    selectedSeverities.push(checkedSeverities[s].name);
  }

  if (selectedModes.length > 0 && selectedSeverities.length > 0) {
    for (var i = 0; i < collisionsArray.length; i++){


      if (($.inArray(collisionsArray[i].properties.InvWith, selectedModes) > -1) && ($.inArray(collisionsArray[i].properties.Injury, selectedSeverities) > -1)) {
        updatedCollisionsArray.push(collisionsArray[i]);
        heatArray.push([collisionsArray[i].geometry.coordinates[1], collisionsArray[i].geometry.coordinates[0], epdoDict[collisionsArray[i].properties.Injury]]);
      }
    }
  }

  heat.setLatLngs(heatArray);
  heat.addTo(map);
}

$('input[class=modeCheckboxes]').change(function(){
  updateCollisions();
});

$('input[class=severityCheckboxes]').change(function(){
  updateCollisions();
});

///////////////////////////////// ADT

function adtStyle(feature) {
  return {
    weight: 0.5,
    color: "cyan",
    opacity: 1
  }
};

function loadAdtData() {
  var adtFile = 'json/adt.json';

  adtArray = [];
  adtValuesArray = []
  $.ajax({
    url: adtFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        adtArray.push(feature);
        adtValuesArray.push(feature.properties.ADT_AVG);
      }
    }
  });

  adtValuesArray.sort(sortNumber);

  $( function() {
   $( "#adtSlider" ).slider({
     range: true,
     min: adtValuesArray[0],
     max: adtValuesArray[adtValuesArray.length - 1],
     values: [ adtValuesArray[0], adtValuesArray[adtValuesArray.length - 1] ],
     slide: function( event, ui ) {
       $( "#adtAmount" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ]);
     },
     change: function (event, ui) {
       updateADT();
     }
   });
    $( "#adtAmount" ).val($("#adtSlider" ).slider( "values", 0 ) + " - " + $( "#adtSlider" ).slider( "values", 1 ));
  });
   updatedAdtArray = adtArray;
}

loadAdtData();

function updateADT() {
  updatedAdtArray = [];

  var checkedLayers = $("input:checkbox[class=adtCheckbox]:checked");

  function queryStreetArray(streetType, currentQueryArray){
    if (streetType == "ADT") {
      var queriedArray = [];
      var lowValue = $('#adtSlider').slider("values")[0];
      var highValue = $('#adtSlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentADT = feature.properties.ADT_AVG;

        if (currentADT >= lowValue && currentADT <= highValue) {
          queriedArray.push(feature);
        }
      }
    }

    return queriedArray;
  }

  if (checkedLayers.length > 0) {
    updatedAdtArray = queryStreetArray(checkedLayers[0].name, adtArray);
  }

}

$('input[class=adtCheckbox]').change(function(){
  updateADT();
});

///////////////////////////////// VMT

function vmtStyle(feature) {
  return {
    weight: 0.5,
    color: "green",
    opacity: 1
  }
};

function loadVmtData() {
  var vmtFile = 'json/vmt.json';

  vmtArray = [];
  vmtValuesArray = []
  $.ajax({
    url: vmtFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        vmtArray.push(feature);
        vmtValuesArray.push(feature.properties.Daily_VMT);
      }
    }
  });

  var filteredVMT = vmtValuesArray.filter(function(a){return !(isNaN(a))});
  filteredVMT.sort(sortNumber);

  $( function() {
   $( "#vmtSlider" ).slider({
     range: true,
     min: filteredVMT[0],
     max: filteredVMT[filteredVMT.length - 1],
     values: [ filteredVMT[0], 1000],
     slide: function( event, ui ) {
       $( "#vmtAmount" ).val(ui.values[ 0 ].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " - " + ui.values[ 1 ].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
     },
     change: function (event, ui) {
       updateVMT();
     }
   });
    $( "#vmtAmount" ).val($("#vmtSlider" ).slider( "values", 0 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " - " + $( "#vmtSlider" ).slider( "values", 1 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  });

  updatedVmtArray = vmtArray;

   // vmt = L.geoJson(vmtArray, {
   //   style: vmtStyle
   // // onEachFeature: createCensusPopup
   // });

   // if (overlaysIDs[2] != -1) {
   //   overlays.removeLayer(overlaysIDs[2]);
   //   overlaysIDs[2] = -1;
   // }
   //
   // overlays.addLayer(vmt).addTo(map);
   // overlaysIDs[2] = vmt._leaflet_id;
}

// loadVmtData();

function updateVMT() {
  updatedVmtArray = [];

  var checkedLayers = $("input:checkbox[class=vmtCheckbox]:checked");

  function queryStreetArray(streetType, currentQueryArray){
    if (streetType == "VMT") {
      var queriedArray = [];
      var lowValue = $('#vmtSlider').slider("values")[0];
      var highValue = $('#vmtSlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentvmt = feature.properties.Daily_VMT;

        if (currentvmt >= lowValue && currentvmt <= highValue) {
          queriedArray.push(feature);
        }
      }
    }

    return queriedArray;
  }

  if (checkedLayers.length > 0) {
    updatedVmtArray = queryStreetArray(checkedLayers[0].name, vmtArray);
  }
}

$('input[class=vmtCheckbox]').change(function(){
  updateVMT();
});

///////////////////////////////// CROSSWALKS
function loadCrosswalkData(){

  var crosswalkFile = 'json/crosswalks.json';
  $.ajax({
    url: crosswalkFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        crosswalkArray.push(feature);
      }
    }
  });

  updatedCrosswalkArray = crosswalkArray;
}

loadCrosswalkData();

function updateCrosswalk() {
  updatedCrosswalkArray = [];

  var checkedModes = $("input:checkbox[class=crosswalkCheckboxes]:checked");
  var selectedModes = [];

  // 'Brick' 'Decorative' 'Ladder - White' 'Ladder - Yellow' 'Standard - White' 'Standard - Yellow'
  // var subcategoriesDict = {"Ladder": ["Ladder - White", "Ladder - Yellow"], "Standard": ["Standard - White", "Standard - Yellow"]};

  for (var m = 0; m < checkedModes.length; m++) {
    selectedModes.push(checkedModes[m].name);
  }

  for (var i = 0; i < crosswalkArray.length; i++){
    var hyphenIndex = crosswalkArray[i].properties.Type.indexOf(" - ");
    if (hyphenIndex > -1) {
      var currentCrosswalkType = crosswalkArray[i].properties.Type.substring(0, hyphenIndex);
    } else {
      var currentCrosswalkType = crosswalkArray[i].properties.Type;
    }

    if ($.inArray(currentCrosswalkType, selectedModes) > -1) {
      updatedCrosswalkArray.push(crosswalkArray[i]);
    }
  }
}

$('input[class=crosswalkCheckboxes]').change(function(){
  updateCrosswalk();
});


///////////////////////////////// PAVEMENT
function loadPavementData(){
  var pavementWidthArray = [];
  var sidewalkWidthArray = [];

  var pavementFile = 'json/row_points.json';
  $.ajax({
    url: pavementFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];

        pavementArray.push(feature);
        sidewalkArray.push(feature);

        pavementWidthArray.push(feature.properties.PAVEMENT_W);
        sidewalkWidthArray.push(feature.properties.SIDEWALK_W);
      }
    }
  });

  updatedPavementArray = pavementArray;
  updatedSidewalkArray = sidewalkArray;

  pavementWidthArray.sort(sortNumber);
  sidewalkWidthArray.sort(sortNumber);

  $( function() {
    $( "#pavementSlider" ).slider({
      range: true,
      min: pavementWidthArray[0],
      max: pavementWidthArray[pavementWidthArray.length - 1],
      values: [ pavementWidthArray[0], pavementWidthArray[pavementWidthArray.length - 1] ],
      step: 1,
      slide: function( event, ui ) {
       $( "#pavementAmount" ).val( ui.values[ 0 ] + " feet - " + ui.values[ 1 ] + " feet");
      },
      change: function (event, ui) {
        updatePavement();
      }
    });
   $( "#pavementAmount" ).val( $( "#pavementSlider" ).slider( "values", 0 ) +
     " feet - " + $( "#pavementSlider" ).slider( "values", 1 ) + " feet");
   });

   $( function() {
     $( "#sidewalkSlider" ).slider({
       range: true,
       min: sidewalkWidthArray[0],
       max: sidewalkWidthArray[sidewalkWidthArray.length - 1],
       values: [ sidewalkWidthArray[0], sidewalkWidthArray[sidewalkWidthArray.length - 1] ],
       step: 1,
       slide: function( event, ui ) {
        $( "#sidewalkAmount" ).val( ui.values[ 0 ] + " feet - " + ui.values[ 1 ] + " feet");
       },
       change: function (event, ui) {
         updateSidewalk();
       }
     });
    $( "#sidewalkAmount" ).val( $( "#sidewalkSlider" ).slider( "values", 0 ) +
      " feet - " + $( "#sidewalkSlider" ).slider( "values", 1 ) + " feet");
    });
}

loadPavementData();

function queryPavementArray(pavementType, currentQueryArray){
  if (pavementType == "PavementWidth") {
    var queriedArray = [];
    var lowValue = parseInt($('#pavementSlider').slider("values")[0]);
    var highValue = parseInt($('#pavementSlider').slider("values")[1]);

    for (var i = 0; i < currentQueryArray.length; i++) {
      var feature = currentQueryArray[i];
      var currentPavementWidth = parseInt(feature.properties.PAVEMENT_W);

      if (currentPavementWidth >= lowValue && currentPavementWidth <= highValue) {
        queriedArray.push(feature);
      }
    }
  } else if (pavementType == "SidewalkWidth") {
    var queriedArray = [];
    var lowValue = parseInt($('#sidewalkSlider').slider("values")[0]);
    var highValue = parseInt($('#sidewalkSlider').slider("values")[1]);

    for (var i = 0; i < currentQueryArray.length; i++) {
      var feature = currentQueryArray[i];
      var currentSidewalkWidth = parseInt(feature.properties.SIDEWALK_W);

      if (currentSidewalkWidth >= lowValue && currentSidewalkWidth <= highValue) {
        queriedArray.push(feature);
      }
    }
  }

  return queriedArray;
}

function updatePavement() {
  var tempArray = [];
  tempArray = queryPavementArray("PavementWidth", updatedPavementArray);
  updatedPavementArray = [];
  updatedPavementArray = tempArray;
}

$('input[class=pavementSelector]').change(function(){
  updatePavement();
});

function updateSidewalk() {
  var tempArray = [];
  tempArray = queryPavementArray("SidewalkWidth", updatedSidewalkArray);
  updatedSidewalkArray = [];
  updatedSidewalkArray = tempArray;
}

$('input[class=sidewalkSelector]').change(function(){
  updateSidewalk();
});


///////////////////////////////// WEIGHTINGS
var weightingFactorDict = {"collisionsWeight": 2,
                     "crosswalkWeight": 0.1,
                     "pavementWeight": 0.1,
                     "sidewalkWeight": 0.2,
                     "adtWeight": 0.1,
                     "vmtWeight": 1};

$('#collisionsWeight').change(function(){
  updateCollisions();
});

$('#crosswalkWeight').change(function(){
  updateCrosswalk();
});

$('#pavementWeight').change(function(){
  updatePavement();
});

$('#sidewalkWeight').change(function(){
  updateSidewalk();
});

$('#adtWeight').change(function(){
  updateADT();
});

map.on('zoomend', function () {
  if (map.getZoom() > 14) {
    heat.setOptions({max: 0});
  }
  else {
    heat.setOptions({max: 10});
    heat.redraw();
  }
});
