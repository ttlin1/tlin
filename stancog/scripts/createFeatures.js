function styleCorridors(feature) {
  var currentStyle = {
    weight: 5,
    opacity: 0.8,
  }

  var status;
  var facType;

  if (feature.properties.ex_bike != null) {
    status = "Existing";
    facType = feature.properties.ex_bike;
  }

  if (feature.properties.old_rec_bike != null) {
    status = "Proposed";
    facType = feature.properties.old_rec_bike;
  }

  if (status == "Proposed") {
    currentStyle["dashArray"] = ["1 10"];
    if ($.inArray(facType, Object.keys(symbologyDict)) > -1) {
      currentStyle["color"] = symbologyDict[facType];
    } 
  } else if (status == "Existing") {
    currentStyle["color"] = existingSymbologyDict[facType];
  }

  return currentStyle
}

function createFeatures(inputNum) {
  if (overlaysIDs[inputNum] != -1) {
    overlays.removeLayer(overlaysIDs[inputNum]);
    overlaysIDs[inputNum] = -1;
  }

  if (inputNum == 2) {
    if (overlaysIDs[inputNum + 1] != -1) {
      overlays.removeLayer(overlaysIDs[inputNum + 1]);
      overlaysIDs[inputNum + 1] = -1;
    }
  }

  switch (inputNum) {
    case 0:
      var currentExisting = [];

      for (var i = 0; i < activeExisting.length; i++) {
        for (var j = 0; j < existingArray[activeExisting[i]].length; j++) {
          currentExisting.push(existingArray[activeExisting[i]][j]);

          // var currentProjectId = existingArray[activeExisting[i]][j].properties.id;
          // currentProjectId = (currentProjectId ? currentProjectId.toString() : currentProjectId);

          // if ($.inArray(currentProjectId, Object.keys(currentAutocompleteDict)) == -1) {
          //   currentAutocompleteDict[currentProjectId] = [existingArray[activeExisting[i]][j].geometry.coordinates[0][0], existingArray[activeExisting[i]][j].geometry.coordinates[0][1]];
          // }
        }
      }

      existing = L.geoJSON(currentExisting, {
        style: styleCorridors,
        onEachFeature: createSurvey
      });

      overlays.addLayer(existing).addTo(map);
      overlaysIDs[inputNum] = existing._leaflet_id;
      break;

    case 1:
      var currentProposed = [];
      for (var i = 0; i < activeProposed.length; i++) {
        for (var j = 0; j < proposedArray[activeProposed[i]].length; j++) {
          currentProposed.push(proposedArray[activeProposed[i]][j]);

          // var currentProjectId = proposedArray[activeProposed[i]][j].properties.proj_id;
          // currentProjectId = (currentProjectId ? currentProjectId.toString() : currentProjectId);

          // if ($.inArray(currentProjectId, Object.keys(currentAutocompleteDict)) == -1) {
          //   currentAutocompleteDict[currentProjectId] = [proposedArray[activeProposed[i]][j].geometry.coordinates[0][0], proposedArray[activeProposed[i]][j].geometry.coordinates[0][1]];
          // }
        }
      }

      proposed = L.geoJSON(currentProposed, {
        style: styleCorridors,
        onEachFeature: createSurvey
      });

      overlays.addLayer(proposed).addTo(map);
      overlaysIDs[inputNum] = proposed._leaflet_id;
      break;
  }
}

// add bike layers to map on load
for (var i = 0; i < 2; i++) {
  createFeatures(i);
}

function tabToggleLayer(inputMode) {
  sidebarControl.hide();

  var overlayArrayNumbers = [0, 1, 2, 3, 8, 9, 10];

  for (var i = 0; i < overlayArrayNumbers.length; i++){
    var element = overlayArrayNumbers[i];
    if (overlaysIDs[element] != -1) {
      overlays.removeLayer(overlaysIDs[element]);
      overlaysIDs[element] = -1;
    }
  };

  if (inputMode == "Bike") {
    createFeatures(0);
    createFeatures(1);
  } else if (inputMode == "Ped") {
    createFeatures(2);
  } else if (inputMode == "Parking") {
    createFeatures(8);
  } else if (inputMode == "Lane") {
    createFeatures(9);
  } else if (inputMode == "Backbone") {
    createFeatures(10);
  }
}
