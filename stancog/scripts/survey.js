//////////////////////////////////////////////// SURVEY
function createSurvey(feature, layer) {

  var selectedLanguageIndex = 0;

  var popupText = "";
  var tooltipText = "";
  var project_id = feature.properties.id;
  var status;
  var location = feature.properties.name;

  if (feature.properties.ex_bike != null) {
    status = "Existing";
    facType = feature.properties.ex_bike;
  }

  if (feature.properties.old_rec_bike != null) {
    status = "Proposed";
    facType = feature.properties.old_rec_bike;
  }

  popupText = `<p><strong>${capitalize(status)} Location</strong>: ${capitalize(location)}</p>`;
  tooltipText = `<p class="text-center p-2 align-middle"><strong>${capitalize(status)} Location</strong>: ${capitalize(location)}<br>Click to comment.</p>`;

  var popup = L.popup({ closeButton: false }).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(tooltipText);

  var clicked = false;

  layer.on('mouseover', function (e) {
    try {
      if ((Object.keys(e.sourceTarget._eventParents)[0] != overlaysIDs[3]) && (Object.keys(e.sourceTarget._eventParents[Object.keys(e.sourceTarget._eventParents)[0]]._eventParents)[0] != overlaysIDs[3])) {
        this.setStyle({ weight: 10, opacity: 0.8 });
      } else {
        this.setStyle({ radius: 10 })
      }
    } catch {
      this.setStyle({ weight: 10, opacity: 0.8 });
    }

  });

  layer.on('mouseout', function (e) {
    if (clicked == false) {
      try {
        if ((Object.keys(e.sourceTarget._eventParents)[0] != overlaysIDs[3]) && (Object.keys(e.sourceTarget._eventParents[Object.keys(e.sourceTarget._eventParents)[0]]._eventParents)[0] != overlaysIDs[3])) {
          this.setStyle({ weight: 5, opacity: 0.8 });
        } else {
          this.setStyle({ radius: 5 })
        }
      } catch {
        this.setStyle({ weight: 5, opacity: 0.8 });
      }
    }
  });

  layer.on('click', function (e) {
    existing.setStyle({weight: 5, opacity: 0.8});
    proposed.setStyle({weight: 5, opacity: 0.8});

    clicked = true;

    map.closePopup();

    var surveyString = '<button type="button" id="closeButton" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

    var headersToDisplay = {"name": "Street Name",
                            "fclass": "Street Type",
                            "ex_bike": "Existing",
                            "old_rec_bike": "Proposed"};

    var headersKeys = Object.keys(headersToDisplay);
    for (var i = 0; i < headersKeys.length; i++) {
      surveyString += `<h6><strong>${headersToDisplay[headersKeys[i]]}</strong>: ${blankIfNull(feature.properties[headersKeys[i]])}</h6>`;
    }
    
    var currentStreetViewID = 'streetViewImagery' + project_id;

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

    surveyString += `<br><div id="${currentStreetViewID}" class="streetViewImagery"></div>
    <script>
      var panorama;
      function initialize() {
        panorama = new google.maps.StreetViewPanorama(document.getElementById('${currentStreetViewID}'), {               
              zoom: 1,
              linksControl: false,
              panControl: false,
              enableCloseButton: false,
              fullscreenControl: false,
              zoomControl: false});
        var sv = new google.maps.StreetViewService();
        sv.getPanorama({location: {lat: ${e.latlng.lat}, lng: ${e.latlng.lng}}, source: 'outdoor'}, processSVData);
        
        function processSVData(data, status) {
          if (status === 'OK') {
            panorama.setPano(data.location.pano);
            panorama.setPov({
              heading: data.links[0].heading,
              pitch: 0
            });
            panorama.setVisible(true);
          } else {
            $('#${currentStreetViewID}').html('<div class="container bg-dark text-white"><div class="row justify-content-md-center align-items-center" style="height: 300px"><h6>Street View data not found for this location.</h6></div></div>');
          }
        }
      }
    </script>`;

    surveyString += '<br><hr>';

    surveyString += '<form id="surveyForm">';

    for (var i = 1; i < surveyQuestionsKeys.length + 1; i++) {
      surveyString += '<h6><strong>' + surveyQuestions[i]['Question'] + "</strong></h6>";

      var responseType = surveyQuestions[i]['Response Type'];

      switch (responseType) {
        case "radio":
          var options = surveyQuestions[i]['Responses'].split(",");
          options = options.map(x => x.replace(/(^\s+|\s+$)/mg, ""));

          for (var j = 0; j < options.length; j++) {
            surveyString += '<div class="form-check">';

            var currentId = 'Question' + i.toString() + options[j];
            surveyString += '<input class="form-check-input" type="' + surveyQuestions[i]['Response Type'] + '" name="Question' + i.toString() + '" value="' + options[j] + '" id="' + currentId + '">';
            surveyString += '<label class="form-check-label" for="' + currentId + '">' + options[j] + '</label>';

            surveyString += '</div>';
          }
          break;

        case "text":
          var textRows = surveyQuestions[i]['textRows'];

          var currentId = 'Question' + i.toString();

          surveyString += '<div class="form-group">';
          surveyString += `<textarea class="form-control" id="${currentId}" rows="${textRows}"></textarea>`;
          surveyString += '</div>';
          break;

        case "checkbox":
          var options = surveyQuestions[i]['Responses'].split(",");
          options = options.map(x => x.replace(/(^\s+|\s+$)/mg, ""));

          for (var j = 0; j < options.length; j++) {
            surveyString += '<div class="form-check">';

            var currentId = 'Question' + i.toString() + options[j];
            surveyString += '<input class="form-check-input" type="' + surveyQuestions[i]['Response Type'] + '" name="Question' + i.toString() + '" value="' + options[j] + '" id="' + currentId + '">';
            surveyString += '<label class="form-check-label" for="' + currentId + '">' + options[j] + '</label>';

            surveyString += '</div>';
          }
          break;

        default:
          console.log(responseType);
      } // end switch statement
      surveyString += '<hr>';
    } // end survey questions loop

    surveyString += '<button type="submit" id="submitButton" class="btn btn-primary">Submit</button>';

    var thanksSubmitText = ["Thanks for submitting your survey!", "Gracias por enviar tu encuesta!"]
    surveyString += '</div></form>';

    surveyString += '<div id="submitMessage"></div><div id="previousComments"></div>';

    $('#sideBarDivId').html(surveyString);

    if ($.inArray(project_id, Object.keys(previousComments)) > -1) {
      var previousCommentString = '<hr style="border: 1px solid #fff;"><h6>Previously Submitted Comments</h6><br>';

      for (var m = 0; m < previousComments[project_id].length; m++) {
        previousCommentString += `<blockquote class="blockquote">
                                    <p class="mb-0">${previousComments[project_id][m][0]}</p>
                                    <footer class="blockquote-footer">${previousComments[project_id][m][1]}, <cite title="Source Title">${previousComments[project_id][m][2]}</cite></footer>
                                  </blockquote>`;
      }

      $('#previousComments').html(previousCommentString);
    }
    
    initialize();
    sidebarControl.show();

    $('#submitButton').on('click', function (e) {
      var valuesToAppend = {};

      for (var k = 1; k < surveyQuestionsKeys.length + 1; k++) {
        var responseType = surveyQuestions[k]['Response Type'];
        var currentQuestionNumber = "Question " + k.toString();
        var currentQuestionNumberWithoutSpace = currentQuestionNumber.replace(" ", "");

        switch (responseType) {
          case "radio":
              valuesToAppend[surveyQuestions[k.toString()]["Question"]] = $('input[name=' + currentQuestionNumberWithoutSpace + ']:checked').val();
            break;
          case 'text':
              valuesToAppend[surveyQuestions[k.toString()]["Question"]] = $('#' + currentQuestionNumberWithoutSpace).val();
            break;
          case 'checkbox':
            var selectedCheckboxes = $('input[name=Question2]:checked');

            var valuesArray = [];
            for (var m = 0; m < selectedCheckboxes.length; m++) {
              valuesArray.push(selectedCheckboxes[m].value);
            }

            var valuesString = valuesArray.join();

            valuesToAppend[surveyQuestions[k.toString()]["Question"]] = valuesString;
          default:
            console.log(responseType);
        }
      }

      valuesToAppend["Name"] = location;
      var cd = new Date(Date.now())
      valuesToAppend["Project ID"] = project_id;
      valuesToAppend["Datetime"] = cd;
      valuesToAppend["IP Address"] = ip_address;

      var $form = $('form#surveyForm'), url = c.m.s

      e.preventDefault();
      $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        data: valuesToAppend
      });

      $("#submitMessage").html('<h6><strong>' + thanksSubmitText[selectedLanguageIndex] + '</strong></h6>');
      $('#submitButton').remove();
      $('#surveyForm').remove();
      clicked = false;

      existing.setStyle({weight: 5, opacity: 0.8});
      proposed.setStyle({weight: 5, opacity: 0.8});
    });

    var pointLayer;

    this.openPopup();
    if (Object.keys(e.sourceTarget._eventParents)[0] != overlaysIDs[3]) {
      pointLayer = false;
      this.setStyle({ weight: 10, opacity: 0.8 });
    } else {
      pointLayer = true;
      this.setStyle({ radius: 10 })
    }

    $('#closeButton').on('click', function () {
      checkIfUnsubmittedComments();

      // if (pointLayer) {
      //   this.setStyle({ radius: 5 })
      // } else {
      //   this.setStyle({ weight: 5, opacity: 0.8 });
      // }
    });
  });
}

function closeSidebar() {
  sidebarControl.hide();
  map.closePopup();
  clicked = false;
  existing.setStyle({weight: 5, opacity: 0.8});
  proposed.setStyle({weight: 5, opacity: 0.8});
  // pedestrian.setStyle({weight: 5, opacity: 0.8});
  // pedestrianPoints.setStyle({radius: 5});
}

function checkIfUnsubmittedComments() {
  var unsubmittedComments = false;

  for (var k = 1; k < surveyQuestionsKeys.length + 1; k++) {
    var responseType = surveyQuestions[k]['Response Type'];
    var currentQuestionNumber = "Question " + k.toString();
    var currentQuestionNumberWithoutSpace = currentQuestionNumber.replace(" ", "");
    var currentResponse;

    switch (responseType) {
      case "radio":
          currentResponse = $('input[name=' + currentQuestionNumberWithoutSpace + ']:checked').val();
        break;
      case 'text':
          currentResponse = $('#' + currentQuestionNumberWithoutSpace).val();
        break;
      case 'checkbox':
        var selectedCheckboxes = $('input[name=Question2]:checked');

        var valuesArray = [];
        for (var m = 0; m < selectedCheckboxes.length; m++) {
          valuesArray.push(selectedCheckboxes[m].value);
        }

        var valuesString = valuesArray.join();

        currentResponse = valuesString;
        break;
      default:
        console.log(responseType);
    }

    if ($.inArray(currentResponse, ["", undefined, null]) == -1) {
      unsubmittedComments = true;
    }
  }

  if (unsubmittedComments == false) {
    closeSidebar();
  } else {
    if (window.confirm("You have not yet submitted your comments. Continue without submitting?")) {
      closeSidebar();
    }
  }
}

function createExistingPopup(feature, layer) {

  var popupText = "";

  var streetName = feature.properties.Name;
  var facType = feature.properties.fac_type;

  popupText = `<p><strong>Existing Location</strong>: ${streetName} - ${capitalize(facType)}`;

  var popup = L.popup({ closeButton: false }).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(popupText);

  layer.on('mouseover', function (e) {
    this.setStyle({ weight: 10, opacity: 0.5 });
  });

  layer.on('mouseout', function (e) {
    this.setStyle({ weight: 5, opacity: 0.8 });
  });

  layer.on('click', function (e) {
    map.closePopup();
    this.openPopup();
  });
}
