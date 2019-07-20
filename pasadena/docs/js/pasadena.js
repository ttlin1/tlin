var stamen = L.tileLayer("http://tile.stamen.com/toner-lite/{z}/{x}/{y}.png", {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
});

var osm_map = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var carto = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
  attribution: "Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL."
});

var hydda = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});

var Esri_WorldGrayReference = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});

var CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var CartoDB_PositronOnlyLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
  pane: 'labels'
});

var baseMaps = {
  "Stamen Base": stamen,
  "Carto Dark": carto
};

var census = L.geoJson();
var censusArray = [];
var updatedCensusArray = [];
var popDensityArray = [];

var adt = L.geoJson();
var adtArray = [];
var updatedAdtArray = [];

var pci = L.geoJson();
var pciArray = [];
var updatedPciArray = [];

var ridership = L.geoJson();
var ridershipArray = [];
var updatedRidershipArray = [];
var filteredRidership = [];

var bike = L.geoJson();
var bikeArray = [];
var updatedBikeArray = [];

var collisions = L.geoJson();
var collisionsArray = [];
var updatedCollisionsArray = [];

var crosswalk = L.geoJson();
var crosswalkArray = [];
var updatedCrosswalkArray = [];

var speed = L.geoJson();
var speedArray = [];
var updatedSpeedArray = [];

var signals = L.geoJson();
var signalsArray = [];
var updatedSignalsArray = [];

var transit = L.geoJson();
var transitArray = [];
var updatedTransitArray = [];

var schoolRoutes = L.geoJson();
var schoolRoutesArray = [];
var updatedSchoolRoutesArray = [];

var uploadedShapefile = L.geoJson();
var uploadedArray = [];

var turfLayer = L.geoJson();
var turfLayerArray = [];
var updatedTurfLayerArray = [];
var finalScoreArray = [];
var turfDict = {};

var turfPolygonArray = [];

var heat = new L.heatLayer(null, {radius: 6, blur: 11, maxZoom: 12, max: 10});
var heatArray = [];

var overlays = L.layerGroup();
var overlaysIDs = [];
var overlayOrder = ["Ridership", "Density", "ADT", "PCI", "Bike Routes", "Collisions", "Speed", "Crosswalks", "Signals", "Transit", "School", "Hex Grid", "Uploaded"];
var overlayFieldNames = ["ridership", "pop_densit", "ADT_COMBN", "PCI", "CLASS", "", "SP_ZONE", "Type", "TYPE", "CS_TRANSIT", "Name", "FINAL_SCOR", ""];

var drawingJson = [];

for (var i = 0; i < overlayOrder.length; i++) {
  overlaysIDs.push(-1);
}

var map = L.map('pasadenaMap', {
  center: [34.1482,-118.1245],
  zoom: 13,
  layers: [CartoDB_PositronNoLabels],
  doubleClickZoom: false,
  boxZoom: false,
  zoomControl: false
  // maxZoom: 15
});

map.createPane('labels');
map.getPane('labels').style.zIndex = 601;
map.getPane('labels').style.pointerEvents = 'none';

CartoDB_PositronOnlyLabels.addTo(map);

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

                        <div class="row">
                          <div class="col">
                            <div id="adtSelector" class="layerSelector">
                              <label for="adtCheckbox"><input type="checkbox" id="adtCheckbox" class="adtCheckboxes" name="ADT"><span class="layerSpan">ADT (average)</span></label>
                              <br>
                              <p class="text-center"><label for="adtAmount"><input type="text" class="text-center" id="adtAmount" readonly style="border:0;"></label></p>
                              <div id="adtSlider" class="layerSlider"></div>
                            </div><hr>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <div id="pciSelector" class="layerSelector">
                              <label for="pciCheckbox"><input type="checkbox" id="pciCheckbox" class="pciCheckboxes" name="PCI"><span class="layerSpan">Pavement Condition</span></label>
                              <br>
                              <p class="text-center"><label for="pciAmount"><input type="text" class="text-center" id="pciAmount" readonly style="border:0;"></label></p>
                              <div id="pciSlider" class="layerSlider"></div>
                            </div><hr>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <div id="bikeSelector" class="layerSelector">
                              <label for="bikeRouteCheckbox"><input type="checkbox" id="bikeRouteCheckbox" class="bikeRouteCheckboxes" name="Bike" checked><span class="layerSpan">Bike Routes</span></label>
                              <br>
                              <div class="modeSelector">
                                <label for="blvdCheckbox"><input type="checkbox" id="blvdCheckbox" class="routesCheckboxes" name="Blvd" checked><span class="modeIcon">Boulevard</span></label>
                                <label for="laneCheckbox"><input type="checkbox" id="laneCheckbox" class="routesCheckboxes" name="Lane" checked><span class="modeIcon">Lane</span></label>
                                <label for="routeCheckbox"><input type="checkbox" id="routeCheckbox" class="routesCheckboxes" name="Route" checked><span class="modeIcon">Route</span></label>
                                <label for="enhancedCheckbox"><input type="checkbox" id="enhancedCheckbox" class="routesCheckboxes" name="Enhanced" checked><span class="modeIcon">Enhanced</span></label>
                              </div><hr>
                            </div>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <div id="collisionsSelector" class="layerSelector">
                              <label for="collisionsCheckbox"><input type="checkbox" id="collisionsCheckbox" class="leftCheckboxes" name="Collisions"><span class="layerSpan">Collisions (heatmap)</span></label>
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
                              </div><hr>
                            </div>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <div id="speedSelector" class="layerSelector">
                              <label for="criticalSpeedCheckbox"><input type="checkbox" id="criticalSpeedCheckbox" class="speedCheckboxes" name="Speed"><span class="layerSpan">Critical Speed</span></label>
                              <br>
                              <p class="text-center"><label for="speedAmount"><input type="text" class="text-center" id="speedAmount" readonly style="border:0;"></label></p>
                              <div id="speedSlider" class="layerSlider"></div>
                            </div><hr>
                          </div>
                        </div>
                      </div>`;
}

legend.addTo(map);

legend.getContainer().addEventListener('mouseover', function () {
  map.dragging.disable();
});

legend.getContainer().addEventListener('mouseout', function () {
  map.dragging.enable();
});

// $('.legendDiv').bind('selectstart dragstart', function(e) {
//   e.preventDefault();
//   return false;
// });

///////////////////////////////// DEFAULT

function createDisabledSliders() {
  $( function() {
    $( "#adtSlider" ).slider({
      range: true,
      min: 0,
      max: 0,
      values: [ 0, 0],
    });
     $( "#adtAmount" ).val($("#adtSlider" ).slider( "values", 0 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " - " + $( "#adtSlider" ).slider( "values", 1 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
   });

  $( function() {
    $( "#pciSlider" ).slider({
      range: true,
      min: 0,
      max: 0,
      values: [ 0, 0],
    });
     $( "#pciAmount" ).val($("#pciSlider" ).slider( "values", 0 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " - " + $( "#pciSlider" ).slider( "values", 1 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  });

  $( function() {
    $( "#speedSlider" ).slider({
      range: true,
      min: 0,
      max: 0,
      values: [ 0, 0],
    });
     $( "#speedAmount" ).val($("#speedSlider" ).slider( "values", 0 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " - " + $( "#speedSlider" ).slider( "values", 1 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  });

  $( function() {
    $( "#schoolSlider" ).slider({
      range: true,
      min: 0,
      max: 0,
      values: [ 0, 0],
    });
     $( "#schoolAmount" ).val($("#schoolSlider" ).slider( "values", 0 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " - " + $( "#schoolSlider" ).slider( "values", 1 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  });

  $( function() {
    $( "#hexSlider" ).slider({
      range: true,
      min: 0,
      max: 0,
      values: [ 0, 0],
    });
     $( "#hexAmount" ).val($("#hexSlider" ).slider( "values", 0 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " - " + $( "#hexSlider" ).slider( "values", 1 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  });
}

createDisabledSliders();

///////////////////////////////// WEIGHTINGS

var weightings = L.control({position: 'topleft'});

weightings.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'weightingsDiv');
  this.initializeInfo();
  return this._div;
};

weightings.initializeInfo = function () {
  this._div.innerHTML = /* @html */`<div class="container addScroll">
                            <p>&nbsp;</p>

                            <div class="row">
                              <div class="col">
                                <div id="transitSelector" class="layerSelector">
                                  <label for="transitCheckbox"><input type="checkbox" id="transitCheckbox" class="leftCheckboxes" name="Transit" checked><span class="layerSpan">Transit</span></label>
                                  <br>
                                  <div class="modeSelector">
                                    <label for="rapidCheckbox"><input type="checkbox" id="rapidCheckbox" class="transitCheckboxes" name="METRO RAPID BUS STOP" checked><span class="modeIcon">Metro Rapid Stops</span></label>
                                    <label for="goldLineCheckbox"><input type="checkbox" id="goldLineCheckbox" class="transitCheckboxes" name="METRO GOLD LINE STATION" checked><span class="modeIcon">Gold Line Stations</span></label>
                                  </div><hr>
                                </div>
                              </div>
                            </div>

                            <div class="row">
                              <div class="col">
                                <div id="schoolSelector" class="layerSelector">
                                  <label for="schoolCheckbox"><input type="checkbox" id="schoolCheckbox" class="leftCheckboxes" name="School"><span class="layerSpan">School Routes (mi. buffer)</span></label>
                                  <br>
                                  <p class="text-center"><label for="schoolAmount"><input type="text" class="text-center" id="schoolAmount" readonly style="border:0;"></label></p>
                                  <div id="schoolSlider" class="layerSlider"></div><hr>
                                </div>
                              </div>
                            </div>

                            <div class="row">
                              <div class="col">
                                <div id="crosswalkSelector" class="layerSelector">
                                  <label for="crosswalkCheckbox"><input type="checkbox" id="crosswalkCheckbox" class="leftCheckboxes" name="Crosswalks" checked><span class="layerSpan">Marked Crosswalks</span></label>
                                  <br>
                                  <div class="modeSelector">
                                    <label for="brickCheckbox"><input type="checkbox" id="brickCheckbox" class="crosswalkCheckboxes" name="Brick"><span class="modeIcon">Brick</span></label>
                                    <label for="decorativeCheckbox"><input type="checkbox" id="decorativeCheckbox" class="crosswalkCheckboxes" name="Decorative"><span class="modeIcon">Dec.</span></label>
                                    <label for="ladderCheckbox"><input type="checkbox" id="ladderCheckbox" class="crosswalkCheckboxes" name="Ladder"><span class="modeIcon">Ladder</span></label>
                                    <label for="standardCheckbox"><input type="checkbox" id="standardCheckbox" class="crosswalkCheckboxes" name="Standard" checked><span class="modeIcon">Standard</span></label>
                                    <label for="otherCheckbox"><input type="checkbox" id="otherCheckbox" class="crosswalkCheckboxes" name="Other"><span class="modeIcon">Other</span></label>
                                  </div><hr>
                                </div>
                              </div>
                            </div>

                            <div class="row">
                              <div class="col">
                                <div id="signalSelector" class="layerSelector">
                                  <label for="signalCheckbox"><input type="checkbox" id="signalCheckbox" class="leftCheckboxes" name="Signals" checked><span class="layerSpan">Signalized Intersections</span></label>
                                  <br>
                                  <div class="modeSelector">
                                    <label for="intersectionCheckbox"><input type="checkbox" id="intersectionCheckbox" class="signalsCheckboxes" name="INTERSECTION" checked><span class="modeIcon">Intersection</span></label>
                                    <label for="midBlockCheckbox"><input type="checkbox" id="midBlockCheckbox" class="signalsCheckboxes" name="MID-BLOCK"><span class="modeIcon">Mid&dash;block</span></label>
                                    <label for="blockCheckbox"><input type="checkbox" id="blockCheckbox" class="signalsCheckboxes" name="BLOCK"><span class="modeIcon">Block</span></label>
                                  </div><hr>
                                </div>
                              </div>
                            </div>

                            
                            <div class="row">
                              <div class="col">
                                <div class="layerSelector">
                                  <label for="uploadCheckbox"><input type="checkbox" id="uploadCheckbox" class="leftCheckboxes" name="Upload"><span class="layerSpan">Upload Layer</span></label>
                                  <form>
                                    <div class="form-group">
                                      <label for="uploadButton">Select a zipped shapefile</label><input type="file" class="form-control-file" id="uploadButton" accept=".zip,.json">
                                    </div>
                                  </form>
                                </div><hr>
                              </div>
                            </div>

                            <div class="row" id="hexRow">
                              <div class="col">
                                <div id="hexSelector" class="layerSelector">
                                  <label for="hexCheckbox"><input type="checkbox" id="hexCheckbox" class="leftCheckboxes" name="Hex"><span class="layerSpan">Upload Hex Grid</span></label>
                                  <br>
                                  <form>
                                    <div class="form-group">
                                      <label for="uploadHex">Select zipped desktop tool output</label><input type="file" class="form-control-file" id="uploadHex" accept=".zip">
                                    </div>
                                  </form>
                                  <p class="text-center"><label for="hexAmount"><input type="text" class="text-center" id="hexAmount" readonly style="border:0;"></label></p>
                                  <div id="hexSlider" class="layerSlider"></div>
                                  <p class="d-none text-center" id="hexStats"></p>
                                  <hr>
                                </div>
                              </div>
                            </div>

                            <div class="row" id="drawRow">
                              <div class="col">
                                <div id="drawSelector" class="layerSelector">
                                  <label for="drawCheckbox"><input type="checkbox" id="drawCheckbox" class="leftCheckboxes" name="Draw" checked><span class="layerSpan">Selection Tools</span></label>
                                  <br>
                                  <div class="row">
                                    <div class="col text-center">
                                      <button id="lineButton" class="drawButton btn btn-outline-secondary"><i class="fas fa-pen"></i><br><span class="small">Line</span></button>
                                    </div>
                                    <div class="col text-center">
                                      <button id="polygonButton" class="drawButton btn btn-outline-secondary"><i class="fas fa-draw-polygon"></i><br><span class="small">Polygon</span></button>
                                    </div>
                                    <div class="col text-center">
                                      <button id="saveDrawings" class="drawButton btn btn-outline-secondary"><i class="far fa-save"></i><br><span class="small">Save</span></button>
                                    </div>
                                    <div class="col text-center">
                                      <button id="deleteDrawings" class="drawButton btn btn-outline-secondary"><i class="fas fa-trash-alt"></i><br><span class="small">Delete</span></button>
                                    </div>
                                  </div><hr>
                                </div>
                              </div>
                            </div>

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

///////////////////////////////// RIDERSHIP

function ridershipStyle(feature) {
  function normalize_scores(in_score, in_minimum, in_maximum){
    var currentRadiusSize = ((in_score - in_minimum) / parseFloat(in_maximum - in_minimum)) * 10;
    if (currentRadiusSize < 1) {
      currentRadiusSize = 2;
    }
    return currentRadiusSize;
  }

  var radiusSize = normalize_scores(feature.properties.ridership, filteredRidership[0], filteredRidership[filteredRidership.length - 1]);

  return {
    radius: radiusSize,
    fillColor: "orange",
    color: "#fff",
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.8
  }
};

function loadRidershipData() {
  var ridershipFile = 'json/ridership.json';

  ridershipArray = [];
  ridershipValuesArray = []
  $.ajax({
    url: ridershipFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        ridershipArray.push(feature);
        ridershipValuesArray.push(feature.properties.ridership);
      }
    }
  });

  filteredRidership = ridershipValuesArray.filter(function(a){return !(isNaN(a))});
  filteredRidership.sort(sortNumber);

  $( function() {
   $( "#ridershipSlider" ).slider({
     range: true,
     min: filteredRidership[0],
     max: filteredRidership[filteredRidership.length - 1],
     values: [ filteredRidership[0], filteredRidership[filteredRidership.length - 1]],
     slide: function( event, ui ) {
       $( "#ridershipAmount" ).val(ui.values[ 0 ].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " - " + ui.values[ 1 ].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
     },
     change: function (event, ui) {
       updateRidership();
     }
   });
    $( "#ridershipAmount" ).val($("#ridershipSlider" ).slider( "values", 0 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " - " + $( "#ridershipSlider" ).slider( "values", 1 ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  });

  updatedRidershipArray = ridershipArray;

  ridership = L.geoJson(updatedRidershipArray, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, ridershipStyle(feature))
    },
    interactive: false
  });

   if (overlaysIDs[overlayOrder.indexOf("Ridership")] != -1) {
     overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Ridership")]);
     overlaysIDs[overlayOrder.indexOf("Ridership")] = -1;
   }

   overlays.addLayer(ridership).addTo(map);
   overlaysIDs[overlayOrder.indexOf("Ridership")] = ridership._leaflet_id;
}

loadRidershipData();

function updateRidership() {
  updatedRidershipArray = [];

  var checkedLayers = $("input:checkbox[class=ridershipCheckboxes]:checked");

  function queryStreetArray(streetType, currentQueryArray){
    if (streetType == "Ridership") {
      var queriedArray = [];
      var lowValue = $('#ridershipSlider').slider("values")[0];
      var highValue = $('#ridershipSlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentRidership = feature.properties.ridership;

        if (currentRidership >= lowValue && currentRidership <= highValue) {
          queriedArray.push(feature);
        }
      }
    }

    return queriedArray;
  }

  if (checkedLayers.length > 0) {
    updatedRidershipArray = queryStreetArray(checkedLayers[0].name, ridershipArray);
  }

  ridership = L.geoJson(updatedRidershipArray, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, ridershipStyle(feature))
    },
    interactive: false
  });

  if (overlaysIDs[overlayOrder.indexOf("Ridership")] != -1) {
    overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Ridership")]);
    overlaysIDs[overlayOrder.indexOf("Ridership")] = -1;
  }

  overlays.addLayer(ridership).addTo(map);
  overlaysIDs[overlayOrder.indexOf("Ridership")] = ridership._leaflet_id;
}

$('input[class=ridershipCheckboxes]').change(function(){
  updateRidership();
});

///////////////////////////////// CENSUS

function censusStyle(feature) {
  var colorGradient = ["#FFFFFF", "#F2F5F9", "#E5ECF3", "#D8E2ED", "#CBD9E7", "#BECFE1", "#B1C6DB", "#A4BDD5", "#97B3CF", "#8AAAC9", "#7DA0C3", "#7097BD", "#638DB7", "#5684B1", "#497BAB", "#3C71A5", "#2F689F", "#225E99", "#155593", "#084C8D"];

  var percentileIndex = Math.floor((parseFloat(popDensityArray.indexOf(parseFloat(feature.properties.pop_densit.toFixed(1))) / popDensityArray.length)) * colorGradient.length);
  var fillColorVariable = colorGradient[percentileIndex];

  return {
    fillColor: fillColorVariable,
    color: '#fff',
    weight: 0,
    opacity: 1,
    fillOpacity: 0.5
  }
}

function loadCensusData() {
  var censusFile = 'json/census.json';
  var currentPopDensityArray = [];

  censusArray = [];
    $.ajax({
      url: censusFile,
      dataType: 'json',
      async: false,
      success: function(data) {
        for (var i = 0; i < data.features.length; i++) {
          var feature = data.features[i];
          censusArray.push(feature);
          currentPopDensityArray.push(feature.properties.pop_densit);
        }
      }
  });

  currentPopDensityArray.sort(sortNumber);
  popDensityArray = currentPopDensityArray.map(function(x) { return parseFloat((x).toFixed(1)); });

  $( function() {
   $( "#densitySlider" ).slider({
     range: true,
     min: popDensityArray[0],
     max: popDensityArray[popDensityArray.length - 1],
     values: [ popDensityArray[0], popDensityArray[popDensityArray.length - 1] ],
     step: 0.01,
     slide: function( event, ui ) {
       $( "#densityAmount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] + " people/acre");
     },
     change: function (event, ui) {
       updateCensus();
     }
   });
  $( "#densityAmount" ).val( $( "#densitySlider" ).slider( "values", 0 ) +
    " - " + $( "#densitySlider" ).slider( "values", 1 ) + " people/acre");
  });

  census = L.geoJson(censusArray, {
    style: censusStyle,
    interactive: false
    // onEachFeature: createCensusPopup
  });

  if (overlaysIDs[overlayOrder.indexOf("Density")] != -1) {
    overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Density")]);
    overlaysIDs[overlayOrder.indexOf("Density")] = -1;
  }

  overlays.addLayer(census).addTo(map);
  overlaysIDs[overlayOrder.indexOf("Density")] = census._leaflet_id;

  updatedCensusArray = censusArray;

  census.bringToBack();
}

loadCensusData();

function updateCensus() {
  updatedCensusArray = [];

  var checkedLayers = $("input:checkbox[class=censusCheckboxes]:checked");

  function queryCensusArray(censusType, currentQueryArray){
    if (censusType == "Density") {
      var queriedArray = [];
      var lowValue = $('#densitySlider').slider("values")[0];
      var highValue = $('#densitySlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentPopDensity = parseFloat(feature.properties.pop_densit).toFixed(1);

        if (currentPopDensity >= lowValue && currentPopDensity <= highValue) {
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
    interactive: false
    // onEachFeature: createCensusPopup
  });

  if (overlaysIDs[overlayOrder.indexOf("Density")] != -1) {
    overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Density")]);
    overlaysIDs[overlayOrder.indexOf("Density")] = -1;
  }

  overlays.addLayer(census).addTo(map);
  overlaysIDs[overlayOrder.indexOf("Density")] = census._leaflet_id;

  census.bringToBack();
}

$('input[class=censusCheckboxes]').change(function(){
  updateCensus();

  var checkedLayers = $("input:checkbox[class=censusCheckboxes]:checked");
  if (checkedLayers.length == 0) {
    if (overlaysIDs[overlayOrder.indexOf("Density")] != -1) {
      overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Density")]);
      overlaysIDs[overlayOrder.indexOf("Density")] = -1;
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

  // heat.setLatLngs(heatArray);
  // heat.addTo(map);
}

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

  heat = L.heatLayer(heatArray, {radius: 6, blur: 11, maxZoom: 12, max: 10});

  if (overlaysIDs[overlayOrder.indexOf("Collisions")] != -1) {
   overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Collisions")]);
   overlaysIDs[overlayOrder.indexOf("Collisions")] = -1;
  }

  overlays.addLayer(heat).addTo(map);
  overlaysIDs[overlayOrder.indexOf("Collisions")] = heat._leaflet_id;
}

$('input[class=modeCheckboxes]').change(function(){
  updateCollisions();
});

$('input[class=severityCheckboxes]').change(function(){
  updateCollisions();
});

$('input[id=collisionsCheckbox]').change(function() {
  if (collisionsArray.length == 0) {
    loadCollisionsData();
  }

  if (document.getElementById('collisionsCheckbox').checked) {
    updateCollisions();
  } else {
    if (overlaysIDs[overlayOrder.indexOf("Collisions")] != -1) {
     overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Collisions")]);
     overlaysIDs[overlayOrder.indexOf("Collisions")] = -1;
    }
  }
});

// map.on('zoomend', function () {
//   if (map.getZoom() > 14) {
//     if (overlaysIDs[overlayOrder.indexOf("Collisions")] != -1) {
//      overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Collisions")]);
//      overlaysIDs[overlayOrder.indexOf("Collisions")] = -1;
//     }
//   }
//   else {
//     if (document.getElementById('collisionsCheckbox').checked) {
//       updateCollisions();
//     }
//   }
// });

///////////////////////////////// ADT

function createAdtPopup(feature, layer) {
  var popupContent = '<span style="font-weight: 800;">Street Name: </span>' + feature.properties.ADDR_ST_NA + '<br>' +
                     '<span style="font-weight: 800;">ADT (highest from 2009 - 2017): </span>' + feature.properties.ADT_COMBN.toFixed(1) + '<br>';

  var popup = L.popup({minWidth: 400, autoPan: false}).setContent(popupContent);

  layer.bindPopup(popup);

  layer.on('click', function(e) {
      this.setStyle({weight: 5});
      this.bringToFront();
      this.openPopup();
  });

  layer.on('popupclose', function(e) {
      this.setStyle({weight: 2});
  });
}

function adtStyle(feature) {
  return {
    weight: 0.5,
    color: "#000",
    opacity: 0.5
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
        adtValuesArray.push(parseFloat(feature.properties.ADT_COMBN.toFixed(1)));
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
     step: 0.01,
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

   adt = L.geoJson(updatedAdtArray, {
     style: adtStyle,
     interactive: false
     // onEachFeature: createAdtPopup
   });

  if (overlaysIDs[overlayOrder.indexOf("ADT")] != -1) {
   overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("ADT")]);
   overlaysIDs[overlayOrder.indexOf("ADT")] = -1;
  }

  overlays.addLayer(adt).addTo(map);
  overlaysIDs[overlayOrder.indexOf("ADT")] = adt._leaflet_id;
}

// loadAdtData();

function updateADT() {
  updatedAdtArray = [];

  var checkedLayers = $("input:checkbox[class=adtCheckboxes]:checked");

  function queryStreetArray(streetType, currentQueryArray){
    if (streetType == "ADT") {
      var queriedArray = [];
      var lowValue = $('#adtSlider').slider("values")[0];
      var highValue = $('#adtSlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentADT = parseFloat(feature.properties.ADT_COMBN.toFixed(1));

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

  adt = L.geoJson(updatedAdtArray, {
    style: adtStyle,
    interactive: false
  });

 if (overlaysIDs[overlayOrder.indexOf("ADT")] != -1) {
  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("ADT")]);
  overlaysIDs[overlayOrder.indexOf("ADT")] = -1;
 }

 overlays.addLayer(adt).addTo(map);
 overlaysIDs[overlayOrder.indexOf("ADT")] = adt._leaflet_id;
}

$('input[class=adtCheckboxes]').change(function(){
  if (adtArray.length == 0) {
    loadAdtData();
  }

  updateADT();

  var checkedLayers = $("input:checkbox[class=adtCheckboxes]:checked");
  if (checkedLayers.length == 0) {
    if (overlaysIDs[overlayOrder.indexOf("ADT")] != -1) {
      overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("ADT")]);
      overlaysIDs[overlayOrder.indexOf("ADT")] = -1;
    }
  }
});

///////////////////////////////// PCI

function pciStyle(feature) {
  return {
    weight: 0.5,
    color: "#000",
    opacity: 0.5
  }
};

function loadPciData() {
  var pciFile = 'json/pci.json';

  pciArray = [];
  pciValuesArray = [];
  $.ajax({
    url: pciFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        pciArray.push(feature);
        pciValuesArray.push(parseInt(feature.properties.PCI));
      }
    }
  });

  pciValuesArray.sort(sortNumber);

  $( function() {
   $( "#pciSlider" ).slider({
     range: true,
     min: pciValuesArray[0],
     max: pciValuesArray[pciValuesArray.length - 1],
     values: [ pciValuesArray[0], pciValuesArray[pciValuesArray.length - 1] ],
     step: 1,
     slide: function( event, ui ) {
       $( "#pciAmount" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ]);
     },
     change: function (event, ui) {
       updatePci();
     }
   });
    $( "#pciAmount" ).val($("#pciSlider" ).slider( "values", 0 ) + " - " + $( "#pciSlider" ).slider( "values", 1 ));
  });
   updatedPciArray = pciArray;

   // pci = L.geoJson(updatedPciArray, {
   //   style: pciStyle,
   //   interactive: false
   // });

  // if (overlaysIDs[overlayOrder.indexOf("PCI")] != -1) {
  //  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("PCI")]);
  //  overlaysIDs[overlayOrder.indexOf("PCI")] = -1;
  // }
  //
  // overlays.addLayer(pci).addTo(map);
  // overlaysIDs[overlayOrder.indexOf("PCI")] = pci._leaflet_id;
}

// loadPciData();

function updatePci() {
  updatedPciArray = [];

  var checkedLayers = $("input:checkbox[class=pciCheckboxes]:checked");

  function queryStreetArray(streetType, currentQueryArray){
    if (streetType == "PCI") {
      var queriedArray = [];
      var lowValue = $('#pciSlider').slider("values")[0];
      var highValue = $('#pciSlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentPCI = parseInt(feature.properties.PCI);

        if (currentPCI >= lowValue && currentPCI <= highValue) {
          queriedArray.push(feature);
        }
      }
    }

    return queriedArray;
  }

  if (checkedLayers.length > 0) {
    updatedPciArray = queryStreetArray(checkedLayers[0].name, pciArray);
  }

  pci = L.geoJson(updatedPciArray, {
    style: pciStyle,
    interactive: false
  });

 if (overlaysIDs[overlayOrder.indexOf("PCI")] != -1) {
  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("PCI")]);
  overlaysIDs[overlayOrder.indexOf("PCI")] = -1;
 }

 overlays.addLayer(pci).addTo(map);
 overlaysIDs[overlayOrder.indexOf("PCI")] = pci._leaflet_id;
}

$('input[class=pciCheckboxes]').change(function(){
  if (pciArray.length == 0) {
    loadPciData();
  }

  updatePci();

  var checkedLayers = $("input:checkbox[class=pciCheckboxes]:checked");
  if (checkedLayers.length == 0) {
    if (overlaysIDs[overlayOrder.indexOf("PCI")] != -1) {
      overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("PCI")]);
      overlaysIDs[overlayOrder.indexOf("PCI")] = -1;
    }
  }
});

///////////////////////////////// CRITICAL SPEED

function speedStyle(feature) {
  return {
    weight: 0.5,
    color: "#000",
    opacity: 0.5
  }
};

function loadSpeedData() {
  var speedFile = 'json/speed_limit.json';

  speedArray = [];
  speedValuesArray = []
  $.ajax({
    url: speedFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        speedArray.push(feature);
        speedValuesArray.push(parseInt(feature.properties.SP_ZONE));
      }
    }
  });

  speedValuesArray.sort(sortNumber);

  $( function() {
   $( "#speedSlider" ).slider({
     range: true,
     min: speedValuesArray[0],
     max: speedValuesArray[speedValuesArray.length - 1],
     values: [ speedValuesArray[0], speedValuesArray[speedValuesArray.length - 1] ],
     step: 5,
     slide: function( event, ui ) {
       $( "#speedAmount" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ]);
     },
     change: function (event, ui) {
       updateSpeed();
     }
   });
    $( "#speedAmount" ).val($("#speedSlider" ).slider( "values", 0 ) + " - " + $( "#speedSlider" ).slider( "values", 1 ));
  });
   updatedSpeedArray = speedArray;

   speed = L.geoJson(updatedSpeedArray, {
     style: speedStyle,
     interactive: false
   });

  // if (overlaysIDs[overlayOrder.indexOf("Speed")] != -1) {
  //  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Speed")]);
  //  overlaysIDs[overlayOrder.indexOf("Speed")] = -1;
  // }
  //
  // overlays.addLayer(speed).addTo(map);
  // overlaysIDs[overlayOrder.indexOf("Speed")] = speed._leaflet_id;
}

// loadSpeedData();

function updateSpeed() {
  updatedSpeedArray = [];

  var checkedLayers = $("input:checkbox[class=speedCheckboxes]:checked");

  function queryStreetArray(streetType, currentQueryArray){
    if (streetType == "Speed") {
      var queriedArray = [];
      var lowValue = $('#speedSlider').slider("values")[0];
      var highValue = $('#speedSlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentSpeed = parseInt(feature.properties.SP_ZONE);

        if (currentSpeed >= lowValue && currentSpeed <= highValue) {
          queriedArray.push(feature);
        }
      }
    }

    return queriedArray;
  }

  if (checkedLayers.length > 0) {
    updatedSpeedArray = queryStreetArray(checkedLayers[0].name, speedArray);
  }

  speed = L.geoJson(updatedSpeedArray, {
    style: speedStyle,
    interactive: false
  });

 if (overlaysIDs[overlayOrder.indexOf("Speed")] != -1) {
  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Speed")]);
  overlaysIDs[overlayOrder.indexOf("Speed")] = -1;
 }

 overlays.addLayer(speed).addTo(map);
 overlaysIDs[overlayOrder.indexOf("Speed")] = speed._leaflet_id;
}

$('input[class=speedCheckboxes]').change(function(){
  if (speedArray.length == 0) {
    loadSpeedData();
  }

  updateSpeed();

  var checkedLayers = $("input:checkbox[class=speedCheckboxes]:checked");
  if (checkedLayers.length == 0) {
    if (overlaysIDs[overlayOrder.indexOf("Speed")] != -1) {
      overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Speed")]);
      overlaysIDs[overlayOrder.indexOf("Speed")] = -1;
    }
  }
});

///////////////////////////////// BIKE ROUTES

function bikeStyle(feature) {
  return {
    weight: 0.5,
    color: "#000",
    opacity: 0.5
  }
};

function loadBikeData() {
  var bikeFile = 'json/bike_routes.json';

  bikeArray = [];
  bikeValuesArray = [];
  $.ajax({
    url: bikeFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        bikeArray.push(feature);
        if ($.inArray(feature.properties.CLASS, bikeValuesArray) == -1) {
          bikeValuesArray.push(parseInt(feature.properties.CLASS));
        }
      }
    }
  });

  bikeValuesArray.sort();

  updatedBikeArray = bikeArray;

  bike = L.geoJson(updatedBikeArray, {
    style: bikeStyle,
    interactive: false
  });

  if (overlaysIDs[overlayOrder.indexOf("Bike Routes")] != -1) {
   overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Bike Routes")]);
   overlaysIDs[overlayOrder.indexOf("Bike Routes")] = -1;
  }

  overlays.addLayer(bike).addTo(map);
  overlaysIDs[overlayOrder.indexOf("Bike Routes")] = bike._leaflet_id;
}

loadBikeData();

function updateBike() {
  updatedBikeArray = [];

  var checkedModes = $("input:checkbox[class=routesCheckboxes]:checked");
  var selectedModes = [];

  var subcategoriesDict = {"Blvd": "Bike Boulevard", "Lane": "Bike Lane", "Route": "Bike Route", "Enhanced": "Bike Route - Enhanced"};

  for (var m = 0; m < checkedModes.length; m++) {
    selectedModes.push(subcategoriesDict[checkedModes[m].name]);
  }

  for (var i = 0; i < bikeArray.length; i++){
    var currentClass = bikeArray[i].properties.CLASS;

    if ($.inArray(currentClass, selectedModes) > -1) {
      updatedBikeArray.push(bikeArray[i]);
    }
  }

  bike = L.geoJson(updatedBikeArray, {
    style: bikeStyle,
    interactive: false
  });

 if (overlaysIDs[overlayOrder.indexOf("Bike Routes")] != -1) {
  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Bike Routes")]);
  overlaysIDs[overlayOrder.indexOf("Bike Routes")] = -1;
 }

 overlays.addLayer(bike).addTo(map);
 overlaysIDs[overlayOrder.indexOf("Bike Routes")] = bike._leaflet_id;
}

$('input[class=bikeRouteCheckboxes]').change(function(){
  updateBike();

  var checkedLayers = $("input:checkbox[class=bikeRouteCheckboxes]:checked");
  if (checkedLayers.length == 0) {
    if (overlaysIDs[overlayOrder.indexOf("Bike Routes")] != -1) {
      overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Bike Routes")]);
      overlaysIDs[overlayOrder.indexOf("Bike Routes")] = -1;
    }
  }
});

///////////////////////////////// CROSSWALKS

function crosswalkStyle(feature) {
  return {
    weight: 1,
    color: "#91ff42",
    opacity: 1
  }
};

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

  crosswalk = L.geoJson(crosswalkArray, {
    style: crosswalkStyle,
    interactive: false
  });

 if (overlaysIDs[overlayOrder.indexOf("Crosswalks")] != -1) {
  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Crosswalks")]);
  overlaysIDs[overlayOrder.indexOf("Crosswalks")] = -1;
 }

 overlays.addLayer(crosswalk).addTo(map);
 overlaysIDs[overlayOrder.indexOf("Crosswalks")] = crosswalk._leaflet_id;
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

  crosswalk = L.geoJson(updatedCrosswalkArray, {
    style: crosswalkStyle,
    interactive: false
  });

 if (overlaysIDs[overlayOrder.indexOf("Crosswalks")] != -1) {
  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Crosswalks")]);
  overlaysIDs[overlayOrder.indexOf("Crosswalks")] = -1;
 }

 overlays.addLayer(crosswalk).addTo(map);
 overlaysIDs[overlayOrder.indexOf("Crosswalks")] = crosswalk._leaflet_id;
}

$('input[id=crosswalkCheckbox]').change(function() {
  if (document.getElementById('crosswalkCheckbox').checked) {
    updateCrosswalk();
  } else {
    if (overlaysIDs[overlayOrder.indexOf("Crosswalks")] != -1) {
     overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Crosswalks")]);
     overlaysIDs[overlayOrder.indexOf("Crosswalks")] = -1;
    }
  }
});

$('input[class=crosswalkCheckboxes]').change(function(){
  updateCrosswalk();

  var checkedLayers = $("input:checkbox[class=crosswalkCheckboxes]:checked");
  if (checkedLayers.length == 0) {
    if (overlaysIDs[overlayOrder.indexOf("Crosswalks")] != -1) {
      overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Crosswalks")]);
      overlaysIDs[overlayOrder.indexOf("Crosswalks")] = -1;
    }
  }
});

///////////////////////////////// SIGNALS

function signalsStyle(feature) {
  return {
    radius: 2,
    weight: 1,
    color: "#91ff42",
    opacity: 1
  }
};

function loadSignalsData(){

  var signalsFile = 'json/signals.json';
  $.ajax({
    url: signalsFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        signalsArray.push(feature);
      }
    }
  });

  updatedSignalsArray = signalsArray;

  signals = L.geoJson(signalsArray, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, signalsStyle(feature))
    },
    interactive: false
  });

 if (overlaysIDs[overlayOrder.indexOf("Signals")] != -1) {
  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Signals")]);
  overlaysIDs[overlayOrder.indexOf("Signals")] = -1;
 }

 overlays.addLayer(signals).addTo(map);
 overlaysIDs[overlayOrder.indexOf("Signals")] = signals._leaflet_id;
}

loadSignalsData();

function updateSignals() {
  updatedSignalsArray = [];

  var checkedModes = $("input:checkbox[class=signalsCheckboxes]:checked");
  var selectedModes = [];

  // 'Brick' 'Decorative' 'Ladder - White' 'Ladder - Yellow' 'Standard - White' 'Standard - Yellow'
  // var subcategoriesDict = {"Ladder": ["Ladder - White", "Ladder - Yellow"], "Standard": ["Standard - White", "Standard - Yellow"]};

  for (var m = 0; m < checkedModes.length; m++) {
    selectedModes.push(checkedModes[m].name);
  }

  for (var i = 0; i < signalsArray.length; i++){
    if ($.inArray(signalsArray[i].properties.TYPE, selectedModes) > -1) {
      updatedSignalsArray.push(signalsArray[i]);
    }
  }

  signals = L.geoJson(updatedSignalsArray, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, signalsStyle(feature))
    },
    interactive: false
  });

 if (overlaysIDs[overlayOrder.indexOf("Signals")] != -1) {
  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Signals")]);
  overlaysIDs[overlayOrder.indexOf("Signals")] = -1;
 }

 overlays.addLayer(signals).addTo(map);
 overlaysIDs[overlayOrder.indexOf("Signals")] = signals._leaflet_id;
}

$('input[id=signalCheckbox]').change(function() {
  if (document.getElementById('signalCheckbox').checked) {
    updateSignals();
  } else {
    if (overlaysIDs[overlayOrder.indexOf("Signals")] != -1) {
     overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Signals")]);
     overlaysIDs[overlayOrder.indexOf("Signals")] = -1;
    }
  }
});

$('input[class=signalsCheckboxes]').change(function(){
  updateSignals();

  var checkedLayers = $("input:checkbox[class=signalsCheckboxes]:checked");
  if (checkedLayers.length == 0) {
    if (overlaysIDs[overlayOrder.indexOf("Signals")] != -1) {
      overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Signals")]);
      overlaysIDs[overlayOrder.indexOf("Signals")] = -1;
    }
  }
});

///////////////////////////////// TRANSIT

function transitStyle(feature) {
  return {
    radius: 3,
    weight: 1,
    color: "purple",
    opacity: 0.5
  }
};

function loadTransitData(){

  var transitFile = 'json/transit.json';
  $.ajax({
    url: transitFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        transitArray.push(feature);
      }
    }
  });

  updatedTransitArray = transitArray;

  transit = L.geoJson(transitArray, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, transitStyle(feature))
    },
    interactive: false
  });

 if (overlaysIDs[overlayOrder.indexOf("Transit")] != -1) {
  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Transit")]);
  overlaysIDs[overlayOrder.indexOf("Transit")] = -1;
 }

 overlays.addLayer(transit).addTo(map);
 overlaysIDs[overlayOrder.indexOf("Transit")] = transit._leaflet_id;
}

loadTransitData();

function updateTransit() {
  updatedTransitArray = [];

  var checkedModes = $("input:checkbox[class=transitCheckboxes]:checked");
  var selectedModes = [];

  for (var m = 0; m < checkedModes.length; m++) {
    selectedModes.push(checkedModes[m].name);
  }

  for (var i = 0; i < transitArray.length; i++){
    if ($.inArray(transitArray[i].properties.CS_TRANSIT, selectedModes) > -1) {
      updatedTransitArray.push(transitArray[i]);
    }
  }

  transit = L.geoJson(updatedTransitArray, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, transitStyle(feature))
    },
    interactive: false
  });

 if (overlaysIDs[overlayOrder.indexOf("Transit")] != -1) {
  overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Transit")]);
  overlaysIDs[overlayOrder.indexOf("Transit")] = -1;
 }

 overlays.addLayer(transit).addTo(map);
 overlaysIDs[overlayOrder.indexOf("Transit")] = transit._leaflet_id;
}

$('input[id=transitCheckbox]').change(function() {
  if (document.getElementById('transitCheckbox').checked) {
    updateTransit();
  } else {
    if (overlaysIDs[overlayOrder.indexOf("Transit")] != -1) {
     overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Transit")]);
     overlaysIDs[overlayOrder.indexOf("Transit")] = -1;
    }
  }
});

$('input[class=transitCheckboxes]').change(function(){
  updateTransit();

  var checkedLayers = $("input:checkbox[class=transitCheckboxes]:checked");
  if (checkedLayers.length == 0) {
    if (overlaysIDs[overlayOrder.indexOf("Transit")] != -1) {
      overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Transit")]);
      overlaysIDs[overlayOrder.indexOf("Transit")] = -1;
    }
  }
});

///////////////////////////////// SCHOOL

function schoolStyle(feature) {
  return {
    weight: 0.5,
    color: "#000",
    opacity: 0.5
  }
};

function loadSchoolData(){

  var schoolFile = 'json/school.json';
  $.ajax({
    url: schoolFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        schoolRoutesArray.push(turf.lineString(feature.geometry.coordinates));
      }
    }
  });

  updatedSchoolRoutesArray = schoolRoutesArray;

  var schoolSliderValues = [0, 0.125, 0.25];

  $( function() {
   $( "#schoolSlider" ).slider({
     value: schoolSliderValues[1],
     min: schoolSliderValues[0],
     max: schoolSliderValues[schoolSliderValues.length - 1],
     step: 0.125,
     slide: function( event, ui ) {
       $( "#schoolAmount" ).val(ui.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
     },
     change: function (event, ui) {
       updateSchool();
     }
   });
    $( "#schoolAmount" ).val($("#schoolSlider" ).slider("value").toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  });

  var buffered = turf.buffer(turf.featureCollection(schoolRoutesArray), schoolSliderValues[schoolSliderValues.length - 1], {units: 'miles'});
  var dissolved = turf.dissolve(buffered)

  // schoolRoutes = L.geoJson(dissolved, {
  //     style: schoolStyle
  //   });
  //
  // if (overlaysIDs[overlayOrder.indexOf("School")] != -1) {
  // overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("School")]);
  // overlaysIDs[overlayOrder.indexOf("School")] = -1;
  // }
  //
  // overlays.addLayer(schoolRoutes).addTo(map);
  // overlaysIDs[overlayOrder.indexOf("School")] = schoolRoutes._leaflet_id;
  //
  // schoolRoutes.bringToBack();
}

// loadSchoolData();

function updateSchool() {

  var currentBufferDistance = $("#schoolSlider").slider("value");

  if (currentBufferDistance > 0) {
    var buffered = turf.buffer(turf.featureCollection(schoolRoutesArray), $("#schoolSlider").slider("value"), {units: 'miles'});
    var dissolved = turf.dissolve(buffered)
  } else {
    var dissolved = schoolRoutesArray;
  }

  schoolRoutes = L.geoJson(dissolved, {
      style: schoolStyle,
      interactive: false
    });

  if (overlaysIDs[overlayOrder.indexOf("School")] != -1) {
    overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("School")]);
    overlaysIDs[overlayOrder.indexOf("School")] = -1;
  }

  overlays.addLayer(schoolRoutes).addTo(map);
  overlaysIDs[overlayOrder.indexOf("School")] = schoolRoutes._leaflet_id;

  schoolRoutes.bringToBack();
}

$('input[id=schoolCheckbox]').change(function() {
  if (document.getElementById('schoolCheckbox').checked) {
    if (schoolRoutesArray.length == 0) {
      loadSchoolData();
    }

    updateSchool();
  } else {
    if (overlaysIDs[overlayOrder.indexOf("School")] != -1) {
     overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("School")]);
     overlaysIDs[overlayOrder.indexOf("School")] = -1;
    }
  }
});

///////////////////////////////// HEX GRID

function createHexPopup(feature, layer) {
  layer.showDelay = 800; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed("Click to view details.");

  layer.on('mouseover', function(e) {
    this.setStyle({opacity: 1});
  });

  layer.on('mouseout', function(e) {
    this.setStyle({opacity: 0});
  });

  layer.on('click', function(e) {
    turfLayer.setStyle({fillOpacity: 0});

    var popupContent = '';

    var hexCoords = [];
    for (var k = 0; k < this._latlngs[0].length; k++) {
      hexCoords.push([this._latlngs[0][k].lng, this._latlngs[0][k].lat]);
    }

    hexCoords.push([this._latlngs[0][0].lng, this._latlngs[0][0].lat])

    var currentHex = turf.polygon([hexCoords]);

    for (var i = 0; i < overlaysIDs.length - 2; i++) {
      if (overlaysIDs[i] != -1 && overlayOrder[i] != "Collisions") {
        var currentLayer = overlays._layers[overlaysIDs[i]];
        var currentLayerFeaturesKeys = Object.keys(currentLayer._layers);

        popupContent += ('<span style="font-weight: 800;">' + overlayOrder[i] + "</span>: ");

        var currentAttributes = [];

        for (var j = 0; j < currentLayerFeaturesKeys.length; j++) {
          var currentFeature = currentLayer._layers[currentLayerFeaturesKeys[j]].feature;
          var currentTurfFeature;

          if (currentFeature.geometry.type == "Point") {
            currentTurfFeature = turf.point(currentFeature.geometry.coordinates);
            var currentIntersect = turf.intersect(currentHex, currentTurfFeature);
          } else if (currentFeature.geometry.type == "LineString") {
            currentTurfFeature = turf.lineString(currentFeature.geometry.coordinates);
            var currentIntersect = turf.lineIntersect(currentHex, currentTurfFeature);

            if (currentIntersect.features.length == 0) {
              currentIntersect = null;
            }

          } else if (currentFeature.geometry.type == "Polygon") {
            currentTurfFeature = turf.polygon(currentFeature.geometry.coordinates);
            var currentIntersect = turf.intersect(currentHex, currentTurfFeature);
          }

          if (currentIntersect != null) {
            var currentAttribute = currentFeature.properties[overlayFieldNames[i]];

            if ($.inArray(currentAttribute, currentAttributes) == -1) {
              currentAttributes.push(currentAttribute);
            }
          }
        }

        currentAttributes.sort();

        if (currentAttributes.length > 0) {
          if ($.inArray(overlayOrder[i], ["ADT", "Density", "PCI", "Ridership"]) == -1) {
            popupContent += (currentAttributes.join(", ") + "<br>");
          } else {
            popupContent += (Math.round(currentAttributes[currentAttributes.length - 1]).toString() + "<br>");
          }
        } else {
          popupContent += "None<br>";
        }
      } else if (overlayOrder[i] == "Collisions" && document.getElementById('collisionsCheckbox').checked) { //collisions

        var collisionModes = {};
        var collisionSeverity = {};

        for (var j = 0; j < updatedCollisionsArray.length; j++) {
          var currentFeature = updatedCollisionsArray[j];
          var currentTurfFeature;

          currentTurfFeature = turf.point(currentFeature.geometry.coordinates);
          var currentIntersect = turf.intersect(currentHex, currentTurfFeature);

          if (currentIntersect != null) {
            var currentInjury = currentFeature.properties.Injury;

            if (!(currentInjury in collisionSeverity)) {
              collisionSeverity[currentInjury] = 0;
            }

            collisionSeverity[currentInjury] += 1;

            var currentMode = currentFeature.properties.InvWith;

            if (!(currentMode in collisionModes)) {
              collisionModes[currentMode] = 0;
            }

            collisionModes[currentMode] += 1;
          }
        }

        popupContent += ('<span style="font-weight: 800;">Collisions Modes</span>: ');

        var collisionKeys = Object.keys(collisionModes);
        collisionKeys.sort()

        var collisionsTempArray = [];
        for (var k = 0; k < collisionKeys.length; k++) {
          var currentCount = collisionModes[collisionKeys[k]];
          collisionsTempArray.push(collisionKeys[k] + ": " + currentCount.toString());
        }

        popupContent += (collisionsTempArray.join(", ") + "<br>");

        popupContent += ('<span style="font-weight: 800;">Collisions Severity</span>: ');

        var collisionKeys = Object.keys(collisionSeverity);
        collisionKeys.sort()

        var collisionsTempArray = [];
        for (var k = 0; k < collisionKeys.length; k++) {
          var currentCount = collisionSeverity[collisionKeys[k]];
          collisionsTempArray.push(collisionKeys[k] + ": " + currentCount.toString());
        }

        popupContent += (collisionsTempArray.join(", ") + "<br>");
      }
    }

    var popup = L.popup({autoPan: false}).setContent(popupContent);
    layer.bindPopup(popup);
    this.setStyle({fillOpacity: 0.5});
    this.bringToFront();
    this.openPopup();
  });

  layer.on('popupclose', function(e) {
    turfLayer.setStyle({fillOpacity: 0});
  });
}

function hexStyle(feature) {
  return {
    weight: 2,
    color: "#000",
    opacity: 0,
    fillOpacity: 0
  }
};

function createHexGrid() {
  var currentMapBounds = map.getBounds();

  var bbox = [-118.203535, 34.116334, -118.058659, 34.253170];
  var cellSide = 500;
  var options = {units: 'feet'};

  var hexagonalGrid = turf.hexGrid(bbox, cellSide, options);

  turfLayer = L.geoJson(hexagonalGrid, {
    style: hexStyle,
    onEachFeature: createHexPopup
  });

  if (overlaysIDs[overlayOrder.indexOf("Hex Grid")] != -1) {
    overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Hex Grid")]);
    overlaysIDs[overlayOrder.indexOf("Hex Grid")] = -1;
  }

  overlays.addLayer(turfLayer).addTo(map);
  overlaysIDs[overlayOrder.indexOf("Hex Grid")] = turfLayer._leaflet_id;
}

createHexGrid();

///////////////////////////////// DRAG AND DROP

function createDesktopHexPopup(feature, layer) {
  layer.showDelay = 800; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed("Click to view details.");

  layer.on('mouseover', function(e) {
    this.setStyle({opacity: 1});
  });

  layer.on('mouseout', function(e) {
    this.setStyle({opacity: 0.5});
  });

  layer.on('click', function(e) {
    turfLayer.setStyle({weight: 0});

    var popupContent = '<span style="font-weight: 800;">Overall Score</span>: ' + feature.properties.FINAL_SCOR.toFixed(1) + '<br>';

    var hexCoords = [];
    for (var k = 0; k < this._latlngs[0].length; k++) {
      hexCoords.push([this._latlngs[0][k].lng, this._latlngs[0][k].lat]);
    }

    hexCoords.push([this._latlngs[0][0].lng, this._latlngs[0][0].lat])

    var currentHex = turf.polygon([hexCoords]);

    for (var i = 0; i < overlaysIDs.length - 2; i++) {
      if (overlaysIDs[i] != -1 && overlayOrder[i] != "Collisions") {
        var currentLayer = overlays._layers[overlaysIDs[i]];
        var currentLayerFeaturesKeys = Object.keys(currentLayer._layers);

        popupContent += ('<span style="font-weight: 800;">' + overlayOrder[i] + "</span>: ");

        var currentAttributes = [];

        for (var j = 0; j < currentLayerFeaturesKeys.length; j++) {
          var currentFeature = currentLayer._layers[currentLayerFeaturesKeys[j]].feature;
          var currentTurfFeature;

          if (currentFeature.geometry.type == "Point") {
            currentTurfFeature = turf.point(currentFeature.geometry.coordinates);
            var currentIntersect = turf.intersect(currentHex, currentTurfFeature);
          } else if (currentFeature.geometry.type == "LineString") {
            currentTurfFeature = turf.lineString(currentFeature.geometry.coordinates);
            var currentIntersect = turf.lineIntersect(currentHex, currentTurfFeature);

            if (currentIntersect.features.length == 0) {
              currentIntersect = null;
            }

          } else if (currentFeature.geometry.type == "Polygon") {
            currentTurfFeature = turf.polygon(currentFeature.geometry.coordinates);
            var currentIntersect = turf.intersect(currentHex, currentTurfFeature);
          }

          if (currentIntersect != null) {
            var currentAttribute = currentFeature.properties[overlayFieldNames[i]];

            if ($.inArray(currentAttribute, currentAttributes) == -1) {
              currentAttributes.push(currentAttribute);
            }
          }
        }

        currentAttributes.sort();

        if (currentAttributes.length > 0) {
          if ($.inArray(overlayOrder[i], ["ADT", "Density", "PCI", "Ridership"]) == -1) {
            popupContent += (currentAttributes.join(", ") + "<br>");
          } else {
            popupContent += (Math.round(currentAttributes[currentAttributes.length - 1]).toString() + "<br>");
          }
        } else {
          popupContent += "None<br>";
        }
      } else if (overlayOrder[i] == "Collisions" && document.getElementById('collisionsCheckbox').checked) { //collisions

        var collisionModes = {};
        var collisionSeverity = {};

        for (var j = 0; j < updatedCollisionsArray.length; j++) {
          var currentFeature = updatedCollisionsArray[j];
          var currentTurfFeature;

          currentTurfFeature = turf.point(currentFeature.geometry.coordinates);
          var currentIntersect = turf.intersect(currentHex, currentTurfFeature);

          if (currentIntersect != null) {
            var currentInjury = currentFeature.properties.Injury;

            if (!(currentInjury in collisionSeverity)) {
              collisionSeverity[currentInjury] = 0;
            }

            collisionSeverity[currentInjury] += 1;

            var currentMode = currentFeature.properties.InvWith;

            if (!(currentMode in collisionModes)) {
              collisionModes[currentMode] = 0;
            }

            collisionModes[currentMode] += 1;
          }
        }

        popupContent += ('<span style="font-weight: 800;">Collisions Modes</span>: ');

        var collisionKeys = Object.keys(collisionModes);
        collisionKeys.sort()

        var collisionsTempArray = [];
        for (var k = 0; k < collisionKeys.length; k++) {
          var currentCount = collisionModes[collisionKeys[k]];
          collisionsTempArray.push(collisionKeys[k] + ": " + currentCount.toString());
        }

        popupContent += (collisionsTempArray.join(", ") + "<br>");

        popupContent += ('<span style="font-weight: 800;">Collisions Severity</span>: ');

        var collisionKeys = Object.keys(collisionSeverity);
        collisionKeys.sort()

        var collisionsTempArray = [];
        for (var k = 0; k < collisionKeys.length; k++) {
          var currentCount = collisionSeverity[collisionKeys[k]];
          collisionsTempArray.push(collisionKeys[k] + ": " + currentCount.toString());
        }

        popupContent += (collisionsTempArray.join(", ") + "<br>");
      }
    }

    var popup = L.popup({autoPan: false}).setContent(popupContent);
    layer.bindPopup(popup);
    this.setStyle({weight: 2});
    this.bringToFront();
    this.openPopup();
  });

  layer.on('popupclose', function(e) {
    turfLayer.setStyle({weight: 0});
  });
}

function desktopHexStyle(feature) {
  // var colorGradient = ["#f1eef6", "#d7b5d8", "#FFB2B2", "#df65b0", "#dd1c77", "#980043"];
  // var colorGradient = ["#FFCCCC", "#FF9A99", "#FF6866", "#FF3633", "#FF0400"];
  // var colorGradient = ["#FFE5E5", "#FFCCCC", "#FFB2B2", "#FF9999", "#FF7F7F", "#FF6666", "#FF4C4C", "#FF3232", "#FF1919", "#FF0000"];

  // var rainbow = new Rainbow();
  // rainbow.setSpectrum('#d7191c', '#2b83ba');
  // rainbow.setNumberRange(1, 100);

  var colorGradient = ['#d53e4f','#f46d43','#fdae61','#fee08b','#ffffbf','#e6f598','#abdda4','#66c2a5','#3288bd'];

  var scoreIndex = Math.floor((finalScoreArray.indexOf(feature.properties.FINAL_SCOR) / finalScoreArray.length) * 9);
  var currentColor = colorGradient[scoreIndex];

  return {
    weight: 0.5,
    color: "#fff",
    fillColor: currentColor,
    opacity: 0.5,
    fillOpacity: 0.8
  }
};

var drawnItems  = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawPolylineOptions = {
  shapeOptions: {
    color: "cyan",
    fillOpacity: 0.5,
    opacity: 0.5,
    weight: 7
  }
};

var drawPolygonOptions = {
  shapeOptions: {
    color: "cyan",
    fillOpacity: 0.5,
    opacity: 0.5,
    weight: 1
  }
};

function dropHandler(ev) {
  console.log('File(s) dropped');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  var ready = false;
  var result = '';

  var check = function() {
    if (ready === true) {
      turfLayerArray = JSON.parse(result);

      for (var i = 0; i < turfLayerArray.features.length; i++) {
        finalScoreArray.push(turfLayerArray.features[i].properties.FINAL_SCOR);
        // turfPolygonArray.push(turf.polygon([turfLayerArray.features[i].geometry.coordinates[0]]));
      }

      finalScoreArray.sort();

      turfLayer = L.geoJson(turfLayerArray, {
        style: desktopHexStyle,
        onEachFeature: createDesktopHexPopup
      });

      if (overlaysIDs[overlayOrder.indexOf("Hex Grid")] != -1) {
        overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Hex Grid")]);
        overlaysIDs[overlayOrder.indexOf("Hex Grid")] = -1;
      }

      overlays.addLayer(turfLayer).addTo(map);
      overlaysIDs[overlayOrder.indexOf("Hex Grid")] = turfLayer._leaflet_id;

      $( function() {
       $( "#hexSlider" ).slider({
         value: 100,
         min: 0,
         max: 100,
         step: 1,
         slide: function( event, ui ) {
           $( "#hexAmount" ).val(ui.value.toString());
         },
         change: function (event, ui) {
           turfLayer.setStyle({fillOpacity: ui.value / 100.0});
         }
       });
        $( "#hexAmount" ).val($("#hexSlider" ).slider("value").toString());
      });

      return;
    }
    setTimeout(check, 0);
  }

  check();

  var reader = new FileReader();
  reader.onloadend = function(evt) {
  // file is loaded
    result = evt.target.result;

    ready = true;
  };

  reader.readAsText(ev.dataTransfer.files[0]);

  ev.preventDefault();
}

function dragOverHandler(ev) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

$('input[id=hexCheckbox]').change(function() {
  if (document.getElementById('hexCheckbox').checked) {
    if (overlaysIDs[overlayOrder.indexOf("Hex Grid")] != -1) {
      overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Hex Grid")]);
      overlaysIDs[overlayOrder.indexOf("Hex Grid")] = -1;
    }

    overlays.addLayer(turfLayer).addTo(map);
    overlaysIDs[overlayOrder.indexOf("Hex Grid")] = turfLayer._leaflet_id;
  } else {
    if (overlaysIDs[overlayOrder.indexOf("Hex Grid")] != -1) {
     overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Hex Grid")]);
     overlaysIDs[overlayOrder.indexOf("Hex Grid")] = -1;
    }
  }
});

var drawingNumbers = [];

function createDrawingPopup(layerType, shape) {

  var popupContent = '';

  var shapeCoords = [];

  if (layerType == "polygon") {
    for (var k = 0; k < shape.geometry.coordinates[0].length; k++) {
      shapeCoords.push([shape.geometry.coordinates[0][k][0], shape.geometry.coordinates[0][k][1]]);
    }
    currentShape = turf.polygon([shapeCoords]);
  } else if (layerType == "polyline") {
    for (var k = 0; k < shape.geometry.coordinates.length; k++) {
      shapeCoords.push([shape.geometry.coordinates[k][0], shape.geometry.coordinates[k][1]]);
    }
    currentShape = turf.lineString(shapeCoords);
  }

  var currentScoreArray = [];

  if (updatedTurfLayerArray.length > 0) {
    for (var j = 0; j < updatedTurfLayerArray.length; j++) {
      var currentFeature = updatedTurfLayerArray[j];
      var currentTurfFeature;
      var currentIntersect;

      try {
        if (currentFeature.geometry.type == "Polygon") {
          currentTurfFeature = turf.polygon(currentFeature.geometry.coordinates);
        } else if (currentFeature.geometry.type == "MultiPolygon") {
          currentTurfFeature = turf.multiPolygon(currentFeature.geometry.coordinates);
        }

        if (layerType == "polygon") {
          currentIntersect = turf.intersect(currentShape, currentTurfFeature);
        } else if (layerType == "polyline") {
          currentIntersect = turf.lineIntersect(currentShape, currentTurfFeature);
        }

      } catch (error) {
        console.error(currentFeature);
      }

      if (currentIntersect != null) {
        var currentScore = currentFeature.properties.FINAL_SCOR;
        currentScoreArray.push(currentScore);
      }
    }

    currentScoreArray.sort();

    popupContent = '<span style="font-weight: 800;">Hex Grid: </span>' + currentScoreArray[0].toFixed(1) + ' (Min.), ' + currentScoreArray[currentScoreArray.length - 1].toFixed(1) + ' (Max.), ' + average(currentScoreArray).toFixed(1) + ' (Avg.), ' + standardDeviation(currentScoreArray).toFixed(1) + ' (Std. Dev.)<br>' ;
  }

  for (var i = 0; i < overlaysIDs.length - 2; i++) {
    if (overlaysIDs[i] != -1 && overlayOrder[i] != "Collisions") {
      var currentLayer = overlays._layers[overlaysIDs[i]];
      var currentLayerFeaturesKeys = Object.keys(currentLayer._layers);

      popupContent += ('<span style="font-weight: 800;">' + overlayOrder[i] + "</span>: ");

      var currentAttributes = [];

      for (var j = 0; j < currentLayerFeaturesKeys.length; j++) {
        var currentFeature = currentLayer._layers[currentLayerFeaturesKeys[j]].feature;
        var currentTurfFeature;
        var currentIntersect;

        if (currentFeature.geometry.type == "Point") {
          currentTurfFeature = turf.point(currentFeature.geometry.coordinates);
          if (layerType == "polygon") {
            currentIntersect = turf.intersect(currentShape, currentTurfFeature);
          }
          if (layerType == "polyline") {
            currentIntersect = turf.lineIntersect(currentShape, currentTurfFeature);
          }

        } else if (currentFeature.geometry.type == "LineString") {
          currentTurfFeature = turf.lineString(currentFeature.geometry.coordinates);
          currentIntersect = turf.lineIntersect(currentShape, currentTurfFeature);

          if (currentIntersect.features.length == 0) {
            currentIntersect = null;
          }

        } else if (currentFeature.geometry.type == "Polygon") {
          currentTurfFeature = turf.polygon(currentFeature.geometry.coordinates);
          if (layerType == "polyline") {
            currentIntersect = turf.lineIntersect(currentShape, currentTurfFeature);
          }
          if (layerType == "polygon") {
            currentIntersect = turf.intersect(currentShape, currentTurfFeature);
          }
        }

        if (currentIntersect != null) {
          var currentAttribute = currentFeature.properties[overlayFieldNames[i]];

          if ($.inArray(currentAttribute, currentAttributes) == -1) {
            currentAttributes.push(currentAttribute);
          }
        }
      }

      currentAttributes.sort();

      if (currentAttributes.length > 0) {
        if ($.inArray(overlayOrder[i], ["ADT", "Density", "PCI", "Ridership"]) == -1) {
          popupContent += (currentAttributes.join(", ") + "<br>");
        } else {
          popupContent += (Math.round(currentAttributes[currentAttributes.length - 1]).toString() + "<br>");
        }
      } else {
        popupContent += "None<br>";
      }
    } else if (overlayOrder[i] == "Collisions" && document.getElementById('collisionsCheckbox').checked) { //collisions

      var collisionModes = {};
      var collisionSeverity = {};

      for (var j = 0; j < updatedCollisionsArray.length; j++) {
        var currentFeature = updatedCollisionsArray[j];
        var currentTurfFeature;

        currentTurfFeature = turf.point(currentFeature.geometry.coordinates);
        var currentIntersect = turf.intersect(currentShape, currentTurfFeature);

        if (currentIntersect != null) {
          var currentInjury = currentFeature.properties.Injury;

          if (!(currentInjury in collisionSeverity)) {
            collisionSeverity[currentInjury] = 0;
          }

          collisionSeverity[currentInjury] += 1;

          var currentMode = currentFeature.properties.InvWith;

          if (!(currentMode in collisionModes)) {
            collisionModes[currentMode] = 0;
          }

          collisionModes[currentMode] += 1;
        }
      }

      popupContent += ('<span style="font-weight: 800;">Collisions Modes</span>: ');

      var collisionKeys = Object.keys(collisionModes);
      collisionKeys.sort()

      var collisionsTempArray = [];
      for (var k = 0; k < collisionKeys.length; k++) {
        var currentCount = collisionModes[collisionKeys[k]];
        collisionsTempArray.push(collisionKeys[k] + ": " + currentCount.toString());
      }

      popupContent += (collisionsTempArray.join(", ") + "<br>");

      popupContent += ('<span style="font-weight: 800;">Collisions Severity</span>: ');

      var collisionKeys = Object.keys(collisionSeverity);
      collisionKeys.sort()

      var collisionsTempArray = [];
      for (var k = 0; k < collisionKeys.length; k++) {
        var currentCount = collisionSeverity[collisionKeys[k]];
        collisionsTempArray.push(collisionKeys[k] + ": " + currentCount.toString());
      }

      popupContent += (collisionsTempArray.join(", ") + "<br>");
    }
  }

  return popupContent;
}

map.on('draw:created draw:edited', function (e) {
  if (e.type != "draw:edited") {
    var drawLayer = e.layer;
    var inShape = drawLayer.toGeoJSON();
    var inLayerType = e.layerType;
    
    drawingJson.push(inShape);

    drawingNumbers.push(drawLayer._leaflet_id);
    drawnItems.addLayer(drawLayer);

    var centroid = turf.centroid(inShape);
    var popupCoord = L.latLng(centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]);

    var currentPopupContent = createDrawingPopup(inLayerType, inShape);

    var popup = L.popup().setLatLng(popupCoord).setContent(currentPopupContent).openOn(map);

    drawLayer.on('click', function(e) {
      var currentPopupContent = createDrawingPopup(inLayerType, inShape);
      var popup = L.popup().setLatLng(popupCoord).setContent(currentPopupContent).openOn(map);
      this.openPopup();
    });
  }
});

///////////////////////////////// UPLOAD SHAPEFILE

$('#uploadButton').change(function(){
  var ready = false;
  var result = '';
  var current = $('#uploadButton');
  var currentFile = current[0].files[0];

  if (currentFile.type == "application/json") {
    
    var check = function() {
      if (ready === true) {
        uploadedArray = JSON.parse(result);

        uploadedShapefile = L.geoJson(uploadedArray, {
          onEachFeature: function(feature, layer) {
            var currentPopupContent = createDrawingPopup((feature.geometry.type).toLowerCase(), feature);
            layer.on('click', function(e) {
              var popup = L.popup().setLatLng(e.latlng).setContent(currentPopupContent).openOn(map);
              this.openPopup();
            });
          }
        });

        if (overlaysIDs[overlayOrder.indexOf("Uploaded")] != -1) {
          overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Uploaded")]);
          overlaysIDs[overlayOrder.indexOf("Uploaded")] = -1;
         }
        
        overlays.addLayer(uploadedShapefile).addTo(map);
        overlaysIDs[overlayOrder.indexOf("Uploaded")] = uploadedShapefile._leaflet_id;


        return
      }
      setTimeout(check, 0);
    }

    check();

    var reader = new FileReader();
    reader.onloadend = function() {
      // file is loaded
      result = reader.result;
      ready = true;
    };
    reader.readAsText(currentFile);
    
  } else {
    getShapefile();
  }

  function getShapefile() {
    var check = function() {
      if (ready === true){
        
        shp(result).then(function(geojson){
          uploadedArray = geojson.features;
  
          uploadedShapefile = L.geoJson(uploadedArray, {
            onEachFeature: function(feature, layer) {
                if (feature.properties) {
                    layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                        return k + ": " + feature.properties[k];
                    }).join("<br />"), {
                        maxHeight: 200
                    });
                }
            }
          });
        
          if (overlaysIDs[overlayOrder.indexOf("Uploaded")] != -1) {
            overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Uploaded")]);
            overlaysIDs[overlayOrder.indexOf("Uploaded")] = -1;
           }
          
          overlays.addLayer(uploadedShapefile).addTo(map);
          overlaysIDs[overlayOrder.indexOf("Uploaded")] = uploadedShapefile._leaflet_id;
        });
  
        return
      }
  
      setTimeout(check, 0);
    }
  
    check();
  
    var reader = new FileReader();
    reader.onloadend = function() {
      // file is loaded
      result = reader.result;
      ready = true;
    };
    reader.readAsArrayBuffer(currentFile);
  }

  $('#uploadCheckbox').prop('checked', true);
});

$('input[id=uploadCheckbox]').change(function() {
  if (uploadedArray.length == 0) {
    $('#uploadCheckbox').prop('checked', false);
  }

  if (overlaysIDs[overlayOrder.indexOf("Uploaded")] != -1) {
    overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Uploaded")]);
    overlaysIDs[overlayOrder.indexOf("Uploaded")] = -1;
   }

  if (document.getElementById('uploadCheckbox').checked == true) {
    overlays.addLayer(uploadedShapefile).addTo(map);
    overlaysIDs[overlayOrder.indexOf("Uploaded")] = uploadedShapefile._leaflet_id;
  }
});

///////////////////////////////// UPLOAD HEXAGON

function standardDeviation(values){
  var avg = average(values);
  
  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });
  
  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

$('#uploadHex').change(function(){
  var ready = false;
  var result = '';
  var current = $('#uploadHex');
  var currentFile = current[0].files[0];

  var check = function() {
    if (ready === true){
      
      shp(result).then(function(geojson){
        turfLayerArray = geojson.features;

        for (var i = 0; i < turfLayerArray.length; i++) {
          finalScoreArray.push(turfLayerArray[i].properties.FINAL_SCOR);
          // turfPolygonArray.push(turf.polygon([turfLayerArray.features[i].geometry.coordinates[0]]));
        }
  
        finalScoreArray.sort();
  
        turfLayer = L.geoJson(turfLayerArray, {
          style: desktopHexStyle,
          onEachFeature: createDesktopHexPopup
        });
  
        if (overlaysIDs[overlayOrder.indexOf("Hex Grid")] != -1) {
          overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Hex Grid")]);
          overlaysIDs[overlayOrder.indexOf("Hex Grid")] = -1;
        }
  
        overlays.addLayer(turfLayer).addTo(map);
        overlaysIDs[overlayOrder.indexOf("Hex Grid")] = turfLayer._leaflet_id;

        var filteredScore = finalScoreArray.filter(function(a){return !(isNaN(a))});
        filteredScore.sort(sortNumber);
  
        $( function() {
          $( "#hexSlider" ).slider({
            range: true,
            min: filteredScore[0],
            max: filteredScore[filteredScore.length - 1],
            values: [filteredScore[0], filteredScore[filteredScore.length - 1]],
            step: 1,
            slide: function( event, ui ) {
              $( "#hexAmount" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ]);
            },
            change: function(event, ui) {
              updateHex();
            }
          });
          $( "#hexAmount" ).val($("#hexSlider" ).slider( "values", 0 ) + " - " + $( "#hexSlider" ).slider( "values", 1 ));
         });

         $('#hexStats').html('Average: ' + average(finalScoreArray).toFixed(1) + ', Std. Dev.: ' + standardDeviation(finalScoreArray).toFixed(1));
         $('#hexStats').removeClass('d-none');

         updatedTurfLayerArray = turfLayerArray;
      });



      return
    }

    setTimeout(check, 0);
  }

  check();

  var reader = new FileReader();
  reader.onloadend = function() {
    // file is loaded
    result = reader.result;
    ready = true;
  };
  reader.readAsArrayBuffer(currentFile);

  $('#hexCheckbox').prop('checked', true);
});

$('input[id=hexCheckbox]').change(function() {
  if (turfLayerArray.length == 0) {
    $('#hexCheckbox').prop('checked', false);
  }

  if (document.getElementById('hexCheckbox').checked) {
    overlays.addLayer(turfLayer).addTo(map);
    overlaysIDs[overlayOrder.indexOf("Hex Grid")] = turfLayer._leaflet_id;
  } else {
    if (overlaysIDs[overlayOrder.indexOf("Hex Grid")] != -1) {
     overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Hex Grid")]);
     overlaysIDs[overlayOrder.indexOf("Hex Grid")] = -1;
    }
  }
});

function updateHex() {
  updatedTurfLayerArray = [];
  var currentFinalScoreArray = [];

  var checkedLayers = $("input:checkbox[id=hexCheckbox]:checked");

  function queryHexArray(inType, currentQueryArray){
    if (inType == "Hex") {
      var queriedArray = [];
      var lowValue = $('#hexSlider').slider("values")[0];
      var highValue = $('#hexSlider').slider("values")[1];

      for (var i = 0; i < currentQueryArray.length; i++) {
        var feature = currentQueryArray[i];
        var currentScore = parseFloat(feature.properties.FINAL_SCOR);

        if (currentScore >= lowValue && currentScore <= highValue) {
          queriedArray.push(feature);
          currentFinalScoreArray.push(currentScore);
        }
      }
    }

    return queriedArray;
  }

  if (checkedLayers.length > 0) {
    updatedTurfLayerArray = queryHexArray(checkedLayers[0].name, turfLayerArray);
  }

  turfLayer = L.geoJson(updatedTurfLayerArray, {
    style: desktopHexStyle,
    onEachFeature: createDesktopHexPopup
  });

  if (overlaysIDs[overlayOrder.indexOf("Hex Grid")] != -1) {
    overlays.removeLayer(overlaysIDs[overlayOrder.indexOf("Hex Grid")]);
    overlaysIDs[overlayOrder.indexOf("Hex Grid")] = -1;
  }

  overlays.addLayer(turfLayer).addTo(map);
  overlaysIDs[overlayOrder.indexOf("Hex Grid")] = turfLayer._leaflet_id;

  $('#hexStats').html('Average: ' + average(currentFinalScoreArray).toFixed(1) + ', Std. Dev.: ' + standardDeviation(currentFinalScoreArray).toFixed(1));
}

$('#lineButton').on('click', function(e) {
  var drawLine = new L.Draw.Polyline(map, drawPolylineOptions).enable();
});

$('#polygonButton').on('click', function(e) {
  var drawPolygon = new L.Draw.Polygon(map, drawPolygonOptions).enable();
});

$('#deleteDrawings').on('click', function(e) {
  var layersKeys = Object.keys(drawnItems._layers);
  for (var j = 0; j < layersKeys.length; j++) {
    drawnItems.remove(drawnItems._layers[layersKeys[j]]);
  }

  drawnItems  = new L.FeatureGroup();
  map.addLayer(drawnItems);
});

$('#saveDrawings').on('click', function(e) {
  function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

download(JSON.stringify(drawingJson), 'drawing.json', 'text/plain');
});

$(document).ready(function() {
  $( function() {
    $( "#speedSelector" ).sortable({
      revert: true
    });
  });
});