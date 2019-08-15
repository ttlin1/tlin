var CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var CartoDB_PositronOnlyLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  pane: 'labels'
});

var map = L.map('mapDiv', {
  center: [34.165514, -118.3791779],
  zoom: 11,
  layers: [CartoDB_PositronNoLabels],
  doubleClickZoom: false,
  boxZoom: false,
  zoomControl: true,
});

map.createPane('labels');
map.getPane('labels').style.zIndex = 601;
map.getPane('labels').style.pointerEvents = 'none';

CartoDB_PositronOnlyLabels.addTo(map);

var overlays = L.layerGroup();
var overlaysIDs = [-1, -1, -1, -1, -1, -1]; //0: stations, 1: turf distances

var allStations = {};

var stationArray = [];
var allStationArray = [];
var stations = L.geoJson();

var circlesArray = [];
var circlesLabels = [];
var circles = L.geoJson();

var cdArray = [];
var councilDistrictLayer = L.geoJson();

var activeExisting = [];

var colors = ['#76ab43', '#3F90A7', '#FFCC66', '#E36F1E', '#174759', '#ab4375', '#ab4375', '#6fb7ff', '#555', '#956fff', '#ffca6f'];

var symbologyDict = {
                      "Installed": "#269600",
                      "Installed - Geofence": "#269600",
                      "Submitted": "#e1e44a",
                      "Drawing ready by not submitted": "#2461aa",
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

var statuses = [];
var siteNumbers = [];
var councilDistricts = [];
var cities = [];
var types = [];

var submittalTracking = {};

var streetAutocompleteDict = {};

var headerToArrayDict = {
                          "Status": statuses,
                          "TD Site Number": siteNumbers,
                          "CD": councilDistricts,
                          "City": cities,
                          "Type": types
                        };

var headerToArrayDictKeys = Object.keys(headerToArrayDict);
var drawingNumber;

var bboxPolygon = turf.polygon([[[-180, -90], [180, -90], [-180, 90], [-180, -90]]]);

//////////////////////////////////////////////// GEOCODER

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

var results = L.layerGroup().addTo(map);

searchControl.on('results', function(data){
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    map.flyTo(data.results[i].latlng, 18);
    // results.addLayer(L.marker(data.results[i].latlng));
  }
});

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

                <div id="City_Selector">
                </div><hr>

                <div id="CD_Selector">
                </div><hr>

                <div class="row">
                  <div class="col text-center">
                    <div class="btn-group btn-group-toggle" data-toggle="buttons">
                      <label class="btn btn-secondary">
                        <input type="radio" name="selectionTypeRadio" id="selectAllRadio" value="all" autocomplete="off" checked> Select All
                      </label>
                      <label class="btn btn-secondary">
                        <input type="radio" name="selectionTypeRadio" id="deselectAllradio" value="none" autocomplete="off"> Deselect All
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

$('input[type=radio][name=selectionTypeRadio]').change(function() {
    if (this.value == 'all') {
      $("select[multiple] option").prop("selected", "selected");
      removeDrawing();
      bboxPolygon = turf.polygon([[[-180, -90], [180, -90], [-180, 90], [-180, -90]]]);
      $('#removeButtonDiv').addClass('d-none');

      createFeaturesWithQuery();
      $("#dataTable").show();
      $('#tableCloseButton').click(function(){
        $("#dataTable").toggle();
      });
    }
    else if (this.value == 'none') {
      $("select[multiple] option").prop("selected", "");
      createFeaturesWithQuery();
    }
});
