const patternAreaChart = new dc.PieChart('#patternAreaChartId');
const numberLanesChart = new dc.BarChart('#numberLanesChartId');

const existingBikewayChart = new dc.BarChart('#existingBikewayChartId');
const swWidthChart = new dc.BarChart('#swWidthChartId');

const widthChart = new dc.ScatterPlot('#widthChartId');

const tspDesignChart = new dc.RowChart('#tspDesignChartId');
const tspTransitChart = new dc.RowChart('#tspTransitChartId');
const tspBikeChart = new dc.RowChart('#tspBikeChartId');
const tspPedestrianChart = new dc.RowChart('#tspPedestrianChartId');
const tspFreightChart = new dc.RowChart('#tspFreightChartId');
const tspTrafficChart = new dc.RowChart('#tspTrafficChartId');

var filteredStreets;

var fieldList = ["TSP_StreetName", "Pavement_RoadWidth", "ROW_Width", "Portland_Pattern_Area", "Number_Lanes", "CenterLane", "TSP_Design", "TSP_Transit", "TSP_Bicycle", "TSP_ToBeAdopted_Pedestrian", "TSP_Freight", "TSP_Traffic", "PedDistricts_New", "Miles", "Pavement_begLocation", "ACTIVE_Facility", "AVG_SW_Width", "SWs_Count", "Parking"];
var fieldString = fieldList.join('%2C+');

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var geometryPrecision = 5;

var resetFilterBoolean = false;

//Exclude_In_Tableau = 0 AND Pavement_RoadWidth NOT IN (0, 1) AND TSP_Traffic <> 'N/A' AND ROW_Width <> 200 AND ROW_Width IS NOT NULL AND TSP_Design <> 'UT' AND TSP_ToBeAdopted_Pedestrian <> 'OSP'
var whereClause = 'Exclude_In_Tableau+%3D+0+AND+Pavement_RoadWidth+NOT+IN+%280%2C+1%29+AND+TSP_Traffic+%3C%3E+%27N%2FA%27+AND+ROW_Width+%3C%3E+200+AND+ROW_Width+IS+NOT+NULL+AND+TSP_Design+%3C%3E+%27UT%27+AND+TSP_ToBeAdopted_Pedestrian+%3C%3E+%27OSP%27';

var streetsJson = `https://services6.arcgis.com/bom7L4u7y1k0qkF1/arcgis/rest/services/Streets2035_Data/FeatureServer/0/query?where=${whereClause}&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Foot&returnGeodetic=false&outFields=${fieldString}&returnHiddenFields=false&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=${geometryPrecision}&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson`;

class mapGroup {
  constructor(parent, group) {
    this._root = d3.select(parent);
    dc.registerChart(this, group);
  }

  // interface for dc.js chart registry

  render() {
    if (!(resetFilterBoolean)) {
      var mileageGroup = filteredStreets.group().reduceSum(function (d) {return d.length;});
      $('#totalStreetMileageId').html(numberWithCommas((mileageGroup.top(Infinity)[0].value).toFixed(1)) + ' Miles');

      var data = filteredStreets.top(Infinity);

      createFeatures(data, $('#legendTabList a.active')[0].id);

      var chartList = dc.chartRegistry.list().filter(x => x.hasOwnProperty('_filters'));

      if (chartList.some(c => c.hasFilter())) {
        mapIsUpdated(false)
      } else {
        mapIsUpdated(true);
      }
    }
    this.redraw();
  }

  redraw() {
    if (!(resetFilterBoolean)) {
      var mileageGroup = filteredStreets.group().reduceSum(function (d) {return d.length;});
      $('#totalStreetMileageId').html(numberWithCommas((mileageGroup.top(Infinity)[0].value).toFixed(1)) + ' Miles');

      var data = filteredStreets.top(Infinity);

      createFeatures(data, $('#legendTabList a.active')[0].id);

      var chartList = dc.chartRegistry.list().filter(x => x.hasOwnProperty('_filters'));

      if (chartList.some(c => c.hasFilter())) {
        mapIsUpdated(false)
      } else {
        mapIsUpdated(true);
      }
    }
  }
}

const mapGroupConst = new mapGroup('#mapGroup');

d3.json(streetsJson).then(data => {

  data.features.forEach(d => {
    streetsArray.push(d);
    d.pattern = d.properties.Portland_Pattern_Area;
    d.lanes = parseInt(d.properties.Number_Lanes) + parseInt(d.properties.CenterLane);
    d.row_width = d.properties.ROW_Width;
    d.pavement_width = d.properties.Pavement_RoadWidth;
    d.design = $.inArray(d.properties.TSP_Design, Object.keys(tspDict)) > -1 ? tspDict[d.properties.TSP_Design] : '';
    d.transit = $.inArray(d.properties.TSP_Transit, Object.keys(transitDict)) > -1 ? transitDict[d.properties.TSP_Transit] : '';
    d.bike = $.inArray(d.properties.TSP_Bicycle, Object.keys(bikeDict)) > -1 ? bikeDict[d.properties.TSP_Bicycle] : '';
    d.pedestrian = $.inArray(d.properties.TSP_ToBeAdopted_Pedestrian, Object.keys(pedDict)) > -1 ? pedDict[d.properties.TSP_ToBeAdopted_Pedestrian] + " - " + pedDistrictDict[d.properties.PedDistricts_New].toString() : '';
    d.freight = $.inArray(d.properties.TSP_Freight, Object.keys(freightDict)) > -1 ? freightDict[d.properties.TSP_Freight] : '';
    d.traffic = $.inArray(d.properties.TSP_Traffic, Object.keys(trafficDict)) > -1 ? trafficDict[d.properties.TSP_Traffic] : '';
    d.existing_bikeway = d.properties.ACTIVE_Facility;
    d.sidewalk_width = d.properties.AVG_SW_Width;

    d.length = parseFloat(d.properties.Miles);
  });

  const streetsData = crossfilter(data.features);
  filteredStreets = streetsData.dimension(function(d) {return d});

  function removeNullsFromGroup(source_group) {
    return {
      all:function () {
        return source_group.all().filter(d => $.inArray(d.key, ["", " "]) == -1);
      }
    };
  }

  var mileageGroup = filteredStreets.group().reduceSum(function (d) {return d.length;});

  const pattern = streetsData.dimension(d => d.pattern);
  // Produce counts records in the dimension
  const patternGroup = pattern.group().reduceSum(function(d) {return d.length;});

  // Dimension by lanes
  const lanesDimension = streetsData.dimension(d => d.lanes);
  const lanesGroup = lanesDimension.group().reduceSum(function(d) {return d.length;});

  // Dimension by existing bikeway
  const existingBikewayDimension = streetsData.dimension(d => d.existing_bikeway);
  const existingBikewayDimensionGroup = existingBikewayDimension.group().reduceSum(function(d) {return d.length;});

  // Dimension by sidewalk width
  const sidewalkWidthDimension = streetsData.dimension(d => d.sidewalk_width);
  const sidewalkWidthDimensionGroup = sidewalkWidthDimension.group().reduceSum(function(d) {return d.length;});

  // Dimension by ROW Width and Pavement Road Width
  const scatterWidthDimension = streetsData.dimension(function(d) {return [+d.row_width, +d.pavement_width, d.design]});
  const scatterWidthDimensionGroup = scatterWidthDimension.group();

  // Dimension by TSP Design
  const tspDesignDimension = streetsData.dimension(d => d.design);
  const tspDesignDimensionGroup = tspDesignDimension.group().reduceSum(function(d) {return d.length;});

  // Dimension by TSP Transit
  const tspTransitDimension = streetsData.dimension(d => d.transit);
  const tspTransitDimensionGroup = tspTransitDimension.group().reduceSum(function(d) {return d.length;});

  // Dimension by TSP Bicycle
  const tspBikeDimension = streetsData.dimension(d => d.bike);
  const tspBikeDimensionGroup = tspBikeDimension.group().reduceSum(function(d) {return d.length;});

  // Dimension by TSP Pedestrian
  const tspPedestrianDimension = streetsData.dimension(d => d.pedestrian);
  const tspPedestrianDimensionGroup = tspPedestrianDimension.group().reduceSum(function(d) {return d.length;});

  // Dimension by TSP Freight
  const tspFreightDimension = streetsData.dimension(d => d.freight);
  const tspFreightDimensionGroup = tspFreightDimension.group().reduceSum(function(d) {return d.length;});

  // Dimension by TSP Traffic
  const tspTrafficDimension = streetsData.dimension(d => d.traffic);
  const tspTrafficDimensionGroup = tspTrafficDimension.group().reduceSum(function(d) {return d.length;});

  var bluesList = ["#A8C9E6", "#8BB8DE", "#6EA6D5", "#5194CD", "#3482C5", "#1871BD", "#E2EDF6", "#C5DBEE"];

  patternAreaChart
    .width(300)
    .height(200)
    .radius(100)
    .innerRadius(30)
    // .minAngleForLabel(0)
    .dimension(pattern)
    .group(patternGroup)
    .ordinalColors(bluesList)
    .title(function (p) {
      return p.key + ': ' + numberWithCommas(p.value.toFixed(1)) + ' Miles'
    });

  numberLanesChart
    .width(320)
    .height(200)
    .dimension(lanesDimension)
    .group(lanesGroup)
    .x(d3.scaleBand().domain([1, 2, 3, 4, 5]))
    .xUnits(dc.units.ordinal)
    .mouseZoomable(true)
    .elasticY(true)
    .title(function (p) {
      return p.key + ': ' + numberWithCommas(p.value.toFixed(1)) + ' Miles'
    })
    // .filterPrinter(filters => {
    //                 const filter = filters[0];
    //                 let s = '';

    //                 function round50(inNum, boundIndex) {
    //                   var labelNumber;

    //                   if (boundIndex == 1) {
    //                     if ((inNum % 1) < 0.5) {
    //                       labelNumber = Math.floor(inNum);
    //                     } else {
    //                       labelNumber = Math.ceil(inNum);
    //                     }
    //                   } else {
    //                     labelNumber = Math.ceil(inNum)
    //                   }
                      
    //                   return labelNumber;
    //                 }

    //                 s += ` ${round50(filter[0], 0)} -> ${round50(filter[1], 1)}`;
    //                 return s;
    //               })
    .ordinalColors(bluesList)
    .xAxis().tickValues([1, 2, 3, 4, 5]).tickFormat(function(v) {return parseInt(v);});

  existingBikewayChart
    .width(300)
    .height(200)
    .dimension(existingBikewayDimension)
    .group(removeNullsFromGroup(existingBikewayDimensionGroup))
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .elasticY(true)
    .title(function (p) {
      return p.key + ': ' + numberWithCommas(p.value.toFixed(1)) + ' Miles'
    })
    .ordinalColors(bluesList);

  swWidthChart
    .width(300)
    .height(200)
    .dimension(sidewalkWidthDimension)
    .group(sidewalkWidthDimensionGroup)
    .x(d3.scaleLinear().domain([0, 30]))
    .elasticY(true)
    .filterPrinter(filters => {
                    const filter = filters[0];
                    let s = '';

                    function round50(inNum, boundIndex) {
                      var labelNumber;

                      if (boundIndex == 1) {
                        if ((inNum % 1) < 0.5) {
                          labelNumber = Math.floor(inNum);
                        } else {
                          labelNumber = Math.ceil(inNum);
                        }
                      } else {
                        labelNumber = Math.ceil(inNum)
                      }
                      
                      return labelNumber;
                    }

                    s += ` ${round50(filter[0], 0)} -> ${round50(filter[1], 1)}`;
                    return s;
                  })
    .barPadding(1)
    .ordinalColors(bluesList)
    .xAxis().tickValues([0, 5, 10, 15, 20, 25, 30]).tickFormat(function(v) {return parseInt(v);});;

  tspDesignChart.width(305)
    .height(150)
    .margins({top: 0, right: 0, bottom: 20, left: 20})
    .dimension(tspDesignDimension)
    .group(removeNullsFromGroup(tspDesignDimensionGroup))
    .colors(colorScale)
    // Title sets the row text
    .elasticX(true)
    .title(function (p) {
      return p.key + ': ' + numberWithCommas(p.value.toFixed(1)) + ' Miles'
    })
    .xAxis().ticks(4);

  tspTransitChart.width(305)
    .height(150)
    .margins({top: 0, right: 0, bottom: 20, left: 20})
    .dimension(tspTransitDimension)
    .group(removeNullsFromGroup(tspTransitDimensionGroup))
    // Title sets the row text
    .elasticX(true)
    .ordinalColors(bluesList)
    .title(function (p) {
      return p.key + ': ' + numberWithCommas(p.value.toFixed(1)) + ' Miles'
    })
    .xAxis().ticks(4);

  tspBikeChart.width(305)
    .height(150)
    .margins({top: 0, right: 0, bottom: 20, left: 20})
    .dimension(tspBikeDimension)
    .group(removeNullsFromGroup(tspBikeDimensionGroup))
    // Title sets the row text
    .elasticX(true)
    .ordinalColors(bluesList)
    .title(function (p) {
      return p.key + ': ' + numberWithCommas(p.value.toFixed(1)) + ' Miles'
    })
    .xAxis().ticks(4);

  tspPedestrianChart.width(305)
    .height(150)
    .margins({top: 0, right: 0, bottom: 20, left: 20})
    .dimension(tspPedestrianDimension)
    .group(removeNullsFromGroup(tspPedestrianDimensionGroup))
    // Title sets the row text
    .elasticX(true)
    .ordinalColors(bluesList)
    .title(function (p) {
      return p.key + ': ' + numberWithCommas(p.value.toFixed(1)) + ' Miles'
    })
    .xAxis().ticks(4);

  tspFreightChart.width(305)
    .height(150)
    .margins({top: 0, right: 0, bottom: 20, left: 20})
    .dimension(tspFreightDimension)
    .group(removeNullsFromGroup(tspFreightDimensionGroup))
    // Title sets the row text
    .elasticX(true)
    .ordinalColors(bluesList)
    .title(function (p) {
      return p.key + ': ' + numberWithCommas(p.value.toFixed(1)) + ' Miles'
    })
    .xAxis().ticks(4);

  tspTrafficChart.width(305)
    .height(150)
    .margins({top: 0, right: 0, bottom: 20, left: 20})
    .dimension(tspTrafficDimension)
    .group(removeNullsFromGroup(tspTrafficDimensionGroup))
    // Title sets the row text
    .elasticX(true)
    .ordinalColors(bluesList)
    .title(function (p) {
      return p.key + ': ' + numberWithCommas(p.value.toFixed(1)) + ' Miles'
    })
    .xAxis().ticks(4);

  widthChart
    .width(675)
    .height(300)
    .x(d3.scaleLinear().domain([0, 200]))
    .brushOn(true)
    .symbolSize(2)
    .colorAccessor(function(d) {return d.key[2]; })
    .colors(colorScale)
    .clipPadding(10)
    .yAxisLabel("Pavement Road Width")
    .xAxisLabel("ROW Width")
    .title(function (p) {
      return p.key + ': ' + numberWithCommas(p.value.toFixed(1)) + ' Miles'
    })
    .filterPrinter(filters => {

                    const filter = filters[0];
                    let s = '';
                    var rowMin = filter[0][0];
                    var rowMax = filter[1][0];

                    var pavementMin = filter[0][1];
                    var pavementMax = filter[1][1];

                    if (rowMax < rowMin) {
                      [rowMin, rowMax] = [rowMax, rowMin];
                    }

                    if (pavementMax < pavementMin) {
                      [pavementMin, pavementMax] = [pavementMax, pavementMin];
                    }

                    s += ` ${rowMin.toFixed(1)} feet to ${rowMax.toFixed(1)} feet (ROW) -> ${pavementMin.toFixed(1)} feet to ${pavementMax.toFixed(1)} feet (Road Width)`;
                    return s;
                    
                    
                  })
    .dimension(scatterWidthDimension)
    .group(scatterWidthDimensionGroup);

  dc.renderAll();
  createFeatures(streetsArray, "tspDesignTab");

  $('#overlayPane').remove();

  $('#totalStreetMileageId').html(numberWithCommas((mileageGroup.top(Infinity)[0].value).toFixed(1)) + ' Miles');

  // streetsData.onChange(function() {
  //   if (!(resetFilterBoolean)) {
  //     var mileageGroup = filteredStreets.group().reduceSum(function (d) {return d.length;});
  //     $('#totalStreetMileageId').html(numberWithCommas((mileageGroup.top(Infinity)[0].value).toFixed(1)) + ' Miles');

  //     var data = filteredStreets.top(Infinity);

  //     createFeatures(data, $('#legendTabList a.active')[0].id);

  //     if (dc.chartRegistry.list().some(c=>c.hasFilter())) {
  //       mapIsUpdated(false)
  //     } else {
  //       mapIsUpdated(true);
  //     }
  //   }
  // });
  
  function addChartYAxis(chartToUpdate, displayText) {
    chartToUpdate.svg()
    .append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", -25)
    .attr("transform", "translate(12,90),rotate(-90)")
    .text(displayText);
  }

  addChartYAxis(numberLanesChart, "Total Mileage");
  addChartYAxis(existingBikewayChart, "Total Mileage");
  addChartYAxis(swWidthChart, "Total Mileage");

  // add labels to row charts
  var tspChartList = [tspDesignChart, tspTransitChart, tspPedestrianChart, tspBikeChart, tspFreightChart, tspTrafficChart];

  function addChartXAxis(chartToUpdate, displayText) {

    chartToUpdate.svg()
      .append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", chartToUpdate.width() / 2)
      .attr("y", chartToUpdate.height())
      .attr("dy", 15)
      .text(displayText);
  }

  for (var c = 0; c < tspChartList.length; c++) {
    addChartXAxis(tspChartList[c], 'Total Mileage');
  }

  $('.x-axis-label').css({'stroke': '#fff', 'fill': '#fff'});
  $('.y-axis-label').css({'stroke': '#fff', 'fill': '#fff'});

});

function mapIsUpdated(inBoolean) {
  if (inBoolean) {
    $('#resetFilters').html('Map is updated');
    $('#resetFilters').prop('disabled', true);
    $('#resetFilters').removeClass('btn-primary');
    $('#resetFilters').addClass('btn-light');
  } else {
    $('#resetFilters').html('Reset all filters');
    $('#resetFilters').prop('disabled', false);
    $('#resetFilters').removeClass('btn-light');
    $('#resetFilters').addClass('btn-primary');
  }
}

d3.select('#resetFilters').on('click', function() {
  resetFilterBoolean = true;

  var chartList = dc.chartRegistry.list().filter(x => x.hasOwnProperty('_filters'));

  for (var c = 0; c < chartList.length; c++) {
    if (chartList[c].hasFilter()) {
      chartList[c].filterAll();
    }
  }

  dc.redrawAll();

  mapIsUpdated(true);

  resetFilterBoolean = false;
});

//Determine the current version of dc with `dc.version`
d3.selectAll('#version').text(dc.version);

// Determine latest stable version in the repo via Github API
d3.json('https://api.github.com/repos/dc-js/dc.js/releases/latest').then(latestRelease => {
  /* eslint camelcase: 0 */
d3.selectAll('#latest').text(latestRelease.tag_name);
});