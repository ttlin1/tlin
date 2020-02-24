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
    getLocationComments();
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
      var key = values[i][locationHeaders.indexOf("Layer")] + "," + values[i][locationHeaders.indexOf("FID")];

      var locationCommentsKeys = Object.keys(locationComments);

      if ($.inArray(key, locationCommentsKeys) == -1) {
        locationComments[key] = [];
      }

      locationComments[key].push([values[i][locationHeaders.indexOf("Comment")], values[i][locationHeaders.indexOf("Commenter Name")]]);
    }
  });
}