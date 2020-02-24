function styleCorridors(feature) {
  var currentStyle = {
    weight: 5,
    opacity: 0.8,
  }

  var facType = feature.properties.fac_type;
  var status = feature.properties.Status

  if (status == "Proposed") {
    currentStyle["dashArray"] = ["3 10"];
    if ($.inArray(facType, Object.keys(symbologyDict)) > -1) {
      currentStyle["color"] = symbologyDict[facType];
    } 
  } else if (status == "Existing") {
    currentStyle["color"] = existingSymbologyDict[facType];
  }

  return currentStyle
}

function stylePedestrian(feature) {
  if (feature.geometry.type == "Point") {
    return {
      radius: 5,
      fillColor: pedSymbologyDict[feature.properties.Project_T],
      color: "#000",
      weight: 0.25,
      opacity: 1,
      fillOpacity: 0.8
    }
  } else{
    return {
      weight: 3,
      opacity: 0.8,
      color: pedSymbologyDict[feature.properties.Project_T]
    }
  }
}

function styleParking(feature) {
  var currentStyle = {
    weight: 5,
    opacity: 0.8,
  }

  var parkingImpl = feature.properties.ParkingR;
  currentStyle["color"] = implementationDict[parkingImpl];
  return currentStyle
}

function styleLane(feature) {
  var currentStyle = {
    weight: 5,
    opacity: 0.8,
  }

  var laneImpl = feature.properties.LaneR;
  currentStyle["color"] = implementationDict[laneImpl];
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

          var currentProjectId = existingArray[activeExisting[i]][j].properties.id;
          currentProjectId = (currentProjectId ? currentProjectId.toString() : currentProjectId);

          if ($.inArray(currentProjectId, Object.keys(currentAutocompleteDict)) == -1) {
            currentAutocompleteDict[currentProjectId] = [existingArray[activeExisting[i]][j].geometry.coordinates[0][0], existingArray[activeExisting[i]][j].geometry.coordinates[0][1]];
          }
        }
      }

      existing = L.geoJSON(currentExisting, {
        style: styleCorridors,
        onEachFeature: createExistingPopup
      });

      overlays.addLayer(existing).addTo(map);
      overlaysIDs[inputNum] = existing._leaflet_id;
      break;

    case 1:
      var currentProposed = [];
      for (var i = 0; i < activeProposed.length; i++) {
        for (var j = 0; j < proposedArray[activeProposed[i]].length; j++) {
          currentProposed.push(proposedArray[activeProposed[i]][j]);

          var currentProjectId = proposedArray[activeProposed[i]][j].properties.Proj_ID;
          currentProjectId = (currentProjectId ? currentProjectId.toString() : currentProjectId);

          if ($.inArray(currentProjectId, Object.keys(currentAutocompleteDict)) == -1) {
            currentAutocompleteDict[currentProjectId] = [proposedArray[activeProposed[i]][j].geometry.coordinates[0][0], proposedArray[activeProposed[i]][j].geometry.coordinates[0][1]];
          }
        }
      }

      proposed = L.geoJSON(currentProposed, {
        style: styleCorridors,
        onEachFeature: createSurvey
      });

      overlays.addLayer(proposed).addTo(map);
      overlaysIDs[inputNum] = proposed._leaflet_id;
      break;
    case 2:
      var currentPedestrian = [];
      var currentPedestrianPoints = [];
      for (var i = 0; i < pedestrianActive.length; i++) {
        for (var j = 0; j < pedestrianArray[pedestrianActive[i]].length; j++) {
          var currentFeature = pedestrianArray[pedestrianActive[i]][j];
          var currentProjectId = pedestrianArray[pedestrianActive[i]][j].properties.Project_ID;
          currentProjectId = (currentProjectId ? currentProjectId.toString() : currentProjectId);

          try {
            if (currentFeature.geometry.type != "Point") {
              currentPedestrian.push(currentFeature);

              if ($.inArray(currentProjectId, Object.keys(currentAutocompleteDict)) == -1) {
                currentAutocompleteDict[currentProjectId] = [pedestrianArray[pedestrianActive[i]][j].geometry.coordinates[0][0], pedestrianArray[pedestrianActive[i]][j].geometry.coordinates[0][1]];
              }
            } else {
              currentPedestrianPoints.push(currentFeature);

              if ($.inArray(currentProjectId, Object.keys(currentAutocompleteDict)) == -1) {
                currentAutocompleteDict[currentProjectId] = [pedestrianArray[pedestrianActive[i]][j].geometry.coordinates[0], pedestrianArray[pedestrianActive[i]][j].geometry.coordinates[1]];
              }
            }
          }
          catch {
            console.log(currentFeature);
          }
        }
      }

      pedestrian = L.geoJSON(currentPedestrian, {
        style: stylePedestrian,
        onEachFeature: createSurvey
      });

      pedestrianPoints = L.geoJSON(currentPedestrianPoints, {
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng);
        },
        style: stylePedestrian,
        onEachFeature: createSurvey
      });

      overlays.addLayer(pedestrian).addTo(map);
      overlaysIDs[inputNum] = pedestrian._leaflet_id;

      overlays.addLayer(pedestrianPoints).addTo(map);
      overlaysIDs[inputNum + 1] = pedestrianPoints._leaflet_id;
      break;

    case 8:
      var currentParking = [];
      for (var i = 0; i < activeParking.length; i++) {
        for (var j = 0; j < parkingArray[activeParking[i]].length; j++) {
          currentParking.push(parkingArray[activeParking[i]][j]);

          var currentProjectId = parkingArray[activeParking[i]][j].properties.Project_ID;
          currentProjectId = (currentProjectId ? currentProjectId.toString() : currentProjectId);

          if ($.inArray(currentProjectId, Object.keys(currentAutocompleteDict)) == -1) {
            currentAutocompleteDict[currentProjectId] = [parkingArray[activeParking[i]][j].geometry.coordinates[0][0], parkingArray[activeParking[i]][j].geometry.coordinates[0][1]];
          }
        }
      }

      implementationParking = L.geoJSON(currentParking, {
        style: styleParking,
        onEachFeature: createSurvey
      });

      overlays.addLayer(implementationParking).addTo(map);
      overlaysIDs[inputNum] = implementationParking._leaflet_id;
      break;

    case 9:
      var currentLane = [];
      for (var i = 0; i < activeLane.length; i++) {
        for (var j = 0; j < laneArray[activeLane[i]].length; j++) {
          currentLane.push(laneArray[activeLane[i]][j]);

          var currentProjectId = laneArray[activeLane[i]][j].properties.Project_ID;
          currentProjectId = (currentProjectId ? currentProjectId.toString() : currentProjectId);

          if ($.inArray(currentProjectId, Object.keys(currentAutocompleteDict)) == -1) {
            currentAutocompleteDict[currentProjectId] = [laneArray[activeLane[i]][j].geometry.coordinates[0][0], laneArray[activeLane[i]][j].geometry.coordinates[0][1]];
          }
        }
      }

      implementationLane = L.geoJSON(currentLane, {
        style: styleLane,
        onEachFeature: createSurvey
      });

      overlays.addLayer(implementationLane).addTo(map);
      overlaysIDs[inputNum] = implementationLane._leaflet_id;
      break;
  }

  $( "#projectIdSearch" ).autocomplete({
    source: Object.keys(currentAutocompleteDict),
    open: function() {
        $(this).autocomplete("widget")
               .appendTo("#searchResults")
               .css("position", "static");
    }
  });

  $("#projectIdSearch").on("autocompleteselect", function(event, ui) {
    map._layers[ui.item.label].fire('click');
    var layer = map._layers[ui.item.label];
    map.fitBounds(layer.getBounds()); 
  });
}

// add bike layers to map on load
for (var i = 0; i < 2; i++) {
  createFeatures(i);
}

function tabToggleLayer(inputMode) {
  sidebarControl.hide();

  var overlayArrayNumbers = [0, 1, 2, 3, 8, 9];

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
  }
}
