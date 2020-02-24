var optionsCount = {};

function sortNumber(a, b) {
  return a - b;
}

function returnInactive(inputStationName) {
  if (typeof inputStationName == 'undefined') {
    return "Inactive";
  } else {
    return inputStationName
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
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

    if (headerToArrayDictKeys[i] == "CD") {
      headerToArrayDict[headerToArrayDictKeys[i]] = headerToArrayDict[headerToArrayDictKeys[i]].map(x => parseInt(x));
      headerToArrayDict[headerToArrayDictKeys[i]] = headerToArrayDict[headerToArrayDictKeys[i]].filter(function(a){ if (!(isNaN(a))) { return a}});
      headerToArrayDict[headerToArrayDictKeys[i]].sort(sortNumber);
    }

    for (var j = 0; j < headerToArrayDict[headerToArrayDictKeys[i]].length; j++) {

      var titleId = `Option_${headerToArrayDict[headerToArrayDictKeys[i]][j].toString().replace(/ /g, "_")}_Title`;
      if (headerToArrayDictKeys[i] != "TD Site Number") {
        if (headerToArrayDictKeys[i] != "Batch Number") {
          currentSelectorText += `<option value="${headerToArrayDict[headerToArrayDictKeys[i]][j]}" id="${titleId}" selected>${headerToArrayDict[headerToArrayDictKeys[i]][j]}</option>"></div>`;
          optionsCount[headerToArrayDict[headerToArrayDictKeys[i]][j]] = 0;
        } else {
          titleId = `Batch${headerToArrayDict[headerToArrayDictKeys[i]][j]}_Title`;
          currentSelectorText += `<option value="Batch${headerToArrayDict[headerToArrayDictKeys[i]][j]}" id="${titleId}" selected>${headerToArrayDict[headerToArrayDictKeys[i]][j]}</option>"></div>`;
          optionsCount[`Batch${headerToArrayDict[headerToArrayDictKeys[i]][j]}`] = 0;
        }
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

    if (headerToArrayDictKeys[i] != "Batch Number") {
      $(`#${headerToArrayDictKeys[i].replace(/ /g, "_") + '_Selector'} select option:selected`).each(function() {
        headerToSelectedOptions[headerToArrayDictKeys[i]].push(this.value);
      });
    } else {
      $(`#${headerToArrayDictKeys[i].replace(/ /g, "_") + '_Selector'} select option:selected`).each(function() {
        var current = this.value;
        headerToSelectedOptions[headerToArrayDictKeys[i]].push(current.replace("Batch", ""));
      });
    }
  }


  for (var i = 0; i < activeExisting.length; i++) {
    if ($.inArray(activeExisting[i], Object.keys(allStations)) > -1) {
      for (var j = 0; j < allStations[activeExisting[i]].length; j++) {

        var meetsCriteria = true;

        for (var m = 0; m < headerToArrayDictKeys.length; m++) {
          if (headerToArrayDictKeys[m] != "Batch Number") {
            if ($.inArray(allStations[activeExisting[i]][j].properties[headerToArrayDictKeys[m]], headerToSelectedOptions[headerToArrayDictKeys[m]]) == -1) {
              meetsCriteria = false;
            }
          } else {
            var anyInBatch = false;

            var batchArray = allStations[activeExisting[i]][j].properties[headerToArrayDictKeys[m]];

            if (batchArray == undefined) {
            if (headerToSelectedOptions[headerToArrayDictKeys[m]].includes("")) {
                anyInBatch = true;
              }
            } else {
              if (batchArray.indexOf(",") > -1) {
                batchArray = batchArray.split(",");
                batchArray = batchArray.map(x => x.replace(" ", ""));

                for (var b = 0; b < batchArray.length; b++) {
                  if ($.inArray(batchArray[b], headerToSelectedOptions[headerToArrayDictKeys[m]]) > -1) {
                    anyInBatch = true;
                  }
                }
              } else {
                if (headerToSelectedOptions[headerToArrayDictKeys[m]].includes("")) {
                  anyInBatch = true;
                }

                if ($.inArray(batchArray, headerToSelectedOptions[headerToArrayDictKeys[m]]) > -1) {
                  anyInBatch = true;
                }
              }
            }

            if (anyInBatch == false) {
              meetsCriteria = false;
            }
          }
        }

        if (meetsCriteria) {
          if (!(isNaN(allStations[activeExisting[i]][j].geometry.coordinates[0])) && !(isNaN(allStations[activeExisting[i]][j].geometry.coordinates[1]))) {

            var pointInPolygonResult = turf.booleanPointInPolygon(turf.point(allStations[activeExisting[i]][j].geometry.coordinates), bboxPolygon);
            if (pointInPolygonResult == true) {
              stationArray.push(allStations[activeExisting[i]][j]);

              for (var n = 0; n < headerToArrayDictKeys.length; n++) {
                if (headerToArrayDictKeys[n] != "Batch Number") {
                  if ($.inArray(allStations[activeExisting[i]][j].properties[headerToArrayDictKeys[n]], headerToSelectedOptions[headerToArrayDictKeys[n]]) > -1) {
                    optionsCount[allStations[activeExisting[i]][j].properties[headerToArrayDictKeys[n]]] += 1;
                  }
                } else {
                  if (allStations[activeExisting[i]][j].properties[headerToArrayDictKeys[n]] != undefined && allStations[activeExisting[i]][j].properties[headerToArrayDictKeys[n]] != "") {
                    var batchArray = allStations[activeExisting[i]][j].properties[headerToArrayDictKeys[n]];

                    if (batchArray.indexOf(",") > -1) {
                      batchArray = batchArray.split(",");
                      batchArray = batchArray.map(x => x.replace(" ", ""));

                      for (var b = 0; b < batchArray.length; b++) {
                        if ($.inArray(batchArray[b], headerToSelectedOptions[headerToArrayDictKeys[n]]) > -1) {
                          optionsCount["Batch" + batchArray[b]] += 1;
                        }

                      }
                    } else {
                      if ($.inArray(batchArray, headerToSelectedOptions[headerToArrayDictKeys[n]]) > -1) {
                        optionsCount["Batch" + batchArray] += 1;
                      }
                    }

                  } else {
                    optionsCount["Batch"] += 1;
                  }
                }
              }
            }
          }
        }
      }
    }
  }


  var optionsCountKeys = Object.keys(optionsCount);
  for (var i = 0; i < optionsCountKeys.length; i++) {
    if (optionsCountKeys[i].indexOf("Batch") == -1) {
      var currentTitleId = 'Option_' + optionsCountKeys[i].replace(/ /g, "_").replace(/\//g, "ForwardSlash") + '_Title';
      $(`#${currentTitleId}`).html(`${optionsCountKeys[i]} (${optionsCount[optionsCountKeys[i]]} Selected)`);
    } else {
      var currentTitleId = optionsCountKeys[i].replace(/ /g, "_").replace(/\//g, "ForwardSlash") + '_Title';
      if (optionsCountKeys[i] != "Batch") {
        $(`#${currentTitleId}`).html(`${optionsCountKeys[i].replace("Batch", "")} (${optionsCount[optionsCountKeys[i]]} Selected)`);
      } else {
        $(`#${currentTitleId}`).html(`No Batch Number (${optionsCount["Batch"]} Selected)`);
      }

    }
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

function createOdLines(inStationNumber){
  if (overlaysIDs[2] != -1) {
    overlays.removeLayer(overlaysIDs[2]);
    overlaysIDs[2] = -1;
  }

  ridershipToLineDict = {};
  var tableDict = {}; // [origin, destination] = count

  ridershipByHour = {
                          0: 0,
                          1: 0,
                          2: 0,
                          3: 0,
                          4: 0,
                          5: 0,
                          6: 0,
                          7: 0,
                          8: 0,
                          9: 0,
                          10: 0,
                          11: 0,
                          12: 0,
                          13: 0,
                          14: 0,
                          15: 0,
                          16: 0,
                          17: 0,
                          18: 0,
                          19: 0,
                          20: 0,
                          21: 0,
                          22: 0,
                          23: 0};
  ridershipByDay = {'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0};

  // var idFilter = function (feature) {
  //   var currentId = (feature.properties.id).toString();
  //   var selectedIdList = [];

  //   $( "#fromStationSelect option:selected" ).each(function() {
  //     selectedIdList.push(stationsToOdId[[$( this ).val(), inStationNumber]]);
  //   });

  //   $( "#toStationSelect option:selected" ).each(function() {
  //     selectedIdList.push(stationsToOdId[[inStationNumber, $( this ).val()]]);
  //   });

  //   if (selectedIdList.includes(currentId)) {
  //     tableDict[[odIdToStations[currentId][0], odIdToStations[currentId][1]]] = feature.properties.count_all;

  //     // hour

  //     for (var i = 0; i < 24; i++) {
  //       var currentNumber = i.toString().padStart(2, '0');
  //       var nextNumber = (i + 1).toString().padStart(2, '0');
  //       var currentField = `count_hr_${currentNumber}_${nextNumber}`;

  //       ridershipByHour[i] += feature.properties[currentField];
  //     }

  //     // day

  //     var dayDict = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday"};
  //     for (var j = 0; j < 7; j++) {
  //       var dayNumber = j.toString().padStart(2, '0');
  //       var dayField = `count_dow_${dayNumber}`;

  //       ridershipByDay[dayDict[j]] += feature.properties[dayField];
  //     }

  //     return true;
  //   }
  // }

  // iterating through the array instead of idFilter to see if this is faster

  var selectedOdArray = [];
  for (var o = 0; o < odLinesArray.length; o++) {
    var feature = odLinesArray[o];

    var currentId = (feature.properties.id).toString();
    var selectedIdList = [];

    $( "#fromStationSelect option:selected" ).each(function() {
      selectedIdList.push(stationsToOdId[[$( this ).val(), inStationNumber]]);
    });

    $( "#toStationSelect option:selected" ).each(function() {
      selectedIdList.push(stationsToOdId[[inStationNumber, $( this ).val()]]);
    });

    if (selectedIdList.includes(currentId)) {
      tableDict[[odIdToStations[currentId][0], odIdToStations[currentId][1]]] = feature.properties.count_all;

      // hour

      for (var i = 0; i < 24; i++) {
        var currentNumber = i.toString().padStart(2, '0');
        var nextNumber = (i + 1).toString().padStart(2, '0');
        var currentField = `count_hr_${currentNumber}_${nextNumber}`;

        ridershipByHour[i] += feature.properties[currentField];
      }

      // day

      var dayDict = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday"};
      for (var j = 0; j < 7; j++) {
        var dayNumber = j.toString().padStart(2, '0');
        var dayField = `count_dow_${dayNumber}`;

        ridershipByDay[dayDict[j]] += feature.properties[dayField];
      }

      selectedOdArray.push(feature);
    }
  }

  function styleRidership(feature, latlng) {
    var ridership = parseInt(feature.properties.count_all) / 10.0;

    var currentStyle = {
      color: '#555',
      opacity: 0.3,
    }

    ridership = (ridership < 3 ? 3 : ridership);
    ridership = (ridership > 20 ? 20 : ridership);

    currentStyle["weight"] = ridership;

    return currentStyle
  }

  function odTooltip(feature, layer) {
    var tooltipText = "";

    var ridershipToLineDictKeysStrings = Object.keys(ridershipToLineDict);
    var ridershipToLineDictKeys = ridershipToLineDictKeysStrings.map(x => parseInt(x));

    if ($.inArray(feature.properties.count_all, ridershipToLineDictKeys) == -1) {
      ridershipToLineDict[feature.properties.count_all] = [];
    }

    ridershipToLineDict[feature.properties.count_all].push(feature.properties.id);

    tooltipText = `
                    <p class="text-center p-2 align-middle">
                      <strong>Origin Station</strong>: ${returnInactive(stationIDtoName[feature.properties.origin_station])} (BTS ID: ${feature.properties.origin_station})<br>
                      <strong>Destination Station</strong>: ${returnInactive(stationIDtoName[feature.properties.destination_station])} (BTS ID: ${feature.properties.destination_station})<br>
                      <strong>Total Ridership</strong>: ${feature.properties.count_all}
                    </p>`;

    layer.showDelay = 350; //use 0 for no delay behavior
    layer.hideDelay = 0; //use 0 for normal behavior
    layer.bindTooltipDelayed(tooltipText);

    layer.on('mouseover', function (e) {
      this.setStyle({ color: 'cyan', opacity: 1 });
    });
    layer.on('mouseout', function (e) {
      this.setStyle({ color: '#555', opacity: 0.3 });
    });
  }

  odLines = L.geoJSON(selectedOdArray, {
    style: styleRidership,
    // filter: idFilter,
    onEachFeature: odTooltip
  });

  overlays.addLayer(odLines).addTo(map);
  overlaysIDs[2] = odLines._leaflet_id;

  var ridershipTableString = `
                            <table class="table">
                              <thead>
                                <tr>
                                  <th scope="col">Origin Station</th>
                                  <th scope="col">Destination Station</th>
                                  <th scope="col">Total Ridership</th>
                                </tr>
                              </thead>
                              <tbody>`;

  var tableDictKeys = Object.keys(tableDict);

  for (var i = 0; i < tableDictKeys.length; i++) {
    ridershipTableString += `
                              <tr>
                                <td>${returnInactive(stationIDtoName[tableDictKeys[i].split(",")[0]])}</td>
                                <td>${returnInactive(stationIDtoName[tableDictKeys[i].split(",")[1]])}</td>
                                <td>${tableDict[tableDictKeys[i]]}</td>
                              </tr>`;
  }

  ridershipTableString += `
                            </tbody>
                          </table>`;

  $('#ridershipTableDiv').html(ridershipTableString);

  var newDataset = [];
  for (var d = 0; d < 24; d++) {
    newDataset.push({x: d, y: ridershipByHour[d]});
  }

  ridershipLineChart.data.datasets[0].data = newDataset;
  ridershipLineChart.options.title.text = 'Ridership by Hour';
  ridershipLineChart.update();

  var dayDataset = [];
  var ridershipByDayKeys = Object.keys(ridershipByDay);
  for (var d = 0; d < 7; d++) {
    dayDataset.push({x: ridershipByDayKeys[d], y: ridershipByDay[ridershipByDayKeys[d]]});
  }

  ridershipDayChart.data.datasets[0].data = dayDataset;
  ridershipDayChart.options.title.text = 'Ridership by Day';
  ridershipDayChart.update();
}

function createSmartLines(inStationNumber) {
  if (overlaysIDs[3] != -1) {
    overlays.removeLayer(overlaysIDs[3]);
    overlaysIDs[3] = -1;
  }

  smartHexes.setInteractive(false);

  function styleRidership(feature, latlng) {
    var ridership = parseInt(feature.properties.count);

    var currentStyle = {
      color: '#FF8000',
      opacity: 0.3,
    }

    ridership = (ridership < 3 ? 3 : ridership);
    ridership = (ridership > 20 ? 20 : ridership);

    currentStyle["weight"] = ridership;

    return currentStyle
  }

  var selectedCheckboxes = [];
  $('input[type=checkbox][name=smartTripsTypes]:checked').each(function(){
    selectedCheckboxes.push($(this).val());
  });

  var smartFilter = function (feature) {
    for (var m = 0; m < selectedCheckboxes.length; m++) {
      if (feature.properties[selectedCheckboxes[m]] == inStationNumber) {
        return true;
      }
    }
  }

  function smartLinesTooltip(feature, layer) {
    var tooltipText = "";

    function returnInactive(inputStationName) {
      if (typeof inputStationName == 'undefined') {
        return "Inactive";
      } else {
        return inputStationName
      }
    }

    tooltipText = `
                    <p class="text-center p-2 align-middle">
                      <strong>Smart Trip Route</strong><br>
                      <strong>Ridership for this route</strong>: ${feature.properties.count}
                    </p>`;

    layer.showDelay = 350; //use 0 for no delay behavior
    layer.hideDelay = 0; //use 0 for normal behavior
    layer.bindTooltipDelayed(tooltipText);

    layer.on('mouseover', function (e) {
      this.setStyle({ color: 'cyan', opacity: 1 });
    });
    layer.on('mouseout', function (e) {
      this.setStyle({ color: '#FF8000', opacity: 0.3 });
    });
  }

  smartLines = L.geoJSON(smartLinesArray, {
    style: styleRidership,
    onEachFeature: smartLinesTooltip,
    filter: smartFilter
  });

  overlays.addLayer(smartLines).addTo(map);
  overlaysIDs[3] = smartLines._leaflet_id;

  smartHexes.on('popupclose', function(e) {
    smartHexes.setInteractive(true);
  });
}

function createOdHexagonOverlay(inStationNumber) {
  if (overlaysIDs[6] != -1) {
    overlays.removeLayer(overlaysIDs[6]);
    overlaysIDs[6] = -1;
  }

  var selectedCheckboxes = [];
  $('input[type=checkbox][name=smartTripsTypes]:checked').each(function(){
    selectedCheckboxes.push($(this).val());
  });

  function styleRidership(feature, latlng) {
    var currentStyle = {
      fillOpacity: 0.8,
      color: '#fff',
      weight: 0.25
    }

    var colorArray = ["#e8f1f8", "#d1e3f2", "#bad4eb", "#a3c6e5", "#8cb8de", "#74aad7", "#5d9cd1", "#468dca", "#2f7fc4", "#1871bd"]; // blue

    var currentTotalRidership = 0;

    for (var m = 0; m < selectedCheckboxes.length; m++) {
      var odType = capitalizeFirstLetter(selectedCheckboxes[m].split("_")[0]);
      currentTotalRidership += smartHexDict[inStationNumber][odType][feature.properties.id];
    }

    var currentColorIndex = Math.round(currentTotalRidership / 100.0 * (colorArray.length - 1));

    if (currentColorIndex > colorArray.length) {
      currentColorIndex = colorArray.length - 1;
    }

    currentStyle["fillColor"] = colorArray[currentColorIndex];

    return currentStyle
  }

  function smartFilter(feature) {
    for (var m = 0; m < selectedCheckboxes.length; m++) {
      var odType = capitalizeFirstLetter(selectedCheckboxes[m].split("_")[0]);

      if ($.inArray((feature.properties.id).toString(), Object.keys(smartHexDict[inStationNumber][odType])) > -1) {
        return true;
      }
    }
  }

  function smartHexOverlayTooltip(feature, layer) {
    var tooltipText = "";


    var currentTotalRidership = 0;

    for (var m = 0; m < selectedCheckboxes.length; m++) {
      var odType = capitalizeFirstLetter(selectedCheckboxes[m].split("_")[0]);
      currentTotalRidership += smartHexDict[inStationNumber][odType][feature.properties.id];
    }

    tooltipText = `
                    <p class="text-center p-2 align-middle">
                      <strong>Total Smart Bike Ridership for this Hexagon</strong>: ${currentTotalRidership}
                    </p>`;

    layer.showDelay = 350; //use 0 for no delay behavior
    layer.hideDelay = 0; //use 0 for normal behavior
    layer.bindTooltipDelayed(tooltipText);

    layer.on('mouseover', function (e) {
      this.setStyle({ fillColor: 'cyan', opacity: 1 });
    });
    layer.on('mouseout', function (e) {
      this.setStyle({ fillColor: '#ccc', opacity: 0.3 });
    });
  }

  smartHexesOverlay = L.geoJSON(smartHexArray, {
    style: styleRidership,
    onEachFeature: smartHexOverlayTooltip,
    filter: smartFilter
  });

  overlays.addLayer(smartHexesOverlay).addTo(map);
  overlaysIDs[6] = smartHexesOverlay._leaflet_id;
}

function createSmartHexes() {
  if (overlaysIDs[5] != -1) {
    overlays.removeLayer(overlaysIDs[5]);
    overlaysIDs[5] = -1;
  }

  function styleRidership(feature, latlng) {

    var currentStyle = {
      color: '#fff',
      weight: 0.25,
      fillColor: '#ccc',
      fillOpacity: 0.5,
      opacity: 0.8,
    }

    return currentStyle

  }

  var selectedCheckboxes = [];
  $('input[type=checkbox][name=smartTripsTypes]:checked').each(function(){
    selectedCheckboxes.push($(this).val());
  });

  function smartHexTooltip(feature, layer) {
    var tooltipText = "";

    var currentTotalRidership = 0;

    var inStationNumber = feature.properties.id;

    for (var m = 0; m < selectedCheckboxes.length; m++) {
      var odType = capitalizeFirstLetter(selectedCheckboxes[m].split("_")[0]);

      try {
        var selectedHexKeys = Object.keys(smartHexDict[inStationNumber][odType]);

        for (var n = 0; n < selectedHexKeys.length; n++) {
          currentTotalRidership += smartHexDict[inStationNumber][odType][selectedHexKeys[n]];
        }
      } catch {
        console.log(inStationNumber);
      }

    }

    tooltipText = `
                    <p class="text-center p-2 align-middle">
                      <strong>Total Smart Bike Ridership for this Hexagon</strong>: ${currentTotalRidership}
                    </p>`;

    layer.showDelay = 350; //use 0 for no delay behavior
    layer.hideDelay = 0; //use 0 for normal behavior
    layer.bindTooltipDelayed(tooltipText);

    layer.bindPopup(tooltipText);

    layer.on('mouseover', function (e) {
      if (overlaysIDs[6] == -1) {
        this.setStyle({ fillColor: '#FF8000', fillOpacity: 1 });
        createOdHexagonOverlay(e.sourceTarget.feature.properties.id);
        // createSmartLines(e.sourceTarget.feature.properties.hex_id);
      }
    });
    layer.on('mouseout', function (e) {
      this.setStyle({ fillColor: '#ccc', fillOpacity: 0.5 });

      if (overlaysIDs[6] != -1) {
        overlays.removeLayer(overlaysIDs[6]);
        overlaysIDs[6] = -1;
      }
    });

    layer.on('click', function(e) {
      createSmartLines(e.sourceTarget.feature.properties.id);
      this.openPopup();

      this.on('popupclose', function() {
        if (overlaysIDs[3] != -1) {
          overlays.removeLayer(overlaysIDs[3]);
          overlaysIDs[3] = -1;
        }
      });
    });
  }

  smartHexes = L.geoJSON(smartHexArray, {
    style: styleRidership,
    onEachFeature: smartHexTooltip
  });

  overlays.addLayer(smartHexes).addTo(map);
  overlaysIDs[5] = smartHexes._leaflet_id;

  smartHexes.bringToBack();
}

function createSuitability() {
  if (overlaysIDs[7] != -1) {
    overlays.removeLayer(overlaysIDs[7]);
    overlaysIDs[7] = -1;
  }

  function styleSuitability(feature, latlng) {

    var selectedVisRadio = $('input[name="visualizeSuitabilityTypes"]:checked')[0].value;

    var currentStyle = {
      color: '#fff',
      weight: 0.25,
      opacity: 0.8
    }

    var colorArray = ["#d1e3f2", "#d1e3f2", "#74aad7", "#468dca", "#1871bd"];

    if (selectedVisRadio == "suitability") {
      var suitabilityDict = {
                              "": "#d1e3f2",
                              "No Score": "#d1e3f2",
                              "Low": "#d1e3f2",
                              "Moderate-low": "#74aad7",
                              "Moderate-high": "#468dca",
                              "High": "#1871bd"
                            };

      currentStyle["fillColor"] = suitabilityDict[feature.properties.suitability];
      if (feature.properties.suitability == "" || feature.properties.suitability == "No Score"){
        currentStyle["fillOpacity"] = 0;
      } else {
        currentStyle["fillOpacity"] = 0.5;
      }
    } else if (selectedVisRadio == "equity_cat") {
      var suitabilityDict = {
                              "": "#d1e3f2",
                              "5 - Low": "#d1e3f2",
                              "4 - Moderate-Low": "#d1e3f2",
                              "3 - Moderate": "#74aad7",
                              "2 - Moderate-High": "#468dca",
                              "1 - High": "#1871bd"
                            };

      currentStyle["fillColor"] = suitabilityDict[feature.properties.equity_cat];
      if (feature.properties.equity_cat == "" || feature.properties.equity_cat == "No Score"){
        currentStyle["fillOpacity"] = 0;
      } else {
        currentStyle["fillOpacity"] = 0.5;
      }
    } else {
      var currentArray = hexGridVisDict[selectedVisRadio];
      var currentProp = feature.properties[selectedVisRadio];

      if (currentProp == null) {
        currentStyle["fillOpacity"] = 0;
      } else {
        currentProp = parseFloat(currentProp);

        for (var j = 0; j <= colorArray.length - 1; j++) {
          var lowerBound = j == 0 ? 0 : Math.round((j / parseFloat(colorArray.length)) * currentArray.length);
          var upperBound = Math.round(((j + 1) / parseFloat(colorArray.length)) * currentArray.length);

          var lowerBoundProp = currentArray[lowerBound];

          upperBound >= currentArray.length ? upperBound = currentArray.length - 1 : upperBound;

          var upperBoundProp = currentArray[upperBound];

          if (currentProp >= lowerBoundProp && currentProp <= upperBoundProp) {
            currentStyle["fillColor"] = colorArray[j];
            currentStyle["fillOpacity"] = 0.5;
          }
        }
      }
    }

    return currentStyle
  }

  function suitabilityTooltip(feature, layer) {
    var tooltipText = "";

    function replaceNullsWithString(inString) {
      var currentString;

      if (inString == null || inString == undefined) {
        currentString = '(No responses)';
      } else {
        currentString = inString;
      }

      return currentString
    }

    function replaceNullsWithZero(inString) {
      var currentString;

      if (inString == null || inString == undefined) {
        currentString = 0;
      } else {
        currentString = inString;
      }

      return currentString
    }

    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    tooltipText = `
                    <p class="text-center"><strong>Crowdsourcing</strong></p>
                    <p>
                      <strong>Total Likes</strong>: ${replaceNullsWithString(feature.properties.crowd_like)}<br>
                      <strong>Total Dislike</strong>: ${replaceNullsWithString(feature.properties.crowd_no_like)}<br>
                      <strong>Total Home Located Here</strong>: ${replaceNullsWithString(feature.properties.home_zip)}<br>
                      <strong>Total Work Located Here</strong>: ${replaceNullsWithString(feature.properties.work_zip)}
                    </p>

                    <hr style="border: 1px solid #fff;">

                    <p>
                      <strong>Suitability</strong>: ${feature.properties.suitability}<br>
                      <strong>Total Households</strong>: ${numberWithCommas(replaceNullsWithZero(feature.properties.total_hh).toFixed(0))}<br>
                      <strong>Equity Category</strong>: ${feature.properties.equity_cat}<br>
                      <strong>Zero-Vehicle Households</strong>: ${(parseFloat(feature.properties.pct_zero_car_hh) * 100).toFixed(2)}%<br>
                    </p>
                  `;

    layer.showDelay = 350; //use 0 for no delay behavior
    layer.hideDelay = 0; //use 0 for normal behavior
    layer.bindTooltipDelayed(tooltipText);

    layer.bindPopup(tooltipText);

    layer.on('mouseover', function (e) {
      this.setStyle({ fillColor: '#FF8000', fillOpacity: 1 });
    });
    layer.on('mouseout', function (e) {
      var currentStyle = styleSuitability(feature);

      this.setStyle(currentStyle);
    });

    layer.on('click', function(e) {

    });
  }

  suitability = L.geoJSON(suitabilityArray, {
    style: styleSuitability,
    onEachFeature: suitabilityTooltip
  });

  overlays.addLayer(suitability).addTo(map);
  overlaysIDs[7] = suitability._leaflet_id;

  suitability.bringToBack();
}