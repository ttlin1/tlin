
function getBikeDataJson(inJsonFile) {

  $.ajax({
    url: inJsonFile,
    dataType: 'json',
    async: false,
    success: function (data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        var existing = feature.properties.ex_bike;
        var proposed = feature.properties.old_rec_bike;

        if (existing != null) {

          if ($.inArray(existing, Object.keys(existingArray)) == -1) {
            existingArray[existing] = [];
            activeExisting.push(existing);
            allExisting.push(existing);
          }
          existingArray[existing].push(feature);

        } else if (proposed != null) {

          if ($.inArray(proposed, Object.keys(proposedArray)) == -1) {
            proposedArray[proposed] = [];
            activeProposed.push(proposed);
            allProposed.push(proposed);
          }
          proposedArray[proposed].push(feature);
        }
      }
    }
  });
}

getBikeDataJson('json/roads.geojson');

