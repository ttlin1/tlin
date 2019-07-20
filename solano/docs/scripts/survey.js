//////////////////////////////////////////////// SURVEY
function createSurvey(feature, layer) {

  var selectedLanguageIndex = 0;

  var popupText = "";
  var tooltipText = "";
  var project_id;

  if ("Corridor" in feature.properties) {
    project_id = ", " + feature.properties.Proj_ID;
  } else {
    project_id = ", " + feature.properties.Project_ID;
  }

  popupText = `<p><strong>${capitalize(feature.properties.Status)} Location</strong>: ${capitalize(feature.properties.Location)}${project_id}</p>`;
  tooltipText = `<p class="text-center p-2 align-middle"><strong>${capitalize(feature.properties.Status)} Location</strong>: ${capitalize(feature.properties.Location)}${project_id}<br>Click to comment.</p>`;

  var popup = L.popup({ closeButton: false }).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(tooltipText);

  var clicked = false;

  layer.on('mouseover', function (e) {
    if (Object.keys(e.sourceTarget._eventParents)[0] != overlaysIDs[3]) {
      this.setStyle({ weight: 10, opacity: 0.8 });
    } else {
      this.setStyle({ radius: 10 })
    }
  });

  layer.on('mouseout', function (e) {
    if (clicked == false) {
      if (Object.keys(e.sourceTarget._eventParents)[0] != overlaysIDs[3]) {
        this.setStyle({ weight: 5, opacity: 0.8 });
      } else {
        this.setStyle({ radius: 5 })
      }
    }
  });

  layer.on('click', function (e) {
    existing.setStyle({weight: 5, opacity: 0.8});
    proposed.setStyle({weight: 5, opacity: 0.8});
    pedestrian.setStyle({weight: 5, opacity: 0.8});
    pedestrianPoints.setStyle({radius: 5});

    clicked = true;

    map.closePopup();

    var surveyString = '<button type="button" id="closeButton" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

    var headersToDisplay = {"Proj_ID": "Project ID",
                            "Corridor": "Street", 
                            "ADT": "ADT", 
                            "Speed": "Posted Speed", 
                            "Existing": "Existing Bike Facility Classification", 
                            "fac_type": "Proposed Facility Type",
                            "Network": "Network Type",
                            "TruckRoute": "Truck Route",
                            "TransitRou": "Transit Route",
                            "ParkingR": "Parking Removal",
                            "LaneR": "Lane Removal",
                            "FAR": "Further Analysis Recommended"};

    var headersKeys = Object.keys(headersToDisplay);

    var pedHeadersToDisplay = {"Project_ID": "Project ID", "Location": "Location", "Project_T": "Project Type", "Descriptio": "Description"};
    var pedHeadersKeys = Object.keys(pedHeadersToDisplay);

    if ("Corridor" in feature.properties) {
      for (var i = 0; i < headersKeys.length; i++) {
        surveyString += `<h6><strong>${headersToDisplay[headersKeys[i]]}</strong>: ${blankIfNull(feature.properties[headersKeys[i]])}</h6>`;
      }
      var project_id = feature.properties.Proj_ID;
    } else {
      for (var i = 0; i < pedHeadersKeys.length; i++) {
        surveyString += `<h6><strong>${pedHeadersToDisplay[pedHeadersKeys[i]]}</strong>: ${blankIfNull(feature.properties[pedHeadersKeys[i]])}</h6>`;
      }
      var project_id = feature.properties.Project_ID;
    }

    var currentStreetViewID = 'streetViewImagery' + project_id;

    surveyString += `<div id="${currentStreetViewID}" class="streetViewImagery"></div>
    <script>
      var panorama;
      function initialize() {
        panorama = new google.maps.StreetViewPanorama(
            document.getElementById('${currentStreetViewID}'),
            {
              position: {lat: ${e.latlng.lat}, lng: ${e.latlng.lng}},
              pov: {heading: 165, pitch: 0},
              zoom: 1,
              linksControl: false,
              panControl: false,
              enableCloseButton: false,
              fullscreenControl: false,
              zoomControl: false,
              source: google.maps.StreetViewSource.OUTDOOR
            });
        
        panorama.setPov(panorama.getPhotographerPov());
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
          var textRows = 3;
          if ([4, 5].includes(i)) {
            textRows = 1;
          }

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

      valuesToAppend["Name"] = feature.properties.Location;
      var cd = new Date(Date.now())
      valuesToAppend["Project ID"] = project_id;
      valuesToAppend["Datetime"] = cd;
      valuesToAppend["IP Address"] = ip_address;

      var $form = $('form#surveyForm'), url = c.m.s

      e.preventDefault();
      // $.ajax({
      //   url: url,
      //   method: "GET",
      //   dataType: "json",
      //   data: valuesToAppend
      // });

      $("#submitMessage").html('<h6><strong>' + thanksSubmitText[selectedLanguageIndex] + '</strong></h6>');
      $('#submitButton').remove();
      $('#surveyForm').remove();
      clicked = false;

      existing.setStyle({weight: 5, opacity: 0.8});
      proposed.setStyle({weight: 5, opacity: 0.8});
      pedestrian.setStyle({weight: 5, opacity: 0.8});
      pedestrianPoints.setStyle({radius: 5});
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
  pedestrian.setStyle({weight: 5, opacity: 0.8});
  pedestrianPoints.setStyle({radius: 5});
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
