
function getLocationsDataJson(inJsonFile) {

  $.ajax({
    url: inJsonFile,
    dataType: 'json',
    async: false,
    success: function (data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        var tdgRec = feature.properties.tdg_rec;

        if ($.inArray(tdgRec, Object.keys(symbologyDict)) > -1 ) {
          proposedArray[tdgRec].push(feature);
        } else if (feature.properties.bike_class != null && feature.properties.class_stat == "EXISTING") {
          existingArray[feature.properties.bike_class].push(feature);
        }
      }
    }
  });
}

function getLocationsDataCsv(inCsvFile) {
  $.ajax({
    type: "GET",
    url: inCsvFile,
    dataType: "text",
    async: false,
    success: function(data) {
      var allTextLines = data.split(/\r\n|\n/);
      var headers = allTextLines[0].split(',');

      headers = headers.filter(header => header != "");

      for (var i = 1; i < allTextLines.length; i++) {
        var currentRow = allTextLines[i].split(',');

        var currentStatus = currentRow[headers.indexOf("Status")];
        var currentFeature = {
                              "type":"Feature",
                              "geometry":{
                                "type":"Point",
                                "coordinates": null
                              },
                              "properties": {}
                            };
                          
        for (var j = 0; j < headers.length; j++) {
          if ($.inArray(headers[j], ["X-Coordinate", "Y-Coordinate"]) == -1) {
            currentFeature.properties[headers[j]] = currentRow[headers.indexOf(headers[j])];
          }

          if ($.inArray(headers[j], headerToArrayDictKeys) > -1) {
            if (headers[j] != "Batch Number") {
              if ($.inArray(currentRow[headers.indexOf(headers[j])], headerToArrayDict[headers[j]]) == -1) {
                headerToArrayDict[headers[j]].push(currentRow[headers.indexOf(headers[j])]);
              }
            } else {
              var batches = currentRow[headers.indexOf(headers[j])].split(",");

              for (var batch = 0; batch < batches.length; batch++) {
                if ($.inArray(batches[batch], headerToArrayDict[headers[j]]) == -1) {
                  headerToArrayDict[headers[j]].push(batches[batch]);
                }
              }
            }

          }
        }

        currentFeature.geometry.coordinates = [parseFloat(currentRow[headers.indexOf("X-Coordinate")]), parseFloat(currentRow[headers.indexOf("Y-Coordinate")])];

        switch (currentStatus){
          case "Existing":
            allStations["Existing"].push(currentFeature);
            break;
          case "Installed":
            allStations["Installed"].push(currentFeature);
            break;
          case "Proposed":
            allStations["Proposed"].push(currentFeature);
            break;      
          case "Rejected":
            allStations["Rejected"].push(currentFeature);
            break;   
        }
      }
    }
  });
}

// getLocationsDataCsv('csv/locations.csv')

function getLocationsDataSheet(in_sheet) {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: in_sheet,
    range: 'DO NOT TOUCH: Full Database!A1:DK',
  }).then(function(response) {
    var values = response.result.values;
    var headers = values[1];

    for (var i = 2; i < values.length; i++){
      var currentStatus = values[i][headers.indexOf("Status")];
      var currentFeature = {
                            "type":"Feature",
                            "geometry":{
                              "type":"Point",
                              "coordinates": null
                            },
                            "properties": {}
                          };

      symbologyDictKeys = Object.keys(symbologyDict);

      stationIDtoName[values[i][headers.indexOf("BTS Site Number")]] = values[i][headers.indexOf("TD Name")];

      // if ($.inArray(currentStatus, symbologyDictKeys) == -1) {
      //   var colorIndex;

      //   if (symbologyDictKeys.length == 0) {
      //     colorIndex = 0;
      //   } else {
      //     colorIndex = symbologyDictKeys.length + 1;
      //   }

      //   symbologyDict[currentStatus] = colors[colorIndex];

      //   allStations[currentStatus] = [];
      // }
      if ($.inArray(currentStatus, Object.keys(allStations)) == -1) {
        allStations[currentStatus] = [];
      }

      for (var j = 0; j < headers.length; j++) {
        if ($.inArray(headers[j], ["Y-coordinate", "X-coordinate"]) == -1) {
          currentFeature.properties[headers[j]] = values[i][headers.indexOf(headers[j])];
        }

        if ($.inArray(headers[j], headerToArrayDictKeys) > -1) {
          if (headers[j] != "Batch Number") {
            if ($.inArray(values[i][headers.indexOf(headers[j])], headerToArrayDict[headers[j]]) == -1) {
              headerToArrayDict[headers[j]].push(values[i][headers.indexOf(headers[j])]);
            }
          } else {
            var currentBatch = values[i][headers.indexOf(headers[j])];

            if (currentBatch != undefined && currentBatch != "") {
              var batches = currentBatch.split(",");
              for (var batch = 0; batch < batches.length; batch++) {
                var currentBatchNum = batches[batch].replace(" ", "")

                if ($.inArray(currentBatchNum, headerToArrayDict[headers[j]]) == -1) {
                  headerToArrayDict[headers[j]].push(currentBatchNum);
                }
              }
            } else {
              if ($.inArray("", headerToArrayDict[headers[j]]) == -1) {
                headerToArrayDict[headers[j]].push("");
              }
            }
          }
        }
      }

      if (currentStatus != "Removed from consideration") {
        streetAutocompleteDict[values[i][headers.indexOf("TD Name")]] = [currentStatus, values[i][headers.indexOf("TD Site Number")]];
      }

      currentFeature.geometry.coordinates = [parseFloat(values[i][headers.indexOf("X-coordinate")]), parseFloat(values[i][headers.indexOf("Y-coordinate")])];

      allStations[currentStatus].push(currentFeature);
    }

    //////////////////////////////////////////////// LEGEND

    var legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function () {
      this._div = L.DomUtil.create('div', 'legendDiv');
      this.initializeInfo();
      return this._div;
    };

    var currentLegendText = '<div class="container p-2 d-none d-sm-block">';

    symbologyDictKeys = Object.keys(symbologyDict);

    for (var i = 0; i < symbologyDictKeys.length; i++) {

      activeExisting.push(symbologyDictKeys[i]);

      currentLegendText += `    
        <div class="row">
          <div class="col d-inline-flex flex-row align-items-center legendItem ExistingLegendItems" id="${symbologyDictKeys[i].replace(/ /g, "_")}_0" style="cursor: pointer;" onclick="toggleLayer('${symbologyDictKeys[i]}', 0)">
            <span style="background-color: ${symbologyDict[symbologyDictKeys[i]]}; display: block; height: 5px; width: 5px; border-radius: 2px;"></span>
            <span class="pl-2">${symbologyDictKeys[i]}</span>
          </div>
        </div>`;
    }

    currentLegendText += '</div>';

    legend.initializeInfo = function () {
      this._div.innerHTML = currentLegendText;
    }

    legend.addTo(map);

    createSelections();
    createFeaturesWithQuery();

    $("#Removed_from_consideration_0").trigger("click");
  });
};

function getSubmittalData(in_sheet) {
    gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: in_sheet,
    range: 'Submittal Tracking Matrix!A1:L',
  }).then(function(response) {
    var values = response.result.values;
    var headers = values[1];

    for (var i = 2; i < values.length; i++){
      var siteNumber = values[i][headers.indexOf("TD Site Number")];
      submittalTrackingKeys = Object.keys(submittalTracking);

      if ($.inArray(siteNumber, submittalTrackingKeys) == -1) {
        submittalTracking[siteNumber] = {};
      }

      for (var j = 0; j < headers.length; j++) {
        if (headers[j] != "TD Site Number") {
          submittalTracking[siteNumber][headers[j]] = values[i][headers.indexOf(headers[j])];
        }
      }
    }
  });
}

function getCreds(in_sheet) {
    gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: in_sheet,
    range: 'Login Credentials!A1:B',
  }).then(function(response) {
    var values = response.result.values;

    a = values[1][0];
    b = values[1][1];

  });
}

var c_i = '1096764346798-03u4s3fphjvgmpbpr3hf7gags9tt4vgp.apps.googleusercontent.com';
var a_k = 'AIzaSyAnQUtLMfKlqquk87var6Oz-wtNhnLLaxU';

var dd = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

var sc = "https://www.googleapis.com/auth/spreadsheets.readonly";

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: a_k,
    clientId: c_i,
    discoveryDocs: dd,
    scope: sc
  }).then(function() {
    getLocationsDataSheet('1eqGuqlpaG6ocv8FCozkmNf_diPTmP41hjerZUfOw3TU');
    getSubmittalData('1eqGuqlpaG6ocv8FCozkmNf_diPTmP41hjerZUfOw3TU');
    getCreds('1eqGuqlpaG6ocv8FCozkmNf_diPTmP41hjerZUfOw3TU');
  });
}

handleClientLoad();

function cdStyle() {
  return {
    fillColor: '#fff',
    fillOpacity: 0,
    color: '#000',
    opacity: 1,
    weight: 0.25
  }
}

function loadCouncilDistricts(inJsonFile) {
  var cdArray = [];

  $.ajax({
    url: inJsonFile,
    dataType: 'json',
    async: false,
    success: function (data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        cdArray.push(feature);
      }
    }
  });

  councilDistrictLayer = L.geoJSON(cdArray, {
    style: cdStyle,
    interactive: false
  });

  overlays.addLayer(councilDistrictLayer).addTo(map);
  overlaysIDs[4] = councilDistrictLayer._leaflet_id;

  councilDistrictLayer.bringToBack();
}

function loadOdLinesFile(inJsonFile, inArray, inDict) {
  
  $.ajax({
    url: inJsonFile,
    dataType: 'json',
    async: false,
    success: function (data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];

        if (feature.properties.hasOwnProperty('origin_station')) {
          var originStation = (feature.properties.origin_station).toString();
          var destStation = (feature.properties.destination_station).toString();
        } else {
          var originStation = (feature.properties.origin_hex).toString();
          var destStation = (feature.properties.destination_hex).toString();
        }

        var currentLineId = (feature.properties.id).toString();

        var inDictKeys = Object.keys(inDict);
        if ($.inArray(originStation, inDictKeys) == -1) {
          inDict[originStation] = {"Origin": [], "Destination": []};
        }
        if ($.inArray(destStation, inDictKeys) == -1) {
          inDict[destStation] = {"Origin": [], "Destination": []};
        }
        
        var currentOriginList = Object.keys(inDict[originStation]["Origin"]);
        var currentDestList = Object.keys(inDict[destStation]["Destination"]);

        if ($.inArray(currentLineId, currentOriginList) == -1) {
          inDict[originStation]["Origin"].push(currentLineId);
        }

        if ($.inArray(currentLineId, currentDestList) == -1) {
          inDict[destStation]["Destination"].push(currentLineId);
        }

        odIdToStations[currentLineId] = [originStation, destStation];
        stationsToOdId[[originStation, destStation]] = currentLineId;

        odIdToRidership[currentLineId] = feature.properties.count_all;

        inArray.push(feature);
      }
    }
  });
}

function loadJsonFile(inJsonFile, inArray) {
  
  $.ajax({
    url: inJsonFile,
    dataType: 'json',
    async: false,
    success: function (data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        inArray.push(feature);
      }
    }
  });

}

function loadSmartHexFile(inJsonFile, inDict) {
  
  $.ajax({
    url: inJsonFile,
    dataType: 'json',
    async: false,
    success: function (data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];

        var originStation = (feature.properties.origin_hex).toString();
        var destStation = (feature.properties.destination_hex).toString();
        
        var inDictKeys = Object.keys(inDict);
        if ($.inArray(originStation, inDictKeys) == -1) {
          inDict[originStation] = {"Origin": {}, "Destination": {}};
          inDict[originStation]["Origin"] = {};
          inDict[originStation]["Destination"]= {};
        }
        if ($.inArray(destStation, inDictKeys) == -1) {
          inDict[destStation] = {"Origin": {}, "Destination": {}};
          inDict[destStation]["Destination"] = {};
          inDict[destStation]["Origin"] = {};
        }

        var currentOriginList = Object.keys(inDict[originStation]["Origin"]);
        var currentDestList = Object.keys(inDict[destStation]["Destination"]);

        if ($.inArray(destStation, currentOriginList) == -1) {
          inDict[originStation]["Origin"][destStation] = feature.properties.count;
        }

        if ($.inArray(originStation, currentDestList) == -1) {
          inDict[destStation]["Destination"][originStation] = feature.properties.count;
        }
      }
    }
  });
}

function loadHexGrid(inJsonFile, inArray) {
  
  $.ajax({
    url: inJsonFile,
    dataType: 'json',
    async: false,
    success: function (data) {
      var suitabilityTypes = Object.keys(hexGridVisDict);

      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        inArray.push(feature);

        for (var j = 0; j < suitabilityTypes.length; j++) {
          if (feature.properties[suitabilityTypes[j]] != null) {
            if ($.inArray(Number(feature.properties[suitabilityTypes[j]]), hexGridVisDict[suitabilityTypes[j]]) == -1) {
              hexGridVisDict[suitabilityTypes[j]].push(Number(feature.properties[suitabilityTypes[j]]));
            }
          }
        }
      }
    }
  });

  var suitabilityTypes = Object.keys(hexGridVisDict);

  for (var j = 0; j < suitabilityTypes.length; j++) {
    hexGridVisDict[suitabilityTypes[j]].sort(function(a, b){return a-b});
  }
}

loadCouncilDistricts("json/Neighborhood_Council_Boundaries_2018.json");
loadOdLinesFile("json/od_lines.geojson", odLinesArray, odLinesDict);
loadOdLinesFile("json/od_lines_hex_smart.geojson", smartLinesArray, smartLinesDict);
loadJsonFile('json/smart_hexes.geojson', smartHexArray);
loadSmartHexFile('json/od_lines_hex_smart.geojson', smartHexDict);
loadHexGrid('json/hex_grid.geojson', suitabilityArray);
