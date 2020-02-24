var CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var Esri_WorldGrayReference = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  maxZoom: 16
});

var CartoDB_PositronOnlyLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  pane: 'labels'
});

var map = L.map('mapDiv', {
  center: [45.5051, -122.7550],
  zoom: 12,
  layers: [CartoDB_PositronNoLabels],
  doubleClickZoom: false,
  boxZoom: false,
  zoomControl: false,
  preferCanvas: true
});

map.createPane('labels');
map.getPane('labels').style.zIndex = 601;
map.getPane('labels').style.pointerEvents = 'none';

CartoDB_PositronOnlyLabels.addTo(map);

map.attributionControl.setPrefix('<a href="https://tooledesign.com/">Toole Design<a> | <a href="https://leafletjs.com/">Leaflet</a>');

var overlays = L.layerGroup();
var overlaysIDs = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

var streets = L.geoJSON();
var streetsArray = [];

var cityLimits = L.geoJSON();

var tspDesignList = ["LS", "CC", "NMS", "CIMS", "NC", "IR", "CIC", "RC", "UT"];
var colorList = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f"];

var tspDict = {
                "LS": "Local Service",
                "CC": "Community Corridor",
                "CIMS": "Civic Main Street",
                "CIC": "Civic Corridor",
                "NMS": "Neighborhood Main Street",
                "NC": "Neighborhood Corridor",
                "IR": "Industrial Roads",
                "RC": "Regional Corridor",
                "UT": "Urban Throughway",
              };

var transitDict = {
                    "LS": "Local Service",
                    "TA": "Transit Access",
                    "MTP": "Major Transit Priority",
                    "RTMTP": "Regional Transitway + Major Transit Priority ",
                    "RT": "Regional Transitway"
                  };

var bikeDict = {
                "LS": "Local Service",
                "CB": "City Bikeway",
                "MCB": "Major City Bikeway"
              };

var pedDict = {
                "CW": "City Walkway",
                "LS": "Local Service Walkway",
                "MCW": "Major City Walkway",
                "NW": "Neighborhood Walkway"
              };

var freightDict = {
                    "LS": "Local Service",
                    "FD": "Freight District",
                    "TA": "Truck Access",
                    "MTS": "Major Truck Street",
                    "PTS": "Priority Truck Street",
                    "RT": "Regional Truckway"
                  };

var trafficDict = {
                    "LS": "Local Service",
                    "NC": "Neighborhood Collector",
                    "MCT": "Major City Traffic",
                    "DC": "District Collector",
                    "TA": "Traffic Access",
                    "RTMCT": "Regional Trafficway and Major City Traffic",
                    "RT": "Regional Trafficway",
                  };



var pedDistrictDict = {0: "Not in Ped. District", 1: "In Ped. District"};

var tspDesignFullNameList = tspDesignList.map(x => tspDict[x]);

var colorScale = d3.scaleOrdinal(tspDesignFullNameList, colorList);
var colorMap = new Map(colorScale.domain().map(d => [d, colorScale(d)]));

var chartsDiv = L.control({position: 'topleft'});

chartsDiv.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'chartsDiv');
  this.initializeInfo();
  return this._div;
};

chartsDiv.initializeInfo = function () {
  this._div.innerHTML = `
  <div class="container panel-container">
    <div class="row">
      <div class="col">

        <div class="row">
          <div class="col">
            <img style="vertical-align: top" src="img/logo.png" alt="City of Portland" class="img-fluid">
            <h5>Streets 2035 Map</h5>
          </div>
          <div class="col">
            <div class="row">
              <p class="pt-5">Use the charts below to filter the data. Click the button below to update the map with your filters.</p>
            </div>
            <div class="row text-center">
              <!--<div class="col">
                <button type="button" class="btn btn-light" id="updateMap" disabled>Map is updated</button>
              </div>-->
              <div class="col">
                <button type="button" class="btn btn-light" id="resetFilters">Map is updated</button>
              </div>
              <div class="w-100"></div>
              <div class="col pt-2">
                <h6>Current Total Street Mileage: <span id="totalStreetMileageId"></span></h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="white-hr">

    <div class="row">
      <div class="col">
        <div id="patternAreaChartId" class="dc-chart">
          <strong>Portland Pattern Area</strong>
          <a class="reset" href="javascript:patternAreaChart.filterAll();dc.redrawAll();"
            style="display: none;">reset</a>

          <div class="clearfix"></div>
        </div>
      </div>

      <div class="col">
        <div id="numberLanesChartId" class="dc-chart">
          <strong>Number of Lanes</strong>
          <a class="reset" href="javascript:numberLanesChart.filterAll();dc.redrawAll();"
            style="display: none;">reset</a>

          <div class="clearfix"></div>
        </div>
      </div>
    </div>

    <div class="row pt-5 pl-3">
      <div class="col">
        <div id="existingBikewayChartId" class="dc-chart">
          <strong>Existing Bikeway</strong>
          <a class="reset" href="javascript:existingBikewayChart.filterAll();dc.redrawAll();"
            style="display: none;">reset</a>

          <div class="clearfix"></div>
        </div>
      </div>

      <div class="col">
        <div id="swWidthChartId" class="dc-chart">
          <strong>Average Sidewalk Width</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="filter">&nbsp;</span>
          <a class="reset" href="javascript:swWidthChart.filterAll();dc.redrawAll();"
            style="display: none;">reset</a>

          <div class="clearfix"></div>
        </div>
      </div>
    </div>

    <div class="row pt-5">
      <div class="col">
        <div id="widthChartId" class="dc-chart">
          <strong>ROW Width vs. Pavement Road Width</strong><br><span class="filter">&nbsp;</span>
          <a class="reset" href="javascript:widthChart.filterAll();dc.redrawAll();"
            style="display: none;">reset</a>

          <div class="clearfix"></div>
        </div>
      </div>
    </div>

    <div class="row pt-5">
      <div class="col">
        <div id="tspDesignChartId" class="dc-chart">
          <strong>TSP Design</strong>
          <a class="reset" href="javascript:tspDesignChart.filterAll();dc.redrawAll();"
            style="display: none;">reset</a>

          <div class="clearfix"></div>
        </div>
      </div>

      <div class="col">
        <div id="tspTransitChartId" class="dc-chart">
          <strong>TSP Transit</strong>
          <a class="reset" href="javascript:tspTransitChart.filterAll();dc.redrawAll();"
            style="display: none;">reset</a>

          <div class="clearfix"></div>
        </div>
      </div>
    </div>

    <div class="row pt-5">
      <div class="col">
        <div id="tspBikeChartId" class="dc-chart">
          <strong>TSP Bike</strong>
          <a class="reset" href="javascript:tspBikeChart.filterAll();dc.redrawAll();"
            style="display: none;">reset</a>

          <div class="clearfix"></div>
        </div>
      </div>

      <div class="col">
        <div id="tspPedestrianChartId" class="dc-chart">
          <strong>TSP Pedestrian</strong>
          <a class="reset" href="javascript:tspPedestrianChart.filterAll();dc.redrawAll();"
            style="display: none;">reset</a>

          <div class="clearfix"></div>
        </div>
      </div>
    </div>

    <div class="row pt-5 pb-5">
      <div class="col">
        <div id="tspFreightChartId" class="dc-chart">
          <strong>TSP Freight</strong>
          <a class="reset" href="javascript:tspFreightChart.filterAll();dc.redrawAll();"
            style="display: none;">reset</a>

          <div class="clearfix"></div>
        </div>
      </div>

      <div class="col">
        <div id="tspTrafficChartId" class="dc-chart">
          <strong>TSP Traffic</strong>
          <a class="reset" href="javascript:tspTrafficChart.filterAll();dc.redrawAll();"
            style="display: none;">reset</a>

          <div class="clearfix"></div>
        </div>

        <div id="mapGroup"></div>
      </div>
    </div>

  </div>`; 
}

chartsDiv.addTo(map);

chartsDiv.getContainer().addEventListener('mouseover', function () {
  map.dragging.disable();
  map.scrollWheelZoom.disable();
});

// Re-enable dragging when user's cursor leaves the element
chartsDiv.getContainer().addEventListener('mouseout', function () {
  map.dragging.enable();
  map.scrollWheelZoom.enable();
});

//////////////////////////////////////////////// LEGEND

function createFeatures(inArray, inTabName) {
  function styleStreets(feature) {

    var currentStyle;

    if (inTabName == "tspDesignTab") {
      var color;

      if (feature.properties.TSP_Design in tspDict) {
        color = colorMap.get(tspDict[feature.properties.TSP_Design]);
      } else {
        color = '#000'
      }

      currentStyle = {
        weight: 2,
        opacity: 1,
        color: color
      }

    } else if (inTabName == "numLanesTab") {
      currentStyle = {
        weight: feature.properties.Number_Lanes + feature.properties.CenterLane,
        opacity: 1,
        color: '#555'
      }

    } else if (inTabName == "pavementWidthTab") {
      var currentRoadWidth = feature.properties.Pavement_RoadWidth;
      var currentWidth = 0;

      if (currentRoadWidth < 25) {
        currentWidth = 1;
      } else if (currentRoadWidth >= 25 && currentRoadWidth <= 29) {
        currentWidth = 2;
      } else if (currentRoadWidth >= 30 && currentRoadWidth <= 34) {
        currentWidth = 3;
      } else if (currentRoadWidth >= 35 && currentRoadWidth <= 39) {
        currentWidth = 4;
      } else if (currentRoadWidth >= 40 && currentRoadWidth <= 44) {
        currentWidth = 5;
      } else if (currentRoadWidth >= 45 && currentRoadWidth <= 49) {
        currentWidth = 6;
      } else if (currentRoadWidth >= 50 && currentRoadWidth <= 54) {
        currentWidth = 7;
      } else if (currentRoadWidth >= 55 && currentRoadWidth <= 59) {
        currentWidth = 8;
      } else if (currentRoadWidth >= 60 && currentRoadWidth <= 69) {
        currentWidth = 9;
      } else if (currentRoadWidth >= 70) {
        currentWidth = 10;
      }

      currentStyle = {
        weight: currentWidth,
        opacity: 1,
        color: '#555'
      }
    }

    return currentStyle
  }

  function createPopups(feature, layer) {
    var tooltipText = `<p><strong>Street</strong>: ${feature.properties.TSP_StreetName}<br><strong>Cross-Street</strong>: ${feature.properties.Pavement_begLocation}</p><p class="text-right">Click to view details</p>`;

    var popupText = `
                  <h6><strong>Street</strong>: ${feature.properties.TSP_StreetName}<br><strong>Cross-Street</strong>: ${feature.properties.Pavement_begLocation}</h6>
                  <table class="table table-striped">
                    <tbody>
                      <tr>
                        <td>TSP Design
                        <td>${$.inArray(feature.properties.TSP_Design, Object.keys(tspDict)) > -1 ? tspDict[feature.properties.TSP_Design] : feature.properties.TSP_Design}
                      </tr>
                      <tr>
                        <td>TSP Transit
                        <td>${$.inArray(feature.properties.TSP_Transit, Object.keys(transitDict)) > -1 ? transitDict[feature.properties.TSP_Transit] : feature.properties.TSP_Transit}
                      </tr>
                      <tr>
                        <td>TSP Bike
                        <td>${$.inArray(feature.properties.TSP_Bicycle, Object.keys(bikeDict)) > -1 ? bikeDict[feature.properties.TSP_Bicycle] : feature.properties.TSP_Bicycle}
                      </tr>
                      <tr>
                        <td>TSP Freight
                        <td>${$.inArray(feature.properties.TSP_Freight, Object.keys(freightDict)) > -1 ? freightDict[feature.properties.TSP_Freight] : feature.properties.TSP_Freight}
                      </tr>
                      <tr>
                        <td>TSP Pedestrian
                        <td>${$.inArray(feature.properties.TSP_ToBeAdopted_Pedestrian, Object.keys(pedDict)) > -1 ? pedDict[feature.properties.TSP_ToBeAdopted_Pedestrian] : feature.properties.TSP_ToBeAdopted_Pedestrian}
                      </tr>
                      <tr>
                        <td>Pedestrian District
                        <td>${pedDistrictDict[feature.properties.PedDistricts_New]}
                      </tr>
                      <tr>
                        <td>TSP Traffic
                        <td>${$.inArray(feature.properties.TSP_Traffic, Object.keys(trafficDict)) > -1 ? trafficDict[feature.properties.TSP_Traffic] : feature.properties.TSP_Traffic}
                      </tr>
                      
                      <tr>
                        <td>Pavement Road Width
                        <td>${feature.properties.Pavement_RoadWidth}
                      </tr>
                      <tr>
                        <td>ROW Width
                        <td>${feature.properties.ROW_Width}
                      </tr>
                      <tr>
                        <td>Portland Pattern Area
                        <td>${feature.properties.Portland_Pattern_Area}
                      </tr>
                      <tr>
                        <td>Number of Lanes
                        <td>${feature.properties.Number_Lanes + feature.properties.CenterLane}
                      </tr>
                      <tr>
                        <td>Existing Bikeway
                        <td>${feature.properties.ACTIVE_Facility}
                      </tr>
                      <tr>
                        <td>Average Sidewalk Width
                        <td>${feature.properties.AVG_SW_Width}
                      </tr>
                      <tr>
                        <td>Sidewalk (sides)
                        <td>${feature.properties.SWs_Count}
                      </tr>
                      <tr>
                        <td>Parking
                        <td>${feature.properties.Parking}
                      </tr>
                    </tbody>
                  </table>`;

    var popup = L.popup().setContent(popupText);

    layer.bindPopup(popup);

    layer.showDelay = 350; //use 0 for no delay behavior
    layer.hideDelay = 0; //use 0 for normal behavior

    layer.bindTooltipDelayed(tooltipText);

    var currentFeatureStyle = styleStreets(feature);
    var currentFeatureStyleWeight = currentFeatureStyle['weight'];

    layer.on('mouseover', function (e) {
      this.setStyle({weight: currentFeatureStyleWeight + 5});
    });

    layer.on('mouseout', function (e) {
      this.setStyle({ weight: currentFeatureStyleWeight});
    });
  }

  if (overlaysIDs[0] != -1) {
    overlays.removeLayer(overlaysIDs[0]);
    overlaysIDs[0] = -1;
  }

  streets = L.geoJSON(inArray, {
    style: styleStreets,
    onEachFeature: createPopups
  });

  overlays.addLayer(streets).addTo(map);
  overlaysIDs[0] = streets._leaflet_id;
}

function toggleTab(inTabName) {
  var data = filteredStreets.top(Infinity);

  createFeatures(data, inTabName);
}

var legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
  this._div = L.DomUtil.create('div', 'legendDiv');
  this.initializeInfo();
  return this._div;
};

var tspDesignLegend = '';
tspDesignLegend += `
  <div class="row pl-3">
    <div class="col d-inline-flex flex-row align-items-center">
    <span style="background-color: #000; display: none; height: 5px; width: 10px;"></span>
    <span class="pl-2"><strong>TSP Design</strong></span>
    </div>
  </div>`;

for (var i = 0; i < tspDesignList.length; i++) {
  tspDesignLegend += `    
  <div class="row pl-3">
    <div class="col d-inline-flex flex-row align-items-center">
      <span style="background-color: ${colorMap.get(tspDict[tspDesignList[i]])}; display: block; height: 5px; width: 10px;"></span>
      <span class="pl-2">${tspDict[tspDesignList[i]]}</span>
    </div>
  </div>`;
}

var numLanesLegend = '';
numLanesLegend += `
  <div class="row pl-3">
    <div class="col d-inline-flex flex-row align-items-center">
    <span style="background-color: #000; display: none; height: 5px; width: 10px;"></span>
    <span class="pl-2"><strong>Total Number of Lanes</strong></span>
    </div>
  </div>`;

for (var i = 1; i < 8; i++) {
  numLanesLegend += `    
  <div class="row pl-3">
    <div class="col d-inline-flex flex-row align-items-center">
      <span style="background-color: #555; display: block; height: ${i}px; width: 10px;"></span>
      <span class="pl-2">${i} Lanes</span>
    </div>
  </div>`;
}

var pavementWidthLegend = '';
pavementWidthLegend += `
  <div class="row pl-3">
    <div class="col d-inline-flex flex-row align-items-center">
    <span style="background-color: #000; display: none; height: 5px; width: 10px;"></span>
    <span class="pl-2"><strong>Pavement Road Width (feet)</strong></span>
    </div>
  </div>`;

var roadWidthBreaks = ["< 25", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-69", "70+"];

for (var i = 0; i < roadWidthBreaks.length; i++) {
  pavementWidthLegend += `    
  <div class="row pl-3">
    <div class="col d-inline-flex flex-row align-items-center">
      <span style="background-color: #555; display: block; height: ${i + 1}px; width: 10px;"></span>
      <span class="pl-2">${roadWidthBreaks[i]} feet</span>
    </div>
  </div>`;
}

var currentLegendText = `
                          <div class="container p-2 d-none d-sm-block">
                            <ul class="nav nav-tabs" id="legendTabList" role="tablist">
                              <li class="nav-item">
                                <a class="nav-link active" id="tspDesignTab" data-toggle="tab" href="#tspDesign" role="tab" aria-controls="tspDesign" aria-selected="true" onclick="toggleTab('tspDesignTab');">TSP Design</a>
                              </li>
                              <li class="nav-item">
                                <a class="nav-link" id="numLanesTab" data-toggle="tab" href="#numLanes" role="tab" aria-controls="numLanes" aria-selected="true"  onclick="toggleTab('numLanesTab');">Lanes</a>
                              </li>
                              <li class="nav-item">
                                <a class="nav-link" id="pavementWidthTab" data-toggle="tab" href="#pavementWidth" role="tab" aria-controls="pavementWidth" aria-selected="true" onclick="toggleTab('pavementWidthTab');">Pavement</a>
                              </li>
                            </ul>

                            <div class="tab-content" id="legendTabContent">
                              <div class="tab-pane fade show active" id="tspDesign" role="tabpanel" aria-labelledby="tspDesignTab">
                                ${tspDesignLegend}
                              </div>
                              <div class="tab-pane fade" id="numLanes" role="tabpanel" aria-labelledby="numLanesTab">
                                ${numLanesLegend}
                              </div>
                              <div class="tab-pane fade" id="pavementWidth" role="tabpanel" aria-labelledby="pavementWidthTab">
                                ${pavementWidthLegend}
                              </div>
                            </div>
 
                          </div>
                        `;

legend.initializeInfo = function () {
  this._div.innerHTML = currentLegendText;
}

legend.addTo(map);
