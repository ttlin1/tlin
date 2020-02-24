function cityLimitStyle() {
  return {
    fillColor: '#fff',
    fillOpacity: 0.85,
    color: '#000',
    opacity: 1,
    weight: 0.5
  }
}

function addCityBoundary() {
  var boundaryFile = 'json/boundary.json';
  var innerRing;
  var worldArray = [[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]];

  $.ajax({
    url: boundaryFile,
    dataType: 'json',
    async: false,
    success: function (data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        innerRing = feature.geometry.coordinates[0];
      }
    }
  });

  var polygonJson = {"type": "Feature", 
  "properties": {}, 
  "geometry": 
   {
     "type": "MultiPolygon", 
     "coordinates": [
       [
        worldArray,
        innerRing
       ]
     ]
   }
 };

  boundary = L.geoJSON(polygonJson, {
    style: cityLimitStyle
  });

  overlays.addLayer(boundary).addTo(map);
  overlaysIDs[99] = boundary._leaflet_id;

  boundary.bringToBack();
}

addCityBoundary();
