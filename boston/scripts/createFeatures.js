var transportationWeightCategories = ["bus", "subway", "bluebike", "zipcar", "job", "ferry", "car", "community", ];
var transportationRankFieldNames = ["BUS_RANK", "SUBWA_RANK", "BIKES_RANK", "CAR_RANK", "Job_Rank", "CR_RANK", "NoV_Rank", "COMMU_RANK"];

var equityWeightCategories = ["youth", "elderly", "race", "education", "english", "income", "disabled"];
var equityRankFieldNames = ["You_Rank", "Eld_Rank", "Min_Rank", "NoC_Rank", "LEP_Rank", "Per_Rank", "Dis_Rank"];

function styleHexagons(feature) {

  var currentStyle = {
    "color": "#fff",
    "fillColor": "#fff",
    "weight": 0,
    "opacity": 1
  };

  var transportationAccessIndexMin = $('#transportation-range').slider('values')[0];
  var transportationAccessIndexMax = $('#transportation-range').slider('values')[1];

  var mobilityIndexMin = $('#mobility-range').slider('values')[0];
  var mobilityIndexMax = $('#mobility-range').slider('values')[1];

  var colorArray = ["#000000", "#1D111F", "#3B233E", "#59355E", "#38538D", "#1871BD", "#8B8F5E", "#FFAE00"];

  var transScore = 0;
  var equityScore = 0;

  if ($('#transportationRadio').prop('checked')) {
    for (var i = 0; i < transportationWeightCategories.length; i++) { 
      var currentWeight = $(`#${transportationWeightCategories[i]}-range`).slider('value');
      transScore += currentWeight * (99.0 - parseFloat(feature.properties[transportationRankFieldNames[i]]));
    }
  }

  if ($('#equityRadio').prop('checked')) {
    for (var i = 0; i < equityWeightCategories.length; i++) { 
      var currentWeight = $(`#${equityWeightCategories[i]}-range`).slider('value');
      equityScore += currentWeight * parseFloat(feature.properties[equityRankFieldNames[i]]);
    }
  }

  var currentScore = transScore / parseFloat(transportationWeightCategories.length) + equityScore / parseFloat(equityWeightCategories.length);

  var currentColorIndex = currentScore >= jenksBreaks["combined"][7] ? 7
        : currentScore > jenksBreaks["combined"][6] ? 6
        : currentScore > jenksBreaks["combined"][5] ? 5
        : currentScore > jenksBreaks["combined"][4] ? 4
        : currentScore > jenksBreaks["combined"][3] ? 3
        : currentScore > jenksBreaks["combined"][2] ? 2
        : currentScore > jenksBreaks["combined"][1] ? 1
        : 0

  var transIndex = transScore >= jenksBreaks["transportation"][7] ? 7
        : transScore > jenksBreaks["transportation"][6] ? 6
        : transScore > jenksBreaks["transportation"][5] ? 5
        : transScore > jenksBreaks["transportation"][4] ? 4
        : transScore > jenksBreaks["transportation"][3] ? 3
        : transScore > jenksBreaks["transportation"][2] ? 2
        : transScore > jenksBreaks["transportation"][1] ? 1
        : 0
    
  var equityIndex = equityScore >= jenksBreaks["equity"][7] ? 7
        : equityScore > jenksBreaks["equity"][6] ? 6
        : equityScore > jenksBreaks["equity"][5] ? 5
        : equityScore > jenksBreaks["equity"][4] ? 4
        : equityScore > jenksBreaks["equity"][3] ? 3
        : equityScore > jenksBreaks["equity"][2] ? 2
        : equityScore > jenksBreaks["equity"][1] ? 1
        : 0

  // if ($('#transportationRadio').prop('checked') && !($('#equityRadio').prop('checked'))) {
  //   currentColorIndex = 7 - currentColorIndex;
  // }

  if ($('#transportationRadio').prop('checked') || $('#equityRadio').prop('checked')) {
    currentStyle["fillColor"] = colorArray[currentColorIndex];
  } 

  if ($('#transportationRadio').prop('checked')) {
    if (transportationAccessIndexMin <= transIndex && transIndex <= transportationAccessIndexMax) {
      currentStyle["fillOpacity"] = 0.5;
    } else {
      currentStyle["fillOpacity"] = 0;
      currentStyle["opacity"] = 0;
    }
  }

  if ($('#equityRadio').prop('checked')) {
    if (mobilityIndexMin <= equityIndex && equityIndex <= mobilityIndexMax) {
      currentStyle["fillOpacity"] = 0.5;
    } else {
      currentStyle["fillOpacity"] = 0;
      currentStyle["opacity"] = 0;
    }
  }

  return currentStyle
}

function styleHexagonsZeroFill(feature) {
    var currentStyle = {
    "color": "#fff",
    "fillColor": "#fff",
    "weight": 0.25,
    "opacity": 0,
    "fillOpacity": 0
  };

  return currentStyle
}

function hexagonTooltip(feature, layer) {
  var tooltipText = "";

  function returnBooleanIf99(in_amount) {
    var booleanText = ["No", "Non", "Não", "No", "Không"][selectedLanguageIndex];

    if (in_amount == 99) {
      booleanText = ["Yes", "Wi", "Sim", "Si", "Đúng"][selectedLanguageIndex];
    }

    return booleanText;
  }

  // tooltipText = `
  //                 <p class="text-center p-2 align-middle">
  //                   <strong>${["Walk Score", "Mache nòt", "Pontuação caminhada", "Caminar Puntuación", "Điểm đi bộ"][selectedLanguageIndex]}</strong>: ${feature.properties.Wal_Rank}<br>
  //                   <strong>${["Jobs Accessible By Transit", "Travay aksesib pa transpò", "Empregos acessíveis por trânsito", "Empleos accesibles por tránsito", "Việc làm có thể truy cập bằng phương tiện"][selectedLanguageIndex]}</strong>: ${numberWithCommas(feature.properties.tot_jobs)}<br>
  //                   <strong>${["Proximity to Grocery Stores", "Pwoksimite nan boutik yo", "Proximidade de supermercados", "Proximidad a las tiendas de comestibles", "Gần các cửa hàng tạp hóa"][selectedLanguageIndex]}</strong>: ${returnBooleanIf99(feature.properties.GROCE_RANK)}<br>
  //                   <strong>${["Within 10-Minute Walk of Key Bus Routes", "Nan 10-minit Mache nan wout otobis yo kle", "A 10 minutos a pé das principais rotas de ônibus", "A 10 minutos a pie de las principales rutas de autobuses", "Trong vòng 10 phút đi bộ của các tuyến xe buýt chính"][selectedLanguageIndex]}</strong>: ${returnBooleanIf99(feature.properties.BUS_RANK)}<br>
  //                   <strong>${["Within 10-Minute Walk of Subway Station", "Nan 10-Minit Mache nan Estasyon Tren", "A 10 minutos a pé da estação de metrô", "A 10 minutos a pie de la estación de metro", "Trong vòng 10 phút đi bộ từ ga tàu điện ngầm"][selectedLanguageIndex]}</strong>: ${returnBooleanIf99(feature.properties.SUBWA_RANK)}<br>
  //                   <strong>${["Within 10-Minute Walk of Commuter Rail / Ferry", "Nan 10-Minit Mache nan Tren Banlye / Ferry", "A 10 minutos a pé da Commuter Rail / Ferry", "A 10 minutos a pie del tren de cercanías / ferry", "Trong vòng 10 phút đi bộ bằng đường sắt đi lại / phà"][selectedLanguageIndex]}</strong>: ${returnBooleanIf99(feature.properties.CR_RANK)}<br>
  //                   <strong>${["Within 10-minute Walk of Bikeshare", "Nan 10-minit Walk nan pataje bisiklèt", "Dentro de 10 minutos a pé do compartilhamento de bicicleta", "A 10 minutos a pie de compartir bicicleta", "Trong vòng 10 phút đi bộ chia sẻ xe đạp"][selectedLanguageIndex]}</strong>: ${returnBooleanIf99(feature.properties.BIKES_RANK)}<br>
  //                   <strong>${["Within 10-minute Walk of Carshare", "Nan 10-minit Walk nan pataje Machin", "", "", ""][selectedLanguageIndex]}</strong>: ${returnBooleanIf99(feature.properties.CAR_RANK)}<br>
  //                   <strong>${["Within Parking Freeze / Restricted Parking Overlay Zone", "Nan 10-minit Walk nan pataje Machin", "Dentro de 10 minutos a pé da ação Car", "A 10 minutos a pie de Car share", "Trong vòng 10 phút đi bộ"][selectedLanguageIndex]}</strong>: ${returnBooleanIf99(feature.properties.PARK_RANK)}<br>
  //                   <strong>${["Youth Percentage", "Pousantaj jèn yo", "Percentagem de Jovens", "Porcentaje juvenil", "Tỷ lệ thanh niên"][selectedLanguageIndex]}</strong>: ${((feature.properties.You_Pct * 100).toFixed(1))}%<br>
  //                   <strong>${["Elderly Percentage", "Pousantaj granmoun aje", "Percentagem de idosos", "Porcentaje de ancianos", "Tỷ lệ người cao tuổi"][selectedLanguageIndex]}</strong>: ${((feature.properties.Eld_Pct * 100).toFixed(1))}%<br>
  //                   <strong>${["Minority Percentage", "Minorite Pousantaj", "Percentagem minoritária", "Porcentaje Minoritario", "Tỷ lệ thiểu số"][selectedLanguageIndex]}</strong>: ${((feature.properties.Min_Pct * 100).toFixed(1))}%<br>
  //                   <strong>${["Limited-English Proficiency Percentage", "Pousantaj konpetans limite nan lang angle", "Porcentagem de Proficiência em Inglês Limitado", "Porcentaje de dominio limitado del inglés", "Tỷ lệ phần trăm trình độ tiếng Anh hạn chế"][selectedLanguageIndex]}</strong>: ${((feature.properties.LEP_Pct * 100).toFixed(1))}%<br>
  //                   <strong>${["Per Capita Income", "Per kapita Revni", "Renda per capita", "El ingreso per capita", "Thu nhập bình quân đầu người"][selectedLanguageIndex]}</strong>: $${numberWithCommas(feature.properties.Per_Income.toFixed(0))}<br>
  //                   <strong>${["Percentage Without Any College Education", "Pousantaj san okenn edikasyon kolèj", "Porcentagem sem Ensino Superior", "Porcentaje sin ninguna educación universitaria", "Tỷ lệ không có giáo dục đại học"][selectedLanguageIndex]}</strong>: ${((feature.properties.NoC_Pct * 100).toFixed(1))}%<br>
  //                   <strong>${["Percentage Without a Car", "Pousantaj San yon Machin", "Porcentagem sem carro", "Porcentaje sin auto", "Tỷ lệ không có xe hơi"][selectedLanguageIndex]}</strong>: ${(feature.properties.NoV_Pct * 100).toFixed(1)}%
  //                 </p>`;

  tooltipText = `
                  <table class="table table-dark table-sm table-bordered">
                    <thead>
                      <tr>
                        <th colspan="2"><strong>Transit</strong></th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td>${["Walk Score", "Mache nòt", "Pontuação caminhada", "Caminar Puntuación", "Điểm đi bộ"][selectedLanguageIndex]}</td>
                        <td>${feature.properties.Wal_Rank}</td>
                      </tr>
                      <tr>
                        <td>${["Jobs Accessible By Transit", "Travay aksesib pa transpò", "Empregos acessíveis por trânsito", "Empleos accesibles por tránsito", "Việc làm có thể truy cập bằng phương tiện"][selectedLanguageIndex]}</td>
                        <td>${numberWithCommas(feature.properties.tot_jobs)}</td>
                      </tr>
                      <tr>
                        <td>${["Within 10-Minute Walk of Key Bus Routes", "Nan 10-minit Mache nan wout otobis yo kle", "A 10 minutos a pé das principais rotas de ônibus", "A 10 minutos a pie de las principales rutas de autobuses", "Trong vòng 10 phút đi bộ của các tuyến xe buýt chính"][selectedLanguageIndex]}</td>
                        <td>${returnBooleanIf99(feature.properties.BUS_RANK)}</td>
                      </tr>
                      <tr>
                        <td>${["Within 10-Minute Walk of Subway Station", "Nan 10-Minit Mache nan Estasyon Tren", "A 10 minutos a pé da estação de metrô", "A 10 minutos a pie de la estación de metro", "Trong vòng 10 phút đi bộ từ ga tàu điện ngầm"][selectedLanguageIndex]}</td>
                        <td>${returnBooleanIf99(feature.properties.SUBWA_RANK)}</td>
                      </tr>
                      <tr>
                        <td>${["Within 10-Minute Walk of Commuter Rail / Ferry", "Nan 10-Minit Mache nan Tren Banlye / Ferry", "A 10 minutos a pé da Commuter Rail / Ferry", "A 10 minutos a pie del tren de cercanías / ferry", "Trong vòng 10 phút đi bộ bằng đường sắt đi lại / phà"][selectedLanguageIndex]}</td>
                        <td>${returnBooleanIf99(feature.properties.CR_RANK)}</td>
                      </tr>
                      <tr>
                        <td>${["Within 10-minute Walk of Bikeshare", "Nan 10-minit Walk nan pataje bisiklèt", "Dentro de 10 minutos a pé do compartilhamento de bicicleta", "A 10 minutos a pie de compartir bicicleta", "Trong vòng 10 phút đi bộ chia sẻ xe đạp"][selectedLanguageIndex]}</td>
                        <td>${returnBooleanIf99(feature.properties.BIKES_RANK)}</td>
                      </tr>
                      <tr>
                        <td>${["Within 10-minute Walk of Carshare", "Nan 10-minit Walk nan pataje Machin", "Dentro de 10 minutos a pé da ação Car", "A 10 minutos a pie de Car share", "Trong vòng 10 phút đi bộ"][selectedLanguageIndex]}</td>
                        <td>${returnBooleanIf99(feature.properties.CAR_RANK)}</td>
                      </tr>
                      <tr>
                        <td>${["Community Assets Score", "Nòt kominote a", "Pontuação da comunidade", "Puntaje de la comunidad", "Điểm cộng đồng"][selectedLanguageIndex]}</td>
                        <td>${(feature.properties.COMMU_RANK).toFixed(1)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table class="table table-dark table-sm table-bordered">
                    <thead>
                      <tr>
                        <th colspan="2"><strong>Equity</strong></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>${["Youth Percentage", "Pousantaj jèn yo", "Percentagem de Jovens", "Porcentaje juvenil", "Tỷ lệ thanh niên"][selectedLanguageIndex]}</td>
                        <td>${((feature.properties.You_Pct * 100).toFixed(1))}%</td>
                      </tr>
                      <tr>
                        <td>${["Elderly Percentage", "Pousantaj granmoun aje", "Percentagem de idosos", "Porcentaje de ancianos", "Tỷ lệ người cao tuổi"][selectedLanguageIndex]}</td>
                        <td>${((feature.properties.Eld_Pct * 100).toFixed(1))}%</td>
                      </tr>
                      <tr>
                        <td>${["Minority Percentage", "Minorite Pousantaj", "Percentagem minoritária", "Porcentaje Minoritario", "Tỷ lệ thiểu số"][selectedLanguageIndex]}</td>
                        <td>${((feature.properties.Min_Pct * 100).toFixed(1))}%</td>
                      </tr>
                      <tr>
                        <td>${["Limited-English Proficiency Percentage", "Pousantaj konpetans limite nan lang angle", "Porcentagem de Proficiência em Inglês Limitado", "Porcentaje de dominio limitado del inglés", "Tỷ lệ phần trăm trình độ tiếng Anh hạn chế"][selectedLanguageIndex]}</td>
                        <td>${((feature.properties.LEP_Pct * 100).toFixed(1))}%</td>
                      </tr>
                      <tr>
                        <td>${["Per Capita Income", "Per kapita Revni", "Renda per capita", "El ingreso per capita", "Thu nhập bình quân đầu người"][selectedLanguageIndex]}</td>
                        <td>$${numberWithCommas(feature.properties.Per_Income.toFixed(0))}</td>
                      </tr>
                      <tr>
                        <td>${["Percentage Without Any College Education", "Pousantaj san okenn edikasyon kolèj", "Porcentagem sem Ensino Superior", "Porcentaje sin ninguna educación universitaria", "Tỷ lệ không có giáo dục đại học"][selectedLanguageIndex]}</td>
                        <td>${((feature.properties.NoC_Pct * 100).toFixed(1))}%</td>
                      </tr>
                      <tr>
                        <td>${["Percentage Without a Car", "Pousantaj San yon Machin", "Porcentagem sem carro", "Porcentaje sin auto", "Tỷ lệ không có xe hơi"][selectedLanguageIndex]}</td>
                        <td>${(feature.properties.NoV_Pct * 100).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td>${["Percentage of people with a disability", "Pousantaj moun ki gen yon andikap", "Percentual de pessoas com deficiência", "Porcentaje de personas con discapacidad", "Tỷ lệ người khuyết tật"][selectedLanguageIndex]}</td>
                        <td>${(feature.properties.Disabl_Pct * 100).toFixed(1)}%</td>
                      </tr>
                    </tbody>
                  </table>
                `;

  var popupText = 'Clicked location'
  var popup = L.popup({ closeButton: false }).setContent(popupText);
  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  var clicked = false;

  layer.on('mouseover', function (e) {
    // this.setStyle({ color: '#fff', weight: 2, fillColor: '#fb4d42', opacity: 0.5 });
    this.setStyle({weight: 2});
  });

  layer.on('mouseout', function (e) {
    if (clicked == false) {
      // var currentStyle = styleHexagons(feature);
      // var currentStyle = styleHexagonsZeroFill(feature);
      this.setStyle({weight: 0});
    }
  });

  layer.on('click', function (e) {
    hexagons.setStyle({weight: 0});

    // var currentStyle = styleHexagons(feature);
    // var currentStyle = styleHexagonsZeroFill(feature);
    // this.setStyle(currentStyle)

    // this.setStyle({ color: '#fb4d42', weight: 5 });
    this.setStyle({weight: 2});
    clicked = true;
    map.closePopup();

    var surveyString = '<button type="button" id="closeButton" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

    var currentGridId = feature.properties.GRID_ID;
    var currentStreetViewID = 'streetViewImagery' + currentGridId;

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

    surveyString += '<br><hr class="sidebarHR">';
    ////////////////////////// Chart Data

    // surveyString += '<canvas id="transitCharts"></canvas><br><hr>';

    surveyString += '<form id="surveyForm">';
    var surveyQuestionsKeys = Object.keys(surveyQuestions);
    for (var i = 1; i < surveyQuestionsKeys.length + 1; i++) {
      surveyString += '<h6><strong>' + surveyQuestions[i][selectedLanguageIndex]['Question'] + "</strong></h6>";
      var responseType = surveyQuestions[i][selectedLanguageIndex]['Response Type'];
      switch (responseType) {
        case "radio":
          var options = surveyQuestions[i][selectedLanguageIndex]['Responses'].split(",");
          options = options.map(x => x.replace(/(^\s+|\s+$)/mg, ""));
          for (var j = 0; j < options.length; j++) {
            surveyString += '<div class="form-check">';
            var currentId = 'Question' + i.toString() + options[j];
            surveyString += '<input class="form-check-input" type="' + surveyQuestions[i][selectedLanguageIndex]['Response Type'] + '" name="Question' + i.toString() + '" value="' + options[j] + '" id="' + currentId + '">';
            surveyString += '<label class="form-check-label" for="' + currentId + '">' + options[j] + '</label>';
            surveyString += '</div>';
          }
          break;
        case "text":
          var currentId = 'Question' + i.toString();
          surveyString += '<div class="form-group">';
          surveyString += '<textarea class="form-control" id="' + currentId + '" rows="3"></textarea>';
          surveyString += '</div>';
          break;
        case "checkbox":
          var options = surveyQuestions[i][selectedLanguageIndex]['Responses'].split(",");
          options = options.map(x => x.replace(/(^\s+|\s+$)/mg, ""));
          for (var j = 0; j < options.length; j++) {
            surveyString += '<div class="form-check">';
            var currentId = 'Question' + i.toString() + options[j];
            surveyString += '<input class="form-check-input" type="' + surveyQuestions[i][selectedLanguageIndex]['Response Type'] + '" name="Question' + i.toString() + '" value="' + options[j] + '" id="' + currentId + '">';
            surveyString += '<label class="form-check-label" for="' + currentId + '">' + options[j] + '</label>';
            surveyString += '</div>';
          }
          break;
        default:
          console.log(responseType);
      } // end switch statement
      surveyString += '<hr>';
    } // end survey questions loop
    var submitButtonText = ["Submit", "Soumèt", "Enviar", "Enviar", "Gửi đi"];
    surveyString += '<button type="submit" id="submitButton" class="btn btn-primary">' + submitButtonText[selectedLanguageIndex] + '</button>';
    var thanksSubmitText = ["Thanks for submitting your survey!", "Mèsi pou soumèt sondaj ou!", "Obrigado por enviar sua pesquisa!", "Gracias por enviar tu encuesta!", "Cảm ơn đã gửi khảo sát của bạn!"];
    surveyString += '</div></form>';
    surveyString += '<div id="submitMessage"></div>';
    $('#sideBarDivId').html(surveyString);
    initialize();
    sidebarControl.show();

    $('#submitButton').on('click', function (e) {
      var valuesToAppend = {};
      var surveyQuestionsKeys = Object.keys(surveyQuestions);
      for (var k = 1; k < surveyQuestionsKeys.length + 1; k++) {
        var responseType = surveyQuestions[k][selectedLanguageIndex]['Response Type'];
        var currentQuestionNumber = "Question " + k.toString();
        var currentQuestionNumberWithoutSpace = currentQuestionNumber.replace(" ", "");
        switch (responseType) {
          case "radio":
            valuesToAppend[currentQuestionNumber] = $('input[name=' + currentQuestionNumberWithoutSpace + ']:checked').val();
            break;
          case 'text':
            valuesToAppend[currentQuestionNumber] = $('#' + currentQuestionNumberWithoutSpace).val();
            break;
          case 'checkbox':
            var selectedCheckboxes = $('input[name=Question3]:checked');
            var valuesArray = [];
            for (var m = 0; m < selectedCheckboxes.length; m++) {
              valuesArray.push(selectedCheckboxes[m].value);
            }
            var valuesString = valuesArray.join();
            valuesToAppend[currentQuestionNumber] = valuesString;
          default:
            console.log(responseType);
        }
      }
      
      var cd = new Date(Date.now())
      valuesToAppend["ID"] = currentGridId;
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
      hexagons.setStyle(currentStyle);
    });
    $('#closeButton').on('click', function () {
      sidebarControl.hide();
      map.closePopup();
      clicked = false;
      hexagons.setStyle({weight: 0});
    });
    this.openPopup();
  });
}

function busTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["Click to view the 10-minute walkshed", "Klike sou yo wè mache a 10 minit", "Clique para ver o passeio de 10 minutos", "Haga clic para ver la caminata de 10 minutos", "Nhấn vào đây để xem 10 phút đi bộ"][selectedLanguageIndex]}</strong><br>
                    <strong>${["Stop Name", "One Stop Non", "Nome da parada", "Nombre de parada", "Tên dừng"][selectedLanguageIndex]}</strong>: ${feature.properties.STOP_NAME}
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  var svg = '<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 48 48">    <title>        bus    </title>    <path fill="#ffc72c" d="m24.12432 47.99966c13.44632-.345 24.22342-11.27549 23.87132-24.128-.36299-13.24986-10.87335-23.94219-24.12799-23.87132a24 24 0 1 0 .25667 47.99932"></path>    <path fill="#1c1e23" d="m37.17509 22.34207-1.27973-10.34352c-.32519-1.86647-1.47054-2.59471-3.17445-3.35829a26.7476 26.7476 0 0 0 -8.71034-1.64026 26.86629 26.86629 0 0 0 -8.72444 1.64026c-1.68268.74943-2.828 1.49182-3.17446 3.35829l-1.28676 10.34352v14.30982h2.2589v2.49222a1.86133 1.86133 0 0 0 1.85585 1.85589 1.86137 1.86137 0 0 0 1.85589-1.85589v-2.49222h14.476v2.49222a1.8559 1.8559 0 0 0 3.71179 0v-2.49222h2.19175zm-18.58725-12.72613h10.88793a.83429.83429 0 1 1 0 1.66852h-10.88793a.83426.83426 0 1 1 0-1.66852zm-5.42274 12.42212 1.06052-8.16593a1.064 1.064 0 0 1 1.06051-.88376h17.58326a1.05671 1.05671 0 0 1 1.05344.88376l1.06051 8.16593a.94744.94744 0 0 1 0 .28282v.05653a1.04868 1.04868 0 0 1 -1.06051 1.05348h-19.74671a1.06024 1.06024 0 0 1 -1.011-1.11.94744.94744 0 0 1 -.00002-.28283zm1.7746 10.188a1.9761 1.9761 0 1 1 1.97253-1.97966 1.97488 1.97488 0 0 1 -1.97253 1.97966zm18.18421 0a1.9761 1.9761 0 1 1 1.97961-1.97966 1.97487 1.97487 0 0 1 -1.97961 1.97966z"></path></svg>';

  var iconUrl = 'data:image/svg+xml;base64,' + btoa(svg);

  var icon = L.icon( {
    iconUrl: iconUrl,
    iconSize: [12, 12]
  });

  var activeIcon = L.icon ( {
    iconUrl: iconUrl,
    iconSize: [20, 20]
  });

  var clicked = false;

  layer.on('mouseover', function (e) {
    this.setIcon(activeIcon);
  });
  layer.on('mouseout', function (e) {
    // if (clicked == false) {
    //   this.setIcon(icon);
    // }

    this.setIcon(icon);
  });
  layer.on('click', function (e) {
    // clicked = true;

    // this.setIcon(activeIcon);
    createWalkshed(21, e.sourceTarget.feature.properties.STOP_ID);
  });
}

function subwayTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["Click to view the 10-minute walkshed", "Klike sou yo wè mache a 10 minit", "Clique para ver o passeio de 10 minutos", "Haga clic para ver la caminata de 10 minutos", "Nhấn vào đây để xem 10 phút đi bộ"][selectedLanguageIndex]}</strong><br>
                    <strong>${["Stop Name", "One Stop Non", "Nome da parada", "Nombre de parada", "Tên dừng"][selectedLanguageIndex]}</strong>: ${feature.properties.STATION}<br>
                    <strong>${["Line", "Liy tren an", "Linha de metrô", "Línea de metro", "Tuyến tàu điện ngầm"][selectedLanguageIndex]}</strong>: ${feature.properties.LINE}
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  var svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Layer_1" x="0px" y="0px" role="img" style="enable-background:new 0 0 48 48" version="1.1" viewBox="0 0 48 48" xml:space="preserve">    <title>        T    </title>    <path d="M24,45.9C11.9,45.9,2.1,36.1,2.1,24S11.9,2.1,24,2.1S45.9,11.9,45.9,24C45.9,36.1,36.1,45.9,24,45.9	C24,45.9,24,45.9,24,45.9" style="fill:#ffffff"></path>    <g>        <path d="M24,0C10.7,0,0,10.7,0,24s10.7,24,24,24s24-10.7,24-24l0,0C48,10.7,37.3,0,24,0C24,0,24,0,24,0 M24,45.9		C11.9,45.9,2.1,36.1,2.1,24S11.9,2.1,24,2.1S45.9,11.9,45.9,24C45.9,36.1,36.1,45.9,24,45.9C24,45.9,24,45.9,24,45.9" style="fill:#1C1E23"></path>        <path d="M20.2,39.6h7.6V20.9h11.4v-7.6H8.8v7.6h11.4V39.6z" style="fill:#1C1E23"></path>    </g></svg>';

  var iconUrl = 'data:image/svg+xml;base64,' + btoa(svg);

  var icon = L.icon( {
    iconUrl: iconUrl,
    iconSize: [12, 12]
  });

  var activeIcon = L.icon ( {
    iconUrl: iconUrl,
    iconSize: [20, 20]
  });

  var clicked = false;

  layer.on('mouseover', function (e) {
    this.setIcon(activeIcon);
  });
  layer.on('mouseout', function (e) {
    this.setIcon(icon);
  });
  layer.on('click', function (e) {
    // clicked = true;

    // this.setIcon(activeIcon);
    createWalkshed(24, e.sourceTarget.feature.properties.STATION);
  });
}

function busWalkshedTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    ${["10-Minute Walkshed (click to remove)", "10-Minit bese (klike sou yo retire)", "Percurso de 10 minutos (clique para remover)", "Walkshed de 10 minutos (haga clic para eliminar)", "Đi bộ 10 phút (bấm để xóa)"][selectedLanguageIndex]}</strong>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({ weight: 3, opacity: 0.5 });
  });
  layer.on('mouseout', function (e) {
      this.setStyle({ weight: 0.25, opacity: 0.85 });
  });
  layer.on('click', function (e) {
    map.removeLayer(layer);
    createFeatures(1);
  });
}

function bluebikesTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["Click to view the 10-minute walkshed", "Klike sou yo wè mache a 10 minit", "Clique para ver o passeio de 10 minutos", "Haga clic para ver la caminata de 10 minutos", "Nhấn vào đây để xem 10 phút đi bộ"][selectedLanguageIndex]}</strong>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  var defaultIcon = L.icon({
    iconUrl: 'img/bluebikes.jpg',
    iconSize: [15, 15]
  });

  var activeIcon = L.icon({
    iconUrl: 'img/bluebikes.jpg',
    iconSize: [22, 22]
  });

  var clicked = false;

  layer.on('mouseover', function (e) {
    this.setIcon(activeIcon);
  });
  layer.on('mouseout', function (e) {
    this.setIcon(defaultIcon);
  });
  layer.on('click', function (e) {
    // clicked = true;

    // this.setIcon(activeIcon);
    createWalkshed(22, e.sourceTarget.feature.properties.id);
  });
}

function bluebikesWalkshedTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["10-Minute Walkshed (click to remove)", "10-Minit bese (klike sou yo retire)", "Percurso de 10 minutos (clique para remover)", "Walkshed de 10 minutos (haga clic para eliminar)", "Đi bộ 10 phút (bấm để xóa)"][selectedLanguageIndex]}</strong><br>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({ weight: 3, opacity: 0.5 });
  });
  layer.on('mouseout', function (e) {
      this.setStyle({ weight: 0.25, opacity: 0.85 });
  });
  layer.on('click', function (e) {
    map.removeLayer(layer);
    createFeatures(2);
  });
}

function zipcarTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["Click to view the 10-minute walkshed", "Klike sou yo wè mache a 10 minit", "Clique para ver o passeio de 10 minutos", "Haga clic para ver la caminata de 10 minutos", "Nhấn vào đây để xem 10 phút đi bộ"][selectedLanguageIndex]}</strong><br>
                    <strong>${["Carshare", "Pataje machin", "Car share", "Compartir coche", "Chia sẻ xe"][selectedLanguageIndex]}</strong>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  var defaultIcon = L.icon({
    iconUrl: 'img/carshare.png',
    iconSize: [15, 15]
  });

  var activeIcon = L.icon({
    iconUrl: 'img/carshare.png',
    iconSize: [25, 25]
  });

  var clicked = false;

  layer.on('mouseover', function (e) {
    this.setIcon(activeIcon);
  });
  layer.on('mouseout', function (e) {
    if (clicked == false) {
      this.setIcon(defaultIcon);
    }
  });
  layer.on('click', function (e) {
    clicked = true;

    this.setIcon(activeIcon);
    createWalkshed(23, e.sourceTarget.feature.properties.Id);
  });
}

function evTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${[" EV Charging Stations", "Estasyon chaje EV", "Estações de carregamento EV", "Estaciones de carga EV", "Trạm sạc EV"][selectedLanguageIndex]}</strong>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  var defaultIcon = L.icon( {
    iconUrl: 'img/ev.png',
    iconSize: [15, 15]
  });

  var activeIcon = L.icon( {
    iconUrl: 'img/ev.png',
    iconSize: [20, 20]
  });

  var clicked = false;

  layer.on('mouseover', function (e) {
    this.setIcon(activeIcon);
  });
  layer.on('mouseout', function (e) {
    this.setIcon(defaultIcon);
  });
  layer.on('click', function (e) {
    // clicked = true;

    // this.setIcon(activeIcon);
    // createWalkshed(15, e.sourceTarget.feature.properties.ParcelID);
  });
}

function libraryTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["Library Branch", "Branch Bibliyotèk", "Ramo da Biblioteca", "Rama de la biblioteca", "Chi nhánh thư viện"][selectedLanguageIndex]}: ${feature.properties.BRANCH}</strong><br>
                    <strong>${["Library Address", "Adrès Bibliyotèk la", "Endereço da Biblioteca", "Dirección de la biblioteca", "Địa chỉ thư viện"][selectedLanguageIndex]}: ${feature.properties.ST_ADDRESS}</strong>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  var defaultIcon = L.icon( {
    iconUrl: 'img/library.png',
    iconSize: [25, 25]
  });

  var activeIcon = L.icon( {
    iconUrl: 'img/library.png',
    iconSize: [35, 35]
  });

  layer.on('mouseover', function (e) {
    this.setIcon(activeIcon);
  });
  layer.on('mouseout', function (e) {
    this.setIcon(defaultIcon);
  });
}

function schoolTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["School Name", "Non lekòl la", "Nome da escola", "Nombre de escuela", "Tên trường"][selectedLanguageIndex]}: ${feature.properties.SCH_NAME}</strong><br>
                    <strong>${["School Address", "Địa chỉ trường", "Endereço escolar", "Dirección de Escuela", "Địa chỉ trường"][selectedLanguageIndex]}: ${feature.properties.ADDRESS}</strong>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  var defaultIcon = L.icon( {
    iconUrl: 'img/school.png',
    iconSize: [20, 20]
  });

  var activeIcon = L.icon( {
    iconUrl: 'img/school.png',
    iconSize: [25, 25]
  });

  layer.on('mouseover', function (e) {
    this.setIcon(activeIcon);
  });
  layer.on('mouseout', function (e) {
    this.setIcon(defaultIcon);
  });
}

function communityTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["Center Name", "Non Sant lan", "Nome do Centro" ,"Nombre del centro", "Tên trung tâm"][selectedLanguageIndex]}: ${feature.properties.SITE}</strong><br>
                    <strong>${["Center Address", "Adrès Sant", "Endereço do Centro" ,"Dirección del centro", "Địa chỉ trung tâm"][selectedLanguageIndex]}: ${feature.properties.STREET}</strong>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  var defaultIcon = L.icon( {
    iconUrl: 'img/community.png',
    iconSize: [25, 25]
  });

  var activeIcon = L.icon( {
    iconUrl: 'img/community.png',
    iconSize: [35, 35]
  });

  layer.on('mouseover', function (e) {
    this.setIcon(activeIcon);
  });
  layer.on('mouseout', function (e) {
    this.setIcon(defaultIcon);
  });
}

function parkTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["Park Name", "Non Pak lad", "Nome do parque", "Nombre del parque", "Tên công viên"][selectedLanguageIndex]}: ${feature.properties.SITE_NAME}</strong><br>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({ weight: 3, opacity: 0.5 });
  });
  layer.on('mouseout', function (e) {
    this.setStyle({ weight: 0.25, opacity: 0.85 });
  });
}

function ejTooltip(feature, layer) {
  var tooltipText = "";

  var ejDict = {"M": "Minority", "I": "Income", "E": "English"};
  var criteriaCodes = feature.properties.EJ_CRITERI;
  criteriaCodes = criteriaCodes.split("");
  criteriaCodes = criteriaCodes.map(x=> ejDict[x]);

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["Environmental Justice Community", "Kominote Jistis Anviwònman an", "Comunidade Justiça Ambientale", "Comunidad de justicia ambiental", "Cộng đồng tư pháp môi trường"][selectedLanguageIndex]}: ${criteriaCodes.join(', ')}</strong><br>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({ weight: 3, opacity: 0.5 });
  });
  layer.on('mouseout', function (e) {
    this.setStyle({ weight: 0.25, opacity: 0.85 });
  });
}

function landmarkTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["BLC Landmark", "BLC bòn tè", "Marco da BLC", "Hito de BLC", "Cột mốc BLC"][selectedLanguageIndex]}: ${feature.properties.Name_of_Pr}</strong><br>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({ weight: 3, opacity: 0.5 });
  });
  layer.on('mouseout', function (e) {
    this.setStyle({ weight: 0.25, opacity: 0.85 });
  });
}

function bikeNetworkTooltip(feature, layer) {
  var tooltipText = "";

  var valueDict = {"BFBL": ["Buffered bike lane", "Chita sou bisiklèt liy bisiklèt la", "Ciclovia com buffer", "Carril bici amortiguado", "Làn đường xe đạp đệm"],
                    "BL": ["Bike lane", "Liy bisiklèt la", "Ciclovia", "Carril de bicicletas", "Làn xe đạp"],
                    "BSBL": ["Bus / bike lane", "Otobis / liy bisiklèt", "Faixa de ônibus / bicicleta", "Bus / carril bici", "Làn xe buýt / xe đạp"],
                    "CFBL": ["Contra-flow bike street", "Kontra-koule bisiklèt lari yo", "Rua de contra-fluxo de bicicleta", "Calle de bicicletas contraflujo", "Đường xe đạp ngược dòng"],
                    "CL": ["Climbing lane / hybrid", "K ap grenpe liy / ibrid", "Pista de escalada / híbrida", "Carril de escalada / híbrido", "Leo đường / lai"],
                    "NSUP": ["Shared use path, natural surface", "Pataje chemen itilizasyon, sifas natirèl", "Caminho de uso compartilhado, superfície natural", "Camino de uso compartido, superficie natural", "Đường dẫn sử dụng chung, bề mặt tự nhiên"],
                    "NW": ["Neighborway, marked", "Vwazen, make", "Vizinhança, marcada", "Vecino, marcado", "Hàng xóm, đánh dấu"],
                    "NW, U": ["Neighborway, unmarked", "Vwazen, na", "Vizinhança, sem marcação", "Vecino, sin marcar", "Hàng xóm, không đánh dấu"],
                    "PSL": ["Priority shared lane markings", "Priyorite mak pataje liy komèsyal yo, Marcações de faixas compartilhadas prioritárias", "Marcado prioritario de carriles compartidos", "Ưu tiên chia sẻ làn đường"],
                    "SBL": ["Separated bike lane", "Liy bisiklèt separe", "Ciclovia separada", "Carril bici separado", "Làn đường dành riêng cho xe đạp"],
                    "SBLBL": ["Separated bike lane on one side, bike lane on the opposite side", "Liy bisiklèt separe sou yon bò, liy bisiklèt sou bò opoze a", "Ciclovia separada de um lado, ciclovia do lado oposto", "Carril para bicicletas separado en un lado, carril para bicicletas en el lado opuesto", "Làn đường dành riêng cho xe đạp ở một bên, làn đường dành cho xe đạp ở phía đối diện"],
                    "SLM": ["Shared lane markings", "Marques liy pataje", "Marcações de faixas compartilhadas", "Marcas de carril compartido", "Đánh dấu làn đường chung"],
                    "SRd": ["Shared road", "Pataje wout la", "Estrada compartilhada", "Camino compartido", "Đường dùng chung"],
                    "SUB": ["Shared use path bridge", "Pataje chemen itilize pon an", "Ponte de caminho de uso compartilhado", "Puente de ruta de uso compartido", "Cầu đường dẫn sử dụng chung"],
                    "SUP": ["Shared use path", "Chemen pou itilize Pataje", "Caminho de uso compartilhado", "Ruta de uso compartido", "Đường dẫn sử dụng chung"],
                    "TC": ["Traffic calmed street", "Trafik kalme lari yo", "Rua calma", "Calle tranquila del tráfico", "Đường giao thông bình tĩnh"],
                    "WALK": ["Walkway", "Pave", "Passarela", "Pasarela", "Lối đi"]
                  };

  function returnBikeFacility(in_facility, in_language_index) {
    var currentBikeFacility;

    if ($.inArray(in_facility, Object.keys(valueDict)) > -1) {
      currentBikeFacility = valueDict[in_facility][in_language_index];
    } else {
      currentBikeFacility = '';
    }

    return currentBikeFacility;
  }

  var bikeFacility = returnBikeFacility(feature.properties.ExisFacil, selectedLanguageIndex);

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["Bike Network Facility", "Bisiklèt rezo etablisman", "Instalação de rede de bicicletas", "Instalación de red de bicicletas", "Cơ sở mạng xe đạp"][selectedLanguageIndex]}: ${bikeFacility}</strong><br>
                    <strong>${["Street Name", "Non lari a", "Nome da rua", "Nombre de la calle", "Tên đường"][selectedLanguageIndex]}: ${feature.properties.STREET_NAM}</strong>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({weight: 8});
  });
  layer.on('mouseout', function (e) {
    this.setStyle({weight: 5});
  });
}

function zipcarWalkshedTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["10-Minute Walkshed (click to remove)", "10-Minit bese (klike sou yo retire)", "Percurso de 10 minutos (clique para remover)", "Walkshed de 10 minutos (haga clic para eliminar)", "Đi bộ 10 phút (bấm để xóa)"][selectedLanguageIndex]}</strong><br>
                    <strong>${["Carshare", "Pataje machin", "Car share", "Compartir coche", "Chia sẻ xe"][selectedLanguageIndex]}</strong>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({ weight: 3, opacity: 0.5 });
  });
  layer.on('mouseout', function (e) {
      this.setStyle({ weight: 0.25, opacity: 0.85 });
  });
  layer.on('click', function (e) {
    map.removeLayer(layer);
    createFeatures(3);
  });
}

function subwayWalkshedTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["10-Minute Walkshed (click to remove)", "10-Minit bese (klike sou yo retire)", "Percurso de 10 minutos (clique para remover)", "Walkshed de 10 minutos (haga clic para eliminar)", "Đi bộ 10 phút (bấm để xóa)"][selectedLanguageIndex]}</strong><br>
                    <strong>${["Subway Station", "Estasyon Tren", "Estação de metrô", "Estación de metro", "Ga tàu điện ngầm"][selectedLanguageIndex]}</strong>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({ weight: 3, opacity: 0.5 });
  });
  layer.on('mouseout', function (e) {
      this.setStyle({ weight: 0.25, opacity: 0.85 });
  });
  layer.on('click', function (e) {
    map.removeLayer(layer);
    createFeatures(4);
  });
}

function evWalkshedTooltip(feature, layer) {
  var tooltipText = "";

  tooltipText = `
                  <p class="text-center p-2 align-middle">
                    <strong>${["10-Minute Walkshed (click to remove)", "10-Minit bese (klike sou yo retire)", "Percurso de 10 minutos (clique para remover)", "Walkshed de 10 minutos (haga clic para eliminar)", "Đi bộ 10 phút (bấm để xóa)"][selectedLanguageIndex]}</strong><br>
                    <strong>${[" EV Charging Stations", "Estasyon chaje EV", "Estações de carregamento EV", "Estaciones de carga EV", "Trạm sạc EV"][selectedLanguageIndex]}</strong>
                  </p>`;

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior
  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({ weight: 3, opacity: 0.5 });
  });
  layer.on('mouseout', function (e) {
      this.setStyle({ weight: 0.25, opacity: 0.85 });
  });
  layer.on('click', function (e) {
    map.removeLayer(layer);
    createFeatures(5);
  });
}

function createFeatures(inputNum) {
  if (overlaysIDs[inputNum] != -1) {
    overlays.removeLayer(overlaysIDs[inputNum]);
    overlaysIDs[inputNum] = -1;
  }

  switch (inputNum){
    case 0:

      scoreDict = {"transportation": [], "equity": [], "combined": []};

      for (var j = 0; j < hexagonArray.length; j++) {
        var feature = hexagonArray[j];

        var transScore = 0;
        var equityScore = 0;

        if ($('#transportationRadio').prop('checked')) {
          for (var i = 0; i < transportationWeightCategories.length; i++) { 
            var currentWeight = $(`#${transportationWeightCategories[i]}-range`).slider('value');
            transScore += currentWeight * (99.0 - parseFloat(feature.properties[transportationRankFieldNames[i]]));
          }
        }
    
        if ($('#equityRadio').prop('checked')) {
          for (var i = 0; i < equityWeightCategories.length; i++) { 
            var currentWeight = $(`#${equityWeightCategories[i]}-range`).slider('value');
            equityScore += currentWeight * parseFloat(feature.properties[equityRankFieldNames[i]]);
          }
        }

        var currentScore = transScore / parseFloat(transportationWeightCategories.length) + equityScore / parseFloat(equityWeightCategories.length);

        scoreDict["transportation"].push(transScore);
        scoreDict["equity"].push(equityScore);
        scoreDict["combined"].push(currentScore);
      }

      var scoreDictKeys = Object.keys(scoreDict);

      for (var k = 0; k < scoreDictKeys.length; k++) {
        scoreDict[scoreDictKeys[k]].sort(function(a, b) {
          return a - b;
        });
  
        var currentSeries = scoreDict[scoreDictKeys[k]];

        if (ss.max(currentSeries) != scoreDict[scoreDictKeys[k]][0]) {
          var set = new Set(scoreDict[scoreDictKeys[k]]);
          var setSize = set.size;

          if (setSize >= 8) {
            jenksBreaks[scoreDictKeys[k]] = ssJenks(currentSeries, 8);
          } else {
            var currentBreaks = ssJenks(currentSeries, setSize);
            var filledMaxArray = new Array(7 - setSize).fill(ss.min(currentBreaks));
            jenksBreaks[scoreDictKeys[k]] = filledMaxArray.concat(currentBreaks);
          }
        } else {
          jenksBreaks[scoreDictKeys[k]] = new Array(8).fill(0);
        }

        // var breakInterval = scoreDict[scoreDictKeys[k]][scoreDict[scoreDictKeys[k]].length - 1] / 8.0;
        // jenksBreaks[scoreDictKeys[k]] = [];
        // for (var g = 0; g < 8; g++) {
        //   jenksBreaks[scoreDictKeys[k]].push(breakInterval * g);
        // }

        // jenksBreaks[scoreDictKeys[k]][7] = scoreDict[scoreDictKeys[k]][scoreDict[scoreDictKeys[k]].length - 1];
      }

      hexagons = L.geoJSON(hexagonArray, {
        style: styleHexagons,
        // style: styleHexagonsZeroFill,
        onEachFeature: hexagonTooltip
      });

      overlays.addLayer(hexagons).addTo(map);
      overlaysIDs[inputNum] = hexagons._leaflet_id;

      break;
    case 1:
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 48 48">    <title>        bus    </title>    <path fill="#ffc72c" d="m24.12432 47.99966c13.44632-.345 24.22342-11.27549 23.87132-24.128-.36299-13.24986-10.87335-23.94219-24.12799-23.87132a24 24 0 1 0 .25667 47.99932"></path>    <path fill="#1c1e23" d="m37.17509 22.34207-1.27973-10.34352c-.32519-1.86647-1.47054-2.59471-3.17445-3.35829a26.7476 26.7476 0 0 0 -8.71034-1.64026 26.86629 26.86629 0 0 0 -8.72444 1.64026c-1.68268.74943-2.828 1.49182-3.17446 3.35829l-1.28676 10.34352v14.30982h2.2589v2.49222a1.86133 1.86133 0 0 0 1.85585 1.85589 1.86137 1.86137 0 0 0 1.85589-1.85589v-2.49222h14.476v2.49222a1.8559 1.8559 0 0 0 3.71179 0v-2.49222h2.19175zm-18.58725-12.72613h10.88793a.83429.83429 0 1 1 0 1.66852h-10.88793a.83426.83426 0 1 1 0-1.66852zm-5.42274 12.42212 1.06052-8.16593a1.064 1.064 0 0 1 1.06051-.88376h17.58326a1.05671 1.05671 0 0 1 1.05344.88376l1.06051 8.16593a.94744.94744 0 0 1 0 .28282v.05653a1.04868 1.04868 0 0 1 -1.06051 1.05348h-19.74671a1.06024 1.06024 0 0 1 -1.011-1.11.94744.94744 0 0 1 -.00002-.28283zm1.7746 10.188a1.9761 1.9761 0 1 1 1.97253-1.97966 1.97488 1.97488 0 0 1 -1.97253 1.97966zm18.18421 0a1.9761 1.9761 0 1 1 1.97961-1.97966 1.97487 1.97487 0 0 1 -1.97961 1.97966z"></path></svg>';

      var iconUrl = 'data:image/svg+xml;base64,' + btoa(svg);

      var icon = L.icon( {
        iconUrl: iconUrl,
        iconSize: [12, 12]
      });

      bus = L.geoJSON(busArray, {
        pointToLayer: function(feature, latlng) {
          return L.marker(latlng, {icon: icon});
        },
        onEachFeature: busTooltip
      });

      overlays.addLayer(bus).addTo(map);
      overlaysIDs[inputNum] = bus._leaflet_id;
      break;
    case 2:
      var blueBikeIcon = L.icon({
        iconUrl: 'img/bluebikes.jpg',
        iconSize: [15, 15]
      })

      bluebikes = L.geoJSON(bluebikesArray, {
        pointToLayer: function(feature, latlng) {
          return L.marker(latlng, {icon: blueBikeIcon});
        },
        onEachFeature: bluebikesTooltip
      });

      overlays.addLayer(bluebikes).addTo(map);
      overlaysIDs[inputNum] = bluebikes._leaflet_id;
      break;
    case 3:
      var zipcarIcon = L.icon({
        iconUrl: 'img/carshare.png',
        iconSize: [15, 15]
      });

      zipcar = L.geoJSON(zipcarArray, {
        pointToLayer: function(feature, latlng) {
          return L.marker(latlng, {icon: zipcarIcon});
        },
        onEachFeature: zipcarTooltip
      });

      overlays.addLayer(zipcar).addTo(map);
      overlaysIDs[inputNum] = zipcar._leaflet_id;
      break;
    case 4:
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Layer_1" x="0px" y="0px" role="img" style="enable-background:new 0 0 48 48" version="1.1" viewBox="0 0 48 48" xml:space="preserve">    <title>        T    </title>    <path d="M24,45.9C11.9,45.9,2.1,36.1,2.1,24S11.9,2.1,24,2.1S45.9,11.9,45.9,24C45.9,36.1,36.1,45.9,24,45.9	C24,45.9,24,45.9,24,45.9" style="fill:#ffffff"></path>    <g>        <path d="M24,0C10.7,0,0,10.7,0,24s10.7,24,24,24s24-10.7,24-24l0,0C48,10.7,37.3,0,24,0C24,0,24,0,24,0 M24,45.9		C11.9,45.9,2.1,36.1,2.1,24S11.9,2.1,24,2.1S45.9,11.9,45.9,24C45.9,36.1,36.1,45.9,24,45.9C24,45.9,24,45.9,24,45.9" style="fill:#1C1E23"></path>        <path d="M20.2,39.6h7.6V20.9h11.4v-7.6H8.8v7.6h11.4V39.6z" style="fill:#1C1E23"></path>    </g></svg>';

      var iconUrl = 'data:image/svg+xml;base64,' + btoa(svg);

      var icon = L.icon( {
        iconUrl: iconUrl,
        iconSize: [12, 12]
      });

      subway = L.geoJSON(subwayArray, {
        pointToLayer: function(feature, latlng) {
          return L.marker(latlng, {icon: icon});
        },
        onEachFeature: subwayTooltip
      });

      overlays.addLayer(subway).addTo(map);
      overlaysIDs[inputNum] = subway._leaflet_id;
      break;
    case 5:

      var icon = L.icon( {
        iconUrl: 'img/ev.png',
        iconSize: [15, 15]
      });

      ev = L.geoJSON(evArray, {
        pointToLayer: function(feature, latlng) {
          return L.marker(latlng, {icon: icon});
        },
        onEachFeature: evTooltip
      });

      overlays.addLayer(ev).addTo(map);
      overlaysIDs[inputNum] = ev._leaflet_id;
      break;
    case 6:
      var icon = L.icon( {
        iconUrl: 'img/library.png',
        iconSize: [25, 25]
      });

      library = L.geoJSON(libraryArray, {
        pointToLayer: function(feature, latlng) {
          return L.marker(latlng, {icon: icon});
        },
        onEachFeature: libraryTooltip
      });

      overlays.addLayer(library).addTo(map);
      overlaysIDs[inputNum] = library._leaflet_id;
      break;
    case 7:
      var icon = L.icon( {
        iconUrl: 'img/school.png',
        iconSize: [20, 20]
      });

      school = L.geoJSON(schoolArray, {
        pointToLayer: function(feature, latlng) {
          return L.marker(latlng, {icon: icon});
        },
        onEachFeature: schoolTooltip
      });

      overlays.addLayer(school).addTo(map);
      overlaysIDs[inputNum] = school._leaflet_id;
      break;
    case 8:
      bikeNetwork = L.geoJSON(bikeNetworkArray, {
        // style: styleHexagons,
        style: {"color": "#ff7800", "weight": 5, "opacity": 0.65},
        onEachFeature: bikeNetworkTooltip
      });

      overlays.addLayer(bikeNetwork).addTo(map);
      overlaysIDs[inputNum] = bikeNetwork._leaflet_id;
      break;
    case 9:
      var icon = L.icon( {
        iconUrl: 'img/community.png',
        iconSize: [25, 25]
      });

      community = L.geoJSON(communityArray, {
        pointToLayer: function(feature, latlng) {
          return L.marker(latlng, {icon: icon});
        },
        onEachFeature: communityTooltip
      });

      overlays.addLayer(community).addTo(map);
      overlaysIDs[inputNum] = community._leaflet_id;
      break;
    case 10:
      var icon = L.icon( {
        iconUrl: 'img/park.png',
        iconSize: [25, 25]
      });

      park = L.geoJSON(parksArray, {
        style: {"fillColor": "green", "fillOpacity": 0.3, "weight": 0.25, "opacity": 0.85, color: '#fff'},
        onEachFeature: parkTooltip
      });

      overlays.addLayer(park).addTo(map);
      overlaysIDs[inputNum] = park._leaflet_id;
      break;

    case 11:

      function styleEj(feature) {
        var colorDict = {
                          "M": "#1f77b4",
                          "I": "#ff7f0e",
                          "E": "#2ca02c",
                          "ME": "#d62728",
                          "MI": "#9467bd",
                          "MIE": "#8c564b"
        }

        var currentStyle = {
                              "fillColor": colorDict[feature.properties.EJ_CRITERI], 
                              "fillOpacity": 0.3, 
                              "weight": 0.25, 
                              "opacity": 0.85, 
                              "color": colorDict[feature.properties.EJ_CRITERI]
                            };

        return currentStyle
      }

      ej = L.geoJSON(ejArray, {
        style: styleEj,
        onEachFeature: ejTooltip
      });

      overlays.addLayer(ej).addTo(map);
      overlaysIDs[inputNum] = ej._leaflet_id;
      break;

    case 12:

      landmarks = L.geoJSON(landmarksArray, {
        style: {"fillColor": "red", "fillOpacity": 0.3, "weight": 0.25, "opacity": 0.85, color: '#fff'},
        onEachFeature: landmarkTooltip
      });

      overlays.addLayer(landmarks).addTo(map);
      overlaysIDs[inputNum] = landmarks._leaflet_id;
      break;
  }
}

function createHeatLayer() {

  heatArray = [];

  for (var j = 0; j < hexPointsArray.length; j++) {
    var feature = hexPointsArray[j];

    var transportationWeightCategories = ["bus", "subway", "bluebike", "zipcar", "walk", "job", "ferry", "parking", "grocery"];
    var transportationRankFieldNames = ["BUS_RANK", "SUBWA_RANK", "BIKES_RANK", "CAR_RANK", "Wal_Rank", "Job_Rank", "CR_RANK", "PARK_RANK", "GROCE_RANK"];

    var equityWeightCategories = ["youth", "elderly", "race", "education", "english", "income", "car"];
    var equityRankFieldNames = ["You_Rank", "Eld_Rank", "Min_Rank", "NoC_Rank", "LEP_Rank", "Per_Rank", "NoV_Rank"];

    var transScore = 0;
    var equityScore = 0;

    if ($('#transportationRadio').prop('checked')) {
      for (var i = 0; i < transportationWeightCategories.length; i++) { 
        var currentWeight = $(`#${transportationWeightCategories[i]}-range`).slider('value');
        transScore += currentWeight * 10 * parseFloat(feature.properties[transportationRankFieldNames[i]]);
      }
    }
 
    if ($('#equityRadio').prop('checked')) {
      for (var i = 0; i < equityWeightCategories.length; i++) { 
        var currentWeight = $(`#${equityWeightCategories[i]}-range`).slider('value');
        equityScore += currentWeight * 10 * parseFloat(feature.properties[equityRankFieldNames[i]]);
      }
    }

    var currentScore = transScore + equityScore;
    scoreArray.push(currentScore);
    heatArray.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0], currentScore]);
  }

  if (overlaysIDs[50] != -1) {
    overlays.removeLayer(overlaysIDs[50]);
    overlaysIDs[50] = -1;
  }

  series = new geostats(scoreArray);
  maxScore = series.max();
  var heatGradient = {};
  // var classJenks = series.getClassJenks(3);
  // classJenks = classJenks.filter(function(x) {
  //   if (x !== undefined && x !== NaN) {
  //     return x;
  //   }
  // });


  // var gradient = ["#000000", "#1871BD", "#FFAE00"];

  // for (var j = 0; j < gradient.length; j++) {
  //   if (Number.isInteger(classJenks[j])) {
  //     heatGradient[(classJenks[j]) / parseFloat(maxScore)] = gradient[j];
  //   }
  // }

  if ($('#transportationRadio').prop('checked')) {
    heatGradient = {
                    0.9: "#000000",
                    0.8: "#1D111F",
                    0.75: "#3B233E",
                    0.7: "#59355E",
                    0.65: "#43497D",
                    0.55: "#2D5D9D",
                    0.5: "#1871BD",
                    0.4: "#65857E",
                    0.3: "#B2993F",
                    0.2: "#FFAE00",
                    }

  } else {
    heatGradient = {
                    0.35: "#000000",
                    0.35: "#1D111F",
                    0.45: "#3B233E",
                    0.45: "#59355E",
                    0.55: "#43497D",
                    0.6: "#2D5D9D",
                    0.65: "#1871BD",
                    0.75: "#65857E",
                    0.85: "#B2993F",
                    0.95: "#FFAE00",
                    }
  }



  heat = L.heatLayer(heatArray, {radius: 4, blur: 8, maxZoom: map.getZoom(), max: maxScore, gradient: heatGradient});
  // heat = L.heatLayer(heatArray, {radius: 11, blur: 12, maxZoom: 14, max: 1, gradient: heatGradient});

  overlays.addLayer(heat).addTo(map);
  overlaysIDs[50] = heat._leaflet_id;
}

function updateHeatLayer() {
  var updatedHeatArray= [];

  var transportationAccessIndexMin = $('#transportation-range').slider('values')[0];
  var transportationAccessIndexMax = $('#transportation-range').slider('values')[1];

  var mobilityIndexMin = $('#mobility-range').slider('values')[0];
  var mobilityIndexMax = $('#mobility-range').slider('values')[1];

  var currentRatio;

  var transRadio = $('#transportationRadio').prop('checked');
  var equityRadio = $('#equityRadio').prop('checked');

  for (var i = 0; i < heatArray.length; i++) {
    currentRatio = heatArray[i][2] / parseFloat(maxScore);

    if (transRadio) {
      currentRatio = 1 - currentRatio;
      if (transportationAccessIndexMin <= currentRatio && currentRatio <= transportationAccessIndexMax) {
        updatedHeatArray.push(heatArray[i]);
      }
    }

    if (equityRadio) {
      if (mobilityIndexMin <= currentRatio && currentRatio <= mobilityIndexMax) {
        updatedHeatArray.push(heatArray[i]);
      }
    }
  }

  heat.setLatLngs(updatedHeatArray);
}

function adjustHeatSettings(currentZoom) {
  switch (currentZoom) {
    case 15:
      heat.setOptions({radius: currentZoom - 8, blur: currentZoom - 3, maxZoom: currentZoom});
      break;
    case 16:
      heat.setOptions({radius: currentZoom - 2, blur: currentZoom + 10, maxZoom: currentZoom});
      break;
    case 17:
      heat.setOptions({radius: currentZoom + 12, blur: currentZoom + 35, maxZoom: currentZoom});
      break;
    case 18:
      heat.setOptions({radius: currentZoom + 40, blur: currentZoom + 80, maxZoom: currentZoom});
      break;
    default:
      heat.setOptions({radius: 4, blur: 8, maxZoom: currentZoom});
  }
}

// map.on('zoomend', function(e) {
//   var currentZoom = map.getZoom();
//   heat.setLatLngs(heatArray);

//   adjustHeatSettings(map.getZoom());

// });

function createWalkshed(inputNum, locationId) {

  if (overlaysIDs[inputNum] != -1) {
    overlays.removeLayer(overlaysIDs[inputNum]);
    overlaysIDs[inputNum] = -1;
  }

  switch (inputNum){
    case 21:
      var currentStyle = {
        "color": "#fff",
        "fillColor": "#ffc72c",
        "weight": 0.25,
        "opacity": 0.85,
        "fillOpacity": 0.25,
      };

      busWalkshed = L.geoJSON(busWalkshedArray, {
        style: currentStyle,
        onEachFeature: busWalkshedTooltip,
        // filter: function (feature) {
        //   if (feature.properties.stop_id == locationId) {
        //     return true;
        //   }
        // }
      });

      overlays.addLayer(busWalkshed).addTo(map);
      overlaysIDs[inputNum] = busWalkshed._leaflet_id;

      break;

    case 22:
      var currentStyle = {
        "color": "#fff",
        "fillColor": "#1D428A",
        "weight": 0.25,
        "opacity": 0.85,
        "fillOpacity": 0.25,
      };

      bluebikesWalkshed = L.geoJSON(bluebikesWalkshedArray, {
        style: currentStyle,
        onEachFeature: bluebikesWalkshedTooltip,
        // filter: function (feature) {
        //   if (feature.properties.id == locationId) {
        //     return true;
        //   }
        // }
      });

      overlays.addLayer(bluebikesWalkshed).addTo(map);
      overlaysIDs[inputNum] = bluebikesWalkshed._leaflet_id;

      break;

    case 23:
      var currentStyle = {
        "color": "#fff",
        "fillColor": "#6cb33e",
        "weight": 0.25,
        "opacity": 0.85,
        "fillOpacity": 0.25,
      };

      zipcarWalkshed = L.geoJSON(zipcarWalkshedArray, {
        style: currentStyle,
        onEachFeature: zipcarWalkshedTooltip,
        // filter: function (feature) {
        //   if (feature.properties.Id == locationId) {
        //     return true;
        //   }
        // }
      });

      overlays.addLayer(zipcarWalkshed).addTo(map);
      overlaysIDs[inputNum] = zipcarWalkshed._leaflet_id;

      break;

    case 24:
      var currentStyle = {
        "color": "#000",
        "fillColor": "#ccc",
        "weight": 0.25,
        "opacity": 0.85,
        "fillOpacity": 0.35,
      };

      subwayWalkshed = L.geoJSON(subwayWalkshedArray, {
        style: currentStyle,
        onEachFeature: subwayWalkshedTooltip,
        // filter: function (feature) {
        //   if (feature.properties.STATION == locationId) {
        //     return true;
        //   }
        // }
      });

      overlays.addLayer(subwayWalkshed).addTo(map);
      overlaysIDs[inputNum] = subwayWalkshed._leaflet_id;

      break;
    case 25:
      var currentStyle = {
        "color": "#fff",
        "fillColor": "#293784",
        "weight": 0.25,
        "opacity": 0.85,
        "fillOpacity": 0.25,
      };

      evWalkshed = L.geoJSON(evWalkshedArray, {
        style: currentStyle,
        onEachFeature: evWalkshedTooltip,
        // filter: function (feature) {
        //   if (feature.properties.ParcelID == locationId) {
        //     return true;
        //   }
        // }
      });

      overlays.addLayer(evWalkshed).addTo(map);
      overlaysIDs[inputNum] = evWalkshed._leaflet_id;

      break;
  }
}

createFeatures(0);
// createHeatLayer();

