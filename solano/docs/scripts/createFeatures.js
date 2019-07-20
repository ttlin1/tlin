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
          try {
            if (currentFeature.geometry.type != "Point") {
              currentPedestrian.push(currentFeature);
            } else {
              currentPedestrianPoints.push(currentFeature);
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
  }
}

// add bike layers to map on load
for (var i = 0; i < 2; i++) {
  createFeatures(i);
}

function tabToggleLayer(inputMode) {
  sidebarControl.hide();

  for (var i = 0; i < overlaysIDs.length - 2; i++){
    if (overlaysIDs[i] != -1) {
      overlays.removeLayer(overlaysIDs[i]);
      overlaysIDs[i] = -1;
    }
  }

  if (inputMode == "Bike") {
    createFeatures(0);
    createFeatures(1);

  } else if (inputMode == "Ped") {
    createFeatures(2);
  }
}
