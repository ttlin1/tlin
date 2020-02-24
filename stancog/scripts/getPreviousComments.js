//////////////////////////////////////////////// GET DATA

var c_i = c.m.c_i;
var a_k = c.m.a_k;

var dd = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

var sc = "https://www.googleapis.com/auth/spreadsheets.readonly";

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

handleClientLoad();

function initClient() {
  gapi.client.init({
    apiKey: a_k,
    clientId: c_i,
    discoveryDocs: dd,
    scope: sc
  }).then(function() {
    getDrawingComments();
  });
}

function styleComment() {
  var currentStyle = {
    weight: 5,
    opacity: 0.8,
    color: '#174759',
    dashArray: "10 10"
  }

  return currentStyle
}

var circleStyle = {
  radius: 5,
  fillColor: "#174759",
  color: "#000",
  weight: 0.25,
  opacity: 0.8,
  fillOpacity: 0.8
};

function createCommentPopup(feature, layer) {

  var popupText = "";
  var currentDrawingType = feature.properties["Drawing Type"];

  currentDrawingType = currentDrawingType == "CompleteStreets" ? currentDrawingType = "Complete Streets" : currentDrawingType;

  popupText =   `<div class="container p-2>
                <p class="text-center"><strong>User-Submitted Drawing</strong><p>
                <p>
                  <strong>Project Type</strong>: ${currentDrawingType}<br>
                  `;
  
  if (currentDrawingType == "Bikeway") {
    popupText += `<strong>Recommended Bikeway Type</strong>: ${feature.properties["What kind of bikeway should this route be?"]}<br>`
  }

  popupText += `<strong>Comments</strong>: ${feature.properties["Comments"]}<br>
                <strong>Commenter Name</strong>: ${feature.properties["Commenter Name"]}<br>
                <strong>Commenter Jurisdiction</strong>: ${feature.properties["Commenter Jurisdiction"]}
                </p></div>`

  var popup = L.popup({ closeButton: false }).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(popupText);

  layer.on('mouseover', function (e) {
    this.setStyle({'weight': 10});
  });

  layer.on('mouseout', function (e) {
    this.setStyle({'weight': 5});
  });

  layer.on('click', function (e) {

  });
}

function getDrawingComments() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: c.s.d,
    range: 'Drawing Comments!A1:D',
  }).then(function(response) {
    var values = response.result.values;
    var headers = values[0];

    previousDrawingArray = [];

    for (var i = 1; i < values.length; i++){
      var shapeValue = values[i][headers.indexOf("Shape")];

      var feature = JSON.parse(shapeValue);

      previousDrawingArray.push(feature);
    }

    previousDrawing = L.geoJson(previousDrawingArray, {
      style: styleComment,
      onEachFeature: createCommentPopup
    });
  });
}

function createDrawingComments() {
  if (overlaysIDs[6] != -1) {
    overlays.removeLayer(overlaysIDs[6]);
    overlaysIDs[6] = -1;
  }

  if ($('#viewComments').prop('checked')) {
    overlays.addLayer(previousDrawing).addTo(map);
    overlaysIDs[6] = previousDrawing._leaflet_id;
  }
}
