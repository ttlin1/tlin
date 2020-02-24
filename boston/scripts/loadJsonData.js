
// function getMaxScore() {
  
//   var totalScoreMax = -1;
//   var transScoreMax = -1;
//   var equityScoreMax = -1;

//   var transScore = 0;
//   var equityScore = 0;

//   var transportationWeightCategories = ["bus", "bluebike", "zipcar"];
//   var transportationRankFieldNames = ["Bus_Rank", "Blu_Rank", "Zip_Rank"];

//   var equityWeightCategories = ["race", "education", "english", "income", "car", "community"];
//   var equityRankFieldNames = ["Min_Rank", "NoC_Rank", "LEP_Rank", "Per_Rank", "NoV_Rank", "COMMU_RANK"];

//   for (var i = 0; i < hexagonArray.length; i++) {
//     transScore = 0;
//     equityScore = 0;

//     for (var j = 0; j < transportationWeightCategories.length; j++) {
//       var currentWeight = $(`#${transportationWeightCategories[j]}-range`).slider('value');
//       transScore += parseInt(currentWeight) * parseFloat(hexagonArray[i].properties[transportationRankFieldNames[j]]);
//     }

//     if (transScore > transScoreMax) {
//       transScoreMax = transScore;
//     }

//     for (var k = 0; k < equityWeightCategories.length; k++) {
//       var currentWeight = $(`#${equityWeightCategories[k]}-range`).slider('value');
//       equityScore += parseInt(currentWeight) * parseFloat(hexagonArray[i].properties[equityRankFieldNames[k]]);
//     }

//     if (equityScore > equityScoreMax) {
//       equityScoreMax = equityScore;
//     }

//     var totalScore = equityScore + transScore;
//     if (totalScore > totalScoreMax) {
//       totalScoreMax = totalScore;
//     }
//   }

//   return [totalScoreMax, transScoreMax, equityScoreMax];
// }

function getLocationsDataJson(inJsonFile, inArray) {

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

  // [maxScore, maxTransScore, maxEquityScore] = getMaxScore();
}

getLocationsDataJson('json/hexagons_2020_02_10.geojson', hexagonArray);
getLocationsDataJson('json/bus.json', busArray);
getLocationsDataJson('json/bus_walkshed.json', busWalkshedArray);
getLocationsDataJson('json/bluebikes.json', bluebikesArray);
getLocationsDataJson('json/bluebikes_walkshed.json', bluebikesWalkshedArray);
getLocationsDataJson('json/zipcar.json', zipcarArray);
getLocationsDataJson('json/zipcar_walkshed.json', zipcarWalkshedArray);
getLocationsDataJson('json/subway.json', subwayArray);
getLocationsDataJson('json/subway_walkshed.json', subwayWalkshedArray);
getLocationsDataJson('json/ev.json', evArray);
getLocationsDataJson('json/ev_walkshed.json', evWalkshedArray);
getLocationsDataJson('json/hex_points.json', hexPointsArray);
getLocationsDataJson('json/Public_Libraries.json', libraryArray);
getLocationsDataJson('json/Public_Schools.json', schoolArray);
getLocationsDataJson('json/Existing_Bike_Network_2019.json', bikeNetworkArray);
getLocationsDataJson('json/Community_Centers.json', communityArray);
getLocationsDataJson('json/open_space.json', parksArray);
getLocationsDataJson('json/ej_poly.json', ejArray);
getLocationsDataJson('json/landmarks.json', landmarksArray);