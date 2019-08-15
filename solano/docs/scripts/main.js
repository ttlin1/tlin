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

var map = L.map('participationMapDiv', {
  center: [38.245164, -121.953152],
  zoom: 11,
  layers: [CartoDB_PositronNoLabels],
  doubleClickZoom: false,
  boxZoom: false,
  zoomControl: true
});

map.createPane('labels');
map.getPane('labels').style.zIndex = 601;
map.getPane('labels').style.pointerEvents = 'none';

CartoDB_PositronOnlyLabels.addTo(map);

var overlays = L.layerGroup();
var overlaysIDs = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]; //0: existing, 1: proposed, 2: pedestrian, 3: pedestrian points, 4: county boundary, 5: drawing, 6: previous drawing, 7: previous drawing points, 8: parking implementation, 9: lane implementation

var drawnItems  = new L.FeatureGroup();
map.addLayer(drawnItems);

var existingSymbologyDict = {'trail connector': '#76ab43', 
                              'trail': '#76ab43',
                              'unpaved trail': '#a75e3f',
                              // 'bike-friendly roads': '#636363', 
                              'bike lane': '#3F90A7'
};
var existingSymbologyDictKeys = Object.keys(existingSymbologyDict);

var symbologyDict = {'Class I Multi-Use Path': '#76ab43', 
                      'Class II Bicycle Lane': "#3F90A7", 
                      'Class III Bicycle Route': "#ffcc66", 
                      'Class III Bicycle Boulevard': "#E36F1E", 
                      'Class II Buffered Bicycle Lane': "#174759", 
                      'Class IV Separated Bikeway': '#ab4375'};

var symbologyDictKeys = Object.keys(symbologyDict);

var pedSymbologyDict = {'Capital Improvement Program': '#76ab43', 
                        'Sidewalk Gap Closure': "#3F90A7", 
                        'Safe Routes to School': "#ffcc66", 
                        'Safe Routes to Transit': "#E36F1E", 
                        'Safety': "#174759", 
                        'Walk Audit': '#ab4375'};

var pedSymbologyDictKeys = Object.keys(pedSymbologyDict);

var implementationDict = {'Both Sides': '#76ab43', 
                          'No Change': "#3F90A7", 
                          'One Side': "#ffcc66", 
                          'Parking or Lane Removal': "#E36F1E", 
                          'Yes': '#ab4375'};

var implementationDictKeys = Object.keys(implementationDict);

// initialize leaflet json layer variables
var proposed = L.geoJSON();
var existing = L.geoJSON();
var pedestrian = L.geoJSON();
var pedestrianPoints = L.geoJSON();
var implementationParking = L.geoJSON();
var implementationLane = L.geoJSON();

var boundary = L.geoJSON();
var previousDrawing = L.geoJSON();
var previousDrawingPoints = L.geoJSON();

// initialize variables containing geojson layer data

var existingArray = {};
var proposedArray = {};
var parkingArray = {};
var laneArray = {};

var activeProposed = [];
var activeExisting = [];
var activeParking = [];
var activeLane = [];

var allExisting = [];
var allProposed = [];
var allImp = [];

var pedestrianArray = {};
var pedestrianActive = [];
var pedestrianAll = [];

var drawnPoints = [];
var drawingNumbers = [];

var previousDrawingArray = [];
var previousDrawingPointsArray = [];

var currentAutocompleteDict = {};

var surveyQuestions = {
                      "1": {"Question": "Prioritization",
                            "Response Type": "radio",
                            "Responses": "High, Medium, Low"},

                      "2": {"Question": "Requires Further Study",
                            "Response Type": "checkbox",
                            "Responses": "None, Complete Streets Corridor Plan/Feasibility Study, Parking Assessment, Traffic Operations Assessment"},
                      "3": {"Question": "Comment",
                            "Response Type": "text",
                            "textRows": 3},
                      "4": {"Question": "Commenter Name",
                            "Response Type": "text",
                            "textRows": 1},
                      "5": {"Question": "Commenter Jurisdiction",
                            "Response Type": "text",
                            "textRows": 1}
                    };

var surveyQuestionsKeys = Object.keys(surveyQuestions);

// for (var i = 0; i < symbologyDictKeys.length; i++) {
//   activeExisting.push(symbologyDictKeys[i]);
//   allExisting.push(symbologyDictKeys[i]);
//   existingArray[symbologyDictKeys[i]] = []; 

//   activeProposed.push(symbologyDictKeys[i]);
//   allProposed.push(symbologyDictKeys[i]);
//   proposedArray[symbologyDictKeys[i]] = [];
// }

for (var i = 0; i < pedSymbologyDictKeys.length; i++) {
  pedestrianArray[pedSymbologyDictKeys[i]] = [];
  pedestrianActive.push(pedSymbologyDictKeys[i]);
  pedestrianAll.push(pedSymbologyDictKeys[i]);
}

for (var i = 0; i < implementationDictKeys.length; i++) {
  parkingArray[implementationDictKeys[i]] = [];
  laneArray[implementationDictKeys[i]] = [];

  activeParking.push(implementationDictKeys[i]);
  activeLane.push(implementationDictKeys[i]);
  allImp.push(implementationDictKeys[i]);
}


//////////////////////////////////////////////// IP
var ip_address;
var postal_code;

$(function () {
  $.getJSON("https://api.ipify.org?format=jsonp&callback=?",
    function (json) {
      ip_address = json.ip;
    }
  );
});

//////////////////////////////////////////////// CONFIG
var c = {};

$.ajax({
  url: 'json/c.json',
  dataType: 'json',
  async: false,
  success: function (data) {
    c.mp = data.mp;
    c.s = data.s;
    c.m = data.m;
  }
});

function capitalize(inString) {
  var returnedString = [];
  if (inString != null) {
    var splitString = inString.split(" ");

    for (var i = 0; i < splitString.length; i++) {
      returnedString.push(splitString[i].charAt(0).toUpperCase() + splitString[i].slice(1).toLowerCase());
    } 
  }

  return returnedString.join(" ");
}

function blankIfNull(inString) {
  return (inString == null ? "" : inString);
}

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
            <a href="http://www.solanocounty.com/" target="_blank" class="mx-auto"><h1>Solano County Active Transportation Plan</h1></a>
          </div>
        </div>

        <hr>

        <div class="row mx-auto" id="welcomeText" style="width: 300px;">
          <div class="col mx-auto">
            <span id="infoText" style="font-size: 14px;">

              <div id="draw">
                <div class="container">

                  <div class="d-none d-sm-block">
                    <p>Welcome to the Solano County Active Transportation Plan map. Click on a location on the map to find out more about the proposed projects!</p>
                  </div>
                  <p>Use the drawing tools below to highlight locations we've missed that you think need pedestrian- or bicycle-related improvements!</p>

                  <div class="row">
                    <div class="col">
                      <div class="row justify-content-center"><button id="pointButton" class="drawButton btn btn-outline-dark"><i class="fas fa-pen mr-1"></i><small>Intersection</small></button></div>
                    </div>
                    <div class="col">
                      <div class="row justify-content-center"><button id="lineButton" class="drawButton btn btn-outline-dark"><i class="fas fa-pen mr-1"></i><small>Route</small></button></div>
                    </div>
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

// Disable dragging when user's cursor enters the element
introDiv.getContainer().addEventListener('mouseover', function () {
  map.dragging.disable();
});

// Re-enable dragging when user's cursor leaves the element
introDiv.getContainer().addEventListener('mouseout', function () {
  map.dragging.enable();
});

//////////////////////////////////////////////// SEARCH DIV

var searchDiv = L.control({position: 'topleft'});

searchDiv.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'searchDiv');
  this.initializeInfo();
  return this._div;
};

searchDiv.initializeInfo = function () {
  this._div.innerHTML = `
                        <div class="ui-widget">
                          <label for="projectIdSearch">Project ID: </label>
                          <input id="projectIdSearch">

                          <div id="searchResults"></div>
                        </div>`;
};

searchDiv.addTo(map);

// Disable dragging when user's cursor enters the element
searchDiv.getContainer().addEventListener('mouseover', function () {
  map.dragging.disable();
});

// Re-enable dragging when user's cursor leaves the element
searchDiv.getContainer().addEventListener('mouseout', function () {
  map.dragging.enable();
});