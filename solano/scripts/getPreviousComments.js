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

function getLocationComments() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: c.s.l,
    range: 'Comments!A1:I',
  }).then(function(response) {
    var values = response.result.values;
    var locationHeaders = values[0];

    for (var i = 1; i < values.length; i++){
      var key = values[i][locationHeaders.indexOf("Project ID")];

      var previousCommentsKeys = Object.keys(previousComments);

      if ($.inArray(key, previousCommentsKeys) == -1) {
        previousComments[key] = [];
      }

      previousComments[key].push([values[i][locationHeaders.indexOf("Comment")], 
                                  values[i][locationHeaders.indexOf("Commenter Name")], 
                                  values[i][locationHeaders.indexOf("Commenter Jurisdiction")]]);
    }
  });
}

function styleComment() {
  var currentStyle = {
    weight: 5,
    opacity: 0.8,
    color: 'cyan'
  }

  return currentStyle
}

var circleStyle = {
  radius: 5,
  fillColor: "cyan",
  color: "#000",
  weight: 0.25,
  opacity: 0.8,
  fillOpacity: 0.8
};

function createCommentPopup(feature, layer) {

  var popupText = "";

  popupText =   `
                <p><strong>User-Submitted Drawing</strong><br>
                  <strong>Prioritization</strong>: ${feature.properties.Prioritization}<br>
                  <strong>Requires Further Study</strong>: ${feature.properties["Requires Further Study"]}<br>
                  <strong>Comment</strong>: ${feature.properties.Comment}<br>
                  <strong>Commenter Name</strong>: ${feature.properties["Commenter Name"]}<br>
                  <strong>Commenter Jurisdiction</strong>: ${feature.properties["Commenter Jurisdiction"]}
                </p>
                  `;

  var popup = L.popup({ closeButton: false }).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  // layer.bindTooltipDelayed(popupText);

  layer.on('mouseover', function (e) {
    map.closePopup();
    this.openPopup();
  });

  layer.on('mouseout', function (e) {
    map.closePopup();
  });

  layer.on('click', function (e) {
    map.closePopup();
    this.openPopup();
  });
}

function getDrawingComments() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: c.s.d,
    range: 'Drawing!A1:H',
  }).then(function(response) {
    var values = response.result.values;
    var headers = values[0];

    previousDrawingArray = [];
    previousDrawingPointsArray = [];

    for (var i = 1; i < values.length; i++){
      var shapeValue = values[i][headers.indexOf("Shape")];

      var feature = JSON.parse(shapeValue);
      
      for (var j = 0; j < headers.length; j++) {
        feature.properties[headers[j]] = values[i][j];
      }

      if (feature.geometry.type == "Point") {
        previousDrawingPointsArray.push(feature);
      } else {
        previousDrawingArray.push(feature);
      }
    }

    if (overlaysIDs[6] != -1) {
      overlays.removeLayer(overlaysIDs[6]);
      overlaysIDs[6] = -1;
    }

    if (overlaysIDs[7] != -1) {
      overlays.removeLayer(overlaysIDs[7]);
      overlaysIDs[7] = -1;
    }

    previousDrawing = L.geoJson(previousDrawingArray, {
      style: styleComment,
      onEachFeature: createCommentPopup
    });

    previousDrawingPoints = L.geoJson(previousDrawingPointsArray, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, circleStyle)
      },
      onEachFeature: createCommentPopup
    });

    overlays.addLayer(previousDrawing).addTo(map);
    overlaysIDs[6] = previousDrawing._leaflet_id;

    overlays.addLayer(previousDrawingPoints).addTo(map);
    overlaysIDs[7] = previousDrawingPoints._leaflet_id;

  });
}
