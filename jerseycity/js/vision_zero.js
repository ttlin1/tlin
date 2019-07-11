require([
    "dojo/dom",
    "dojo/on",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/layers/WebTileLayer",
    "esri/widgets/BasemapToggle",
    "esri/Basemap",
    "esri/layers/GraphicsLayer",
    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",
    "dojo/domReady!"
  ],
  function(
    dom,
    on,
    Map,
    MapView,
    FeatureLayer,
    Legend,
    WebTileLayer,
    BasemapToggle,
    Basemap,
    GraphicsLayer,
    Query,
    QueryTask
  ) {

    // Create a WebTileLayer with a third-party cached service
    var mapBaseLayer = new WebTileLayer({
      urlTemplate: "https://stamen-tiles-{subDomain}.a.ssl.fastly.net/toner-lite/{level}/{col}/{row}.png",
      subDomains: ["a", "b", "c", "d"],
      copyright: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
    });

    // Create a Basemap with the WebTileLayer. The thumbnailUrl will be used for
    // the image in the BasemapToggle widget.
    var stamen = new Basemap({
      baseLayers: [ mapBaseLayer ],
      title: "Stamen",
      id: "Stamen",
      thumbnailUrl: "http://maps.stamen.com/m2i/image/20181227/toner-lite_DhKkujO_u6E"
    });

    var modeUrl = "https://services6.arcgis.com/bom7L4u7y1k0qkF1/arcgis/rest/services/Crashes/FeatureServer";

    const map = new Map({
      basemap: stamen
    });

    const view = new MapView({
      container: "mapDiv",
      map: map,
      center: [-74.069073, 40.716764],
      zoom: 13,
      padding: {
      }
    });

    // Create the PopupTemplate
    const popupTemplate = { // autocasts as new PopupTemplate()
      title: "Crash Details",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "DATE_STR",
          label: "Date"
        }, {
          fieldName: "TIME_FRMT",
          label: "Time"
        }, {
          fieldName: "MODE",
          label: "Crash Mode"
        }, {
          fieldName: "SEVERITY",
          label: "Crash Severity"
        }]
      }]
    };

    const mvSym = {
      type: "simple-marker",
      color: "orange",
      style: "circle",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: [ 255, 255, 255],
        width: 0.25  // points
      }
    };

    const pedSym = {
      type: "simple-marker",
      color: "#1e74ff",
      style: "circle",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: [ 255, 255, 255],
        width: 0.25  // points
      }
    };

    const bikeSym = {
      type: "simple-marker",
      color: "green",
      style: "circle",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: [ 255, 255, 255],
        width: 0.25 // points
      }
    };

    const mcSym = {
      type: "simple-marker",
      color: "purple",
      style: "circle",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: [ 255, 255, 255],
        width: 0.25 // points
      }
    };

    var severityArcade = document.getElementById("severity").text;

    var sizeVisVar = {
      type: "size",
      field: "SEV_INT",
      valueExpressionTitle: "Severity",

      stops: [{ value: 5, size: 3, label: "Property damage only/no injury" },
              { value: 4, size: 4, label: "Self-reported pain" },
              { value: 3, size: 5, label: "Moderate injury" },
              { value: 2, size: 6, label: "Serious injury" },
              { value: 1, size: 8, label: "Fatal" }
      ]
    };

    // var opacityVisVar = {
    //   type: "opacity",
    //   valueExpression: severityArcade,
    //
    //   stops: [{ value: 1, opacity: 0.4, label: "Property damage only/no injury" },
    //           { value: 1, opacity: 0.5, label: "Self-reported pain" },
    //           { value: 2, opacity: 0.6, label: "Moderate injury" },
    //           { value: 3, opacity: 0.8, label: "Serious injury" },
    //           { value: 4, opacity: 1, label: "Fatal" }
    //   ]
    // };

    const modeRenderer = {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      legendOptions: {
        title: "Mode"
      },
      field: "MODE",
      uniqueValueInfos: [{
        value: "Pedestrian",
        symbol: pedSym,
        label: "Pedestrian"
      }, {
        value: "Bicyclist",
        symbol: bikeSym,
        label: "Bicyclist"
      },
      {
        value: "Motorcyclist",
        symbol: mcSym,
        label: "Motorcyclist"
      },
      {
        value: "Motorist",
        symbol: mvSym,
        label: "Motorist"
      }],
      visualVariables: [sizeVisVar]
    };

    var modeLayer = new FeatureLayer({
      url: modeUrl,
      outFields: ["*"],
      renderer: modeRenderer,
      popupTemplate: popupTemplate
      // visible: false
    });
    // map.add(modeLayer);

    // var legend = new Legend({
    //   view: view,
    //   layerInfos: [{
    //     layer: modeLayer
    //   }]
    // });
    //
    // view.ui.add(legend, "bottom-left");

    // QUERY

    view.ui.add("infoDiv", "top-right");

    var modeCheckboxes = document.querySelectorAll('input[class="modeCheckboxes"]');

    for (var i = 0; i < modeCheckboxes.length; i++) {
      modeCheckboxes[i].addEventListener("click", function () {
        queryMode()
          .then(displayResults);
      });
    }

    var severityCheckboxes = document.querySelectorAll('input[class="severityCheckboxes"]');

    for (var i = 0; i < severityCheckboxes.length; i++) {
      severityCheckboxes[i].addEventListener("click", function () {
        queryMode()
          .then(displayResults);
      });
    }

    var filterByDateBtn = document.getElementById('filterByDateBtn');
    filterByDateBtn.addEventListener("click", function () {
      queryMode()
        .then(displayResults);
    });

    function queryMode() {
      // GET MODES
      var modeCheckboxes = document.querySelectorAll('input[class="modeCheckboxes"]:checked');
      var modeQueryString = "MODE IN ('";
      var modeList = [];

      for (var i = 0; i < modeCheckboxes.length; i++) {
        modeList.push(modeCheckboxes[i].name);
      }

      modeQueryString += modeList.join("', '");
      modeQueryString += "')";

      // GET SEVERITY
      var severityCheckboxes = document.querySelectorAll('input[class="severityCheckboxes"]:checked');
      var severityQueryString = "(SEV_INT IN (";
      var severityList = [];

      for (var i = 0; i < severityCheckboxes.length; i++) {
        severityList.push(severityCheckboxes[i].name);
      }

      severityQueryString += severityList.join(", ");
      severityQueryString += "))";

      // GET DATE
      var startDateInput = document.getElementById('startDate');
      var endDateInput = document.getElementById('endDate');

      function formatDate(inputDate){
        var dateArray = inputDate.split("-");
        return [dateArray[1], dateArray[2], dateArray[0]].join("/")
      }

      var formattedStart = formatDate(startDateInput.value);
      var formattedEnd = formatDate(endDateInput.value);

      var dateQueryString = "(DATE >= '" + formattedStart + "') AND (DATE <= '" + formattedEnd + "')";
      // var dateQueryString = "(YEAR_INT = 2017)";


      var combinedQueryString = [modeQueryString, severityQueryString, dateQueryString].join(" AND ");
      // var combinedQueryString = [modeQueryString, severityQueryString].join(" AND ");
      // var combinedQueryString = [modeQueryString, dateQueryString].join(" AND ");

      var query = modeLayer.createQuery();
      query.where = combinedQueryString;

      return modeLayer.queryFeatures(query);
    }

    function displayResults(results) {
      map.layers.removeAll();

      view.ui.empty("bottom-left");

      var resultsLayer = new FeatureLayer({
        source: results.features,  // autocast from an array of esri/Graphic
          // create an instance of esri/layers/support/Field for each field object
          fields: results.fields,
          objectIdField: "FID",
          popupTemplate: popupTemplate,
          renderer: modeRenderer
      })

      map.add(resultsLayer);

      var legend = new Legend({
        view: view,
        layerInfos: [{
          layer: resultsLayer
        }]
      });

      view.ui.add(legend, "bottom-left");

      document.getElementById("totalNumber").innerHTML = "Total crashes from query: " + results.features.length.toString();
    }

    $(document).ready(queryMode()
      .then(displayResults));

  } // end function
);
