// //////////////////////////////////////////////// SURVEY
// function createSurvey(feature, layer) {
//   var selectedLanguageIndex = 0;
//   var popupText = "";
//   var tooltipText = "";
//   popupText = `<p><strong>${capitalize(feature.properties.class_stat)} Location</strong>: ${capitalize(feature.properties.name)}</p>`;
//   tooltipText = `<p class="text-center p-2 align-middle"><strong>${capitalize(feature.properties.class_stat)} Location</strong>: ${capitalize(feature.properties.name)}<br>Click to comment.</p>`;

//   if (!feature.properties.name) {
//     popupText = popupText.replace(": ", "");
//     tooltipText = tooltipText.replace(": ", "");
//   }

//   var popup = L.popup({ closeButton: false }).setContent(popupText);

//   layer.bindPopup(popup);
//   layer.showDelay = 350; //use 0 for no delay behavior
//   layer.hideDelay = 0; //use 0 for normal behavior
//   layer.bindTooltipDelayed(tooltipText);
//   var clicked = false;
//   layer.on('mouseover', function (e) {
//     this.setStyle({ weight: 10, opacity: 0.5 });
//   });
//   layer.on('mouseout', function (e) {
//     if (clicked == false) {
//       this.setStyle({ weight: 5, opacity: 0.8 });
//     }
//   });
//   layer.on('click', function (e) {
//     existing.setStyle({weight: 5, opacity: 0.8});
//     proposed.setStyle({weight: 5, opacity: 0.8});
//     clicked = true;
//     map.closePopup();
//     var surveyString = '<button type="button" id="closeButton" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
//     var headersToDisplay = {"tdg_rec": "Facility Type", "implmnt": "Implementation Action", "comment_jz": "Notes"};
//     var headersKeys = Object.keys(headersToDisplay);
//     for (var i = 0; i < headersKeys.length; i++) {
//       if (i == 2) {
//         surveyString += `<h6><strong>${headersToDisplay[headersKeys[i]]}</strong>: ${[capitalize(feature.properties[headersKeys[i]]), capitalize(feature.properties.comment)].join(" ")}</h6>`;
//       } else {
//         surveyString += '<h6><strong>' + headersToDisplay[headersKeys[i]] + '</strong>: ' + capitalize(feature.properties[headersKeys[i]]) + '</h6>';
//       }
//     }
//     var currentGid = feature.properties.gid;
//     var currentStreetViewID = 'streetViewImagery' + feature.properties.gid;
//     surveyString += `<div id="${currentStreetViewID}" class="streetViewImagery"></div>
//     <script>
//       var panorama;
//       function initialize() {
//         panorama = new google.maps.StreetViewPanorama(
//             document.getElementById('${currentStreetViewID}'),
//             {
//               position: {lat: ${e.latlng.lat}, lng: ${e.latlng.lng}},
//               pov: {heading: 165, pitch: 0},
//               zoom: 1,
//               linksControl: false,
//               panControl: false,
//               enableCloseButton: false,
//               fullscreenControl: false,
//               zoomControl: false,
//               source: google.maps.StreetViewSource.OUTDOOR
//             });

//         panorama.setPov(panorama.getPhotographerPov());
//       }
//     </script>`;
//     surveyString += '<br><hr>';
//     surveyString += '<form id="surveyForm">';
//     var surveyQuestionsKeys = Object.keys(surveyQuestions);
//     for (var i = 1; i < surveyQuestionsKeys.length + 1; i++) {
//       surveyString += '<h6><strong>' + surveyQuestions[selectedLanguageIndex][i]['Question'] + "</strong></h6>";
//       var responseType = surveyQuestions[i][selectedLanguageIndex]['Response Type'];
//       switch (responseType) {
//         case "radio":
//           var options = surveyQuestions[i][selectedLanguageIndex]['Responses'].split(",");
//           options = options.map(x => x.replace(/(^\s+|\s+$)/mg, ""));
//           for (var j = 0; j < options.length; j++) {
//             surveyString += '<div class="form-check">';
//             var currentId = 'Question' + i.toString() + options[j];
//             surveyString += '<input class="form-check-input" type="' + surveyQuestions[i][selectedLanguageIndex]['Response Type'] + '" name="Question' + i.toString() + '" value="' + options[j] + '" id="' + currentId + '">';
//             surveyString += '<label class="form-check-label" for="' + currentId + '">' + options[j] + '</label>';
//             surveyString += '</div>';
//           }
//           break;
//         case "text":
//           var currentId = 'Question' + i.toString();
//           surveyString += '<div class="form-group">';
//           surveyString += '<textarea class="form-control" id="' + currentId + '" rows="3"></textarea>';
//           surveyString += '</div>';
//           break;
//         case "checkbox":
//           var options = surveyQuestions[i][selectedLanguageIndex]['Responses'].split(",");
//           options = options.map(x => x.replace(/(^\s+|\s+$)/mg, ""));
//           for (var j = 0; j < options.length; j++) {
//             surveyString += '<div class="form-check">';
//             var currentId = 'Question' + i.toString() + options[j];
//             surveyString += '<input class="form-check-input" type="' + surveyQuestions[i][selectedLanguageIndex]['Response Type'] + '" name="Question' + i.toString() + '" value="' + options[j] + '" id="' + currentId + '">';
//             surveyString += '<label class="form-check-label" for="' + currentId + '">' + options[j] + '</label>';
//             surveyString += '</div>';
//           }
//           break;
//         default:
//           console.log(responseType);
//       } // end switch statement
//       surveyString += '<hr>';
//     } // end survey questions loop
//     var submitButtonText = ["Submit", "Votar"];
//     surveyString += '<button type="submit" id="submitButton" class="btn btn-primary">' + submitButtonText[selectedLanguageIndex] + '</button>';
//     var thanksSubmitText = ["Thanks for submitting your survey!", "Gracias por enviar tu encuesta!"]
//     surveyString += '</div></form>';
//     surveyString += '<div id="submitMessage"></div>';
//     $('#sideBarDivId').html(surveyString);
//     initialize();
//     sidebarControl.show();
//     $('#submitButton').on('click', function (e) {
//       var valuesToAppend = {};
//       var surveyQuestionsKeys = Object.keys(surveyQuestions);
//       for (var k = 1; k < surveyQuestionsKeys.length + 1; k++) {
//         var responseType = surveyQuestions[k][selectedLanguageIndex]['Response Type'];
//         var currentQuestionNumber = "Question " + k.toString();
//         var currentQuestionNumberWithoutSpace = currentQuestionNumber.replace(" ", "");
//         switch (responseType) {
//           case "radio":
//             valuesToAppend[currentQuestionNumber] = $('input[name=' + currentQuestionNumberWithoutSpace + ']:checked').val();
//             break;
//           case 'text':
//             valuesToAppend[currentQuestionNumber] = $('#' + currentQuestionNumberWithoutSpace).val();
//             break;
//           case 'checkbox':
//             var selectedCheckboxes = $('input[name=Question3]:checked');
//             var valuesArray = [];
//             for (var m = 0; m < selectedCheckboxes.length; m++) {
//               valuesArray.push(selectedCheckboxes[m].value);
//             }
//             var valuesString = valuesArray.join();
//             valuesToAppend[currentQuestionNumber] = valuesString;
//           default:
//             console.log(responseType);
//         }
//       }
//       valuesToAppend["Name"] = feature.properties.name;
//       var cd = new Date(Date.now())
//       valuesToAppend["ID"] = feature.properties.gid;
//       valuesToAppend["Datetime"] = cd;
//       valuesToAppend["IP Address"] = ip_address;
//       var $form = $('form#surveyForm'), url = c.m.s
//       e.preventDefault();
//       $.ajax({
//         url: url,
//         method: "GET",
//         dataType: "json",
//         data: valuesToAppend
//       });
//       $("#submitMessage").html('<h6><strong>' + thanksSubmitText[selectedLanguageIndex] + '</strong></h6>');
//       $('#submitButton').remove();
//       $('#surveyForm').remove();
//       clicked = false;
//       existing.setStyle({weight: 5, opacity: 0.8});
//       proposed.setStyle({weight: 5, opacity: 0.8});
//     });
//     $('#closeButton').on('click', function () {
//       sidebarControl.hide();
//       map.closePopup();
//       clicked = false;
//       existing.setStyle({weight: 5, opacity: 0.8});
//       proposed.setStyle({weight: 5, opacity: 0.8});
//     });
//     this.openPopup();
//     this.setStyle({weight: 10, opacity: 0.5});
//   })
// }
