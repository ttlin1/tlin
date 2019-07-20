var stamen = L.tileLayer("https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png", {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
});

var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});

var Esri_WorldGrayReference = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});



var stamen_labels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Labels by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 14,
	ext: 'png'
});

var CartoDB_PositronOnlyLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 14
});

var baseMaps = {
  "Stamen Base": stamen,
  "Esri Light Gray": Esri_WorldGrayCanvas
};

var map = L.map('participationMapDiv', {
  center: [41.8240, -71.4128],
  zoom: 13,
  layers: [Esri_WorldGrayCanvas, Esri_WorldGrayReference],
  doubleClickZoom: false,
  boxZoom: false,
  zoomControl: false,
  minZoom: 12
});

// var control = L.control.layers(baseMaps, null, {collapsed: true, position: 'topright'});
// control.addTo(map);

var overlays = L.layerGroup();
var overlaysIDs = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]; //0: existing, 1: great street, 2: urban trail, 3: comments, 4: comments points, 5: drawing, 6: city limits, 7: neighbohood greenway, 8: network crossings, 9: dangerous intersections, 10: very dangerous intersections, 11: neighborhood comment

var intersections = L.geoJSON();
var intersectionsArray = [];

var improvementsHeaders = ["ID", "Location / Ubicación", "Project Type / Tipo de proyecto", "Why is this important? / ¿Porque es esto importante?", "Recommendation / Recomendación", "Photo", "Geom"];

var existing = L.geoJSON();
var existingArray = [];

var greatStreets = L.geoJSON();
var greatStreetsArray = [];

var urbanTrail = L.geoJSON();
var urbanTrailArray = [];

var neighborhoodGreenway = L.geoJSON();
var neighborhoodGreenwayArray = [];

var surveyQuestions = {};

var comments = L.geoJSON();
var commentsArray = [];

var commentsPoints = L.geoJSON();
var commentsPointsArray = [];

var networkCrossings = L.geoJSON();
var networkCrossingsArray = [];

var veryDangerousIntersections = L.geoJSON();
var veryDangerousIntersectionsArray = [];

var neighborhoodComment = L.geoJSON();
var neighborhoodCommentArray = [];

var drawnPoints = [];
var drawingNumbers = [];

var alreadySubmittedSurvey = [];

var welcomeZip;
var welcomeTravelAround;
var welcomeEmail;

var valuesToAppend = {};

var workshopComments = {};

var selectedLanguageIndex = 0;

map.attributionControl.setPrefix('<a href="https://tooledesign.com/">Toole Design<a> | <a href="https://leafletjs.com/">Leaflet</a>');

//////////////////////////////////////////////// IP
var ip_address;
var postal_code;

$(function() {
  $.getJSON("https://api.ipify.org?format=jsonp&callback=?",
    function(json) {
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
    success: function(data) {
      c.mp = data.mp;
      c.s = data.s;
      c.m = data.m;
    }
});

//////////////////////////////////////////////// OVERLAPPING MARKERS

// var oms = new OverlappingMarkerSpiderfier(map);
//
// oms.addListener('click', function(marker) {
//   popup.setContent(marker.desc);
//   popup.setLatLng(marker.getLatLng());
//   map.openPopup(popup);
// });
//
// oms.addListener('spiderfy', function(markers) {
//   map.closePopup();
// });

//////////////////////////////////////////////// TOOLTIP

L.Layer.include({

     showDelay: 1200,
     hideDelay: 100,

     bindTooltipDelayed: function (content, options) {

         if (content instanceof L.Tooltip) {
             L.setOptions(content, options);
             this._tooltip = content;
             content._source = this;
         } else {
             if (!this._tooltip || options) {
                 this._tooltip = new L.Tooltip(options, this);
             }
             this._tooltip.setContent(content);

         }

         this._initTooltipInteractionsDelayed();

         if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
             this.openTooltipWithDelay();
         }

         return this;
     },

     _openTooltipDelayed: function (e) {
         var layer = e.layer || e.target;

         if (!this._tooltip || !this._map) {
             return;
         }
         this.openTooltipWithDelay(layer, this._tooltip.options.sticky ? e.latlng : undefined);
     },

     openTooltipDelayed: function (layer, latlng) {
         if (!(layer instanceof L.Layer)) {
             latlng = layer;
             layer = this;
         }
         if (layer instanceof L.FeatureGroup) {
             for (var id in this._layers) {
                 layer = this._layers[id];
                 break;
             }
         }
         if (!latlng) {
             latlng = layer.getCenter ? layer.getCenter() : layer.getLatLng();
         }
         if (this._tooltip && this._map) {
             this._tooltip._source = layer;
             this._tooltip.update();
             this._map.openTooltip(this._tooltip, latlng);
             if (this._tooltip.options.interactive && this._tooltip._container) {
                 addClass(this._tooltip._container, 'leaflet-clickable');
                 this.addInteractiveTarget(this._tooltip._container);
             }
         }

         // layer.fireEvent('mousemove', lastMouseEvent);

         return this;
     },
     openTooltipWithDelay: function (t, i) {
         this._delay(this.openTooltipDelayed, this, this.showDelay, t, i);
     },
     closeTooltipDelayed: function () {
         if (this._tooltip) {
             this._tooltip._close();
             if (this._tooltip.options.interactive && this._tooltip._container) {
                 removeClass(this._tooltip._container, 'leaflet-clickable');
                 this.removeInteractiveTarget(this._tooltip._container);
             }
         }
         return this;
     },
     closeTooltipWithDelay: function () {
         clearTimeout(this._timeout);
         this._delay(this.closeTooltipDelayed, this, this.hideDelay);
     },
     _delay: function (func, scope, delay, t, i) {
         var me = this;
         if (this._timeout) {
             clearTimeout(this._timeout)
         }
         this._timeout = setTimeout(function () {
             func.call(scope, t, i);
             delete me._timeout
         }, delay)
     },
     _initTooltipInteractionsDelayed: function (remove$$1) {
         if (!remove$$1 && this._tooltipHandlersAdded) { return; }
         var onOff = remove$$1 ? 'off' : 'on',
            events = {
                remove: this.closeTooltipWithDelay,
                move: this._moveTooltip
            };
         if (!this._tooltip.options.permanent) {
             events.mouseover = this._openTooltipDelayed;
             events.mouseout = this.closeTooltipWithDelay;
             events.click = this.closeTooltipWithDelay;
             if (this._tooltip.options.sticky) {
                 events.mousemove = this._moveTooltip;
             }
             if (L.touch) {
                 events.click = this._openTooltipDelayed;
             }
         } else {
             events.add = this._openTooltipDelayed;
         }
         this[onOff](events);
         this._tooltipHandlersAdded = !remove$$1;
     }
 });

 //////////////////////////////////////////////// LEGEND

 var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'legendDiv');
  this.initializeInfo();
  return this._div;
};

function returnLegend() {
  // <div class="row">
  //   <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" onclick="toggleLayer(10)">
  //     <span style="background-color: #3F90A7; display: block; height: 12px; width: 12px; border-radius: 50%;"></span>
  //     <span class="pl-2">${["Pedestrian/Bicycle Crash Focus Intersection (9+ crashes)", "Intersección de Enfoque de Choque Peatonal / Bicicleta (9+ Choques)"][selectedLanguageIndex]}</span>
  //   </div>
  // </div>

  // <div class="row">
  //   <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" onclick="toggleLayer(9)">
  //     <span style="background-color: #3F90A7; display: block; height: 8px; width: 8px; border-radius: 50%;"></span>
  //     <span class="pl-2">${["Pedestrian/Bicycle Crash Focus Intersection (6+ crashes, 2009-17)", "Intersección de Enfoque de Choque Peatonal / Bicicleta (6+ Choques, 2009-17)"][selectedLanguageIndex]}</span>
  //   </div>
  // </div>

  var legendText = `
  <div class="container p-2 d-none d-sm-block">
  
    <div class="row">
      <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" onclick="toggleLayer(8)">
        <span style="background-color: #555; display: block; height: 7px; width: 7px; border-radius: 50%;"></span>
        <span class="pl-2">${["Proposed Intersection Improvements", "Mejoras de intersección propuestas"][selectedLanguageIndex]}</span>
      </div>
    </div>

    <div class="row">
      <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" onclick="toggleLayer(11)">
        <span style="background-color: #fff; display: block; height: 7px; width: 7px; border-radius: 50%; border: 1px solid #555"></span>
        <span class="pl-2">${["Neighborhood Comments", "Comentarios del Barrio"][selectedLanguageIndex]}</span>
      </div>
    </div>

    <div class="row">
      <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" onclick="toggleLayer(0)">
        <span style="background-color: #8497b0; display: block; height: 7px; width: 16px;"></span>
        <span class="pl-2">${["Existing Network", "Red Existente"][selectedLanguageIndex]}</span>
      </div>
    </div>
    
    <div class="row">
      <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" onclick="toggleLayer(1)">
        <span style="background-color: #555; display: block; height: 5px; width: 16px;"></span>
        <span class="pl-2">${["Proposed Great Streets Improvement Project", "Proyectos de Calles Maravillosas Propuestos"][selectedLanguageIndex]}</span>
      </div>
    </div>
    
    <div class="row">
      <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" onclick="toggleLayer(2)">
        <span style="background-color: #c55a11; display: block; height: 5px; width: 16px;"></span>
        <span class="pl-2">${["Proposed Urban Trail Candidate", "Candidato a Sendero Urbano Propuesto"][selectedLanguageIndex]}</span>
      </div>
    </div>
    
    <div class="row">
      <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" onclick="toggleLayer(7)">
        <span style="background-color: #f4b183; display: block; height: 5px; width: 16px;"></span>
        <span class="pl-2">${["Proposed Urban Trail Candidate: Neighborhood Greenway", "Candidato a Sendero Urbano Propuesto: Vecindario Vía Verde"][selectedLanguageIndex]}</span>
      </div>
    </div>`;

  if ($('#viewComments').prop('checked')) {
    legendText += `
      <div class="row">
        <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" onclick="toggleLayer(4)">
          <span style="background-color: #fff; display: block; height: 12px; width: 12px; border: 1px solid #8497b0; border-radius: 50%;"></span>
          <span class="pl-2">${["Intersection (drawn)", "Intersección (dibujado)"][selectedLanguageIndex]}</span>
        </div>
      </div>
    
      <div class="row">
        <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" onclick="toggleLayer(3)">
          <span style="background-color: #E36F1E; display: block; height: 5px; width: 5px;"></span>
          <span style="background-color: #fff; display: block; height: 5px; width: 6px;"></span>
          <span style="background-color: #E36F1E; display: block; height: 5px; width: 5px;"></span>
          <span class="pl-2">${["Street (drawn)", "Calle (dibujado)"][selectedLanguageIndex]}</span>
        </div>
      </div>
    `;
  }

  legendText += '</div>';

  return legendText;
}


var currentLegendText = returnLegend();

legend.initializeInfo = function () {
  this._div.innerHTML = currentLegendText;
}

legend.addTo(map);

var pvdLogo = L.control({position: 'topright'});

pvdLogo.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'pvdLogoDiv');
  this.initializeInfo();
  return this._div;
};

pvdLogo.initializeInfo = function () {
  this._div.innerHTML = `
    <div class="container p-2 d-none d-sm-block pvdLogoDivContainer">
      <button type="button" id="pvdCloseButton" class="close" aria-label="Close" style="color: #000;"><span aria-hidden="true"><i class="far fa-minus-square"></i></span></button>

      <span id="pvdLogoSpanId">
        <div class="row mx-auto" style="width: 400px;">
          <div class="col mx-auto text-center">
            <a href="http://www.providenceri.gov/planning/great-streets/" target="_blank" class="mx-auto"><img src="img/pvd-great-streets.png" class="bikeShareLogo"></a>
          </div>
        </div>

        <br>
        <br>

        <div class="row mx-auto" id="welcomeText" style="width: 400px;">
          <div class="col mx-auto">
            <span id="infoText" style="font-size: 14px;">
              The Providence Great Streets Initiative is based on one guiding principle: that every street in Providence should be safe, clean, healthy, inclusive, and vibrant. Put simply, every street in Providence should be great. In Spring 2019, the City of Providence hosted 12 neighborhood meetings to gather input on Great Streets improvements. We collected over 275 comments from over 180 attendees about topics ranging from traffic calming to street lighting to bike lanes.<br><br>Since then, we’ve translated those ideas into a draft map for public comment. This draft map presents draft recommendations for:<br><br>
              <ol>
                <li><strong>Proposed Great Streets Improvement Projects</strong>: Corridor and intersection projects to proactively address traffic calming, safety for walking and bicycling, and streetscape improvements.</li>
                <li><strong>An Urban Trail Network</strong>: A connected network of on- and off-street paths that are safe and comfortable for people walking, running, riding bicycles, scootering, skateboarding, or using other non-automobile options. The Urban Trail Network will consist of off-road paths, on-road paths that are physically protected from cars, and neighborhood greenways where traffic calming investments combined with wayfinding signage will help connect neighborhoods to the larger Urban Trail Network.</li>
              </ol>

              To learn more, visit the project website at <a href="http://www.providenceri.gov/planning/great-streets" target="_blank">www.providenceri.gov/planning/great-streets</a>.
            </span>
          </div>
        </div>
      </span>
    </div>
  `;
}

pvdLogo.addTo(map);

$('#pvdCloseButton').click(function(){
  $("#pvdLogoSpanId").toggle();
  // sidebarControl.open('info');
});

// L.control.scale().addTo(map);

 //////////////////////////////////////////////// SIDEBAR

 var currentSidebarHtml = createSidebar();
 $('#sidebar').html(currentSidebarHtml);

var sidebarControl = L.control.sidebar('sidebar', {
                                        closeButton: false,
                                        position: 'left',
                                        autoPan: false
                                      });
map.addControl(sidebarControl);

$('#sidebar-close-location').click(function(){
  sidebarControl.close('location');
});

$('#sidebar-close-draw').click(function(){
  tabToggle('Draw');
  currentLegendText = returnLegend();
  $('.legendDiv').html(currentLegendText);
});

function createSidebar() {
  var sidebarHtml = `
    <div class="sidebar-tabs">
      <ul role="tablist">
        <li id="greatStreetsTab" onclick="tabToggle('Great')" data-toggle="tooltip" data-placement="right" title="${["Great Streets", "Calles Maravillosas"][selectedLanguageIndex]}"><a href="#great-streets" role="tab"><i class="fas fa-road"></i></a></li>

        <li id="urbanTrailTab" onclick="tabToggle('Urban')" data-toggle="tooltip" data-placement="right" title="${["Urban Trail", "Camino Urbano"][selectedLanguageIndex]}"><a href="#urban-trail" role="tab"><i class="fas fa-route" id="routeTabId"></i></a></li>

        <li id="drawTab" onclick="tabToggle('Draw')" data-toggle="tooltip" data-placement="right" title="${["Draw Additional Ideas", "Dibujar ideas adicionales"][selectedLanguageIndex]}"><a href="#draw" role="tab"><i class="fas fa-edit"></i></a></li>

        <li id="locationTab"><a href="#location" role="tab"><span style="color: #fff;"><i class="fas fa-map-marker-alt"></i></span></a></li>
      </ul>
    </div>

    <!-- Tab panes -->
    <div class="sidebar-content">
      <div class="sidebar-pane" id="urban-trail">
        <h1 class="sidebar-header">${["Urban Trail Network", "Red de Senderos Urbanos"][selectedLanguageIndex]}<span class="sidebar-close" id="sidebar-close-urban-trail"><i class="fa fa-caret-left"></i></span></h1>
        <br>

        <p>${['<span style="background-color: #c55a11; color: #fff; padding: 2px;">Instructions</span><br><span style="color: #c55a11;">Click on segments of the urban trail to view details about the recommendations and share your opinion or comments.</span><br><br>The urban trail network in Providence will connect every neighborhood with high-quality travelways for people walking, biking, accessing transit, or using other micromobility options, like scooters and e-bikes.<br><br><strong>What are urban trails?</strong><br>Urban trails are on or off-street paths that are safe, comfortable, and easily accessible for people of all ages and abilities. On busy streets, urban trails are fully separated from vehicle traffic.<br><br><strong>What are neighborhood greenways?</strong><br>On smaller neighborhood streets, urban trails use a combination of traffic calming and wayfinding to provide a consistent, high-comfort experience for people using the trail.', '<span style="background-color: #c55a11; color: #fff; padding: 2px;">Instrucciones</span><br><span style="color: #c55a11;">Haga clic en los segmentos del sendero urbano para ver detalles sobre las recomendaciones y Comparte tu opinión o comentarios.</span><br><br>La red de senderos urbanos en Providence conectará todos los vecindarios con caminos de alta calidad para personas que caminan, andan en bicicleta, acceden al tránsito o usan otras opciones de micromovilidad, como scooters y bicicletas eléctricas.<br><br><strong>¿Qué son los senderos urbanos?</strong><br>Los senderos urbanos están dentro o fuera de la calle, son seguros, cómodos y de fácil acceso para personas de todas las edades y habilidades. En calles concurridas, los senderos urbanos están completamente separados del tráfico de vehículos.<br><br><strong>¿Qué son las vías verdes del vecindario?</strong><br>En las calles más pequeñas del vecindario, los senderos urbanos utilizan una combinación de calmantes de tráfico y orientación para proporcionar una experiencia consistente y de alto confort para las personas que usan el sendero.'][selectedLanguageIndex]}</p>
      </div>

      <div class="sidebar-pane" id="great-streets">
        <h1 class="sidebar-header">${["Great Streets Projects", "Proyectos de Calles Maravillosas"][selectedLanguageIndex]}<span class="sidebar-close" id="sidebar-close-great-streets"><i class="fa fa-caret-left"></i></span></h1>
        <br>

        <p>${['<span style="background-color: #555; color: #fff; padding: 2px;">Instructions</span><br><span style="color: #555;">Click on the Great Streets segments to view details about the recommendations and share your comments.</span><br><br>Great Streets Projects include needed intersection improvements as well as improvements to other streets that might fall outside of the proposed Urban Trail Network. The inclusion of these projects is based on community feedback, crash history, and other data. Intersections and streets highlighted as Great Streets Projects may include improvements to make it safer and more comfortable for people to cross the street, slow down traffic where speeding is an issue, or improve aesthetics with street trees, landscaping, lighting, or other streetscape improvements.', '<span style="background-color: #555; color: #fff; padding: 2px;">Instrucciones</span><br><span style="color: #555;">Haga clic en los proyectos de Calles Maravillosas para ver los detalles de las recomendaciones y compartir su comentarios.</span><br><br>Los proyectos de Calles Maravillosas incluyen mejoras necesarias en las intersecciones, así como mejoras en otras calles que podrían quedar fuera de la red de senderos urbanos propuesta. La inclusión de estos proyectos se basa en los comentarios de la comunidad, el historial de fallos y otros datos. Las intersecciones y las calles resaltadas como Proyectos de Great Streets pueden incluir mejoras para que sea más seguro y más cómodo para las personas cruzar la calle, reducir la velocidad del tráfico donde el exceso de velocidad es un problema o mejorar la estética con árboles, jardines, iluminación u otras mejoras en el paisaje urbano.'][selectedLanguageIndex]}</p>
      </div>

      <div class="sidebar-pane" id="great-streets-nodes">
        <h1 class="sidebar-header">${["Great Streets Projects: Nodes", "Proyectos de Calles Maravillosas: Intersecciones"][selectedLanguageIndex]}<span class="sidebar-close" id="sidebar-close-great-streets-nodes"><i class="fa fa-caret-left"></i></span></h1>
        <br>

        <p>${['<span style="background-color: #555; color: #fff; padding: 2px;">Instructions</span><br><span style="color: #555;">Click on the Great Streets nodes to view details about the recommendations and share your comments.</span><br><br>The inclusion of these intersections and other points is based on community feedback, crash history, crossings of proposed urban trails and great streets, and other data. Design changes at these nodes will make it safer and more comfortable to cross the street, slow down traffic where speeding is an issue, improve aesthetics, and help people from one Urban Trail route to another. They could be incorporated into recommended Urban Trail or Great Streets projects, or they could be candidates for independent Great Streets projects.', '<span style="background-color: #555; color: #fff; padding: 2px;">Instrucciones</span><br><span style="color: # 555;">Haga clic en las intersecciones de Calles Maravillosas para ver los detalles de las recomendaciones y compartir su comentarios.</span><br><br>La inclusión de estas intersecciones y otros puntos se basa en los comentarios de la comunidad, el historial de choques, los cruces de los senderos urbanos propuestos y las grandes calles, y otros datos. Los cambios de diseño en estas intersecciones harán que sea más seguro y cómodo cruzar la calle, reducir la velocidad del tráfico donde el exceso de velocidad es un problema, mejorar la estética y ayudar a las personas de una ruta de sendero urbano a otra. Se podrían incorporar en proyectos recomendados de los senderos urbanos o Calles Maravillosas, o podrían ser candidatos para proyectos independientes de Calles Maravillosas.'][selectedLanguageIndex]}</p>
      </div>

      <div class="sidebar-pane" id="draw">
        <h1 class="sidebar-header">${["Draw Additional Ideas", "Dibujar ideas adicionales"][selectedLanguageIndex]}<span class="sidebar-close" id="sidebar-close-draw"><i class="fa fa-caret-left"></i></h1></span>
        <br>

        <div class="container">
          <p>${["Use the toggle button below to view comments from other Providence residents. Click their comments to share your opinion on their ideas.", "Use el botón de alternar a continuación para ver los comentarios de otros residentes de Providence. Haga clic en sus comentarios para compartir su opinión sobre sus ideas."][selectedLanguageIndex]}</p>

          <div class="row">
            <div class="col text-center">
              <div class="custom-control custom-switch mx-auto">
                <input type="checkbox" class="custom-control-input" id="viewComments">
                <label class="custom-control-label" for="viewComments"><h6 style="cursor: pointer;">${["View Submitted Drawing Comments", "Ver Comentarios de Dibujo Enviados"][selectedLanguageIndex]}</h6></label>
              </div>
            </div>
          </div>

          <br>

          <p>${["See something missing or have other ideas? Use the tools below to suggest additional intersections or routes for the Great Streets PVD Initiative.", "¿Ves algo que falta o tienes otras ideas? Use las herramientas a continuación para sugerir intersecciones o rutas adicionales para la Iniciativa PVD de Great Streets."][selectedLanguageIndex]}</p>

          <div class="row">
            <div class="col text-center">
              <button id="pointButton" class="drawButton btn btn-outline-dark"><i class="fas fa-pen mr-1"></i>${["Suggest Intersection", "Sugerir Intersección"][selectedLanguageIndex]}</button>
            </div>
            <div class="col text-center">
              <button id="lineButton" class="drawButton btn btn-outline-dark"><i class="fas fa-pen mr-1"></i>${["Suggest Street", "Sugerir Calle"][selectedLanguageIndex]}</button>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-pane" id="location">
        <h1 class="sidebar-header">${["Proposed Location", "Ubicación propuesta"][selectedLanguageIndex]}<span class="sidebar-close" id="sidebar-close-location"><i class="fa fa-caret-left"></i></span></h1>
        <br>

        <p>${["Click a location on the map to share your opinion", "Haga clic en una ubicación en el mapa para compartir su opinión"][selectedLanguageIndex]}</p>
      </div>
    </div>
  </div>`;

  return sidebarHtml
}

function addControlPlaceholders(map) {
  var corners = map._controlCorners,
      l = 'leaflet-',
      container = map._controlContainer;

  function createCorner(vSide, hSide) {
      var className = l + vSide + ' ' + l + hSide;

      corners[vSide + hSide] = L.DomUtil.create('div', className, container);
  }

  createCorner('paddedTop', 'left');
  createCorner('paddedTop', 'right');
}
addControlPlaceholders(map);

L.control.zoom({
  position:'bottomright'
}).addTo(map);

var clickReminder = L.control({position: 'topleft'});

clickReminder.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'clickDiv');
  this.initializeInfo();
  return this._div;
};

clickReminder.initializeInfo = function () {
  this._div.innerHTML = '<div id="clickReminderDiv"><i class="fas fa-arrow-left"></i>&nbsp;&nbsp;&nbsp;&nbsp;Click on these tabs to learn more about the projects!</div>';
}

clickReminder.addTo(map);

$('#clickReminderDiv').click(function() {
  $('#clickReminderDiv').remove();
});

function shakeReminder() {
  $('#clickReminderDiv').effect('shake', 'slow');
}

var setIntervalOnButton;
setIntervalOnButton = setInterval(shakeReminder, 5000);

//////////////////////////////////////////////// INSTRUCTIONS

var rawText = c.mp.i;
var instructionsText = rawText.split("<hr>")[0];

function createOverlayPaneFormText() {

  var formText = `     <div class="row mx-auto">
                                <div class="col text-center mx-auto">
                                  <h6 class="text-left mx-auto" id="instructionsTextId">${instructionsText}</h6>
                                </div>
                              </div>

                              <div class="row mx-auto">
                                <div class="col-xs mx-auto">
                                  <div class="form-group">
                                    <label for="zipCodeInput" class="col-form-label light-blue-pvd">${["What is your zip code?", "¿Cuál es su código postal?"][selectedLanguageIndex]}</label>
                                    <div class="col">
                                      <input type="text" class="form-control" id="zipCodeInput" placeholder="Zip..." maxlength="5">
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div class="row mx-auto">
                                <div class="col-xs mx-auto pl-2">
                                  <p class="light-blue-pvd">${["How do you travel around Providence?", "¿Cómo viajas por Providence?"][selectedLanguageIndex]}<p>
                                  <div class="form-group">
                                    <div class="form-check form-check-inline">
                                      <input class="form-check-input" type="checkbox" name="travelAround" id="Walk" value="Walk">
                                      <label class="form-check-label" for="Walk">${["Walk", "Caminar"][selectedLanguageIndex]}</label>
                                    </div>

                                    <div class="form-check form-check-inline">
                                      <input class="form-check-input" type="checkbox" name="travelAround" id="Bus/Transit" value="Bus/Transit">
                                      <label class="form-check-label" for="Bus/Transit">${["Bus/Transit", "Bus/Tránsito"][selectedLanguageIndex]}</label>
                                    </div>

                                    <div class="form-check form-check-inline">
                                      <input class="form-check-input" type="checkbox" name="travelAround" id="Bike" value="Bike">
                                      <label class="form-check-label" for="Bike">${["Bike", "Bicicleta"][selectedLanguageIndex]}</label>
                                    </div>

                                    <div class="form-check form-check-inline">
                                      <input class="form-check-input" type="checkbox" name="travelAround" id="Drive" value="Drive">
                                      <label class="form-check-label" for="Drive">${["Drive", "Conducir"][selectedLanguageIndex]}</label>
                                    </div>

                                    <div class="form-check form-check-inline">
                                      <input class="form-check-input" type="checkbox" name="travelAround" id="Scooter" value="Scooter">
                                      <label class="form-check-label" for="Scooter">${["Scooter", "Scooter"][selectedLanguageIndex]}</label>
                                    </div>

                                    <div class="form-check form-check-inline">
                                      <input class="form-check-input" type="checkbox" name="travelAround" id="Uber/Lyft" value="Uber/Lyft">
                                      <label class="form-check-label" for="Uber/Lyft">${["Uber/Lyft", "Uber/Lyft"][selectedLanguageIndex]}</label>
                                    </div>

                                    <div class="form-check form-check-inline">
                                      <input class="form-check-input" type="checkbox" name="travelAround" id="Other" value="Other">
                                      <label class="form-check-label" for="Other">${["Other", "Otro"][selectedLanguageIndex]}</label>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div class="row mx-auto">
                                <div class="col-xs mx-auto">
                                  <div class="form-group">
                                    <label for="emailInput" class="col-form-label light-blue-pvd">${["What is your email (optional)?", "Cual es tu email (opcional)?"][selectedLanguageIndex]}</label>
                                    <div class="col">
                                      <input type="email" class="form-control" id="emailInput" placeholder="Email...">
                                    </div>
                                  </div>
                                </div>
                              </div>`;
  return formText
}

var currentOverlayPaneFormText = createOverlayPaneFormText();
var overlayPaneText = `<div class="row mx-auto" id="overlayPaneRow">
                          <div class="col text-center mx-auto p-3 d-sm-block" style="background-color: rgba(255, 255, 255, 0.95);" id="fullScreen">
                            <button type="button" id="instructionsCloseButton" class="close" aria-label="Close" style="color: #000;"><span aria-hidden="true">&times;</span></button>
                            <img src="img/pvd-great-streets.png" class="img-fluid bikeShareLogo">

                            <br><br>

                            <span id="overlayPaneFormText">${currentOverlayPaneFormText}</span>

                            <div class="row mx-auto">
                              <div class="col-xs mx-auto">
                                <div class="btn-group btn-group-toggle mx-auto" data-toggle="buttons">
                                  <label class="btn btn-light active">
                                    <input type="radio" name="language" id="english" value="english" checked> English
                                  </label>
                                  <label class="btn btn-light">
                                    <input type="radio" name="language" id="spanish" value="spanish"> Español
                                  </label>
                                </div>
                                <button type="button" id="participateButton" class="btn btn-primary">Participate!</button>
                              </div>
                            </div>

                          </div>
                        </div>`

$('#overlayPane').html(overlayPaneText);

//////////////////////////////////////////////// LANGUAGE TOGGLE

$("input[name='language']").change(function() {
  var languageArray = ["english", "spanish"];
  var selectedLanguage = $("input[name='language']:checked").val();
  var participateButtonText = ["Participate!", "¡Participar!"]

  var rawText = c.mp.i;
  selectedLanguageIndex = languageArray.indexOf(selectedLanguage);

  currentOverlayPaneFormText = createOverlayPaneFormText();
  $('#overlayPaneFormText').html(currentOverlayPaneFormText);

  instructionsText = rawText.split("<hr>")[selectedLanguageIndex];
  $('#instructionsTextId').html(instructionsText);

  currentSidebarHtml = createSidebar();
  $('#sidebar').html(currentSidebarHtml);

  $('#clickReminderDiv').html(['<i class="fas fa-arrow-left"></i>&nbsp;&nbsp;&nbsp;&nbsp;Click on these tabs to learn more about the projects!', '<i class="fas fa-arrow-left"></i>&nbsp;&nbsp;&nbsp;&nbsp;¡Haz clic en estas pestañas para obtener más información sobre los proyectos!'][selectedLanguageIndex]);

  map.removeControl(sidebarControl);
  sidebarControl = L.control.sidebar('sidebar', {
    closeButton: false,
    position: 'left',
    autoPan: false
  });
  map.addControl(sidebarControl);

  $('#sidebar-close-location').click(function(){
    sidebarControl.close('location');
  });

  $('#sidebar-close-draw').click(function(){
    tabToggle('Draw');
  });

  currentLegendText = returnLegend();
  $('.legendDiv').html(currentLegendText);

  $('#pointButton').on('click', function(e) {
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
    $('#lineButton').button('toggle');
    var drawLine = new L.Draw.Polyline(map, drawPolylineOptions).enable();
  });

  var rawInfoText = `          <span id="infoText">
  In the Spring of 2019, the Great Streets PVD team hosted 12 neighborhood meetings covering all of Providence. We collected over 275 comments from over 180 attendees about topics ranging from traffic calming to street lighting to bike lanes.<br><br>Since then, we’ve been busy turning those ideas into a plan. Based on comments from the neighborhood meetings – as well as crash, environmental, and other data – this mapping tool presents <span class="font-italic">draft</span> recommendations for:<br><br>
  <ol>
    <li><strong>Proposed Great Streets Improvement Projects</strong>: Corridor and intersection projects to proactively address traffic calming, safety for walking and bicycling, and streetscape improvements.</li>
    <li><strong>An Urban Trail Network</strong>: A series of interconnected on- and off-street paths that are comfortable for all non-motorized users and that connect every neighborhood in Providence.</li>
  </ol>
  To learn more, visit the project website at <a href="http://www.providenceri.gov/planning/great-streets" target="_blank">www.providenceri.gov/planning/great-streets</a>.
</span><hr><span id = "infoText">
La iniciativa de Calles Maravillosas PVD (PVD Great Streets en inglés) se basa en un principio rector: que cada calle de Providence sea segura, limpia, saludable, inclusiva y vibrante. En pocas palabras, cada calle en Providence debería ser maravillosa. En la primavera de 2019, el equipo de Calles Maravillosas PVD organizó 12 reuniones en vecindarios cuales cubrieron a todo Providence. Se colecto más de 275 comentarios de 180 asistentes sobre temas que van desde la calma del tráfico, hasta el alumbrado público y los carriles para bicicletas. Desde entonces, hemos convertido esas ideas en un borrador de mapa para comentario público. Este borrador de mapa presenta recomendaciones de borrador para:<br><br>
            <ol>
              <li><strong>Proyectos Propuestos de Calles Maravillosas:</strong>: Proyectos de corredor y intersectoriales prioritarios para abordar de manera proactiva la calma del tráfico, la seguridad de los peatones y bicicletas y mejoras en el paisaje urbano.</li>
              <li><strong>Una Red de Caminos Urbanos</strong>: Una red conectada de caminos dentro y fuera de la calle que son seguros y cómodos para la gente que camina, corre, anda en bicicleta, monta scooters, patina o usa otras opciones que no son automóviles. La Red de Caminos Urbanos consistirá de caminos fuera de la calle, caminos en la calle que están físicamente protegidos de los automóviles, y vías verdes vecinales donde la inversión para calmar el tráfico combinada con la señalización de orientación ayudará a conectar los vecindarios con la Red de Caminos Urbanos más grande.</li>
            </ol>
Para obtener más información, visite el sitio web del proyecto en: <a href="http://www.providenceri.gov/planning/great-streets" target="_blank">www.providenceri.gov/planning/great-streets</a>.
          </span>`;

  var infoText = rawInfoText.split("<hr>")[selectedLanguageIndex];
  $('#infoText').html(infoText);

  $('#participateButton').html(participateButtonText[selectedLanguageIndex]);

  createFeatures(0);

  $('#viewComments').on('click', function() {
    activateViewComments();
  });
});

$('#instructionsCloseButton').click(function(){
  $('#overlayPane').remove();
  // sidebarControl.open('info');
});

$('#participateButton').click(function(){
  var selectedCheckboxes = $('input[name=travelAround]:checked');

  var valuesArray = [];
  for (var m = 0; m < selectedCheckboxes.length; m++) {
    valuesArray.push(selectedCheckboxes[m].value);
  }

  var valuesString = valuesArray.join();

  valuesToAppend["Survey - Travel"] = valuesString;
  valuesToAppend["Survey - Zip"] = $('#zipCodeInput').val();
  valuesToAppend["Survey - email"] = $('#emailInput').val();

  $('#overlayPane').remove();
  // sidebarControl.open('info');
});

//////////////////////////////////////////////// UTILITY FUNCTIONS

function panToClickedPoint(e) {
  var currentMapZoom = map.getZoom();
  map.setView(e.latlng, currentMapZoom);
}

//////////////////////////////////////////////// GET DATA

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
    // getLocationsDataJson();
    // getLocationsData();
    getSurveyQuestions();
    getSubmittedComments();
  });
}

function styleCorridors(feature) {
  var corridorColor;
  var corridorWeight;

  if (feature.properties["Project Type / Tipo de proyecto"].split(" | ")[0] == "Urban Trail") {
    if ($.inArray(feature.properties.n_fac_prop, [1, 2, 3]) > -1) {
      corridorColor = '#c55a11';
      corridorWeight = 5;
    } else if (feature.properties.n_fac_prop == 4){
      corridorColor = '#f4b183';
      corridorWeight = 5;
    }

  } else if (feature.properties["Project Type / Tipo de proyecto"].split(" | ")[0] == "Great Street") {
    corridorColor = '#555';
    corridorWeight = 5;
  } else if (feature.properties["Project Type / Tipo de proyecto"].split(" | ")[0] == "Existing") {
    corridorColor = '#8497b0';
    corridorWeight = 7;
  }

  return {
    color: corridorColor,
    weight: corridorWeight,
    opacity: 0.8,
  }
}

function createExistingPopup(feature, layer) {
  var tooltipLanguage = ["Existing network", "Red existente"];
  var locationLanguage = ["Location", "Ubicación"]

  var popupText = "";
  var tooltipText = "";

  var streetName = feature.properties.name != null ? ', ' + feature.properties.name : '';

  popupText = '<p><strong>' + locationLanguage[selectedLanguageIndex] + '</strong>: ' + tooltipLanguage[selectedLanguageIndex] + streetName + '</p>';
  tooltipText = '<p class="text-center p-2 align-middle"><strong>' + locationLanguage[selectedLanguageIndex] + '</strong>: ' + tooltipLanguage[selectedLanguageIndex] + streetName + '</p>';

  var popup = L.popup({closeButton: false}).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({weight: 10, opacity: 0.5});
  });

  layer.on('mouseout', function (e) {
    this.setStyle({weight: 7, opacity: 0.8});
  });

  layer.on('click', function(e) {
    map.closePopup();
    this.openPopup();
  });
}

function crossingsPopup(feature, layer) {
  var tooltipLanguage = ["Proposed Intersection Improvements ", "Mejora de Intersección Propuesta"];
  var locationLanguage = ["Location", "Ubicación"]

  var popupText = "";
  var tooltipText = "";

  popupText = '<p><strong>' + locationLanguage[selectedLanguageIndex] + '</strong>: ' + tooltipLanguage[selectedLanguageIndex] + '</p>';
  tooltipText = '<p class="text-center p-2 align-middle"><strong>' + locationLanguage[selectedLanguageIndex] + '</strong>: ' + tooltipLanguage[selectedLanguageIndex] + '</p>';

  var popup = L.popup({closeButton: false}).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({radius: 8, opacity: 0.5});
  });

  layer.on('mouseout', function (e) {
    this.setStyle({radius: 5, opacity: 0.8});
  });

  layer.on('click', function(e) {
    map.closePopup();
    this.openPopup();
  });
}

function crossingsPopup(feature, layer) {
  var tooltipLanguage;
  
  if (feature.properties.id != null) {
    tooltipLanguage = ["Pedestrian/Bicycle Crash Focus Intersection", "Intersección de enfoque de choque peatonal/bicicleta"];
  } else if (feature.properties.id == null) {
    tooltipLanguage = ["Network Crossing", "Cruce de Red"];
  };
  var locationLanguage = ["Location", "Ubicación"]

  var popupText = "";
  var tooltipText = "";

  popupText = '<p><strong>' + locationLanguage[selectedLanguageIndex] + '</strong>: ' + tooltipLanguage[selectedLanguageIndex] + '</p>';
  tooltipText = '<p class="text-center p-2 align-middle"><strong>' + locationLanguage[selectedLanguageIndex] + '</strong>: ' + tooltipLanguage[selectedLanguageIndex] + '</p>';

  var popup = L.popup({closeButton: false}).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({radius: 8, opacity: 0.5});
  });

  layer.on('mouseout', function (e) {
    this.setStyle({radius: 5, opacity: 0.8});
  });

  layer.on('click', function(e) {
    map.closePopup();
    this.openPopup();
  });
}

function intersectionPopup(feature, layer) {
  var tooltipLanguage = ["Pedestrian/Bicycle Crash Focus Intersection (6+ crashes)", "Intersección de Enfoque de Choque Peatonal / Bicicleta (6+ Choques)"];
  var locationLanguage = ["Location", "Ubicación"]

  var popupText = "";
  var tooltipText = "";

  popupText = `<p class="p-2 align-middle"><strong>${locationLanguage[selectedLanguageIndex]}</strong>: ${tooltipLanguage[selectedLanguageIndex]}<br>
                <strong>${["Bike Crashes", "Choques de Bicicleta"][selectedLanguageIndex]}</strong>: ${feature.properties.bike_cr_25ft}<br>
                <strong>${["Pedestrian Crashes", "Choques de Peatones"][selectedLanguageIndex]}</strong>: ${feature.properties.ped_cr_25ft}<br>
                <strong>${["Severe Bike Crashes", "Choques de Bicicleta Severos"][selectedLanguageIndex]}</strong>: ${feature.properties.sev_bike_cr_25ft}<br>
                <strong>${["Severe Pedestrian Crashes", "Choques Peatones Severos"][selectedLanguageIndex]}</strong>: ${feature.properties.sev_ped_cr_25ft}<br>`;

  tooltipText = '<p class="text-center p-2 align-middle"><strong>' + locationLanguage[selectedLanguageIndex] + '</strong>: ' + tooltipLanguage[selectedLanguageIndex] + '</p>';

  var popup = L.popup({closeButton: false}).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({radius: 8, opacity: 0.5});
  });

  layer.on('mouseout', function (e) {
    this.setStyle({radius: 5, opacity: 0.8});
  });

  layer.on('click', function(e) {
    map.closePopup();
    this.openPopup();
  });
}

function veryDangerousIntersectionPopup(feature, layer) {
  var tooltipLanguage = ["Pedestrian/Bicycle Crash Focus Intersection (9+ crashes)", "Intersección de Enfoque de Choque Peatonal / Bicicleta (9+ Choques)"];
  var locationLanguage = ["Location", "Ubicación"]

  var popupText = "";
  var tooltipText = "";

  popupText = `<p class="p-2 align-middle"><strong>${locationLanguage[selectedLanguageIndex]}</strong>: ${tooltipLanguage[selectedLanguageIndex]}<br>
                <strong>${["Bike Crashes", "Choques de Bicicleta"][selectedLanguageIndex]}</strong>: ${feature.properties.bike_cr_25ft}<br>
                <strong>${["Pedestrian Crashes", "Choques de Peatones"][selectedLanguageIndex]}</strong>: ${feature.properties.ped_cr_25ft}<br>
                <strong>${["Severe Bike Crashes", "Choques de Bicicleta Severos"][selectedLanguageIndex]}</strong>: ${feature.properties.sev_bike_cr_25ft}<br>
                <strong>${["Severe Pedestrian Crashes", "Choques Peatones Severos"][selectedLanguageIndex]}</strong>: ${feature.properties.sev_ped_cr_25ft}<br>`;

  tooltipText = '<p class="text-center p-2 align-middle"><strong>' + locationLanguage[selectedLanguageIndex] + '</strong>: ' + tooltipLanguage[selectedLanguageIndex] + '</p>';

  var popup = L.popup({closeButton: false}).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({radius: 10, opacity: 0.5});
  });

  layer.on('mouseout', function (e) {
    this.setStyle({radius: 8, opacity: 0.8});
  });

  layer.on('click', function(e) {
    map.closePopup();
    this.openPopup();
  });
}

function neighborhoodCommentPopup(feature, layer) {
  var tooltipLanguage = ["Neighborhood Comment", "Comentario del Barrio"];

  var popupText = "";
  var tooltipText = "";

  var currentLocation = feature.properties.location;

  // <strong>${["Comment", "Comentario"][selectedLanguageIndex]}</strong>: ${ feature.properties["specific note"] } <br>
  // <strong>${["Recommendation", "Recomendación"][selectedLanguageIndex]}</strong>: ${feature.properties.recommendation}<br>`;

  popupText = `<p class="p-2 align-middle"><strong>${tooltipLanguage[selectedLanguageIndex]}</strong>: ${currentLocation}<br>
                <strong>${["Category", "Categoría"][selectedLanguageIndex]}</strong>: ${feature.properties.category}<br>`;

  tooltipText = '<p class="text-center p-2 align-middle"><strong>' + tooltipLanguage[selectedLanguageIndex] + '</strong>: ' + currentLocation + '</p>';

  var popup = L.popup({ closeButton: false }).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(tooltipText);

  layer.on('mouseover', function (e) {
    this.setStyle({ radius: 8, opacity: 0.5 });
  });

  layer.on('mouseout', function (e) {
    this.setStyle({ radius: 5, opacity: 0.8 });
  });

  layer.on('click', function (e) {
    map.closePopup();
    this.openPopup();
  });
}

function createFeatures(inputNum) {
  if (overlaysIDs[inputNum] != -1) {
    overlays.removeLayer(overlaysIDs[inputNum]);
    overlaysIDs[inputNum] = -1;
  }

  switch(inputNum){
    case 0:
      existing = L.geoJSON(existingArray, {
        style: styleCorridors,
        onEachFeature: createExistingPopup
      });

      overlays.addLayer(existing).addTo(map);
      overlaysIDs[inputNum] = existing._leaflet_id;
    break;

    case 1:
      greatStreets = L.geoJSON(greatStreetsArray, {
        style: styleCorridors,
        onEachFeature: createSurvey
      });

      overlays.addLayer(greatStreets).addTo(map);
      overlaysIDs[inputNum] = greatStreets._leaflet_id;
    break;

    case 2:
      urbanTrail = L.geoJSON(urbanTrailArray, {
        style: styleCorridors,
        onEachFeature: createSurvey
      });

      overlays.addLayer(urbanTrail).addTo(map);
      overlaysIDs[inputNum] = urbanTrail._leaflet_id;
    break;

    case 7:
      neighborhoodGreenway = L.geoJSON(neighborhoodGreenwayArray, {
        style: styleCorridors,
        onEachFeature: createSurvey
      });

      overlays.addLayer(neighborhoodGreenway).addTo(map);
      overlaysIDs[inputNum] = neighborhoodGreenway._leaflet_id;
    break;

    case 8:
      networkCrossings = L.geoJSON(networkCrossingsArray, {
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 5,
            fillColor: "#555",
            color: "#fff",
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.8
          })
        },
        onEachFeature: crossingsPopup
      });

      overlays.addLayer(networkCrossings).addTo(map);
      overlaysIDs[inputNum] = networkCrossings._leaflet_id;
    break;

    // case 9:
    //   intersections = L.geoJSON(intersectionsArray, {
    //     pointToLayer: function(feature, latlng) {
    //       return L.circleMarker(latlng, {
    //         radius: 5,
    //         fillColor: "#3F90A7",
    //         color: "#fff",
    //         weight: 1,
    //         opacity: 0.8,
    //         fillOpacity: 0.8
    //       })
    //     },
    //     onEachFeature: intersectionPopup
    //   });

    //   overlays.addLayer(intersections).addTo(map);
    //   overlaysIDs[inputNum] = intersections._leaflet_id;
    // break;

    // case 10:
    //   veryDangerousIntersections = L.geoJSON(veryDangerousIntersectionsArray, {
    //     pointToLayer: function(feature, latlng) {
    //       return L.circleMarker(latlng, {
    //         radius: 8,
    //         fillColor: "#3F90A7",
    //         color: "#fff",
    //         weight: 1,
    //         opacity: 0.8,
    //         fillOpacity: 0.8
    //       })
    //     },
    //     onEachFeature: veryDangerousIntersectionPopup
    //   });

    //   overlays.addLayer(veryDangerousIntersections).addTo(map);
    //   overlaysIDs[inputNum] = veryDangerousIntersections._leaflet_id;
    // break;

    case 11:
      neighborhoodComment = L.geoJSON(neighborhoodCommentArray, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 5,
            fillColor: "#fff",
            color: "#555",
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0
          })
        },
        onEachFeature: neighborhoodCommentPopup
      });

      overlays.addLayer(neighborhoodComment).addTo(map);
      overlaysIDs[inputNum] = neighborhoodComment._leaflet_id;
    break;
  }
}

function getLocationsDataJson() {
  var networkFile = 'json/network.json';

  $.ajax({
    url: networkFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        if (feature.properties["Project Type / Tipo de proyecto"].split(" | ")[0] == "Great Street") {
          greatStreetsArray.push(feature);
        } else if (feature.properties["Project Type / Tipo de proyecto"].split(" | ")[0] == "Urban Trail") {
          if ($.inArray(feature.properties.n_fac_prop, [1, 2, 3]) > -1) {
            urbanTrailArray.push(feature);
          } else if (feature.properties.n_fac_prop == 4) {
            neighborhoodGreenwayArray.push(feature);
          }
        }
      }
    }
  });

  var existingFile = 'json/existing.json';

  $.ajax({
    url: existingFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        existingArray.push(feature);
      }
    }
  });

  var networkCrossingsFile = 'json/network_crossings.json';

  $.ajax({
    url: networkCrossingsFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        networkCrossingsArray.push(feature);
      }
    }
  });

  var intersectionsFile = 'json/dangerous_intersections.json';

  $.ajax({
    url: intersectionsFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        networkCrossingsArray.push(feature);
      }
    }
  });

  // var veryDangerousIntersectionsFile = 'json/v_dangerous_intersections.json';

  // $.ajax({
  //   url: veryDangerousIntersectionsFile,
  //   dataType: 'json',
  //   async: false,
  //   success: function(data) {
  //     for (var i = 0; i < data.features.length; i++) {
  //       var feature = data.features[i];
  //       veryDangerousIntersectionsArray.push(feature);
  //     }
  //   }
  // });

  var neighborhoodCommentFile = 'json/neighborhood_comments.json';

  $.ajax({
    url: neighborhoodCommentFile,
    dataType: 'json',
    async: false,
    success: function (data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        neighborhoodCommentArray.push(feature);
      }
    }
  });

  var featuresToAdd = [0];
  for (var i = 0; i < featuresToAdd.length; i++) {
    createFeatures(featuresToAdd[i]);
  }
}

getLocationsDataJson();

function getLocationsData() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: c.s.l,
    range: 'Locations!A1:I',
  }).then(function(response) {
    var values = response.result.values;
    improvementsHeaders = values[0];

    for (var i = 1; i < values.length; i++){
      var feature = {
        "type": "Feature",
        "properties": {},
        "geometry": null
      };

      for (var j = 0; j < improvementsHeaders.length; j++) {
        feature.properties[improvementsHeaders[j]] = values[i][improvementsHeaders.indexOf(improvementsHeaders[j])];
      }

      feature.geometry = JSON.parse(values[i][improvementsHeaders.indexOf("Geom")]);

      if (feature.geometry.type == "Point") {
        intersectionsArray.push(feature);
      } else if (feature.geometry.type == "LineString") {
        if (feature.properties["Project Type / Tipo de proyecto"].split(" | ")[0] == "Great Street Project") {
          greatStreetsArray.push(feature);
        } else if (feature.properties["Project Type / Tipo de proyecto"].split(" | ")[0] == "Urban Trail Candidate") {
          urbanTrailArray.push(feature);
        }
      }
    }

    for (var i = 0; i < 3; i++) {
      createFeatures(i);
    }
  });
}

function getSurveyQuestions() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: c.s.l,
    range: 'Survey!A1:G',
  }).then(function(response) {
    var values = response.result.values;
    var headers = values[0];

    for (var i = 1; i < values.length; i++){
      var currentQuestionNumber = parseInt(values[i][headers.indexOf("Number")]);
      surveyQuestions[currentQuestionNumber] = {}

      for (var j = 1; j < headers.length; j++) {
        surveyQuestions[currentQuestionNumber][headers[j]] = values[i][headers.indexOf(headers[j])];
      }
    }
  });
}

//////////////////////////////////////////////// DRAWING CONTROLS
var drawnItems  = new L.FeatureGroup();
map.addLayer(drawnItems);

var pointOptions = {
  color: "#3F90A7",
  fillColor: '#fff',
  fillOpacity: 0.5,
  weight: 2,
  radius: 8
};

var drawPolylineOptions = {
  shapeOptions: {
    color: "#E36F1E",
    opacity: 0.8,
    weight: 5,
    dashArray: "10 10"
  }
};

var drawPolygonOptions = {
  shapeOptions: {
    color: "#007bff",
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
  var options = ["Needs improvement for people walking / Necesita mejoras para la gente que camina.", 
                 "Needs improvement for people biking / Necesita mejoras para el ciclismo.", 
                 "Needs traffic calming to slow traffic and reduce cut-through traffic / Necesita que el tráfico se calme para reducir el tráfico y reducir el tráfico de paso.", 
                 "Needs streetscape improvements (lighting, trash cans, etc) / Necesita mejoras en el paisaje urbano (iluminación, botes de basura, etc.)"]

  var popupContent = '<div id="concernsCheckboxID">';

  for (var k = 0; k < options.length; k++) {
    popupContent += '<div class="form-check"><input class="form-check-input mt-0" type="checkbox" name="Concerns" value="' + options[k].split(" / ")[0] + '" id="Checkbox' + String(k) + '"><label class="form-check-label" for="Checkbox' + String(k) + '">' + options[k].split(" / ")[selectedLanguageIndex] + '</label></div><br><br>';
  }

  popupContent += '</div>';
  popupContent += `<p id="comment${currentDrawingNumber}">${["Add a comment (optional)", "Añadir un comentario (opcional)"][selectedLanguageIndex]}:</p><div class="form-group"><textarea class="form-control bg-dark text-white" placeholder="${["Enter comment...", "Introducir comentario..."][selectedLanguageIndex]}" 
                   id="drawing${currentDrawingNumber}" rows="3"></textarea></div>
                   <button type="submit" id="drawingSubmitButton${currentDrawingNumber}" class="btn btn-primary">Submit</button><div id="drawingSubmitMessage"></div>`;

  var popup = L.popup({closeOnClick: false})
    .setLatLng(coords)
    .setContent(popupContent);
  drawLayer.bindPopup(popup)
  popup.openOn(map);

  drawLayer.on('popupclose', function() {
    drawnItems.removeLayer(drawLayer._leaflet_id);
  });

  $("button").removeClass("active");

  $('#drawingSubmitButton' + drawingNumbers.length.toString()).on('click', function() {
    var input = $('#drawing' + drawingNumbers.length.toString()).val();
    let currentEpochTime = Date.now();
    let commentDate = new Date(Date.now()).toDateString();

    var selectedCheckboxes = $('input[name=Concerns]:checked');

    var valuesArray = [];
    for (var m = 0; m < selectedCheckboxes.length; m++) {
      valuesArray.push(selectedCheckboxes[m].value);
    }

    var valuesString = valuesArray.join();

    shape.properties["Comment"] = input;
    shape.properties["Date"] = commentDate;
    shape.properties["ID"] = currentEpochTime;

    valuesToAppend["Shape"] = JSON.stringify(shape);

    valuesToAppend["ID"] = currentEpochTime;
    valuesToAppend["IP Address"] = ip_address;
    valuesToAppend["Date"] = commentDate;
    var cd = new Date(Date.now());
    valuesToAppend["Comment"] = input
    valuesToAppend["Concerns"] = valuesString;
    valuesToAppend["User"] = (cd.getMonth() * 512).toString() + (cd.getDay() * 125).toString() + (cd.getFullYear() * 12 * 5).toString();

    $.ajax({
      url: c.m.d,
      method: "GET",
      dataType: "json",
      data: valuesToAppend
    });

    $('#comment' + drawingNumbers.length.toString()).html("Comment submitted " + commentDate);
    let commentSubmitted = $('#drawing' + drawingNumbers.length.toString()).val();
    $('#drawing' + drawingNumbers.length.toString()).attr('disabled', true);
    $('#drawingSubmitButton' + drawingNumbers.length.toString()).remove();
    $('#concernsCheckboxID').remove();
    $('#drawingSubmitMessage').html("Thanks for sharing your input!");

    var popup = L.popup()
      .setLatLng(coords)
      .setContent(`<blockquote class="blockquote text-center"><p class="mb-0">${commentSubmitted}</p>
                   <footer class="blockquote-footer">Comment submitted ${commentDate}</footer>
                   </blockquote>`);
    drawLayer.bindPopup(popup);

    drawLayer.off('popupclose');
  });
}

$('#pointButton').on('click', function(e) {
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
  $('#lineButton').button('toggle');
  var drawLine = new L.Draw.Polyline(map, drawPolylineOptions).enable();
});

map.on('draw:created draw:edited', function (e) {
  if (e.type != "draw:edited") {
    createDrawingSubmit(e, 1);
  }
});

//////////////////////////////////////////////// WORKSHOP COMMENTS

$.ajax({
  type: "GET",
  async: false,
  url: "json/workshop_comments.txt",
  dataType: "text",
  success: function(data) {
    processData(data);
  }
});

function processData(allText) {
  var allTextLines = allText.split(/\r\n|\n/);
  var headers = allTextLines[0].split('|');

  for (var i=1; i<allTextLines.length; i++) {
    var data = allTextLines[i].split('|');
    if (data.length == headers.length) {
      var projectId = data[headers.indexOf("project_id")];

      if (!(projectId in workshopComments)) {
        workshopComments[projectId] = [];
      }
      workshopComments[projectId].push([data[headers.indexOf("location")], data[headers.indexOf("category")]]);
    }
  }
}

//////////////////////////////////////////////// SURVEY
function createSurvey(feature, layer) {
  var tooltipLanguage = ["Click to take survey.", "Haga clic para tomar encuesta."];
  var locationLanguage = ["Location", "Ubicación"]
  var popupTextLanguage = ["Survey not available for existing stations.", "Encuesta no disponible para estaciones existentes."]

  var popupText = "";
  var tooltipText = "";

  popupText = '<p><strong>' + locationLanguage[selectedLanguageIndex] + '</strong>: ' + feature.properties["Location / Ubicación"] + '</p>';
  tooltipText = '<p class="text-center p-2 align-middle"><strong>' + locationLanguage[selectedLanguageIndex] + '</strong>: ' + feature.properties["Location / Ubicación"] + '<br>' + tooltipLanguage[selectedLanguageIndex] + '</p>';

  var popup = L.popup({closeButton: false}).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(tooltipText);

  var clicked = false;

  layer.on('mouseover', function (e) {
    this.setStyle({weight: 10, opacity: 0.5});
  });

  layer.on('mouseout', function (e) {
    if (clicked == false) {
      this.setStyle({weight: 5, opacity: 0.8});
    }
  });

  layer.on('click', function (e) {
    existing.setStyle({weight: 7, opacity: 0.8});
    greatStreets.setStyle({weight: 5, opacity: 0.8});
    urbanTrail.setStyle({weight: 5, opacity: 0.8});
    neighborhoodGreenway.setStyle({ weight: 5, opacity: 0.8 });

    clicked = true;
    this.setStyle({weight: 10, opacity: 0.5});

    map.closePopup();

    var surveyString = '<h1 class="sidebar-header">Proposed Location<span class="sidebar-close" id="surveyClose"><i class="fa fa-caret-left"></i></span></h1><br>';

    var headersToDisplay = improvementsHeaders.slice();
    headersToDisplay.splice(headersToDisplay.indexOf("ID"), 1);
    headersToDisplay.splice(headersToDisplay.indexOf("Geom"), 1);
    headersToDisplay.splice(headersToDisplay.indexOf("Photo"), 1);

    function createRecommendationText() {
      var facilityTypeKey = {1: "Two-Way Shared Use Path | Ruta de uso compartido bidireccional", 2: "Two-Way Urban Trail with Accessible Sidewalk | Sendero urbano de dos vías con acera accesible", 3: "One-Way Urban Trail with Accessible Sidewalk | Sendero urbano de una vía con acera accesible", 4: "Neighborhood Greenway | Barrio Greenway", 5: "Buffered Bike Lanes | Carriles de bicicleta amortiguados", 6: "Conventional Bike Lanes | Carriles de bicicleta convencionales", 7: "Other Great Street Improvement | Otra gran mejora de la calle"};
      var implementationAction = {"A": "Remove parking one side | Retire el aparcamiento de un lado", "B": "Consolidate parking one side | Consolidar aparcando un lado.", "C": "Remove parking two sides | Quitar aparcamiento dos lados", "D": "Narrow travel or parking lane (Lane Diet) | Carril de viaje o de estacionamiento estrecho (dieta Lane)", "E": "Remove travel lane (Road Diet) | Eliminar carril de circulación (Road Diet)", "F": "Move curbs | Mover aceras", "G": "Independent ROW | FILA independiente", "H": "Neighborhood Greenway Toolbox (Speed management, major intersections, wayfinding) | Neighborhood Greenway Toolbox (gestión de la velocidad, intersecciones principales, wayfinding)", "I": "Enhance quality of existing facility | Mejorar la calidad de las instalaciones existentes"};

      var recommendationText = [];
      var currentFac = feature.properties.n_fac_prop;
      var currentImp = feature.properties.n_Act_pro;

      if (currentFac > 0) {
        recommendationText.push(facilityTypeKey[currentFac].split(" | ")[selectedLanguageIndex]);
      }

      for (var k = 0; k < currentImp.length; k++) {
        recommendationText.push(implementationAction[currentImp[k]].split(" | ")[selectedLanguageIndex]);
      }

      return recommendationText.join(", ")
    }

    for (var i = 0; i < headersToDisplay.length; i++) {
      if (headersToDisplay[i] == "Why is this important? / ¿Porque es esto importante?") {
        surveyString += '<h6><strong>' + headersToDisplay[i].split(" / ")[selectedLanguageIndex] + '</strong>: ' + feature.properties[headersToDisplay[i]].split(" | ")[selectedLanguageIndex] + '</h6>';
      } else if (headersToDisplay[i] == "Recommendation / Recomendación") {
        var recText = createRecommendationText();
        surveyString += '<h6><strong>' + headersToDisplay[i].split(" / ")[selectedLanguageIndex] + '</strong>: ' + recText + '</h6>';
      } else if (headersToDisplay[i] == "Location / Ubicación") {
        surveyString += '<h6><strong>' + headersToDisplay[i].split(" / ")[selectedLanguageIndex] + '</strong>: ' + feature.properties[headersToDisplay[i]] + '</h6>';
      } else {
        surveyString += '<h6><strong>' + headersToDisplay[i].split(" / ")[selectedLanguageIndex] + '</strong>: ' + feature.properties[headersToDisplay[i]].split(" | ")[selectedLanguageIndex]  + '</h6>';
      }
    }

    surveyString += '<hr>';

    if ($.inArray(feature.properties.ID, alreadySubmittedSurvey) == -1) {
      surveyString += '<form id="surveyForm"><div class="form-check pl-0">';

      var surveyQuestionsKeys = Object.keys(surveyQuestions);
      for (var i = 1; i < surveyQuestionsKeys.length + 1; i++) {
        surveyString += '<h6><strong>' + surveyQuestions[i]['Question'].split(" / ")[selectedLanguageIndex] + "</strong></h6>";

        var responseType = surveyQuestions[i]['Response Type'];

        switch (responseType) {
          case "radio":
            var options = surveyQuestions[i]['Responses'].split(",");
            options = options.map(x => x.replace(/(^\s+|\s+$)/mg, ""));

            surveyString += '<div class="form-check-inline"><div class="btn-group btn-group-toggle" data-toggle="buttons">';

            for (var j = 0; j < options.length; j++) {
              var currentId = 'Question' + i.toString() + options[j];
              if (options[j] == "Like / A favor") {
                surveyString += '<label class="btn btn-secondary btn-sm"><input type="radio" name="Question' + i.toString() + '" id="' + currentId + '" value="' + options[j] + '" autocomplete="off"><i class="far fa-thumbs-up pl-2"></i><span class="small pl-2">' + options[j].split(" / ")[selectedLanguageIndex] + '!</span></label>';
              } else if (options[j] == "Dislike / En contra") {
                surveyString += '<label class="btn btn-secondary btn-sm"><input type="radio" name="Question' + i.toString() + '" id="' + currentId + '" value="' + options[j] + '" autocomplete="off"><i class="far fa-thumbs-down pl-2"></i><span class="small pl-2">' + options[j].split(" / ")[selectedLanguageIndex] + '!</span></label>';
              } else {
                surveyString += '<input class="form-check-input" type="' + surveyQuestions[i]['Response Type'] + '" name="Question' + i.toString() + '" value="' + options[j] + '" id="' + currentId + '">';
                surveyString += '<label class="form-check-label" for="' + currentId + '">' + options[j].split(" / ")[selectedLanguageIndex] + '</label>';
              }
            }
            surveyString += '</div></div><br><br>';
            break;

          case "text":
            var currentId = 'Question' + i.toString();

            surveyString += '<div class="form-group">';
            surveyString += '<textarea class="form-control mr-3" id="' + currentId + '" rows="3"></textarea>';
            surveyString += '</div>';
            break;

          case "checkbox":
            var options = surveyQuestions[i]['Responses'].split(",");
            options = options.map(x => x.replace(/(^\s+|\s+$)/mg, ""));

            for (var j = 0; j < options.length; j++) {
              surveyString += '<div class="form-check">';

              var currentId = 'Question' + i.toString() + options[j];
              surveyString += '<input class="form-check-input" type="' + surveyQuestions[i]['Response Type'] + '" name="Question' + i.toString() + '" value="' + options[j] + '" id="' + currentId + '">';
              surveyString += '<label class="form-check-label" for="' + currentId + '">' + options[j].split(" / ")[selectedLanguageIndex] + '</label>';

              surveyString += '</div>';
            }
            break;

          default:
            console.log(responseType);
        } // end switch statement

      } // end survey questions loop

      var submitButtonText = ["Submit", "Votar"];

      surveyString += '<button type="submit" id="submitButton" class="btn btn-primary">' + submitButtonText[selectedLanguageIndex] + '</button>';
    }

    surveyString += '<hr>';

    if (feature.properties.ID in workshopComments) {
      var workshopCommentText = "Neighborhood Meeting Comments / Comentarios de la reunión de barrio";
      surveyString += '<h6><strong>' + workshopCommentText.split(" / ")[selectedLanguageIndex] + '</strong></h6>';

      for (var m = 0; m < workshopComments[feature.properties.ID].length; m++) {
        surveyString += workshopComments[feature.properties.ID][m].join(' - ') + '<br>';
      }

      surveyString += '<br><hr>';
    }

    // surveyString += '<img src="img/' + feature.properties.Photo + '" width="90%" height="auto">';
    var crossSectionDict = {"CS1F": "Shared Use Path.png", "CS1G": "Shared Use Path.png", "CS2A": "Two Way no Parking.png", "CS2B": "Two Way no Parking.png", "CS2E": "Two Way with Two Parking.png", "CS2E_1W": "Two Way with One Parking.png", "CS2A_1W": "One Way with One Parking.png", "CS3": "Two Way with Two Parking.png", "CS3A_1W": "", "CS3_1W": "", "CS2E_TL": ""}

    var crossSectionDictKeys = Object.keys(crossSectionDict);

    var currentPhotoString = feature.properties.Photo;

    if ($.inArray(currentPhotoString, crossSectionDictKeys) > -1) {
      
      var currentPhoto = currentPhotoString + ".png";

      var streetConfigText = "Potential Street Configuration / Configuración de calle potencial";
      surveyString += '<h6><strong>' + streetConfigText.split(" / ")[selectedLanguageIndex] + '</strong></h6>';
      surveyString += '<a href="img/' + currentPhoto + '" data-lightbox="image-' + feature.properties.ID + '" data-title=""><img src="img/' + currentPhoto + '" width="90%" height="auto"></a><hr>';
    } 

    if (currentPhotoString.indexOf(" | ") > -1) {
      var streetConfigText = "Potential Street Configuration / Configuración de calle potencial";
      surveyString += '<h6><strong>' + streetConfigText.split(" / ")[selectedLanguageIndex] + '</strong></h6>' + currentPhotoString.split(" | ")[selectedLanguageIndex] + '<hr>';
    }

    var streetViewText = "Existing Street View / Street View existente";
    surveyString += '<h6><strong>' + streetViewText.split(" / ")[selectedLanguageIndex] + '</strong></h6>';
    var currentStreetViewID = 'streetViewImagery' + feature.properties.ID;

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

    var thanksSubmitText = ["Thanks for submitting your survey!", "Gracias por enviar tu encuesta!"]
    surveyString += '</div></form>';
    if ($.inArray(feature.properties.ID, alreadySubmittedSurvey) == -1) {
      surveyString += '<div id="submitMessage"></div>';
    } else {
      surveyString += '<div id="submitMessage"><h6><strong>' + thanksSubmitText[selectedLanguageIndex] + '!</strong></h6></div>';
    }

    $('#location').html(surveyString);
    initialize();
    sidebarControl.open('location');
    // map.flyTo(e.latlng, flyToZoom);

    $('#submitButton').on('click', function(e) {

      clicked = false;
      layer.setStyle({weight: 5, opacity: 0.8});

      var surveyQuestionsKeys = Object.keys(surveyQuestions);

      for (var k = 1; k < surveyQuestionsKeys.length + 1; k++) {
        var responseType = surveyQuestions[k]['Response Type'];
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

      valuesToAppend["ID"] = feature.properties.ID;
      var cd = new Date(Date.now())
      valuesToAppend["Datetime"] = cd;
      valuesToAppend["User"] = (cd.getMonth() * 512).toString() + (cd.getDay() * 125).toString() + (cd.getFullYear() * 12 * 5).toString();
      valuesToAppend["IP Address"] = ip_address;

      var $form = $('form#surveyForm'), url = c.m.s

      e.preventDefault();
      // $.ajax({
      //   url: url,
      //   method: "GET",
      //   dataType: "json",
      //   data: valuesToAppend
      // });

      alreadySubmittedSurvey.push(feature.properties.ID);

      $("#submitMessage").html('<h6><strong>' + thanksSubmitText[selectedLanguageIndex] + '</strong></h6>');
      $('#submitButton').remove();
      $('#surveyForm').remove();
    });

    $('#surveyClose').on('click', function() {
      sidebarControl.close();
      map.closePopup();

      clicked = false;
      layer.setStyle({weight: 5, opacity: 0.8});

      // $('#location').html('<h1 class="sidebar-header">Proposed Location<span class="sidebar-close"><i class="fa fa-caret-left"></i></span></h1><p>Click on a location on the map to share your opinion</p>');
    });

    this.openPopup();
    // this.setStyle({color: 'cyan', weight: 5});
  })
}

//////////////////////////////////////////////// VIEW SUBMITTED COMMENTS

function getSubmittedComments() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: c.s.d,
    range: 'Input!A1:K',
  }).then(function(response) {
    var values = response.result.values;
    var headers = values[0];

    commentsArray = [];
    commentsPointsArray = [];

    for (var i = 1; i < values.length; i++){
      var shapeValue = values[i][headers.indexOf("Shape")];
      var indexNum = parseInt(values[i][headers.indexOf("ID")]);
      if (indexNum > 0) {
        var feature = JSON.parse(shapeValue);
        feature.properties.Concerns = values[i][headers.indexOf("Concerns")];
        if (feature.geometry.type == "Point") {
          commentsPointsArray.push(feature);
        } else {
          commentsArray.push(feature);
        }
      }
    }

    comments = L.geoJSON(commentsArray, {
      style: styleComment,
      onEachFeature: createCommentPopup
    });

    commentsPoints = L.geoJSON(commentsPointsArray, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, pointOptions);
      },
      onEachFeature: createCommentPopup
    });

  });
}

function styleComment(feature){
  var geometryType = feature.geometry.type;
  switch (geometryType){
    case "LineString":
      return drawPolylineOptions.shapeOptions;
      break;
    case "Polygon":
    return drawPolygonOptions.shapeOptions;
      break;
    default:
      console.log(geometryType);
  }
}

function createCommentPopup(feature, layer) {
  var in_num = feature.properties.ID;
  var in_concerns = feature.properties.Concerns;
  var in_comment = feature.properties.Comment;
  var in_date = feature.properties.Date;

  in_concerns = in_concerns.replace(/,Needs/g, "<br><br>Needs") + '<br>' + in_comment;

  var upButtonId = 'thumbsUp' + in_num.toString();
  var downButtonId = 'thumbsDown' + in_num.toString();
  var addCommentButton = 'additionalComment' + in_num.toString();
  var additionalCommentText = 'additionalComment' + in_num.toString() + 'Text';
  var additionalCommentTextSubmit = 'additionalComment' + in_num.toString() + 'TextSubmit';

  var popupContent = `<blockquote class="blockquote text-left"><p class="mb-0 small">${in_concerns}</p>
            <footer class="blockquote-footer">Comment submitted ${in_date}</footer>
          </blockquote>
          <div class="row">
            <div class="col text-center" id="thumbsId">
              <div class="btn-group btn-group-toggle" data-toggle="buttons">
                <label class="btn btn-outline-light btn-sm">
                  <input type="radio" name="votingThumbs" id="${upButtonId}" value="1" autocomplete="off"><i class="far fa-thumbs-up"></i><span class="small .pl-2">Thumbs up!</span>
                </label>
                <label class="btn btn-outline-light btn-sm">
                  <input type="radio" name="votingThumbs" id="${downButtonId}" value="-1" autocomplete="off"><i class="far fa-thumbs-down"></i><span class="small .pl-2">Thumbs Down!</span>
                </label>
              </div>
            </div>
          </div>
          <br>
          <div class="row">
            <div class="col text-center">
              <a href="#" id="${addCommentButton}">Add a comment to this proposal</a>
            </div>
          </div>
          <br>
          <div class="row">
            <div class="col text-center">
              <div class="form-group">
                <textarea class="form-control" id="${additionalCommentText}" rows="3" style="display: none;"></textarea>
              </div>
            </div>
          </div>
          <br>
          <div class="row">
            <div class="col text-center">
              <button type="submit" id="${additionalCommentTextSubmit}" class="btn btn-primary">Submit</button>
            </div>
          </div>`;


  var tooltipText = `<p class="text-center p-2 align-middle"><strong>${["Public comment: ", "Público cómo: "][selectedLanguageIndex]}</strong>${in_comment}<br>${["Click to vote on this comment.", "Haga clic para votar en este comentario."][selectedLanguageIndex]}</p>`;

  var popup = L.popup({autoPan: false}).setContent(popupContent);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(tooltipText);

  layer.bindPopup(popup);

  layer.on('click', function(e) {
    this.openPopup();

    panToClickedPoint(e);

    $('#' + addCommentButton).click(function(){
      $('#' + additionalCommentText).toggle();
    });

    $('#' + additionalCommentTextSubmit).click(function(){

      addVoting(in_num, $('input[name="votingThumbs"]:checked').val(), $('#' + additionalCommentText).val());
      $('#' + addCommentButton).remove();
      $('#thumbsId').remove();
      $('#' + additionalCommentText).remove();
      $('#' + additionalCommentTextSubmit).html('Thanks for sharing!');
      $('#' + additionalCommentTextSubmit).prop('disabled', 'disabled');

      var popup = L.popup({autoPan: false}).setContent(`<blockquote class="blockquote text-center"><p class="mb-0">${in_comment}</p>
                                                        <footer class="blockquote-footer">Comment submitted ${in_date}</footer>
                                                        </blockquote>`);
      layer.bindPopup();
    });

    function addVoting(in_num, vote, addComment) {
      var valuesToAppend = {"ID": 0};

      var votingDict = {"type": "Voting"};
      votingDict["Date Voted"] = new Date();
      votingDict["ID"] = in_num;
      votingDict["Vote"] = vote;
      votingDict["Comment"] = addComment;

      valuesToAppend["Shape"] = JSON.stringify(votingDict);

      var cd = new Date(Date.now())
      valuesToAppend["User"] = (cd.getMonth() * 512).toString() + (cd.getDay() * 125).toString() + (cd.getFullYear() * 12 * 5).toString();
      valuesToAppend["Date"] = new Date();;
      valuesToAppend["Vote"] = vote;
      valuesToAppend["IP Address"] = ip_address;
      valuesToAppend["Additional Comment"] = addComment;

      // $.ajax({
      //   url: c.m.d,
      //   method: "GET",
      //   dataType: "json",
      //   data: valuesToAppend
      // });
    }
  });

  layer.on('popupclose', function(e) {
  });
}

function activateViewComments() {
  currentLegendText = returnLegend();
  $('.legendDiv').html(currentLegendText);

  if($('#viewComments').prop('checked')) {

    if (overlaysIDs[3] != -1) {
      overlays.removeLayer(overlaysIDs[3]);
      overlaysIDs[3] = -1;

      overlays.removeLayer(overlaysIDs[4]);
      overlaysIDs[4] = -1;
    }

    overlays.addLayer(comments).addTo(map);
    overlaysIDs[3] = comments._leaflet_id;

    overlays.addLayer(commentsPoints).addTo(map);
    overlaysIDs[4] = commentsPoints._leaflet_id;

  } else {
    if (overlaysIDs[3] != -1) {
      overlays.removeLayer(overlaysIDs[3]);
      overlaysIDs[3] = -1;

      overlays.removeLayer(overlaysIDs[4]);
      overlaysIDs[4] = -1;
    }
  }
}

$('#viewComments').on('click', function() {
  activateViewComments();
});

function loadCityLimits() {
  var cityFile = 'json/city_limit.json';

  var cityLimitArray = [];
  $.ajax({
    url: cityFile,
    dataType: 'json',
    async: false,
    success: function(data) {
      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        cityLimitArray.push(feature);
      }
    }
  });

  function cityLimitStyle() {
    return {
      fillColor: '#fff',
      fillOpacity: 0.75,
      color: '#000',
      opacity: 0.55,
      weight: 0.25
    }
  }

  var cityLimits = L.geoJSON(cityLimitArray, {
    style: cityLimitStyle,
    interactive: false
  });


  overlays.addLayer(cityLimits).addTo(map);
  overlaysIDs[6] = cityLimits._leaflet_id;

  cityLimits.bringToBack();

  // overlays.addLayer(stamen_labels).addTo(map);
  // stamen_labels.bringToFront();
}

loadCityLimits();

$(window).on("resize", function() {
    $("#participationMapDiv").height($(window).height() - $('#headerImage').height()).width($(window).width());
    map.invalidateSize();
}).trigger("resize");

function toggleLayer(inputNumber) {
  if (overlaysIDs[inputNumber] != -1) {
    overlays.removeLayer(overlaysIDs[inputNumber]);
    overlaysIDs[inputNumber] = -1;
  } else {
    if ($.inArray(inputNumber, [0, 1, 2, 7, 8, 9, 10, 11]) > -1) {
      createFeatures(inputNumber);
    } else if (inputNumber == 3) {
      overlays.addLayer(comments).addTo(map);
      overlaysIDs[3] = comments._leaflet_id;
    } else if (inputNumber == 4) {
      overlays.addLayer(commentsPoints).addTo(map);
      overlaysIDs[4] = commentsPoints._leaflet_id;
    }
  }
}

function tabToggle(inputType) {
  clearInterval(setIntervalOnButton);
  $('#clickReminderDiv').remove();

  map.closePopup();

  for (var i = 0; i < 12; i++) {
    if (overlaysIDs[i] != -1) {
      if (i != 6) {
        overlays.removeLayer(overlaysIDs[i]);
        overlaysIDs[i] = -1;
      } else {
        var layersKeys = Object.keys(drawnItems._layers);
        for (var j = 0; j < layersKeys.length; j++) {
          drawnItems.remove(drawnItems._layers[layersKeys[j]]);
        }

        drawnItems  = new L.FeatureGroup();
        map.addLayer(drawnItems);
      }
    }
  }

  if ($('#viewComments').prop('checked') == true) {
    $('#viewComments').prop('checked', false);
  }

  createFeatures(0);
  if (inputType == 'Great') {
    createFeatures(1);
    createFeatures(11);
    // createFeatures(9);
    createFeatures(8);
  } else if (inputType == 'Nodes') {
    createFeatures(1);
    createFeatures(11);
    // createFeatures(9);
    createFeatures(8);
  }
  else if (inputType == 'Urban') {
    createFeatures(1);
    createFeatures(2);
    createFeatures(7);
    createFeatures(11);
    createFeatures(8);
  } else if (inputType == 'Draw') {
    createFeatures(1);
    createFeatures(2);
    createFeatures(7);
    createFeatures(11);
    createFeatures(8);
  }
}

window.scrollTo(0, 1);