/////////////////////////////////////////////// DRAWING CONTROLS

var pointOptions = {
  radius: 5,
  fillColor: "cyan",
  color: "#000",
  weight: 0.25,
  opacity: 0.8,
  fillOpacity: 0.8
};

var drawPolylineOptions = {
  shapeOptions: {
    color: "cyan",
    opacity: 0.8,
    weight: 5,
    dashArray: "10 10"
  }
};

var drawPolygonOptions = {
  shapeOptions: {
    color: "cyan",
    fillOpacity: 0.5,
    opacity: 0.5,
    weight: 1
  }
};

function createDrawingSubmit(e, drawTypeNumber) {

  if (drawTypeNumber == 0) {
    var drawLayer = e;
    var shape = e.toGeoJSON();
    var layerType = "point";
  } else if (drawTypeNumber == 1) {
    var drawLayer = e.layer;
    var shape = drawLayer.toGeoJSON();
    var layerType = e.layerType;
  }

  drawingNumbers.push(drawLayer._leaflet_id);
  drawnItems.addLayer(drawLayer);

  overlaysIDs[5] = drawLayer._leaflet_id;

  switch (layerType) {
    case "polyline":
      var coords = e.layer._latlngs[0];
      break;
    case "polygon":
      var coords = e.layer._latlngs[0][0];
      break;
    case "point":
      var coords = e._latlng;
      break;
    default:
      console.log(layerType);
  }

  var currentDrawingNumber = drawingNumbers.length.toString();

  var popupContent = '<div>';

  popupContent += '<form id="drawingSurveyForm">';

  var surveyQuestionsKeys = Object.keys(surveyQuestions);
  for (var i = 1; i < surveyQuestionsKeys.length + 1; i++) {
    popupContent += '<h6><strong>' + surveyQuestions[i]['Question'] + "</strong></h6>";

    var responseType = surveyQuestions[i]['Response Type'];
    var textRows = surveyQuestions[i]['textRows'];

    switch (responseType) {
      case "radio":
        var options = surveyQuestions[i]['Responses'].split(",");
        options = options.map(x => x.replace(/(^\s+|\s+$)/mg, ""));

        for (var j = 0; j < options.length; j++) {
          popupContent += '<div class="form-check">';

          var currentId = 'DrawingQuestion' + i.toString() + options[j];
          popupContent += '<input class="form-check-input" type="' + surveyQuestions[i]['Response Type'] + '" name="DrawingQuestion' + i.toString() + '" value="' + options[j] + '" id="' + currentId + '">';
          popupContent += '<label class="form-check-label" for="' + currentId + '">' + options[j] + '</label>';

          popupContent += '</div>';
        }
        break;

      case "text":
        var currentId = 'DrawingQuestion' + i.toString();

        popupContent += '<div class="form-group">';
        popupContent += `<textarea class="form-control" id="${currentId}" rows="${textRows}"></textarea>`;
        popupContent += '</div>';

        break;

      case "checkbox":
        var options = surveyQuestions[i]['Responses'].split(",");
        options = options.map(x => x.replace(/(^\s+|\s+$)/mg, ""));

        for (var j = 0; j < options.length; j++) {

          popupContent += '<div class="form-check">';

          var currentId = 'DrawingQuestion' + i.toString() + options[j];
          popupContent += '<input class="form-check-input" type="' + surveyQuestions[i]['Response Type'] + '" name="DrawingQuestion' + i.toString() + '" value="' + options[j] + '" id="' + currentId + '">';
          popupContent += '<label class="form-check-label" for="' + currentId + '">' + options[j] + '</label>';

          if (options[j] == 'Other') {
            popupContent += '<div class="form-group d-none" id="otherTextDiv' + currentId + '">';
            popupContent += '<textarea class="form-control" id="otherText' + currentId + '" rows="1" placeholder="Other..."></textarea>';
            popupContent += '</div>';
          }

          popupContent += '</div>';
        }
        break;

      default:
        console.log(responseType);
    } // end switch statement
    popupContent += '<hr>';
  } // end survey questions loop


  popupContent += `<button type="submit" id="drawingSubmitButton${currentDrawingNumber}" class="btn btn-primary">Submit</button></form><div id="drawingSubmitMessage"></div>`;

  var popup = L.popup({closeOnClick: false})
    .setLatLng(coords)
    .setContent(popupContent);
  drawLayer.bindPopup(popup)
  popup.openOn(map);

  drawLayer.on('popupclose', function() {
    drawnItems.removeLayer(drawLayer._leaflet_id);

    var currentWindowWidth = $(window).width();
    if (currentWindowWidth < 600) {
      $("#introDivSpanId").toggle();
    }
  });

  $("button").removeClass("active");

  $('#drawingSubmitButton' + drawingNumbers.length.toString()).on('click', function() {
    let currentEpochTime = Date.now();
    // let commentDate = new Date(Date.now()).toDateString();
    var currentDateTime = new Date(Date.now());

    shape.properties["Datetime"] = currentDateTime;
    shape.properties["ID"] = currentEpochTime;

    var valuesToAppend = {"Shape": JSON.stringify(shape)};

    valuesToAppend["ID"] = currentEpochTime;
    valuesToAppend["IP Address"] = ip_address;
    valuesToAppend["Datetime"] = currentDateTime;

    var surveyQuestionsKeys = Object.keys(surveyQuestions);

    for (var k = 1; k < surveyQuestionsKeys.length + 1; k++) {
      var responseType = surveyQuestions[k]['Response Type'];
      var currentQuestionNumber = "DrawingQuestion " + k.toString();
      var currentQuestionNumberWithoutSpace = currentQuestionNumber.replace(" ", "");

      switch (responseType) {
        case "radio":
          valuesToAppend[surveyQuestions[k.toString()]["Question"]] = $('input[name=' + currentQuestionNumberWithoutSpace + ']:checked').val();
          break;
        case 'text':
          valuesToAppend[surveyQuestions[k.toString()]["Question"]] = $('#' + currentQuestionNumberWithoutSpace).val();
          break;
        case 'checkbox':
          var selectedCheckboxes = $(`input[name=${currentQuestionNumberWithoutSpace}]:checked`);

          var valuesArray = [];
          for (var m = 0; m < selectedCheckboxes.length; m++) {
            valuesArray.push(selectedCheckboxes[m].value);
          }

          if ($.inArray('Other', valuesArray) > -1) {
            valuesArray.push($(`#otherText${currentQuestionNumberWithoutSpace}Other`).val());
          }

          var valuesString = valuesArray.join();

          valuesToAppend[surveyQuestions[k.toString()]["Question"]] = valuesString;
          break;
        default:
          console.log(responseType);
      }
    }

    $.ajax({
      url: c.m.d,
      method: "GET",
      dataType: "json",
      data: valuesToAppend
    });

    $('#drawing' + drawingNumbers.length.toString()).attr('disabled', true);
    $('#drawingSubmitButton' + drawingNumbers.length.toString()).remove();
    $('#drawingSubmitMessage').html("Thanks for sharing your input!");

    $('#drawingSurveyForm').remove();

    // var popup = L.popup()
    //   .setLatLng(coords)
    //   .setContent(`<blockquote class="blockquote text-center"><p class="mb-0">${commentSubmitted}</p>
    //                <footer class="blockquote-footer">Comment submitted ${commentDate}</footer>
    //                </blockquote>`);
    // drawLayer.bindPopup(popup);

    drawLayer.off('popupclose');

    var currentWindowWidth = $(window).width();
    if (currentWindowWidth < 600) {
      $("#introDivSpanId").toggle();
    }
  });
}

$('#pointButton').on('click', function(e) {
  var currentWindowWidth = $(window).width();
  if (currentWindowWidth < 600) {
    $("#introDivSpanId").toggle();
  }

  $('#pointButton').button('toggle');
  e.stopPropagation();

  document.getElementById('participationMapDiv').style.cursor = 'crosshair';

  function addNewMarker(e) {
    var marker = new L.circleMarker(e.latlng, pointOptions).addTo(map);
    map.off('click', addNewMarker);
    createDrawingSubmit(marker, 0);
    document.getElementById('participationMapDiv').style.cursor = '';
  }

  map.on('click', addNewMarker);
});

$('#lineButton').on('click', function(e) {
  var currentWindowWidth = $(window).width();
  if (currentWindowWidth < 600) {
    $("#introDivSpanId").toggle();
  }

  $('#lineButton').button('toggle');
  var drawLine = new L.Draw.Polyline(map, drawPolylineOptions).enable();
});

map.on('draw:created draw:edited', function (e) {
  if (e.type != "draw:edited") {
    createDrawingSubmit(e, 1);
  }
});
