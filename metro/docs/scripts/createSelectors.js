var optionsCount = {};

function sortNumber(a, b) {
  return a - b;
}

function styleCorridors(feature, latlng) {
  var currentStyle = {
    radius: 6,
    color: "#fff",
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.8
  };

  var inType = feature.properties.Status;
  currentStyle['fillColor'] = symbologyDict[inType];

  var currentCircle = new L.circleMarker(latlng, currentStyle);

  return currentCircle;
}

function createSelections() {
  for (var i = 0; i < headerToArrayDictKeys.length; i++) {
    var currentSelectorText = `<h6>Query by ${headerToArrayDictKeys[i]}</h6><select class="custom-select" multiple>`;
    headerToArrayDict[headerToArrayDictKeys[i]] = headerToArrayDict[headerToArrayDictKeys[i]].filter(function(a){return a != null});

    headerToArrayDict[headerToArrayDictKeys[i]].sort();

    // if (headerToArrayDictKeys[i] == "TD Site Number") {
    //   headerToArrayDict[headerToArrayDictKeys[i]] = headerToArrayDict[headerToArrayDictKeys[i]].map(x => parseInt(x));
    //   headerToArrayDict[headerToArrayDictKeys[i]] = headerToArrayDict[headerToArrayDictKeys[i]].filter(function(a){ if (!(isNaN(a))) { return a}});
    //   headerToArrayDict[headerToArrayDictKeys[i]].sort(sortNumber);
    // }

    for (var j = 0; j < headerToArrayDict[headerToArrayDictKeys[i]].length; j++) {

      var titleId = `Option_${headerToArrayDict[headerToArrayDictKeys[i]][j].toString().replace(/ /g, "_")}_Title`;
      if (headerToArrayDictKeys[i] != "TD Site Number") {
        currentSelectorText += `<option value="${headerToArrayDict[headerToArrayDictKeys[i]][j]}" id="${titleId}" selected>${headerToArrayDict[headerToArrayDictKeys[i]][j]}</option>"></div>`;
        optionsCount[headerToArrayDict[headerToArrayDictKeys[i]][j]] = 0;
      } else {
        currentSelectorText += `<option value="${headerToArrayDict[headerToArrayDictKeys[i]][j]}" selected>${headerToArrayDict[headerToArrayDictKeys[i]][j]}</option>"></div>`;
      }
    }

    currentSelectorText += '</select>';

    var currentSelectorId = headerToArrayDictKeys[i].replace(/ /g, "_") + '_Selector';
    $(`#${currentSelectorId}`).html(currentSelectorText);

    $(`#${currentSelectorId}`).click(function(){
      createFeaturesWithQuery();
    });
  }
}

function createFeaturesWithQuery() {
  var optionsCountKeys = Object.keys(optionsCount);
  for (var i = 0; i < optionsCountKeys.length; i++) {
    optionsCount[optionsCountKeys[i]] = 0;
  }

  if (overlaysIDs[0] != -1) {
    overlays.removeLayer(overlaysIDs[0]);
    overlaysIDs[0] = -1;
  }

  stationArray = [];

  var headerToSelectedOptions = {};

  for (var i = 0; i < headerToArrayDictKeys.length; i++) {
    if ($.inArray(headerToArrayDictKeys[i], headerToSelectedOptions) == -1) {
      headerToSelectedOptions[headerToArrayDictKeys[i]] = [];
    }

    $(`#${headerToArrayDictKeys[i].replace(/ /g, "_") + '_Selector'} select option:selected`).each(function() {
      headerToSelectedOptions[headerToArrayDictKeys[i]].push(this.value);
    });
  }

  for (var i = 0; i < activeExisting.length; i++) {
    for (var j = 0; j < allStations[activeExisting[i]].length; j++) {

      var meetsCriteria = true;

      for (var m = 0; m < headerToArrayDictKeys.length; m++) {
        if ($.inArray(allStations[activeExisting[i]][j].properties[headerToArrayDictKeys[m]], headerToSelectedOptions[headerToArrayDictKeys[m]]) == -1) {
          meetsCriteria = false;
        }
      }

      if (meetsCriteria) {
        if (!(isNaN(allStations[activeExisting[i]][j].geometry.coordinates[0])) && !(isNaN(allStations[activeExisting[i]][j].geometry.coordinates[1]))) {

          var pointInPolygonResult = turf.booleanPointInPolygon(turf.point(allStations[activeExisting[i]][j].geometry.coordinates), bboxPolygon);
          if (pointInPolygonResult == true) {
            stationArray.push(allStations[activeExisting[i]][j]);

            for (var n = 0; n < headerToArrayDictKeys.length; n++) {
              if ($.inArray(allStations[activeExisting[i]][j].properties[headerToArrayDictKeys[n]], headerToSelectedOptions[headerToArrayDictKeys[n]]) > -1) {
                optionsCount[allStations[activeExisting[i]][j].properties[headerToArrayDictKeys[n]]] += 1;
              }
            }
          }
        }
      }
    }
  }

  var optionsCountKeys = Object.keys(optionsCount);
  for (var i = 0; i < optionsCountKeys.length; i++) {
    var currentTitleId = 'Option_' + optionsCountKeys[i].replace(/ /g, "_").replace(/\//g, "ForwardSlash") + '_Title';
    $(`#${currentTitleId}`).html(`${optionsCountKeys[i]} (${optionsCount[optionsCountKeys[i]]} Selected)`);
  }

 function sortByStatus(a, b) {
   if (a.properties.Status < b.properties.Status) return -1;
   if (a.properties.Status > b.properties.Status) return 1;
   return 0;
 }

 stationArray = stationArray.sort(sortByStatus);

  stations = L.geoJSON(stationArray, {
    pointToLayer: styleCorridors,
    onEachFeature: createSurvey
  });

  overlays.addLayer(stations).addTo(map);
  overlaysIDs[0] = stations._leaflet_id;

  createStationTable();
}


