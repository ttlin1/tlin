/////////////////////////////////////////////// DRAWING CONTROLS

var drawnItems  = new L.FeatureGroup();
map.addLayer(drawnItems);

var pointOptions = {
  color: "#fc0000",
  fillColor: '#fff',
  fillOpacity: 0.5,
  weight: 2,
  radius: 8
};

var drawPolylineOptions = {
  shapeOptions: {
    color: "cyan",
    opacity: 0.8,
    weight: 5
  }
};

var drawPolygonOptions = {
  shapeOptions: {
    color: "#91d893",
    fillOpacity: 0.5,
    opacity: 0.5,
    weight: 1
  }
};

function removeDrawing() {
  if (map.hasLayer(drawnItems)){
    drawnItems.eachLayer(
      function(l){
        drawnItems.removeLayer(l);
    });
  }   
}

function createDrawingSubmit(e) {
  removeDrawing();

  var drawLayer = e.layer;
  var shape = drawLayer.toGeoJSON();

  drawnItems.addLayer(drawLayer);

  var shape = drawLayer.toGeoJSON();
  var shapeCoordinates = shape.geometry.coordinates;
  shapeCoordinates.push(shapeCoordinates[0]);
  bboxPolygon = turf.polygon([shapeCoordinates]);

  createFeaturesWithQuery();
}

$('#lineButton').on('click', function(e) {
  var drawLine = new L.Draw.Polyline(map, drawPolylineOptions).enable();
});

map.on('draw:created draw:edited', function (e) {
  if (e.type != "draw:edited") {
    $('#removeButtonDiv').removeClass('d-none');
    createDrawingSubmit(e);
    createStationTable();
  }
});

$('#removeButton').on('click', function() {
  removeDrawing();
  bboxPolygon = turf.polygon([[[-180, -90], [180, -90], [-180, 90], [-180, -90]]]);
  createFeaturesWithQuery();
  $('#removeButtonDiv').addClass('d-none');
});