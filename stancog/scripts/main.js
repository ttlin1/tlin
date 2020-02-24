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
  center: [37.618, -120.927],
  zoom: 10,
  layers: [CartoDB_PositronNoLabels],
  doubleClickZoom: false,
  boxZoom: false,
  zoomControl: false
});

var mapZoom = new L.Control.Zoom({position: 'bottomleft'}).addTo(map);

map.createPane('labels');
map.getPane('labels').style.zIndex = 601;
map.getPane('labels').style.pointerEvents = 'none';

CartoDB_PositronOnlyLabels.addTo(map);

var overlays = L.layerGroup();
var overlaysIDs = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]; //0: existing, 1: proposed, 2: , 3: , 4: county boundary, 5: drawing, 6: previous drawing

var drawnItems  = new L.FeatureGroup();
map.addLayer(drawnItems);

var existingSymbologyDict = {

                              'Class 1 Path': "#76ab43", 
                              'Class 2 Bicycle Lane': "#3F90A7", 
                              'Class 3 Bicycle Route': "#ffcc66", 
                              'Class 3.5 Bicycle Route with Wide Shoulders': "#E36F1E", 
};
var existingSymbologyDictKeys = Object.keys(existingSymbologyDict);

var symbologyDict = {'Class 1 Path': "#76ab43", 
                      'Class 2 Bicycle Lane': "#3F90A7", 
                      'Class 3 Bicycle Route': "#ffcc66", 
                      // 'Class 3.5 Bicycle Route with Share The Road Signs': "#E36F1E", 
                      'Class 3.5 Bicycle Route with Wide Shoulders': "#E36F1E"};

var symbologyDictKeys = Object.keys(symbologyDict);

// initialize leaflet json layer variables
var proposed = L.geoJSON();
var existing = L.geoJSON();

var boundary = L.geoJSON();
var previousDrawing = L.geoJSON();
var previousDrawingPoints = L.geoJSON();

// initialize variables containing geojson layer data

var existingArray = {};
var proposedArray = {};

var activeProposed = [];
var activeExisting = [];

var allExisting = [];
var allProposed = [];

var drawnPoints = [];
var drawingNumbers = [];

var previousDrawingArray = [];
var previousDrawingPointsArray = [];

var currentAutocompleteDict = {};

var surveyQuestions = {
                        "1": {
                                "Question": "What kind of bikeway should this route be?",
                                "Response Type": "radio",
                                "Responses": "Class I Multi-Use Path, Class II Bicycle Lane, Class II Buffered Bicycle Lane, Class III Bicycle Route, Class III Bicycle Boulevard, Class IV Separated Bikeway"
                              },
                        "2": {"Question": "Comments",
                              "Response Type": "text",
                              "textRows": 3},
                        "3": {"Question": "Commenter Name",
                              "Response Type": "text",
                              "textRows": 1},
                        "4": {"Question": "Commenter Jurisdiction",
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

var searchControl = L.esri.Geocoding.geosearch({position: 'bottomleft'}).addTo(map);

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
    <nav class="navbar fixed-top navbar-light bg-light d-md-none">
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#mobileNavBarToggle" aria-controls="mobileNavBarToggle" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mobileNavBarToggle">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="#" id="mobileAbout">About this map</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" id="mobileInstructions">View Instructions</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" id="mobileLegend">View Legend</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" id="mobileInput">Add your input</a>
          </li>
        </ul>
      </div>
    </nav>

    <div class="container introDivContainer d-none d-md-block">
      <div class="row d-none d-md-block">
        <div class="col p-3">
          <button type="button" id="introCloseButton" class="close" aria-label="Close" style="color: #000;"><span aria-hidden="true"><i class="far fa-minus-square"></i></span></button>
        </div>
      </div>
      
      <span id="introDivSpanId">
        <div class="row align-items-center mb-1 d-none d-md-block">
          <div class="col text-center"><a href="http://www.stancog.org/" target="_blank" class="mx-auto"><h1>StanCOG’s<br>Non-Motorized Transportation Plan</h1></a></div>
        </div>

        <div class="row d-none d-md-block" id="mobileAboutRow">
          <div class="col">
            <span class="float-right hideThisElement d-md-none" style="cursor: pointer"><i class="fas fa-caret-square-up fa-2x"></i></span>
            <br>
            <p>Welcome to the Stanislaus Council of Government’s (StanCOG) Non-Motorized Transportation Plan web map. Please use this map to tell us how you’d like to improve the active transportation network in your community.</p>
          </div>
        </div>

        <div class="row pb-2 d-none d-md-block">
          <div class="col text-center">
            <a class="noDecoration" data-toggle="collapse" href="#instructionsCollapse" role="button" aria-expanded="false" aria-controls="instructionsCollapse">
              <i class="fas fa-sort-down"></i> View Instructions
            </a>
          </div>
        </div>

        <div class="row pb-2 d-none d-md-block" id="mobileInstructionsRow">
          <div class="col">
          <span class="float-right hideThisElement d-md-none" style="cursor: pointer"><i class="fas fa-caret-square-up fa-2x"></i></span>
          <br>
            <div class="collapse" id="instructionsCollapse">
              <div class="card card-body">
                <p><strong>How to Use the Map</strong></p>
                <p>Use the drawing tools below to highlight planned projects or suggested network improvements. Use the bikeway route tool to draw new bikeways or to recommend an existing facility be changed.<br><br>Use the Complete Streets Route tool to mark planned active transportation or Complete Streets projects. For both bikeway comments and Complete Streets projects please draw the full extent of the project.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="row" style="margin-bottom:1em;" id="mobileInputRow">
          <div class="col text-center">
          <span class="float-right hideThisElement d-md-none" style="cursor: pointer"><i class="fas fa-caret-square-up fa-2x"></i></span>
          <br>

            <div class="row" style="margin-bottom:1em;">
              <div class="col text-center">
                <button id="lineButtonBikeway" class="drawButton lineButton btn btn-secondary"><i class="fas fa-pen mr-1"></i><small>Add Bikeway</small></button>
              </div>
              <div class="col text-center">
                <button id="lineButtonCompleteStreets" class="drawButton lineButton btn btn-secondary"><i class="fas fa-pen mr-1"></i><small>Add Complete Street</small></button>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <div class="custom-control custom-switch mx-auto">
                  <input type="checkbox" class="custom-control-input" id="viewComments">
                  <label class="custom-control-label" for="viewComments"><span style="cursor: pointer;">View Submitted Drawing Comments</span></label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row d-none d-md-block" id="mobileLegendRow">
          <div class="col">
          <span class="float-right hideThisElement d-md-none" style="cursor: pointer"><i class="fas fa-caret-square-up fa-2x"></i></span>
          <br>
            <ul class="nav nav-tabs" id="myTab" role="tablist">
              <li class="nav-item">
                <a class="nav-link active" id="bike-tab" data-toggle="tab" href="#bike" role="tab" aria-controls="bike" aria-selected="false" onclick="toggleLegendTab('bike');">Bicycle</a>
              </li>
            </ul>
            <div class="tab-content" id="myTabContent"></div>
          </div>
        </div>

      </span>

    </div>
  `;
}

introDiv.addTo(map);

var mobileButtons = ["mobileAbout", "mobileInstructions", "mobileLegend", "mobileInput"];
for (var i = 0; i < mobileButtons.length; i++) {
  $(`#${mobileButtons[i]}`).click(function() {
    $('#mobileNavBarToggle').removeClass('show');
    $('.introDivContainer').removeClass('d-none');
    $(`#${$(this)[0].id}Row`).removeClass('d-none');

    var otherButtons = mobileButtons.slice(0);
    otherButtons.splice(mobileButtons.indexOf($(this)[0].id), 1)

    for (var j = 0; j < otherButtons.length; j++) {
      $(`#${otherButtons[j]}Row`).addClass('d-none');
    }
  });
}

$('.hideThisElement').click(function() {
  $('.introDivContainer').toggleClass('d-none');
  $(this).parent().parent().toggleClass('d-none');
});

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

$('#viewComments').on('click', function() {
  $('#myTabContent').html(createLegendText());
  createDrawingComments();
});

function createOverlayPaneText() {
  var checkboxString = '';
  var checkboxArray = [
                        "Downtowns or High Pedestrian Activity Centers",
                        "Schools",
                        "Major Regional Retail Areas",
                        "Neighborhood Commercial Locations",
                        "Transit Stops and Centers",
                        "Parks, Open Space, and Recreation",
                        "Business Parks or Employment Centers",
                        "Governmental, Social Services, and Hospitals",
                        "Libraries",
                        "Entertainment Options and Venues"
                      ];

  for (var i = 0; i < checkboxArray.length; i++) {
    checkboxString +=`
          <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input overlayCheckboxes" id="DestinationTypes${i}" name="DestinationTypes" value="${checkboxArray[i]}">
            <label class="custom-control-label" for="DestinationTypes${i}">${checkboxArray[i]}</label>
          </div>`;
  }

  var current = `
  <div class="row mx-auto align-items-center" style="background-color: rgba(255, 255, 255, 0.95);" id="fullScreen">
    <div class="col mx-auto p-3 d-sm-block">

      <div class="row justify-content-md-center">
        <div class="col col-lg-6">
          <button type="button" id="instructionsCloseButton" class="close float-right" aria-label="Close" style="color: #000;"><span aria-hidden="true">&times;</span></button>
        </div>
      </div>

      <div class="row text-center pb-3">
        <div class="col">
          <a href="http://www.stancog.org/" target="_blank" class="mx-auto"><img src="http://www.stancog.org/images/logo-lg.png" id="citySeal" width="100%"></a>
        </div>
      </div>

      <div class="row justify-content-md-center">
        <div class="col col-lg-6" style="background-color: rgba(255, 255, 255, 0.95);">
          <h6><strong>Welcome to StanCOG’s Non-Motorized Transportation Plan Online Map!</strong></h6>
          <p>You can use this map to tell us about important destinations and to share comments about where you like, or don’t like, to walk and bike throughout the Stanislaus region.</p>
          <p>Please select your <strong>top three</strong> key destination types that should be prioritized for walking and biking: </p>
        </div>
      </div>

      <div class="row justify-content-md-center">
        <div class="col col-lg-4">
          ${checkboxString}
        </div>
      </div>
      <br>

      <div class="row justify-content-md-center">
        <div class="col col-lg-4">
        <div class="form-group">
          <label for="surveyEmailInput">Use your email address to login and make comments, and to receive project notifications</label>
          <input type="email" class="form-control" id="surveyEmailInput" aria-describedby="emailHelp" placeholder="Enter email">
          <small id="emailHelp" class="form-text text-muted">If you’ve visited the web map already, please do not vote for your top three destinations again, instead click View Map to go straight to the map</small>
        </div>
        </div>
      </div>

      <div class="row pt-1">
        <div class="col" align="center">
          <button type="button" id="participateButton" class="btn btn-primary">View map!</button>
        </div>
      </div>

    </div>
  </div>`

  return current
}

// var currentOverlayPaneText = createOverlayPaneText();

// $('#overlayPane').html(currentOverlayPaneText);

// var limit = 3;
// $('input.overlayCheckboxes').on('change', function(evt) {
//    if ($("input[name='DestinationTypes']:checked").length > limit) {
//       this.checked = false;
//       alert("Please select only your top three destination types.");
//    }
// });

// $('#participateButton').click(function() {
//   overlayPaneClose();
// });
// $('#instructionsCloseButton').click(function() {
//   overlayPaneClose();
// });

function overlayPaneClose() {
  var selectedCheckboxes = $('input[name="DestinationTypes"]:checked');
  for (var i = 0; i < selectedCheckboxes.length; i++) {
    surveyTopThree.push(selectedCheckboxes[i].value);
  }

  emailAddress = $('#surveyEmailInput').val();
  $('#overlayPane').addClass('d-none');
}
