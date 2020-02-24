var CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var CartoDB_PositronOnlyLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd'
  // pane: 'labels'
});

var map = L.map('mapDiv', {
  center: [34.165514, -118.3791779],
  zoom: 11,
  layers: [CartoDB_PositronNoLabels],
  doubleClickZoom: false,
  boxZoom: false,
  zoomControl: true,
  renderer: L.canvas()
});

// map.createPane('labels');
// map.getPane('labels').style.zIndex = 601;
// map.getPane('labels').style.pointerEvents = 'none';

CartoDB_PositronOnlyLabels.addTo(map);

var overlays = L.layerGroup();
var overlaysIDs = [-1, -1, -1, -1, -1, -1, -1, -1]; //0: stations, 1: turf distances, 2: od lines, 3: smart od lines, 4: council districts, 5: smart hexes, 6: smart hexes overlay, 7: suitability

var allStations = {};

var stationArray = [];
var allStationArray = [];
var stations = L.geoJson();

var circlesArray = [];
var circlesLabels = [];
var circles = L.geoJson();

var suitability = L.geoJson();
var suitabilityArray = [];

var cdArray = [];
var councilDistrictLayer = L.geoJson();

var odLinesDict = {};
var odLinesArray = [];
var odLines = L.geoJson();

var smartLinesDict = {}
var smartLinesArray = [];
var smartLines = L.geoJson();

var smartHexArray = [];
var smartHexes = L.geoJson();

var smartHexOverlayArray = [];
var smartHexesOverlay = L.geoJson();

var activeExisting = [];

var colors = ['#76ab43', '#3F90A7', '#FFCC66', '#E36F1E', '#174759', '#ab4375', '#ab4375', '#6fb7ff', '#555', '#956fff', '#ffca6f'];

var symbologyDict = {
                      "Installed": "#269600",
                      "Installed - Geofence": "#269600",
                      "Submitted": "#e1e44a",
                      "Explore or Visit": "#CA1F7B",
                      "Drawing ready but not submitted": "#2461aa",
                      "Drawing in progress": "#50c8e8",
                      "Ready to draw": "#6c257d",
                      "Ready to measure": "#9561a8",
                      "Red curb": "#fc3842",
                      "Work needed": "#f15623",
                      "Other": "#ffb300",
                      "Revisit later": "#adb8bf",
                      "Removed from consideration": "#d4dadc"
                    };
var symbologyDictKeys;

var stationIDtoName = {};
var odIdToStations = {};
var stationsToOdId = {};
var odIdToRidership = {};

var ridershipToLineDict = {};
var smartHexDict = {};

var hexGridVisDict = {};

var ridershipLineChart;
var ridershipDayChart;

var statuses = [];
var siteNumbers = [];
var councilDistricts = [];
var cities = [];
var types = [];
var batchNum = [];

var a;
var b;

var ridershipByHour = {
                        0: 0,
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 0,
                        5: 0,
                        6: 0,
                        7: 0,
                        8: 0,
                        9: 0,
                        10: 0,
                        11: 0,
                        12: 0,
                        13: 0,
                        14: 0,
                        15: 0,
                        16: 0,
                        17: 0,
                        18: 0,
                        19: 0,
                        20: 0,
                        21: 0,
                        22: 0,
                        23: 0};
var ridershipByDay = {'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0};

var submittalTracking = {};

var streetAutocompleteDict = {};

var headerToArrayDict = {
                          "Status": statuses,
                          "TD Site Number": siteNumbers,
                          "CD": councilDistricts,
                          "System": cities,
                          "Type": types,
                          "Batch Number": batchNum
                        };

var headerToArrayDictKeys = Object.keys(headerToArrayDict);
var drawingNumber;

var bboxPolygon = turf.polygon([[[-180, -90], [180, -90], [-180, 90], [-180, -90]]]);

//////////////////////////////////////////////// INTERACTION
L.Layer.prototype.setInteractive = function (interactive) {
  if (this.getLayers) {
    this.getLayers().forEach(layer => {
      layer.setInteractive(interactive);
    });
    return;
  }
  if (!this._path) {
    return;
  }

  this.options.interactive = interactive;

  if (interactive) {
    L.DomUtil.addClass(this._path, 'leaflet-interactive');
  } else {
    L.DomUtil.removeClass(this._path, 'leaflet-interactive');
  }
};

//////////////////////////////////////////////// GEOCODER

// var searchControl = L.esri.Geocoding.geosearch().addTo(map);

// var results = L.layerGroup().addTo(map);

// searchControl.on('results', function(data){
//   results.clearLayers();
//   for (var i = data.results.length - 1; i >= 0; i--) {
//     // map.flyTo(data.results[i].latlng, map.getZoom());
//     // results.addLayer(L.marker(data.results[i].latlng));

//   }
// });

//////////////////////////////////////////////// LOGIN

// var tries = 0;

// $('#login-button').click(function() {
//   tries += 1;

//   if (tries >= 4) {
//     window.open("https://www.metro.net/","_self");
//   }

//   var u = $('#login-user-input').val();
//   var p = $('#login-pw-input').val();

//   if ((u == a) && (p == b)) {
//     $('#login-box').addClass('d-none');
//   } else {
//     $('#num-tries').html(`<span style="color: red">Incorrect login. ${4 - tries} attempts left.</span>`)
//   }
// });

//////////////////////////////////////////////// SIDEBAR

var sideBar = L.control({ position: 'topleft' });

sideBar.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'sideBarDiv');
  this.initializeInfo();
  return this._div;
};

sideBar.initializeInfo = function () {
  this._div.innerHTML = '';
}

sideBar.addTo(map);

$('.sideBarDiv').attr('id', 'sideBarDivId');

var sidebarControl = L.control.sidebar('sideBarDivId', {
  closeButton: false,
  position: 'left',
  autoPan: false
});
map.addControl(sidebarControl);


//////////////////////////////////////////////// INTRO DIV

var introDiv = L.control({position: 'topright'});

introDiv.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'introDiv');
  this.initializeInfo();
  return this._div;
};

introDiv.initializeInfo = function () {
  this._div.innerHTML = `
    <div class="container p-2 introDivContainer">
      <button type="button" id="introCloseButton" class="close" aria-label="Close" style="color: #000;"><span aria-hidden="true"><i class="far fa-minus-square"></i></span></button>

      <span id="introDivSpanId">
        <div class="row mx-auto" style="width: 300px;">
          <div class="col mx-auto text-center">
            <a href="https://www.metro.net/" target="_blank" class="mx-auto"><img src="img/bike_share_logo.png" class="img-fluid" alt="Metro Logo"></a>
          </div>
        </div>

        <hr>

        <div class="row mx-auto" id="welcomeText" style="width: 300px;">
          <div class="col mx-auto">
            <span id="infoText" style="font-size: 14px;">

              <div class="container">

                <br>

                <div id="Status_Selector">
                </div><hr>

                <div id="TD_Site_Number_Selector">
                </div><hr>

                <div id="Type_Selector">
                </div><hr>

                <div id="System_Selector">
                </div><hr>

                <div id="CD_Selector">
                </div><hr>

                <div id="Batch_Number_Selector">
                </div><hr>

                <div class="row">
                  <div class="col text-center">
                    <div class="btn-group btn-group-toggle" data-toggle="buttons">
                      <label class="btn btn-secondary">
                        <input type="checkbox" name="selectionTypeRadio" id="selectAllRadio" value="all" autocomplete="off"> Select All
                      </label>
                      <label class="btn btn-secondary">
                        <input type="checkbox" name="selectionTypeRadio" id="deselectAllradio" value="none" autocomplete="off"> Deselect All
                      </label>
                    </div>
                  </div>
                </div>

                <br>

                <div class="row">
                  <div class="col text-center">
                    <button id="lineButton" class="drawButton btn btn-outline-dark"><i class="fas fa-pen mr-1"></i>Select by location</button>
                  </div>
                  <div class="col text-center d-none" id="removeButtonDiv">
                    <button id="removeButton" class="btn btn-outline-dark"><i class="fas fa-minus-circle mr-1"></i>Remove Selection</button>
                  </div>
                </div>
              </div>

              <br>
            </span>
          </div>
        </div>
      </span>
    </div>
  `;
}

introDiv.addTo(map);

$('#introCloseButton').click(function(){
  $("#introDivSpanId").toggle();
  // sidebarControl.open('info');
});

map.on('zoomend', function() {
  var currentZoom = map.getZoom();

  if (currentZoom < 17) {
    for (var m = 0; m < circlesLabels.length; m++) {
      map.removeLayer(circlesLabels[m]);
    }
  } else if (currentZoom >= 17) {
    for (var m = 0; m < circlesLabels.length; m++) {
      map.addLayer(circlesLabels[m]);
    }
  }
});

$('input[type=checkbox][name=selectionTypeRadio]').change(function() {
  if (this.value == 'all') {
    $("select[multiple] option").prop("selected", "selected");
    removeDrawing();
    bboxPolygon = turf.polygon([[[-180, -90], [180, -90], [-180, 90], [-180, -90]]]);
    $('#removeButtonDiv').addClass('d-none');

    createFeaturesWithQuery();
  }
  else if (this.value == 'none') {
    $("select[multiple] option").prop("selected", "");
    createFeaturesWithQuery();
  }
});

//////////////////////////////////////////////// SMART TRIPS DIV

var smartDiv = L.control({position: 'topleft'});

smartDiv.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'smartDiv');
  this.initializeInfo();
  return this._div;
};

smartDiv.initializeInfo = function () {
  this._div.innerHTML = `
                        <div class="custom-control custom-checkbox custom-control-inline align-middle">
                          <input class="custom-control-input" type="checkbox" value="" name="smartTripsCheckbox" id="smartTrips" data-toggle="collapse" data-target="#smartTripsCollapse" aria-expanded="false" aria-controls="smartTripsCollapse">
                          <label class="custom-control-label" for="smartTrips">
                            View Smart trips?
                          </label>
                        </div>

                        <div class="custom-control custom-checkbox custom-control-inline">
                          <input class="custom-control-input" type="checkbox" value="" name="suitabilityCheckbox" id="suitability" data-toggle="collapse" data-target="#suitabilityCollapse" aria-expanded="false" aria-controls="suitabilityCollapse">
                          <label class="custom-control-label" for="suitability">
                            View Hex Grid?
                          </label>
                        </div>

                        <div class="collapse" id="smartTripsCollapse">
                          <div class="custom-control custom-checkbox">
                            <input class="custom-control-input" type="checkbox" id="smartOriginCheckbox" name="smartTripsTypes" value="origin_hex" checked>
                            <label class="custom-control-label" for="smartOriginCheckbox">Smart trips with selected hexagon as origin</label>
                          </div>
                          <div class="custom-control custom-checkbox">
                            <input class="custom-control-input" type="checkbox" id="smartDestinationCheckbox" name="smartTripsTypes" value="destination_hex" checked>
                            <label class="custom-control-label" for="smartDestinationCheckbox">Smart trips with selected hexagon as destination</label>
                          </div>
                        </div>

                        <div class="collapse" id="suitabilityCollapse">
                          Visualize data by:
                          <div class="custom-control custom-radio">
                            <input class="custom-control-input" type="radio" id="visualizeSuitabilityRadio" name="visualizeSuitabilityTypes" value="suitability" checked>
                            <label class="custom-control-label" for="visualizeSuitabilityRadio">Suitability</label>
                          </div>
                          <div class="custom-control custom-radio">
                            <input class="custom-control-input" type="radio" id="visualizeZeroVehicleRadio" name="visualizeSuitabilityTypes" value="pct_zero_car_hh">
                            <label class="custom-control-label" for="visualizeZeroVehicleRadio">Zero-vehicle households</label>
                          </div>
                          <div class="custom-control custom-radio">
                            <input class="custom-control-input" type="radio" id="visualizeEquityRadio" name="visualizeSuitabilityTypes" value="equity_cat">
                            <label class="custom-control-label" for="visualizeEquityRadio">Equity Score</label>
                          </div>
                          <div class="custom-control custom-radio">
                            <input class="custom-control-input" type="radio" id="visualizeLikesRadio" name="visualizeSuitabilityTypes" value="crowd_like">
                            <label class="custom-control-label" for="visualizeLikesRadio">Crowdsourcing Likes</label>
                          </div>
                          <div class="custom-control custom-radio">
                            <input class="custom-control-input" type="radio" id="visualizeDislikesRadio" name="visualizeSuitabilityTypes" value="crowd_no_like">
                            <label class="custom-control-label" for="visualizeDislikesRadio">Crowdsourcing Dislikes</label>
                          </div>
                          <div class="custom-control custom-radio">
                            <input class="custom-control-input" type="radio" id="visualizeHomeRadio" name="visualizeSuitabilityTypes" value="home_zip">
                            <label class="custom-control-label" for="visualizeHomeRadio">Crowdsourcing Home</label>
                          </div>
                          <div class="custom-control custom-radio">
                            <input class="custom-control-input" type="radio" id="visualizeWorkRadio" name="visualizeSuitabilityTypes" value="work_zip">
                            <label class="custom-control-label" for="visualizeWorkRadio">Crowdsourcing Work</label>
                          </div>
                        </div>`;
};

smartDiv.addTo(map);

$('#smartTrips').change(function() {
  if (overlaysIDs[5] != -1) {
    overlays.removeLayer(overlaysIDs[5]);
    overlaysIDs[5] = -1;
  }

  if ($('input[name="smartTripsCheckbox"]').is(':checked')) {
    createSmartHexes();
    map.setView([34.012479, -118.462475], 13);
  }
});

$('#suitability').change(function() {
  if (overlaysIDs[7] != -1) {
    overlays.removeLayer(overlaysIDs[7]);
    overlaysIDs[7] = -1;
  }

  if ($('input[name="suitabilityCheckbox"]').is(':checked')) {
    createSuitability();
  }
});

var visualizeCheckboxes = $('input[name="visualizeSuitabilityTypes"]');
for (var i = 0; i < visualizeCheckboxes.length; i++) {
  hexGridVisDict[visualizeCheckboxes[i].value] = [];
}

$('input[name="visualizeSuitabilityTypes"]').change(function() {
  createSuitability();
});