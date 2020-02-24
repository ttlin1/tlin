//////////////////////////////////////////////// SURVEY
function createSurvey(feature, layer) {

  var popupText = "";
  var tooltipText = "";

  popupText = `<p><strong>${feature.properties.Status} Station</strong>: ${feature.properties["TD Site Number"]}, ${feature.properties["TD Name"]}</p>`;
  tooltipText = `<p class="text-center p-2 align-middle"><strong>${feature.properties.Status}</strong>: ${feature.properties["TD Site Number"]}, ${feature.properties["TD Name"]}</p>`;

  var popup = L.popup().setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(tooltipText);

  let clicked = false;

  layer._leaflet_id = feature.properties["TD Site Number"];

  layer.on('mouseover', function (e) {
    if (clicked == false) {
      this.setStyle({ radius: 10, opacity: 0.5 });
    }
  });

  layer.on('mouseout', function (e) {
    if (clicked == false) {
      this.setStyle({ radius: 5, opacity: 0.8 });
    }
  });

  layer.on('click', function (e) {
    if (overlaysIDs[2] != -1) {
      overlays.removeLayer(overlaysIDs[2]);
      overlaysIDs[2] = -1;
    }

    map.closePopup();

    $("#dataTable").hide();

    clicked = false;

    this.openPopup();

    var btsSiteNumber = (e.sourceTarget.feature.properties["BTS Site Number"]).toString();

    stations.setStyle({radius: 5, opacity: 0.8});

    var currentLat = -1;
    var currentLng = -1;

    if (e.hasOwnProperty('latlng')) {
      currentLat = e.latlng.lat;
      currentLng = e.latlng.lng;
    } else {
      if (feature.geometry.type != "Point") {
        currentLat = feature.geometry.coordinates[0][1];
        currentLng = feature.geometry.coordinates[0][0];
      } else {
        currentLat = feature.geometry.coordinates[1];
        currentLng = feature.geometry.coordinates[0];
      }
    }

    if (map.getZoom() < 13) {
      map.flyTo([currentLat, currentLng], 13);
    }


    // var turfPoint = turf.point([e.latlng.lng, e.latlng.lat]);
    // var buffer250Feet = turf.buffer(turfPoint, 250, {units: 'feet'});
    // var buffer500Feet = turf.buffer(turfPoint, 500, {units: 'feet'});
    // var buffer750Feet = turf.buffer(turfPoint, 750, {units: 'feet'});

    // circlesArray = [];

    // for (var m = 0; m < circlesLabels.length; m++) {
    //   map.removeLayer(circlesLabels[m]);
    // }
    // circlesLabels = [];

    // circlesArray.push(buffer250Feet);
    // circlesArray.push(buffer500Feet);
    // circlesArray.push(buffer750Feet);

    // if (overlaysIDs[1] != -1) {
    //   overlays.removeLayer(overlaysIDs[1]);
    //   overlaysIDs[1] = -1;
    // }

    // var circleStyle = { 
    //                     fillColor: "#ff7800",
    //                     color: "#000",
    //                     weight: 0.25,
    //                     opacity: 1,
    //                     fillOpacity: 0
    //                   };

    // circles = L.geoJSON(circlesArray, {
    //   style: circleStyle
    // });
  
    // var centerLatLng = circles.getBounds().getCenter();        

    // var label250 = L.marker({lon: centerLatLng.lng + 0.00125, lat: centerLatLng.lat}, {
    //   icon: L.divIcon({
    //     className: 'distanceLabels',
    //     html: '250 feet',
    //     iconSize: [100, 40]
    //   })
    // }).addTo(map);

    // var label500 = L.marker({lon: centerLatLng.lng + 0.0019, lat: centerLatLng.lat}, {
    //   icon: L.divIcon({
    //     className: 'distanceLabels',
    //     html: '500 feet',
    //     iconSize: [100, 40]
    //   })
    // }).addTo(map);

    // var label750 = L.marker({lon: centerLatLng.lng + 0.0026, lat: centerLatLng.lat}, {
    //   icon: L.divIcon({
    //     className: 'distanceLabels',
    //     html: '750 feet',
    //     iconSize: [100, 40]
    //   })
    // }).addTo(map);

    // circlesLabels.push(label250);
    // circlesLabels.push(label500);
    // circlesLabels.push(label750);
  

    // overlays.addLayer(circles).addTo(map);
    // overlaysIDs[1] = circles._leaflet_id;

    // circles.bringToBack();

    clicked = true;

    map.closePopup();

    var surveyString = '<button type="button" id="closeButton" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

    // var propertiesKeys = Object.keys(feature.properties);
    // for (var j = 0; j < propertiesKeys.length; j++) {
    //   surveyString += `<h6><strong>${propertiesKeys[j]}</strong>: ${feature.properties[propertiesKeys[j]]}</h6>`;
    // }

    var displayFields = {"Location Information": ["TD Site Number", "TD Name", "Status", "Type", "Location Description", "CD"],
                        "Planning Details": ["Parking Removal? (Y/N)", "No. of Spaces", "No. of Docks", "Wheelstop"],
                        "Public Input Information": ["Taken to Phase 2 crowdsourcing (2019)? (Y/N/Added)", "# NO", "NO Public Comments", "# YES", "YES Public Comments", "Public input from other sources"]
                        };

    if (feature.properties.Status == "Removed from consideration") {
      displayFields["Removed from Consideration"] = ["Status Description"];
    }

    var displayFieldsKeys = Object.keys(displayFields);

    for (var j = 0; j < displayFieldsKeys.length; j++) {
      var currentId = displayFieldsKeys[j].replace(/ /g, "_");

      var accordionText = '';

      for (var k = 0; k < displayFields[displayFieldsKeys[j]].length; k++) {
        accordionText += `<h6><strong>${displayFields[displayFieldsKeys[j]][k]}</strong>: ${feature.properties[displayFields[displayFieldsKeys[j]][k]]}</h6>`;
      }

      surveyString += `
                      <div id="${currentId}">
                        <h6 class="mb-0">
                          <button class="btn btn-light" type="button">
                            ${displayFieldsKeys[j]}
                          </button>
                        </h6>
                      </div>
                      <br>
                      <div id="${currentId + "Collapse"}">
                        ${accordionText}
                      </div>
                      <hr style="border-top: 1px solid #fff">
                      <script>
                        $("#${currentId}").click(function() {
                          $("#${currentId + "Collapse"}").toggle("slow", function() {
                          });
                        });
                      </script>
                      `;

      if (j > 0) {
        surveyString += `<script>$("#${currentId + "Collapse"}").toggle();</script>`;
      }
    }

    var fromSelectString = `<select class="custom-select" multiple id="fromStationSelect"><option value="SelectStation" selected>--Select station(s)--</option>`;
    var toSelectString = `<select class="custom-select" multiple id="toStationSelect"><option value="SelectStation" selected>--Select station(s)--</option>`;

    try {
      var originList = odLinesDict[btsSiteNumber]["Destination"];
      var originNameList = originList.map(x => stationIDtoName[odIdToStations[x][0]]);

      var nameToIdDict = {};
      for (var k = 0; k < originList.length; k++) {
        nameToIdDict[stationIDtoName[odIdToStations[originList[k]][0]]] = odIdToStations[originList[k]][0];
      }

      originNameList.sort();
      originNameList = originNameList.filter(name => name != undefined);

      for (var m = 0; m < originNameList.length; m++) {
        var originStation = nameToIdDict[originNameList[m]];
        fromSelectString += `<option value="${originStation}">${originNameList[m]} (Trips: ${odIdToRidership[stationsToOdId[[originStation, btsSiteNumber]]]})</option>`;
      }

      var destList = odLinesDict[btsSiteNumber]["Origin"];
      var destNameList = destList.map(x => stationIDtoName[odIdToStations[x][1]]);

      var nameToIdDict = {};
      for (var k = 0; k < destList.length; k++) {
        nameToIdDict[stationIDtoName[odIdToStations[destList[k]][1]]] = odIdToStations[destList[k]][1];
      }

      destNameList.sort();
      destNameList = destNameList.filter(name => name != undefined);

      for (var m = 0; m < destNameList.length; m++) {
        var destinationStation = nameToIdDict[destNameList[m]];
        toSelectString += `<option value="${destinationStation}">${destNameList[m]} (Trips: ${odIdToRidership[stationsToOdId[[btsSiteNumber, destinationStation]]]})</option>`;
      }
    } catch {

    }

    fromSelectString += '</select>';
    toSelectString += '</select>';

    surveyString += `<div id="ridershipInfoDiv">
                        <h6 class="mb-0">
                          <button class="btn btn-light" type="button">
                            Ridership Information
                          </button>
                        </h6>
                      </div>
                      <br>
                      <div id="ridershipInfoDivCollapse">

                        <div class="row">
                          <div class="col">
                            <input type="checkbox" id="selectAllFrom">
                            <label for="selectAllFrom">Select All Origin Stations</label>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <div class="input-group mb-3">
                              <div class="input-group-prepend">
                                <label class="input-group-text" for="fromStationSelect"><small>Origin:</small></label>
                              </div>
                              ${fromSelectString}
                            </div>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <input type="checkbox" id="selectAllTo">
                            <label for="selectAllTo">Select All Destination Stations</label>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <div class="input-group mb-3">
                              <div class="input-group-prepend">
                                <label class="input-group-text" for="inputGroupSelect01"><small>Destination: </small></label>
                              </div>
                              ${toSelectString}
                            </div>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col">
                            <canvas id="ridershipHourChartDiv"></canvas>
                          </div>
                        </div>

                        <br><hr style="border-top: 1px solid #fff">

                        <div class="row">
                          <div class="col">
                            <canvas id="ridershipDayChartDiv"></canvas>
                          </div>
                        </div>

                        <br>

                        <div class="row">
                          <div class="col">
                            <div id="ridershipTableDiv"></div>
                          </div>
                        </div>

                      </div>
                      <hr style="border-top: 1px solid #fff">
                      <script>
                        $("#ridershipInfoDiv").click(function() {
                          $("#ridershipInfoDivCollapse").toggle("slow", function() {
                          });
                        });
                      </script>
                      <script>$("#ridershipInfoDivCollapse").toggle();</script>`;

    var currentSiteNumber = feature.properties["TD Site Number"];
    var siteNumbersWithTracking = Object.keys(submittalTracking)

    if ($.inArray(currentSiteNumber, siteNumbersWithTracking) > -1) {
      var submittalText = '';

      var submittalFieldKeys = Object.keys(submittalTracking[currentSiteNumber]);

      for (var j = 0; j < submittalFieldKeys.length; j++) {
        var currentValue = submittalTracking[currentSiteNumber][submittalFieldKeys[j]];
        submittalText += `<h6><strong>${submittalFieldKeys[j]}</strong>: ${(currentValue == undefined ? '(no data)' : currentValue)}</h6>`;
      }

      surveyString += `
                      <div id="currentSubmittalInfo">
                        <h6 class="mb-0">
                          <button class="btn btn-light" type="button">
                            Submittal Tracking
                          </button>
                        </h6>
                      </div>
                      <br>
                      <div id="Submittal_TrackingCollapse">
                          ${submittalText}
                      </div>
                      <hr style="border-top: 1px solid #fff">
                      <script>
                        $("#currentSubmittalInfo").click(function() {
                          $("#Submittal_TrackingCollapse").toggle("slow", function() {
                          });
                        });
                        $("#Submittal_TrackingCollapse").toggle();
                      </script>
                      `;
    }

    surveyString += '<canvas id="votesChart"></canvas><br><hr>';

    var currentStreetViewID = 'streetViewImagery' + feature.properties["TD Site Number"];
    var currentStreetViewURL = feature.properties["Street View Link"];
    var currentStreetViewLat, currentStreetViewLng, unknownParam1, unknownParam2, unknownParam3, currentStreetViewHeading, currentStreetViewPitch, rest;

    if (currentStreetViewURL != "") {
      [currentStreetViewLat, currentStreetViewLng, unknownParam1, unknownParam2, currentStreetViewHeading, currentStreetViewPitch, ...rest] = currentStreetViewURL.substring(currentStreetViewURL.indexOf("@") + 1).split(",");
    } else {
      [currentStreetViewLat, currentStreetViewLng, currentStreetViewHeading, currentStreetViewPitch] = [currentLat, currentLng, "165", "0"];
    }

    try {
      currentStreetViewHeading = parseFloat(currentStreetViewHeading.substring(0, currentStreetViewHeading.indexOf("h")));
      currentStreetViewPitch = parseFloat(currentStreetViewPitch.substring(0, currentStreetViewPitch.indexOf("t")));
    } catch {
      currentStreetViewHeading = 165;
      currentStreetViewPitch = 0;
    }

    
    surveyString += `<div id="${currentStreetViewID}" class="streetViewImagery"></div>
    <script>
      var panorama;
      function initialize() {
        panorama = new google.maps.StreetViewPanorama(
            document.getElementById('${currentStreetViewID}'),
            {
              position: {lat: ${parseFloat(currentStreetViewLat)}, lng: ${parseFloat(currentStreetViewLng)}},
              pov: {heading: ${currentStreetViewHeading}, pitch: 0},
              zoom: 1,
              linksControl: false,
              panControl: false,
              enableCloseButton: false,
              fullscreenControl: false,
              zoomControl: false,
              source: google.maps.StreetViewSource.OUTDOOR
            });
      }

    </script>`;

    surveyString += '<br><hr>';

    surveyString += '<button type="button" id="generateReport" class="btn btn-primary"><span id="reportButtonText">Generate Report</span><div id="reportLoader"></div></button>';
    
    $('#sideBarDivId').html(surveyString);

    $('#fromStationSelect').change(function() {
      createOdLines(btsSiteNumber);
    });

    $('#toStationSelect').change(function() {
      createOdLines(btsSiteNumber);
    });

    $('#selectAllFrom').click(function() {
      if ($('#selectAllFrom')[0].checked == true) {
        $('#fromStationSelect option').prop('selected', true);
        createOdLines(btsSiteNumber);
      } else {
        $('#fromStationSelect option').prop('selected', false);
        createOdLines(btsSiteNumber);
      }
    });

    $('#selectAllTo').click(function() {
      if ($('#selectAllTo')[0].checked == true) {
        $('#toStationSelect option').prop('selected', true);
        createOdLines(btsSiteNumber);
      } else {
        $('#toStationSelect option').prop('selected', false);
        createOdLines(btsSiteNumber);
      }
    });

    $('#generateReport').click(function() {
      $("#reportButtonText").html("Generating Report...");
      $("#reportLoader").css({'display':'inline-block'});
      generateReport(btsSiteNumber);
    });

    initialize();
    sidebarControl.show();

    var numberYes = feature.properties["# YES"];
    var numberNo = feature.properties["# NO"];

    if (numberYes == "") {
      numberYes = 0
    } else {
      numberYes = parseInt(numberYes);
    }

    if (numberNo == "") {
      numberNo = 0
    } else {
      numberNo = parseInt(numberNo);
    }

    var data = {
      datasets: [{
        data: [numberYes, numberNo],
        backgroundColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderColor: ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)'],
        borderWidth: 2
      }],

      labels: ['Like', 'Dislike']
    };

    var options = {
      cutoutPercentage: 50,
      legend: {
        labels: {
          fontColor: '#fff',
          fontFamily: "'Roboto', sans-serif",
          boxWidth: 20
        }
      },
      title: {
        display: true,
        text: `Number of Votes (Total: ${numberNo + numberYes})`,
        fontColor: '#fff'
      }
    };

    var ctx = document.getElementById('votesChart');
    var myDoughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: options
    });

    // hour of day

    var config = {
      type: 'line',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        datasets: [{
          label: 'Ridership',
          backgroundColor: '#ffbf00',
          borderColor: '#ffbf00',
          data: [],
          fill: false,
        }]
      },
      options: {
        legend: {
          labels: {
            fontColor: '#fff'
          }
        },
        responsive: true,
        title: {
          display: true,
          text: 'Ridership by Hour (select an origin/destination pair to view ridership)',
          fontColor: '#fff'
        },
        tooltips: {
          callbacks: {
            title: function(tooltipItem, data) {
              var currentLabel = parseInt(tooltipItem[0].label);
              var formattedLabel = '';

              if (currentLabel == 0) {
                formattedLabel = "12am - 1am";
              } else if (currentLabel > 12 && currentLabel != 23) {
                formattedLabel = `${currentLabel - 12}pm - ${currentLabel + 1 - 12}pm`;
              } else if (currentLabel == 23) {
                formattedLabel = "11pm - 12am";
              } else if (currentLabel < 12 && currentLabel != 0) {
                formattedLabel = `${currentLabel}am - ${currentLabel + 1}am`;
              } else if (currentLabel == 12) {
                formattedLabel = "12pm - 1pm";
              }

              return formattedLabel;
            }
          },
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Time (24-hour)',
              fontColor: '#fff'
            },
            ticks: {
              fontColor: '#fff'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Count',
              fontColor: '#fff'
            },
            ticks: {
              fontColor: '#fff'
            }
          }]
        }
      }
    };

    var timeChart = document.getElementById('ridershipHourChartDiv').getContext('2d');
    ridershipLineChart = new Chart(timeChart, config);

    // day of week

    var dayConfig = {
      type: 'line',
      data: {
        labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        datasets: [{
          label: 'Ridership',
          backgroundColor: 'cyan',
          borderColor: 'cyan',
          data: [],
          fill: false,
        }]
      },
      options: {
        legend: {
          labels: {
            fontColor: '#fff'
          }
        },
        responsive: true,
        title: {
          display: true,
          text: 'Ridership by Day (select an origin/destination pair to view ridership)',
          fontColor: '#fff'
        },
        tooltips: {
          callbacks: {
            title: function(tooltipItem, data) {

              return tooltipItem[0].label;

              // var currentLabel = parseInt(tooltipItem[0].label);
              // var formattedLabel = '';

              // if (currentLabel == 0) {
              //   formattedLabel = "12am - 1am";
              // } else if (currentLabel > 12 && currentLabel != 23) {
              //   formattedLabel = `${currentLabel - 12}pm - ${currentLabel + 1 - 12}pm`;
              // } else if (currentLabel == 23) {
              //   formattedLabel = "11pm - 12am";
              // } else if (currentLabel < 12 && currentLabel != 0) {
              //   formattedLabel = `${currentLabel}am - ${currentLabel + 1}am`;
              // } else if (currentLabel == 12) {
              //   formattedLabel = "12pm - 1pm";
              // }

              // return formattedLabel;
            }
          },
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Day of Week',
              fontColor: '#fff'
            },
            ticks: {
              fontColor: '#fff'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Count',
              fontColor: '#fff'
            },
            ticks: {
              fontColor: '#fff'
            }
          }]
        }
      }
    };

    var dayChart = document.getElementById('ridershipDayChartDiv').getContext('2d');
    ridershipDayChart = new Chart(dayChart, dayConfig);

    $('#closeButton').on('click', function () {
      sidebarControl.hide();
      map.closePopup();
      clicked = false;
      stations.setStyle({radius: 5, fillOpacity: 0.8});
      // $("#dataTable").toggle();

      $("#streetSearch").val("");

      if (overlaysIDs[2] != -1) {
        overlays.removeLayer(overlaysIDs[2]);
        overlaysIDs[2] = -1;
      }
    });

    this.openPopup();
    this.setStyle({radius: 10, fillOpacity: 1});
  });
}
