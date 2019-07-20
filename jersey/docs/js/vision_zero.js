require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/layers/WebTileLayer",
    "esri/widgets/BasemapToggle",
    "esri/Basemap",
    "esri/layers/GraphicsLayer",
    "esri/tasks/support/Query",
    "esri/geometry/Polygon",
    "esri/geometry/Point",
    "esri/tasks/QueryTask",
    "esri/geometry/geometryEngine",
    "esri/widgets/BasemapToggle"
  ],
  function(
    Map,
    MapView,
    FeatureLayer,
    Legend,
    WebTileLayer,
    BasemapToggle,
    Basemap,
    GraphicsLayer,
    Query,
    QueryTask,
    Polygon,
    Point,
    geometryEngine,
    BasemapToggle
  )
  {

    // Create a WebTileLayer with a third-party cached service
    var mapBaseLayer = new WebTileLayer({
      urlTemplate: "http://stamen-tiles-{subDomain}.a.ssl.fastly.net/toner-lite/{level}/{col}/{row}.png",
      subDomains: ["a", "b", "c", "d"],
      copyright: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
    });

    // Create a Basemap with the WebTileLayer. The thumbnailUrl will be used for
    // the image in the BasemapToggle widget.
    var stamen = new Basemap({
      baseLayers: [ mapBaseLayer ],
      title: "Stamen",
      id: "Stamen",
      thumbnailUrl: "https://s3.amazonaws.com/images.m2i.stamen.com/20190115/toner-lite_-CFPoeoMpts.png"
    });

    var modeUrl = "https://services6.arcgis.com/bom7L4u7y1k0qkF1/arcgis/rest/services/Crashes_2019_01_15/FeatureServer";

    const map = new Map({
      basemap: stamen
    });

    const view = new MapView({
      container: "mapDiv",
      map: map,
      center: [-74.069073, 40.716764],
      zoom: 13,
      constraints: {minZoom: 13}
    });

    var basemapToggle = new BasemapToggle({
      view: view,
      nextBasemap: "hybrid"
    }, "BasemapToggle");

    basemapToggle.startup();
    view.ui.add(basemapToggle, "top-left");

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
      color: "#FF8C00", //"orange",
      style: "circle",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: [ 255, 255, 255],
        width: 0.5  // points
      }
    };

    const pedSym = {
      type: "simple-marker",
      color: "#1e74ff",
      style: "circle",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: [ 255, 255, 255],
        width: 0.5  // points
      }
    };

    const bikeSym = {
      type: "simple-marker",
      color: "#006400", //"green",
      style: "circle",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: [ 255, 255, 255],
        width: 0.5 // points
      }
    };

    const mcSym = {
      type: "simple-marker",
      color: "#8B008B", //"purple",
      style: "circle",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: [ 255, 255, 255],
        width: 0.5 // points
      }
    };

    // var severityArcade = document.getElementById("severity").text;

    var sizeVisVar = {
      type: "size",
      field: "SEV_INT",
      valueExpressionTitle: "Severity",

      // stops: [{ value: 5, size: 3, label: "Property damage only/no injury" },
      //         { value: 4, size: 4, label: "Self-reported pain" },
      //         { value: 3, size: 5, label: "Moderate injury" },
      //         { value: 2, size: 6, label: "Serious injury" },
      //         { value: 1, size: 8, label: "Fatal" }

      stops: [{ value: 1, size: 18, label: "Fatal" },
              { value: 2, size: 12, label: "Serious injury" },
              { value: 3, size: 6, label: "Moderate injury" }
            ]
    };

    // var opacityVisVar = {
    //   type: "opacity",
    //   field: "SEV_INT",
    //   valueExpressionTitle: "Severity",
    //
    //   stops: [{ value: 5, opacity: 0.25, label: "Property damage only/no injury" },
    //           { value: [4, 3], opacity: 0.4, label: "Self-reported pain / Moderate injury" },
    //           { value: [2, 1], opacity: 1, label: "Serious injury / Fatal" },
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

    const limitRenderer = {
      type: "simple",  // autocasts as new SimpleRenderer()
      symbol: {
        type: "simple-fill",  // autocasts as new SimpleMarkerSymbol()
        color: [0, 0, 0, 0],
        outline: {  // autocasts as new SimpleLineSymbol()
          width: 1.5,
          color: "#000"
        }
      }
    };

    const backgroundOpacityRenderer = {
      type: "simple",  // autocasts as new SimpleRenderer()
      symbol: {
        type: "simple-fill",  // autocasts as new SimpleMarkerSymbol()
        color: [255, 255, 255, 0.75],
        outline: {  // autocasts as new SimpleLineSymbol()
          width: 1.5,
          color: "#000"
        }
      }
    };

    var modeLayer = new FeatureLayer({
      url: modeUrl,
      outFields: ["*"],
      renderer: modeRenderer,
      popupTemplate: popupTemplate
      // visible: false
    });
    // map.add(modeLayer);


    var backgroundOpacityUrl = "https://services6.arcgis.com/bom7L4u7y1k0qkF1/arcgis/rest/services/Background_Opacity/FeatureServer";
    var backgroundOpacityLayer = new FeatureLayer({
      url: backgroundOpacityUrl,
      renderer: backgroundOpacityRenderer
    });

    var limitUrl = "https://services6.arcgis.com/bom7L4u7y1k0qkF1/arcgis/rest/services/City_Limits/FeatureServer";
    var limitsLayer = new FeatureLayer({
      url: limitUrl,
      outFields: ["*"],
      renderer: limitRenderer
    });

    var resultsLayer = new FeatureLayer({
    });




    // QUERY

    view.ui.add("infoDiv", "top-right");
    view.popup.dockOptions = {
      // Disables the dock button from the popup
      buttonEnabled: false,
    };

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
      // map.layers.removeAll();
      map.layers.remove(resultsLayer);

      document.getElementById("totalNumber").innerHTML = "Total crashes from query: ";
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
      var severityDict = {"moderate": 3, "serious": 2, "fatal": 1};

      var severityList = [];

      if (severityCheckboxes.length > 0) {
        for (var i = 0; i < severityCheckboxes.length; i++) {
          let currentName = severityCheckboxes[i].name;
          severityList.push(severityDict[currentName]);
        }
      }

      severityQueryString += severityList.join(", ");
      severityQueryString += "))";

      // GET DATE
      var startDateInput = document.getElementById('startDate');
      var endDateInput = document.getElementById('endDate');

      function formatDate(inputDate){
        var dateArray = inputDate.split("-");

        if (dateArray[0] == "2017") {
          document.getElementById("2017warning").innerHTML = '<span style="color: red;">*Accurate geolocation information is not available for motor vehicle moderate injury crashes in 2017.</span>';
        }

        return [dateArray[1], dateArray[2], dateArray[0]].join("/")
      }

      var formattedStart = formatDate(startDateInput.value);
      var formattedEnd = formatDate(endDateInput.value);

      if (formattedEnd.split("/")[2] != "2017") {
        document.getElementById("2017warning").innerHTML = "";
      }

      var dateQueryString = "(DATE >= '" + formattedStart + "') AND (DATE <= '" + formattedEnd + "')";

      var combinedQueryString = [modeQueryString, severityQueryString, dateQueryString].join(" AND ");

      var query = modeLayer.createQuery();
      query.where = combinedQueryString;

      return modeLayer.queryFeatures(query);
    }

    function displayResults(results) {
      view.ui.empty("bottom-left");

      resultsLayer = FeatureLayer({
        source: results.features,  // autocast from an array of esri/Graphic
          // create an instance of esri/layers/support/Field for each field object
        fields: results.fields,
        objectIdField: "FID",
        popupTemplate: popupTemplate,
        renderer: modeRenderer
      });

      map.add(backgroundOpacityLayer);
      map.add(resultsLayer);
      // map.add(limitsLayer);

      var legend = new Legend({
        view: view,
        layerInfos: [{
          layer: resultsLayer
        }]
      });

      view.ui.add(legend, "bottom-left");

      document.getElementById("totalNumber").innerHTML = "Total crashes from query: " + results.features.length.toString();
    }

    $(document).ready(function() {
      queryMode()
      .then(displayResults);
    });

  } // end function
);
