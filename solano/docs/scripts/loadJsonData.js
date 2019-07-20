
function getPedestrianDataJson(inJsonFile) {

  $.ajax({
    url: inJsonFile,
    dataType: 'json',
    async: false,
    success: function (data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        var projectType = feature.properties.Project_T;
        pedestrianArray[projectType].push(feature);
      }
    }
  });
}

getPedestrianDataJson('json/pedestrian_projects_line.json');
getPedestrianDataJson('json/pedestrian_projects_point.json');

function getBikeDataJson(inJsonFile) {

  $.ajax({
    url: inJsonFile,
    dataType: 'json',
    async: false,
    success: function (data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        var facType = feature.properties.fac_type;
        var status = feature.properties.Status
        
        if (status == "Existing") {

          if ($.inArray(facType, Object.keys(existingArray)) == -1) {
            existingArray[facType] = [];
            activeExisting.push(facType);
            allExisting.push(facType);
          }
          existingArray[facType].push(feature);

        } else if (status == "Proposed") {

          if ($.inArray(facType, Object.keys(proposedArray)) == -1) {
            proposedArray[facType] = [];
            activeProposed.push(facType);
            allProposed.push(facType);
          }
          proposedArray[facType].push(feature);

        }
      }
    }
  });
}

getBikeDataJson('json/existing_bike.json');
getBikeDataJson('json/benicia_proposed.json');
getBikeDataJson('json/rio_vista_proposed.json');
getBikeDataJson('json/vacaville_proposed.json')
getBikeDataJson('json/fairfield_proposed.json')
getBikeDataJson('json/dixon_proposed.json')
getBikeDataJson('json/suisun_proposed.json')
getBikeDataJson('json/vallejo_proposed.json')