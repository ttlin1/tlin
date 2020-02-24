var CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var CartoDB_PositronOnlyLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  pane: 'labels'
});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash;'
});

// center of boston: 42.3601, -71.0589

var map = L.map('participationMapDiv', {
  center: [42.373883, -71.020021],
  zoom: 14,
  layers: [Esri_WorldImagery, CartoDB_PositronNoLabels],
  doubleClickZoom: false,
  boxZoom: false,
  zoomControl: false,
  minZoom: 14,
  maxZoom: 18
});

var mapZoom = new L.Control.Zoom({position: 'bottomleft'}).addTo(map);

var baseMaps = {
  "Carto": CartoDB_PositronNoLabels,
  "Satellite": Esri_WorldImagery
};

//////////////////////////////////////////////// GEOCODER

var searchControl = L.esri.Geocoding.geosearch({position: 'bottomleft'}).addTo(map);

var results = L.layerGroup().addTo(map);

searchControl.on('results', function(data){
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    map.flyTo(data.results[i].latlng, 18);
    // results.addLayer(L.marker(data.results[i].latlng));
  }
});

map.attributionControl.setPrefix('<a href="https://tooledesign.com/">Toole Design<a> | <a href="https://leafletjs.com/">Leaflet</a>');

var basemapControl = L.control.layers(baseMaps, null, {position: 'bottomleft'});
basemapControl.addTo(map);

map.createPane('labels');
map.getPane('labels').style.zIndex = 601;
map.getPane('labels').style.pointerEvents = 'none';

CartoDB_PositronOnlyLabels.addTo(map);

var overlays = L.layerGroup();
var overlaysIDs = new Array(100).fill(-1);

var hexagonArray = [];
var hexagons = L.geoJson();

var scoreDict = {"transportation": [], "equity": [], "combined": []};
var jenksBreaks = {};
var maxScore;

var hexPointsArray = [];
var heatArray = [];
var heat = new L.heatLayer(null);

var busArray = [];
var bus = L.geoJson();
var busWalkshedArray = [];
var busWalkshed = L.geoJson();

var bluebikesArray = [];
var bluebikes = L.geoJson();
var bluebikesWalkshedArray = [];
var bluebikesWalkshed = L.geoJson();

var zipcarArray = [];
var zipcar = L.geoJson();
var zipcarWalkshedArray = [];
var zipcarWalkshed = L.geoJson();

var subwayArray = [];
var subway = L.geoJson();
var subwayWalkshedArray = [];
var subwayWalkshed = L.geoJson();

var evArray = [];
var ev = L.geoJson();
var evWalkshedArray = [];
var evWalkshed = L.geoJson();

var libraryArray = [];
var library = L.geoJson();

var boundary = L.geoJson();

var schoolArray = [];
var school = L.geoJson();

var communityArray = [];
var community = L.geoJson();

var bikeNetworkArray = [];
var bikeNetwork = L.geoJson();

var parksArray = [];
var parks = L.geoJson();

var ejArray = [];
var ej = L.geoJson();

var landmarksArray = [];
var landmarks = L.geoJson();

var maxScore = 0;

var drawnPoints = [];
var drawingNumbers = [];

var surveyQuestions = {};

var selectedLanguageIndex = 0;
var languageArray = ["English", "Kreyòl Ayisyen", "Portuguesa", "Española", "Tiếng Việt"];

var initialValueDict = {
                          "bus-range": 8, 
                          "subway-range": 10, 
                          "bluebike-range": 7, 
                          "zipcar-range": 7, 
                          // "walk-range": 10, 
                          "job-range": 0, 
                          "ferry-range": 8, 
                          "youth-range": 10, 
                          "elderly-range": 10, 
                          "race-range": 10, 
                          "education-range": 10, 
                          "english-range": 10, 
                          "income-range": 10, 
                          "car-range": 0,
                          "community-range": 0,
                          "disabled-range": 10};

//////////////////////////////////////////////// IP
var ip_address;
var postal_code;

$(function () {
  $.getJSON("https://api.ipify.org?format=jsonp&callback=?",
    function (json) {
      ip_address = json.ip;
    }
  );
});

//////////////////////////////////////////////// CONFIG
var c = {};

$.ajax({
  url: 'json/c.json',
  dataType: 'json',
  async: false,
  success: function (data) {
    c.mp = data.mp;
    c.s = data.s;
    c.m = data.m;
  }
});

function capitalize(inString) {
  var returnedString = [];
  if (inString != null) {
    var splitString = inString.split(" ");

    for (var i = 0; i < splitString.length; i++) {
      returnedString.push(splitString[i].charAt(0).toUpperCase() + splitString[i].slice(1).toLowerCase());
    } 
  }

  return returnedString.join(" ");
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//////////////////////////////////////////////// GET SURVEY QUESTIONS
var c_i = c.m.c_i;
var a_k = c.m.a_k;

var dd = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

var sc = "https://www.googleapis.com/auth/spreadsheets.readonly";

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

handleClientLoad();

function initClient() {
  gapi.client.init({
    apiKey: a_k,
    clientId: c_i,
    discoveryDocs: dd,
    scope: sc
  }).then(function() {
    getSurveyQuestions();
  });
}

function getSurveyQuestions() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: c.s.l,
    range: 'Survey Questions!A1:G',
  }).then(function(response) {
    var values = response.result.values;
    var headers = values[0];

    // var numberLanguages = 5;
    // var numberQuestions = 3;

    // for (var m = 1; m <= numberQuestions; m++) {
    //   surveyQuestions[m] = [];
    // }

    for (var i = 1; i < values.length; i++){
      var currentQuestionNumber = parseInt(values[i][headers.indexOf("Number")]);
      var currentQuestion = {};

      var surveyQuestionsKeys = Object.keys(surveyQuestions);
      surveyQuestionsKeys = surveyQuestionsKeys.map(x => parseInt(x));

      if ($.inArray(currentQuestionNumber, surveyQuestionsKeys) == -1) {
        surveyQuestions[currentQuestionNumber] = [];
      }

      for (var j = 1; j < headers.length; j++) {
        currentQuestion[headers[j]] = values[i][headers.indexOf(headers[j])];
      }

      surveyQuestions[currentQuestionNumber].push(currentQuestion);
    }
  });
}

//////////////////////////////////////////////// SIDEBAR

var sideBar = L.control({ position: 'topleft' });

sideBar.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'sideBarDiv');
  this.initializeInfo();
  return this._div;
};

sideBar.initializeInfo = function () {
  this._div.innerHTML = '';
}

sideBar.addTo(map);

$('.sideBarDiv').attr('id', 'sideBarDivId');

var sidebarControl = L.control.sidebar('sideBarDivId', {
  closeButton: false,
  position: 'left',
  autoPan: false
});
map.addControl(sidebarControl);

//////////////////////////////////////////////// INTRO DIV

function createIntroDivText() {
  var currentIntroText = `
    <div class="row d-none d-md-block mx-auto">
      <div class="col mx-auto text-center">
        <br>
        <a href="https://www.boston.gov/" target="_blank" class="mx-auto"><img src="img/logo.svg" class="citySeal"></a>
      </div>
    </div>

    <div class="row d-none d-md-block" id="mobileAboutRow">
      <hr>
      <div class="col">
        <span class="float-right hideThisElement d-md-none" style="cursor: pointer"><i class="fas fa-caret-square-up fa-2x"></i></span>
        <br>

        <div class="row mx-auto no-gutters">
          <div class="col mx-auto">
            <span id="infoText">
              <div class="highlightedBlockText">
                <h6><strong>${["Current Conditions", "Kondisyon aktyèl yo", "Condições atuais", "Condiciones actuales", "Điều kiện hiện tại"][selectedLanguageIndex]}</strong></h6>
                <p class="small">${["Use the tools below to explore the current conditions in East Boston. Click on a hexagon to comment on that location. Click on transportation locations to view the 10-minute walkshed to/from that location.", "Sèvi ak zouti ki anba yo pou eksplore kondisyon aktyèl yo nan East Boston. Klike sou yon egzagòn pou fè kòmantè sou kote sa a. Klike sou kote pou transpòte yo pou wè 10-minit mache a / soti nan kote sa a.", "Use as ferramentas abaixo para explorar as condições atuais em East Boston. Clique em um hexágono para comentar sobre esse local. Clique nos locais de transporte para ver o percurso de 10 minutos de / para esse local.", "Use las herramientas a continuación para explorar las condiciones actuales en East Boston. Haga clic en un hexágono para comentar sobre esa ubicación. Haga clic en las ubicaciones de transporte para ver la caminata de 10 minutos hacia / desde esa ubicación.", "Sử dụng các công cụ dưới đây để khám phá các điều kiện hiện tại ở Đông Boston. Nhấp vào hình lục giác để nhận xét về vị trí đó. Nhấp vào các địa điểm giao thông để xem 10 phút đi bộ đến / từ vị trí đó."][selectedLanguageIndex]}</p>
              </div>
              <br>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="row d-none d-md-block" id="mobileTransportationRow">
      <div class="col">
        <span class="float-right hideThisElement d-md-none" style="cursor: pointer"><i class="fas fa-caret-square-up fa-2x"></i></span>
        <br>

        <div class="row mx-auto">
          <div class="col-8">
            <label for="transportationRadio"><input type="checkbox" id="transportationRadio" class="topCheckboxes" name="visualizationType" value="transportation" checked><strong>${[" Transportation Access", " Aksè Transpò", " Acesso ao transporte", " Acceso de transporte", " Giao thông vận tải"][selectedLanguageIndex]}</strong></label>
          </div>
          <div class="col-4 text-right">
            <button class="noStyling" data-toggle="tooltip" data-placement="left" data-html="true" title="<small>${["Access to transportation is calculated based on the number of transportation options (bus, subway, bikeshare, and carshare) within a 10-minute walk of the given location.", "Aksè a transpò kalkile ki baze sou kantite opsyon transpò (otobis, tren, bikeshare, ak vwati) nan yon ti mache 10-minit nan kote yo bay la.", "O acesso ao transporte é calculado com base no número de opções de transporte (ônibus, metrô, compartilhamento de bicicletas e carros) a uma caminhada de 10 minutos do local indicado.", "El acceso al transporte se calcula en función de la cantidad de opciones de transporte (autobús, metro, bicicletas compartidas y autos compartidos) a 10 minutos a pie de la ubicación dada.", "Truy cập vào giao thông được tính dựa trên số lượng tùy chọn giao thông (xe buýt, tàu điện ngầm, xe đạp và xe hơi) trong vòng 10 phút đi bộ từ vị trí nhất định."][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
          </div>
        </div>

        <br>

        <div class="row mx-auto">
          <div class="col">
            <p class="text-center">
              <!--<input type="text" id="transportationAccessAmount" class="text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">-->
              <div id="transportation-range"></div>
              <label for "transportationAccessAmount" style="width: 100%;">
                <div class="float-left"><small>${["Most Access", "Pifò Aksè", "Maior acesso", "Mayor acceso", "Truy cập nhiều nhất"][selectedLanguageIndex]}</small></div>
                <div class="float-right"><small>${["Least Access", "Pi piti aksè", "Menos acesso", "Menos acceso", "Truy cập ít nhất"][selectedLanguageIndex]}</small></div>
              </label>
            </p>
          </div>
        </div>

        <div class="row pb-1">
          <div class="col">
            <p class="text-center">
              <a class="noDecoration" data-toggle="collapse" href="#accessCollapse" role="button" aria-expanded="false" aria-controls="accessCollapse">
                <i class="fas fa-sort-down"></i>${[" Transportation Settings", " Transpòtasyon", " Configurações de transporte", " Configuraciones de transporte", " Cài đặt vận chuyển"][selectedLanguageIndex]}
              </a>
            </p>
          </div>
        </div>

        <div class="row mx-auto collapse" id="accessCollapse">
          <div class="col">
            <div class="row">
              <div class="col-5">
                <p><strong>${["Type", "Kalite", "Tipo", "Tipo", "Thể loại"][selectedLanguageIndex]}</strong></p>
              </div>
              <div class="col-2">
                <p><strong>${["Weight", "Pwa", "Peso", "Peso", "Cân nặng"][selectedLanguageIndex]}</strong></p>
              </div>
              <div class="col-5">
                <p class="pl-2"><strong>${["Range", "Range", "Alcance", "Distancia", "Phạm vi"][selectedLanguageIndex]}</strong></p>
              </div>
            </div>

            <!--<div class="row">
              <div class="col-5">
                <p>
                  <small>${["Walk Score", "Mache nòt", "Walk Score", "Walk Score", "Điểm đi bộ"][selectedLanguageIndex]}</small>
                  
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Walk Score is a numerical walkability score", "Mache Nòt se yon nòt pèsistans teknik", "A pontuação da caminhada é uma pontuação numérica da capacidade de caminhar", "Walk Score es un puntaje numérico de caminabilidad", "Điểm số đi bộ là một số điểm đi bộ số"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="walk-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="walk-range" class="access-ranges"></div>
              </div>
            </div>-->

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Job Access", "Aksè nan Travay", "Acesso ao trabalho", "Acceso laboral", "Tiếp cận công việc"][selectedLanguageIndex]}</small>
                  
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Job Access is based on the number of jobs accessible from a given location", "Aksè pou Travay baze sou kantite travay ki aksesib nan yon kote yo bay la", "O Acesso ao trabalho é baseado no número de trabalhos acessíveis a partir de um determinado local", "Job Access se basa en la cantidad de trabajos accesibles desde una ubicación determinada", "Truy cập công việc dựa trên số lượng công việc có thể truy cập từ một vị trí nhất định"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="job-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="job-range" class="access-ranges"></div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Key Bus Route", "Kle otobis la kle", "Rota de ônibus principal", "Ruta clave del autobús", "Tuyến xe buýt chính"][selectedLanguageIndex]}</small>
                  
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Located within walking distance of a Key Bus Route", "Sitiye nan mache distans de yon wout otobis kle", "Localizado a uma curta distância de uma rota de ônibus principal", "Ubicado a poca distancia de una ruta clave de autobuses", "Nằm trong khoảng cách đi bộ của Tuyến xe buýt chính"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="bus-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="bus-range" class="access-ranges"></div>
              </div>
            </div>

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Rail / Ferry", "Rail / Ferry", "Rail / Ferry", "Ferrocarril / Ferry", "Đường sắt / phà"][selectedLanguageIndex]}</small>

                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Proximity to commuter rail / ferry", "Sitiye nan mache distans nan tren an banlye / Ferry", "Localizado a uma curta distância do trem / balsa", "Ubicado a poca distancia del tren de cercanías / ferry", "Nằm trong khoảng cách đi bộ của đường sắt đi lại / phà"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="ferry-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="ferry-range" class="access-ranges"></div>
              </div>
            </div>

            <!--<div class="row">
              <div class="col-5">
                <p>
                  <small>${["Parking", "Espas pou", "Estacionamento", "Estacionamiento", "Bãi đỗ xe"][selectedLanguageIndex]}</small>
                
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["", "", "", "", ""][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="parking-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="parking-range" class="access-ranges"></div>
              </div>
            </div>-->

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Subway", "Tren", "Metrô", "Subterraneo", "Xe điện ngầm"][selectedLanguageIndex]}</small>

                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Located within walking distance of a subway station", "Sitiye nan mache distans nan yon estasyon tren", "Localizado a uma curta distância de uma estação de metrô", "Ubicado a poca distancia de una estación de metro", "Nằm trong khoảng cách đi bộ đến ga tàu điện ngầm"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="subway-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="subway-range" class="access-ranges"></div>
              </div>
            </div>

            <!--<div class="row">
              <div class="col-5">
                <p>
                  <small>${["Grocery Stores", "Magazen episeri yo", "Mercearias", "Tiendas de comestibles", "Cửa hàng tạp hóa"][selectedLanguageIndex]}</small>

                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["", "", "", "", ""][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="grocery-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="grocery-range" class="access-ranges"></div>
              </div>
            </div>-->

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Zero Car", "Zewo Machin", "Zero Car", "Coche cero", "Xe không"][selectedLanguageIndex]}</small>
                  
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Households with zero car ownership", "Kay ak komen zewo machin", "Famílias com zero carros", "Hogares con cero automóviles", "Các hộ gia đình không có quyền sở hữu xe hơi"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2 text-center">
                <input type="text" id="car-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="car-range" class="access-ranges"></div>
              </div>
            </div>

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Bikeshare", "Pataje bisiklèt", "Partilha de bicicleta", "Compartir bicicleta", "Chia sẻ xe đạp"][selectedLanguageIndex]}</small>
                  
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Located within walking distance of a bikeshare location", "Sitiye nan mache distans nan yon kote pataje bisiklèt", "Localizado a uma curta distância de um local de compartilhamento de bicicleta", "Ubicado a poca distancia de un lugar para compartir bicicletas", "Nằm trong khoảng cách đi bộ của một vị trí chia sẻ xe đạp"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="bluebike-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="bluebike-range" class="access-ranges"></div>
              </div>
            </div>

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Carshare", "Pataje machin", "Car share", "Compartir coche", "Chia sẻ xe"][selectedLanguageIndex]}</small>
                  
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Located within walking distance of a carshare location", "Sitiye nan mache distans nan yon kote machin pataje", "Localizado a uma curta distância de um local de compartilhamento de carro", "Ubicado a una corta distancia a pie de una ubicación de coche compartido", "Nằm trong khoảng cách đi bộ của một vị trí chia sẻ xe"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="zipcar-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="zipcar-range" class="access-ranges"></div>
              </div>
            </div>

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Community Assets", "Byen Kominotè", "Ativos da comunidade", "Bienes de la comunidad", "Tài sản cộng đồng"][selectedLanguageIndex]}</small>
                  
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Community Assets score is comprised of schools, grocery stores, libraries, community centers, parks, and retail jobs", "Nòt kominote a gen ladan lekòl, boutik, bibliyotèk, sant kominotè, pak, travay detay ak enstitisyon kiltirèl", "A pontuação da comunidade é composta por escolas, supermercados, bibliotecas, centros comunitários, parques, empregos no varejo", "El puntaje de la comunidad está compuesto por escuelas, supermercados, bibliotecas, centros comunitarios, parques, empleos minoristas.", "Điểm tài sản cộng đồng bao gồm các trường học, cửa hàng tạp hóa, thư viện, trung tâm cộng đồng, công viên và công việc bán lẻ"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="community-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="community-range" class="access-ranges"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div> <!-- end mobileTransportationRow -->

    <div class="row d-none d-md-block" id="mobileEquityRow">
      <hr>
      <div class="col">
        <span class="float-right hideThisElement d-md-none" style="cursor: pointer"><i class="fas fa-caret-square-up fa-2x"></i></span>
        <br>

        <div class="row mx-auto">
          <div class="col-8">
            <label for="equityRadio"><input type="checkbox" id="equityRadio" class="topCheckboxes" name="visualizationType" value="equity" checked><strong>${[" Equity Considerations", " Konsiderasyon sou Tretman Egal Ego", " Considerações sobre patrimônio líquido", " Consideraciones de equidad", " Cân nhắc vốn chủ sở hữu"][selectedLanguageIndex]}</strong></label>
          </div>
          <div class="col-4 text-right">
            <button class="noStyling" data-toggle="tooltip" data-placement="left" data-html="true" title="<small>${["Equity concerns is a measure of vulnerable populations based on a location's demographics (race/ethnicity, educational attainment, English proficiency, income, and vehicle ownership).", "Enkyetid sou Tretman Egal Ego se yon mezi nan popilasyon vilnerab ki baze sou démographie yon kote a (ras / etnisite, reyalizasyon edikasyon, konpetans angle, revni, ak pwopriyetè machin).", "Preocupações com a equidade é uma medida de populações vulneráveis com base na demografia de um local (raça / etnia, escolaridade, proficiência em inglês, renda e propriedade de veículos).", "La preocupación por la equidad es una medida de las poblaciones vulnerables en función de la demografía de una ubicación (raza / etnia, nivel educativo, dominio del inglés, ingresos y propiedad del vehículo).", "Mối quan tâm công bằng là thước đo dân số dễ bị tổn thương dựa trên nhân khẩu học của một địa điểm (chủng tộc / sắc tộc, trình độ học vấn, trình độ tiếng Anh, thu nhập và quyền sở hữu phương tiện)."][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
          </div>
        </div>

        <br>

        <div class="row mx-auto">
          <div class="col">
            <p class="text-center">
              <!--<input type="text" id="mobilityEquityAmount" class="text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">-->
              <div id="mobility-range"></div>
              <label for "mobilityEquityAmount" style="width: 100%;">
                <div class="float-left"><small>${["Least", "Pi piti", "Menos", "Menos", "Ít nhất"][selectedLanguageIndex]}</small></div>
                <div class="float-right"><small>${["Most", "Pifò", "A maioria", "Más", "Phần lớn"][selectedLanguageIndex]}</small></div>
              </label>
            </p>
          </div>
        </div>

        <div class="row pb-1">
          <div class="col">
            <p class="text-center">
              <a class="noDecoration" data-toggle="collapse" href="#equityCollapse" role="button" aria-expanded="false" aria-controls="equityCollapse">
                <i class="fas fa-sort-down"></i>${[" Equity Settings", " Ajisteman sou Tretman Egal Ego", " Configurações de patrimônio", " Configuraciones de equidad", " Cài đặt vốn chủ sở hữu"][selectedLanguageIndex]}
              </a>
            </p>
          </div>
        </div>

        <div class="row mx-auto collapse" id="equityCollapse">
          <div class="col">
            <div class="row">
              <div class="col-5">
                <p><strong>${["Type", "Kalite", "Tipo", "Tipo", "Thể loại"][selectedLanguageIndex]}</strong></p>
              </div>
              <div class="col-2">
                <p><strong>${["Weight", "Pwa", "Peso", "Peso", "Cân nặng"][selectedLanguageIndex]}</strong></p>
              </div>
              <div class="col-5">
                <p class="pl-2"><strong>${["Range", "Range", "Alcance", "Distancia", "Phạm vi"][selectedLanguageIndex]}</strong></p>
              </div>
            </div>

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Youth", "Jèn yo", "Juventude", "Juventud", "Thiếu niên"][selectedLanguageIndex]}</small>

                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Percentage of the population that is under 18", "Pousantaj popilasyon an ki poko gen 18 an", "Porcentagem da população abaixo de 18 anos", "Porcentaje de la población menor de 18 años", "Tỷ lệ dân số dưới 18 tuổi"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>  
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="youth-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="youth-range" class="access-ranges"></div>
              </div>
            </div>

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Elderly", "Granmoun Aje", "Idosas", "Mayor", "Hơi già"][selectedLanguageIndex]}</small>

                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Percentage of the population that is 65 and over", "Pousantaj nan popilasyon an ki gen 65 oswa plis", "Porcentagem da população com 65 anos ou mais", "Porcentaje de la población que tiene 65 años o más", "Tỷ lệ dân số từ 65 tuổi trở lên"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>  
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="elderly-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="elderly-range" class="access-ranges"></div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Race / Ethnicity", "Ras / Etnisite", "Raça / Etnia", "Raza / Etnia", "Chủng tộc / Dân tộc"][selectedLanguageIndex]}</small>
                  
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Percentage of the population that is people of color", "Pousantaj popilasyon an ki se moun ki gen koulè", "Porcentagem da população que é de cor", "Porcentaje de la población que es gente de color", "Tỷ lệ dân số là người da màu"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="race-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="race-range" class="access-ranges"></div>
              </div>
            </div>

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Education", "Edikasyon", "Educação", "Educación", "Giáo dục"][selectedLanguageIndex]}</small>

                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Percentage of the population that does not have a college education", "Pousantaj popilasyon an ki pa gen yon edikasyon kolèj", "Percentual da população que não possui ensino superior", "Porcentaje de la población que no tiene educación universitaria", "Tỷ lệ dân số không có giáo dục đại học"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>  
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="education-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="education-range" class="access-ranges"></div>
              </div>
            </div>

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Language", "Lang", "Língua", "Idioma", "Ngôn ngữ"][selectedLanguageIndex]}</small>
                  
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Percentage of the population that has limited English proficiency", "Pousantaj popilasyon an ki limite konpetans nan angle", "Porcentagem da população que possui proficiência limitada em inglês", "Porcentaje de la población que tiene un dominio limitado del inglés.", "Tỷ lệ dân số có trình độ tiếng Anh hạn chế"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="english-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="english-range" class="access-ranges"></div>
              </div>
            </div>

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Income", "Revni", "Renda", "Ingresos", "Thu nhập"][selectedLanguageIndex]}</small>
                  
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Per capita income", "Revni per capita", "Renda per capita", "El ingreso per capita", "Thu nhập bình quân đầu người"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="income-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="income-range" class="access-ranges"></div>
              </div>
            </div>

            <div class="row">
              <div class="col-5">
                <p>
                  <small>${["Disability", "Andikap", "Incapacidade", "Invalidez", "Khuyết tật"][selectedLanguageIndex]}</small>
                  
                  <button class="noStyling" data-toggle="tooltip" data-placement="bottom" data-html="true" title="<small>${["Percentage of population with a disability", "Pousantaj popilasyon ki gen yon andikap", "Percentagem da população com deficiência", "Porcentaje de población con discapacidad", "Tỷ lệ dân số bị khuyết tật"][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
                </p>
              </div>
              <div class="col-2">
                <input type="text" id="disabled-range-number" class="weightValues text-center" readonly style="border:0; color:#fb4d42; font-weight:bold; background-color: rgba(255, 255, 255, 0);">
              </div>
              <div class="col-5">
                <div id="disabled-range" class="access-ranges"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div> <!-- end mobileEquityRow -->

    <div class="row d-flex justify-content-center">
      <button type="button" class="btn btn-light" id="defaultSettings"><small>Return to Default Settings</small></button>
    </div>

    <div class="row d-none d-md-block" id="mobileAddRow">
      <hr>
      <div class="col">
        <span class="float-right hideThisElement d-md-none" style="cursor: pointer"><i class="fas fa-caret-square-up fa-2x"></i></span>
        <br>
        <div class="row mx-auto">
          <div class="col-8">
            <p><strong>${["Transit", "Transpò", "Transito", "Tránsito", "Quá cảnh"][selectedLanguageIndex]}</strong></p>
          </div>
          <div class="col-4 text-right">
            <button class="noStyling" data-toggle="tooltip" data-placement="left" data-html="true" title="<small>${["Use the buttons below to view the stops and lines for both bus and subway.", "Sèvi ak bouton ki anba yo pou wè arè yo ak liy yo pou toude otobis ak tren.", "Use os botões abaixo para ver as paradas e linhas de ônibus e metrô.", "Use los botones a continuación para ver las paradas y líneas tanto del autobús como del metro.", "Sử dụng các nút bên dưới để xem các điểm dừng và đường cho cả xe buýt và tàu điện ngầm."][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
          </div>
        </div>

        <div class="row mx-auto">
          <div class="col">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="busCheckbox"><i class="fas fa-bus blueColor"></i>${["Key Bus Route", "Kle otobis la kle", "Rota de ônibus principal", "Ruta clave del autobús", "Tuyến xe buýt chính"][selectedLanguageIndex]}
              </label>
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" checked autocomplete="off" id="subwayCheckbox"><i class="fas fa-subway blueColor"></i>${[" Subway", " Tren", " Metrô", " Subterraneo", " Xe điện ngầm"][selectedLanguageIndex]}
              </label>
            </div>
          </div>

          <!--
          <div class="col">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="stopsCheckbox"><i class="far fa-flag blueColor"></i>${[" Stops", " Estasyon yo", " Estações", " Estaciones", " Trạm"][selectedLanguageIndex]}
              </label>
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="linesCheckbox"><i class="fas fa-route blueColor"></i>${[" Lines", " Liy", " Linhas", " Líneas", " Dòng"][selectedLanguageIndex]}
              </label>
            </div>
          </div>
          -->

        </div>

        <hr>

        <div class="row mx-auto">
          <div class="col-8">
            <p><strong>${["Biking", "Monte bisiklèt", "Ciclismo", "Ciclismo", "Đi xe đạp"][selectedLanguageIndex]}</strong></p>
          </div>
          <div class="col-4 text-right">
            <button class="noStyling" data-toggle="tooltip" data-placement="left" data-html="true" title="<small>${["Use the buttons below to view bicycle routes and stations.", "Sèvi ak bouton ki anba yo pou wè wout ak estasyon bisiklèt yo.", "Use os botões abaixo para ver rotas e estações de bicicleta.", "Use los botones a continuación para ver las rutas y estaciones de bicicleta.", "Sử dụng các nút bên dưới để xem các tuyến đường và trạm xe đạp."][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
          </div>
        </div>

        <div class="row mx-auto">
          <div class="col">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="bikeCheckbox"><i class="fas fa-bicycle blueColor"></i>${[" Bike Routes", " Wout bisiklèt", " Rotas de bicicleta", "Rutas en bicicleta", "Tuyến đường xe đạp"][selectedLanguageIndex]}
              </label>
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="bluebikeStationsCheckbox"><img src="img/Blue-Bikes-SM-logo_p_WEB_v2.svg" alt="Bluebikes" class="img-thumbnail" style="max-height: 23px;">
              </label>
            </div>
          </div>
        </div>

        <hr>

        <div class="row mx-auto">
          <div class="col-8">
            <p><strong>${["Car", "Machin", "Carro", "Coche", "Xe hơi"][selectedLanguageIndex]}</strong></p>
          </div>
          <div class="col-4 text-right">
            <button class="noStyling" data-toggle="tooltip" data-placement="left" data-html="true" title="<small>${["Use the buttons below to view carshare locations and EV charging stations.", "Sèvi ak bouton ki anba yo pou wè ki kote machin ak estasyon rechaj EV.", "Use os botões abaixo para visualizar os locais de compartilhamento de carros e as estações de carregamento de EV.", "Use los botones a continuación para ver ubicaciones de autos compartidos y estaciones de carga EV.", "Sử dụng các nút bên dưới để xem vị trí xe hơi và trạm sạc EV."][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
          </div>
        </div>

        <div class="row mx-auto">
          <div class="col">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-outline-dark btn-sm">
                <!--<input type="checkbox" autocomplete="off" id="zipcarCheckbox"><img src="img/zipcar-logo-png-transparent.png" alt="Zipcar locations" class="img-thumbnail" style="max-height: 25px;">-->
                <input type="checkbox" autocomplete="off" id="zipcarCheckbox"><i class="fas fa-car blueColor"></i>${["Carshare", "Pataje machin", "Car share", "Compartir coche", "Chia sẻ xe"][selectedLanguageIndex]}
              </label>
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="evChargingCheckbox"><img src="img/ev.png" alt="EV Charging Stations" class="img-thumbnail" style="max-height: 25px;">${[" EV Charging Stations", "Estasyon chaje EV", "Estações de carregamento EV", "Estaciones de carga EV", "Trạm sạc EV"][selectedLanguageIndex]}
              </label>
            </div>
          </div>
        </div>

        <hr>

        <div class="row mx-auto">
          <div class="col-8">
            <p><strong>${["Community Locations", "Lokal Kominote yo", "Locais da comunidade", "Ubicaciones de la comunidad", "Địa điểm cộng đồng"][selectedLanguageIndex]}</strong></p>
          </div>
          <div class="col-4 text-right">
            <button class="noStyling" data-toggle="tooltip" data-placement="left" data-html="true" title="<small>${["Use the buttons below to view community locations like schools and libraries.", "Sèvi ak bouton ki anba yo pou wè kote kominote a ye tankou lekòl ak bibliyotèk yo.", "Use os botões abaixo para visualizar locais da comunidade, como escolas e bibliotecas.", "Use los botones a continuación para ver ubicaciones de la comunidad como escuelas y bibliotecas.", "Sử dụng các nút bên dưới để xem các địa điểm cộng đồng như trường học và thư viện."][selectedLanguageIndex]}</small>"><i class="fas fa-info-circle blueColor"></i></button>
          </div>
        </div>

        <div class="row mx-auto">
          <div class="col">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="schoolCheckbox"><i class="fas fa-school blueColor"></i>${[" K-12 Schools", " Lekòl K-12 yo", " K-12 Escolas", " Escuelas K-12", " Trường K-12"][selectedLanguageIndex]}
              </label>
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="libraryCheckbox"><i class="fas fa-book-reader blueColor"></i>${[" Libraries", " Bibliyotèk yo", " Bibliotecas", " Bibliotecas", " Thư viện"][selectedLanguageIndex]}
              </label>
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="communityCheckbox"><img src="img/community.jpg" alt="Community Centers" class="img-thumbnail" style="max-height: 25px;">${[" Community Centers", " Sant Kominotè yo", " Centros Comunitários", " Centros comunitarios", " Trung tâm cộng đồng"][selectedLanguageIndex]}
              </label>
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="parksCheckbox"><img src="img/park-black.png" alt="Parks" class="img-thumbnail" style="max-height: 25px;">${[" Parks", " Pak yo", " Parques", " Parques", " Công viên"][selectedLanguageIndex]}
              </label>
            </div>
          </div>
          
          <div class="w-100"></div>

          <div class="col">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="ejCheckbox"><i class="fas fa-grip-horizontal blueColor"></i>${[" Environmental Justice Community", " Kominote Jistis Anviwònman an", " Comunidade Justiça Ambientale", " Comunidad de justicia ambiental", " Cộng đồng tư pháp môi trường"][selectedLanguageIndex]}
              </label>
            </div>
          </div>

          <!--<div class="col">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
              <label class="btn btn-outline-dark btn-sm">
                <input type="checkbox" autocomplete="off" id="blcCheckbox"><i class="fas fa-building blueColor"></i>${["BLC Landmark", "BLC bòn tè", "Marco da BLC", "Hito de BLC", "Cột mốc BLC"][selectedLanguageIndex]}
              </label>
            </div>
          </div>-->

        </div>

      </div>
    </div> <!-- end mobileAddRow -->
  `

  return currentIntroText;
}

var introDiv = L.control({position: 'topright'});

introDiv.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'introDiv');
  this.initializeInfo();
  return this._div;
};

var introText = createIntroDivText();

introDiv.initializeInfo = function () {
  this._div.innerHTML = `
    <nav class="navbar fixed-top navbar-light bg-light d-md-none">
      <a href="https://www.boston.gov/" target="_blank" class="mx-auto navbar-brand"><img src="img/logo.svg" height="30px" class="d-inline-block align-top" alt=""></a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#mobileNavBarToggle" aria-controls="mobileNavBarToggle" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mobileNavBarToggle">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="#" id="mobileAbout">About this map</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" id="mobileTransportation">View Transportation</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" id="mobileEquity">View Equity</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" id="mobileAdd">Add layers</a>
          </li>
        </ul>
      </div>
    </nav>

    <div class="container p-2 introDivContainer addScroll d-none d-md-block">
      <div class="row d-none d-md-block">
        <div class="col p-3">
          <button type="button" id="introCloseButton" class="close" aria-label="Close" style="color: #000;"><span aria-hidden="true"><i class="far fa-minus-square"></i></span></button>
        </div>
      </div>

      <span id="introDivSpanId">
        ${introText}
      </span>
    </div>
  `;
}

introDiv.addTo(map);

var mobileButtons = ["mobileAbout", "mobileTransportation", "mobileEquity", "mobileAdd"];
for (var i = 0; i < mobileButtons.length; i++) {
  $(`#${mobileButtons[i]}`).click(function() {
    $('#mobileNavBarToggle').removeClass('show');
    $('.introDivContainer').removeClass('d-none');
    $(`#${$(this)[0].id}Row`).removeClass('d-none');

    var otherButtons = mobileButtons.slice(0);
    otherButtons.splice(mobileButtons.indexOf($(this)[0].id), 1)

    for (var j = 0; j < otherButtons.length; j++) {
      $(`#${otherButtons[j]}Row`).addClass('d-none');
    }
  });
}

$('#defaultSettings').click(function() {
  var sliderKeys = Object.keys(initialValueDict);
  for (var s = 0; s < sliderKeys.length; s++) {
    $(`#${sliderKeys[s]}`).slider('value', initialValueDict[sliderKeys[s]]);
    $(`#${sliderKeys[s]}-number`).val(initialValueDict[sliderKeys[s]]);
  }
  $('#transportationRadio').prop('checked', 'true');
  $('#equityRadio').prop('checked', 'true');

  $('#transportation-range').slider('values', 0, 0);
  $('#transportation-range').slider('values', 1, 7);
  $('#mobility-range').slider('values', 0, 0);
  $('#mobility-range').slider('values', 1, 7);

  createFeatures(0);
})

$('.hideThisElement').click(function() {
  $('.introDivContainer').toggleClass('d-none');
  $(this).parent().parent().toggleClass('d-none');
});

// Disable dragging when user's cursor enters the element
introDiv.getContainer().addEventListener('mouseover', function () {
  map.dragging.disable();
});

// Re-enable dragging when user's cursor leaves the element
introDiv.getContainer().addEventListener('mouseout', function () {
  map.dragging.enable();
});

//////////////////////////////////////////////// OVERLAY PANE

function createOverlayPaneFormText() {
  var overlayPaneText = `        
                          <div class="row justify-content-md-center pt-5">
                            <div class="col col-lg-6">
                              <p><strong>${["Welcome to the City of Boston's Neighborhood Mobility microHUBs webmap!", "Byenveni nan kat sitwèb Mobility Neighborhood City nan Boston katye a!", "Bem-vindo ao webmap de microHUBs da Mobilidade de Bairro da Cidade de Boston!", "¡Bienvenido al mapa web de microHUB de Movilidad de Vecindarios de la Ciudad de Boston!", "Chào mừng bạn đến với sơ đồ web di động microHUBs của Thành phố Boston!"][selectedLanguageIndex]}</strong></p>
                              <p>${["This map is your opportunity to examine the existing conditions and suggest where you think these microHUBs should be located.", "Kat jeyografik sa a se opòtinite ou a egzaminen kondisyon yo ki deja egziste ak sijere ki kote ou panse sa yo microHUBs ta dwe chita.", "Este mapa é sua oportunidade de examinar as condições existentes e sugerir onde você acha que esses microHUBs devem estar localizados.", "Este mapa es su oportunidad para examinar las condiciones existentes y sugerir dónde cree que deberían ubicarse estos microHUB.", "Bản đồ này là cơ hội của bạn để kiểm tra các điều kiện hiện có và đề xuất nơi bạn nghĩ những microHUB này nên được đặt."][selectedLanguageIndex]}</p>
                              
                              <p><strong>${["What are microHUBs?", "Ki sa ki microHUBs?", "O que são microHUBs?", "¿Qué son los microHUB?", "MicroHUB là gì?"][selectedLanguageIndex]}</strong></p>
                              <p>${["Centered around T-stations, bus network nodes, and local destinations such as community centers and small business districts, Mobility microHUBs are designed to provide and identify a range of connected travel choices.", "Santralize alantou estasyon T yo, nœuds rezo otobis yo, ak destinasyon lokal tankou sant kominotè yo ak ti distri biznis yo, Mobilite microHUB yo fèt pou bay ak idantifye yon seri de chwa ki konekte nan vwayaj.", "Centrados em estações T, nós da rede de ônibus e destinos locais, como centros comunitários e pequenos distritos comerciais, os microHUBs da Mobility foram projetados para fornecer e identificar uma variedade de opções de viagens conectadas.", "Centrados en estaciones T, nodos de red de autobuses y destinos locales como centros comunitarios y distritos de pequeñas empresas, los microHUB de movilidad están diseñados para proporcionar e identificar una variedad de opciones de viaje conectadas.", "Tập trung quanh các trạm T, các nút mạng xe buýt và các điểm đến địa phương như trung tâm cộng đồng và khu kinh doanh nhỏ, microHUB di động được thiết kế để cung cấp và xác định một loạt các lựa chọn du lịch được kết nối."][selectedLanguageIndex]}</p>
                            </div>
                          </div>

                          <div class="row justify-content-md-center">
                            <div class="col col-lg-6">
                              <hr>
                            </div>
                          </div>

                          <div class="row justify-content-md-center">
                            <div class="col col-lg-3">
                              <p>
                                <strong>${["Explore the current conditions", "Eksplore kondisyon aktyèl yo", "Explore as condições atuais", "Explore las condiciones actuales", "Khám phá các điều kiện hiện tại"][selectedLanguageIndex]}</strong>
                                <br>
                                ${["By using the sliders on right-side of the map, you can explore which areas best meet your criteria.", "Lè ou itilize koulis yo sou bò dwat kat jeyografik la, ou ka eksplore ki zòn ki pi byen satisfè kritè ou yo.", "Usando os controles deslizantes no lado direito do mapa, você pode explorar quais áreas melhor atendem aos seus critérios.", "Al usar los controles deslizantes en el lado derecho del mapa, puede explorar qué áreas satisfacen mejor sus criterios.", "Bằng cách sử dụng các thanh trượt ở bên phải bản đồ, bạn có thể khám phá khu vực nào đáp ứng tốt nhất các tiêu chí của bạn."][selectedLanguageIndex]}
                              </p>
                              
                              <!-- <img src="gif/sliders.gif" class="img-fluid"> -->
                              <img src="gif/sliders.png" class="img-fluid">
                            </div>

                            <div class="col col-lg-3">
                              <p>
                                <strong>${["Submit your feedback", "Soumèt remak ou", "Envie seu feedback", "Envía tus comentarios", "Gửi phản hồi của bạn"][selectedLanguageIndex]}</strong>
                                <br>
                                ${["Click on the map to submit your comments about the location.", "Klike sou kat la pou soumèt kòmantè ou sou kote a.", "Clique no mapa para enviar seus comentários sobre a localização.", "Haga clic en el mapa para enviar sus comentarios sobre la ubicación.", "Nhấp vào bản đồ để gửi nhận xét của bạn về vị trí."][selectedLanguageIndex]}
                              </p>
                              
                              <!-- <img src="gif/survey.gif" class="img-fluid"> -->
                              <img src="gif/survey.png" class="img-fluid">
                            </div>
                          </div>`;

  return overlayPaneText;
}

var currentOverlayPaneFormText = createOverlayPaneFormText();
var overlayPaneText = `<div class="row mx-auto" id="overlayPaneRow">
                        <div class="col mx-auto p-3 d-sm-block" style="background-color: rgba(255, 255, 255, 0.95);" id="fullScreen">
                          <button type="button" id="instructionsCloseButton" class="close" aria-label="Close" style="color: #000;"><span aria-hidden="true">&times;</span></button>
                          <a href="https://www.boston.gov/" target="_blank" class="mx-auto"><img src="img/logo.svg" class="img-fluid overlayLogo citySeal"></a>

                          <br><br>

                          <span id="overlayPaneFormText">${currentOverlayPaneFormText}</span>

                          <br><br>

                          <div class="row justify-content-md-center">
                            <div class="col col-lg-6" align="center">
                              <div class="btn-group btn-group-toggle mx-auto" data-toggle="buttons">
                                <label class="btn btn-light active">
                                  <input type="radio" name="language" id="english" value="english" checked> English
                                </label>
                                <label class="btn btn-light">
                                  <input type="radio" name="language" id="creole" value="creole"> Kreyòl Ayisyen
                                </label>
                                <label class="btn btn-light">
                                  <input type="radio" name="language" id="portuguese" value="portuguese"> Portugues
                                </label>
                                <label class="btn btn-light">
                                  <input type="radio" name="language" id="spanish" value="spanish"> Español
                                </label>
                                <label class="btn btn-light">
                                  <input type="radio" name="language" id="vietnamese" value="vietnamese"> Tiếng Việt
                                </label>
                              </div>  
                            </div>
                          </div>

                          <div class="row justify-content-md-center pt-1">
                            <div class="col col-lg-6" align="center">
                              <button type="button" id="participateButton" class="btn btn-primary">View map!</button>
                            </div>
                          </div>

                        </div>
                      </div>`;

$('#overlayPane').html(overlayPaneText);
$('#participateButton').click(function(){
  $('#overlayPane').remove();
});

$('#instructionsCloseButton').click(function(){
  $('#overlayPane').remove();
});

//////////////////////////////////////////////// SLIDERS

function createSliders() {
  $('#transportationRadio').on('change', function() {
    // createHeatLayer();
    createFeatures(0);
  });

  $('#equityRadio').on('change', function() {
    // createHeatLayer();
    createFeatures(0);
  });

  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  });

  $( "#transportation-range" ).slider({
    range: true,
    min: 0,
    max: 7,
    step: 1,
    values: [ 0, 7 ],
    slide: function( event, ui ) {
      // $( "#transportationAccessAmount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
    },
    stop: function(event, ui) {
      createFeatures(0);
      // createHeatLayer();
      // updateHeatLayer();
    }
  });
  // $( "#transportationAccessAmount" ).val( $( "#transportation-range" ).slider( "values", 0 ) +
  //   " - " + $( "#transportation-range" ).slider( "values", 1 ) );

  $( "#mobility-range" ).slider({
    range: true,
    min: 0,
    max: 7,
    step:1,
    values: [ 0, 7 ],
    slide: function( event, ui ) {
      // $( "#mobilityEquityAmount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
    },
    stop: function(event, ui) {
      createFeatures(0);
      // createHeatLayer();
      // updateHeatLayer();
    }
  });
  // $( "#mobilityEquityAmount" ).val( $( "#mobility-range" ).slider( "values", 0 ) +
  //   " - " + $( "#mobility-range" ).slider( "values", 1 ) );

  var accessRanges = [
                      "bus-range", 
                      "subway-range", 
                      "bluebike-range", 
                      "zipcar-range", 
                      // "walk-range",
                      "job-range", 
                      "ferry-range", 
                      "youth-range", 
                      "elderly-range", 
                      "race-range", 
                      "education-range", 
                      "english-range", 
                      "income-range", 
                      "car-range", 
                      "community-range", 
                      "disabled-range"];

  function createSlider(inSliderId) {
    $( `#${inSliderId}` ).slider({
      value: initialValueDict[inSliderId],
      min: 0,
      max: 10,
      step: 1,
      slide: function( event, ui ) {
        $( `#${inSliderId}-number` ).val( ui.value );
      },
      stop: function(event, ui) {
        createFeatures(0);
        // createHeatLayer();
      }
    });
    $( `#${inSliderId}-number` ).val( $( `#${inSliderId}` ).slider( "value"));
  }

  for (var i = 0; i < accessRanges.length; i++) {
    createSlider(accessRanges[i]);
  };


  $('#introCloseButton').click(function(){
    $("#introDivSpanId").toggle();
    // sidebarControl.open('info');
  });

  var checkboxIds = ["busCheckbox", "bluebikeStationsCheckbox", "zipcarCheckbox", "subwayCheckbox", "evChargingCheckbox", "libraryCheckbox", "schoolCheckbox", "bikeCheckbox", "communityCheckbox", "parksCheckbox", "ejCheckbox", "blcCheckbox"];

  for (var i = 0; i < checkboxIds.length; i++) {
    $(`#${checkboxIds[i]}`).change((function(j) {
      return function () {
        var inputNum = j + 1;
        if ($(`#${checkboxIds[j]}`).is(':checked')) {
          createFeatures(inputNum);
        } else {
          if (overlaysIDs[inputNum] != -1) {
            overlays.removeLayer(overlaysIDs[inputNum]);
            overlaysIDs[inputNum] = -1;
          }

          if (overlaysIDs[inputNum + 20] != -1) {
            overlays.removeLayer(overlaysIDs[inputNum + 20]);
            overlaysIDs[inputNum + 20] = -1;
          }
        }
      }

    })(i));
  }
}

createSliders();

// jenks implementation from https://observablehq.com/@jdev42092/jenks-breaks-using-simple-statistics
function ssJenks(data, n_classes) {

  // sort data in numerical order
  data = data.slice().sort(function (a, b) { return a - b; });

  // get our basic matrices
  var matrices = ssJenksMatrices(data, n_classes),
      // we only need lower class limits here
      lower_class_limits = matrices.lower_class_limits,
      k = data.length - 1,
      kclass = [],
      countNum = n_classes;

  // the calculation of classes will never include the upper and
  // lower bounds, so we need to explicitly set them
  kclass[n_classes] = data[data.length - 1];
  kclass[0] = data[0];

  // the lower_class_limits matrix is used as indexes into itself
  // here: the `k` variable is reused in each iteration.
  while (countNum > 1) {
      kclass[countNum - 1] = data[lower_class_limits[k][countNum] - 2];
      k = lower_class_limits[k][countNum] - 1;
      countNum--;
  }

  return kclass;
};

function ssJenksMatrices(data, n_classes) {

  // in the original implementation, these matrices are referred to
  // as `LC` and `OP`
  //
  // * lower_class_limits (LC): optimal lower class limits
  // * variance_combinations (OP): optimal variance combinations for all classes
  var lower_class_limits = [],
      variance_combinations = [],
      // loop counters
      i, j,
      // the variance, as computed at each step in the calculation
      variance = 0;

  // Initialize and fill each matrix with zeroes
  for (i = 0; i < data.length + 1; i++) {
      var tmp1 = [], tmp2 = [];
      for (j = 0; j < n_classes + 1; j++) {
          tmp1.push(0);
          tmp2.push(0);
      }
      lower_class_limits.push(tmp1);
      variance_combinations.push(tmp2);
  }

  for (i = 1; i < n_classes + 1; i++) {
      lower_class_limits[1][i] = 1;
      variance_combinations[1][i] = 0;
      // in the original implementation, 9999999 is used but
      // since Javascript has `Infinity`, we use that.
      for (j = 2; j < data.length + 1; j++) {
          variance_combinations[j][i] = Infinity;
      }
  }

  for (var l = 2; l < data.length + 1; l++) {

      // `SZ` originally. this is the sum of the values seen thus
      // far when calculating variance.
      var sum = 0, 
          // `ZSQ` originally. the sum of squares of values seen
          // thus far
          sum_squares = 0,
          // `WT` originally. This is the number of 
          w = 0,
          // `IV` originally
          i4 = 0;

      // in several instances, you could say `Math.pow(x, 2)`
      // instead of `x * x`, but this is slower in some browsers
      // introduces an unnecessary concept.
      for (var m = 1; m < l + 1; m++) {

          // `III` originally
          var lower_class_limit = l - m + 1,
              val = data[lower_class_limit - 1];

          // here we're estimating variance for each potential classing
          // of the data, for each potential number of classes. `w`
          // is the number of data points considered so far.
          w++;

          // increase the current sum and sum-of-squares
          sum += val;
          sum_squares += val * val;

          // the variance at this point in the sequence is the difference
          // between the sum of squares and the total x 2, over the number
          // of samples.
          variance = sum_squares - (sum * sum) / w;

          i4 = lower_class_limit - 1;

          if (i4 !== 0) {
              for (j = 2; j < n_classes + 1; j++) {
                  if (variance_combinations[l][j] >=
                      (variance + variance_combinations[i4][j - 1])) {
                      lower_class_limits[l][j] = lower_class_limit;
                      variance_combinations[l][j] = variance +
                          variance_combinations[i4][j - 1];
                  }
              }
          }
      }

      lower_class_limits[l][1] = 1;
      variance_combinations[l][1] = variance;
  }

  return {
      lower_class_limits: lower_class_limits,
      variance_combinations: variance_combinations
  };
};