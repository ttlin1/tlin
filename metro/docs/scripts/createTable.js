function createStationTable() {
  if (stationArray.length > 0) {
    var dataTable = document.getElementById("dataTable");

    if (dataTable == null) {
      var stationTable = L.control({position: 'topleft'});

      stationTable.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'stationTableDiv');
        this.initializeInfo();
        return this._div;
      };

      stationTable.initializeInfo = function () {
        this._div.innerHTML = `
                                <button type="button" id="tableCloseButton" class="close float-left" aria-label="Close" style="color: #000;"><span aria-hidden="true"><i class="far fa-minus-square"></i></span></button>
                                
                                <br>

                                <div class="ui-widget" id="streetSearchDiv">
                                  <label for="streetSearch">Search by street: </label>
                                  <input id="streetSearch">

                                  <div id="searchResults"></div>
                                </div>

                                <div id="dataTable" class="table-responsive"><div>
                              `;
      }

      stationTable.addTo(map);
      dataTable = document.getElementById("dataTable");

      stationTable.getContainer().addEventListener('mouseover', function () {
        map.dragging.disable();
      });

      stationTable.getContainer().addEventListener('mouseout', function () {
        map.dragging.enable();
      });

      $('#tableCloseButton').click(function(e){
        $("#dataTable").toggle();
        $('.stationTableDiv').css("width", '10px');
        $('.stationTableDiv').css("height", '10px');
      });

    } else {
      dataTable.innerHTML = "";
    }

    var popupDict = {};
    var table = document.createElement('TABLE');
    $(table).attr('id', "stationTableID");
    $(table).attr('class', "table table-hover table-sm table-striped");

    var tableHead = document.createElement('THEAD');
    $(tableHead).attr('class', "thead-dark");
    var tableBody = document.createElement('TBODY');


    var stationPropertiesKeys = Object.keys(stationArray[0].properties);
    var allTableRows = [];

    //TABLE COLUMNS
    var tr = document.createElement('TR');
    tableHead.appendChild(tr);
    for (i = 0; i < stationPropertiesKeys.indexOf("Streetview Link"); i++) {
      var th = document.createElement('TH')
      th.appendChild(document.createTextNode(stationPropertiesKeys[i]));
      th.className = "tableHeader";
      th.scope = "col";
      tr.appendChild(th);
    }

    for (var i = 0; i < stationArray.length; i++) {
      var tr = document.createElement('TR');
      var currentRow = [];

      var th = document.createElement('TH');
      th.scope = "row";
      th.innerHTML = stationArray[i].properties[stationPropertiesKeys[0]];
      currentRow.push(stationArray[i].properties[stationPropertiesKeys[0]]);
      tr.appendChild(th);

      for (j = 1; j < stationPropertiesKeys.indexOf("Streetview Link"); j++) {
        var td = document.createElement('TD');
        // td.appendChild(document.createTextNode(tableArray[j]));
        td.innerHTML = stationArray[i].properties[stationPropertiesKeys[j]];
        currentRow.push(stationArray[i].properties[stationPropertiesKeys[j]]);
        tr.appendChild(td);
      }

      tr.className = "tableRowData";
      tableBody.appendChild(tr);
      allTableRows.push(currentRow);

      currentRow.push(stationArray[i].geometry.coordinates);
      popupDict[stationArray[i].properties["TD Site Number"]] = currentRow;
    }

    //TABLE ROWS

    table.border = '1';
    table.appendChild(tableHead);
    table.appendChild(tableBody);
    table.style.fontSize = '10px';
    dataTable.appendChild(table)

    $(document).ready(function() {
      $("#dataTable table tbody tr.tableRowData").hover(function() {
        var tds = this.childNodes;
        var selectedAddress = tds[stationPropertiesKeys.indexOf("TD Site Number")].innerHTML;
        var selectedAddressRow = popupDict[selectedAddress];
        var selectedAddressLatLng = L.latLng(selectedAddressRow[selectedAddressRow.length - 1][1], selectedAddressRow[selectedAddressRow.length - 1][0]);

        var popup = L.popup()
          .setLatLng(selectedAddressLatLng)
          .setContent(`<strong>Site Number</strong>: ${selectedAddressRow[stationPropertiesKeys.indexOf("TD Site Number")]}<br><strong>Site Name</strong>: ${selectedAddressRow[stationPropertiesKeys.indexOf("TD Name")]}`)
          .openOn(map);
      });

      $("#dataTable").mouseout(function() {
        map.closePopup();
      });
    });

    $(".stationTableDiv").show();

    $(function() {
      $( ".stationTableDiv" ).draggable();
      $( "#dataTable" ).resizable();

      $('#dataTable').resize(function(){
        $('.stationTableDiv').css("width", $('#dataTable').width() + 'px');
        $('.stationTableDiv').css("height", $('#dataTable').height() + 'px');
      });
    });

    function getAutocompleteList() {
      var currentAutocompleteList = [];
      var currentIdList = [];
      
      $('.legendItem').each(function(i, obj) {
        if ($(this).css('opacity') == 1) {
          var currentId = obj.id;
          currentIdList.push(currentId.replace("_0", "").replace(/_/g, " "))
        }
      });

      var streetAutocompleteDictKeys = Object.keys(streetAutocompleteDict);

      for (var i = 0; i < streetAutocompleteDictKeys.length; i++) {
        if ($.inArray(streetAutocompleteDict[streetAutocompleteDictKeys[i]][0], currentIdList) > -1) {
          currentAutocompleteList.push(streetAutocompleteDictKeys[i]);
        }
      }

      return currentAutocompleteList;
    }

    $("#streetSearch").autocomplete({
      source: getAutocompleteList(),
      open: function() {
          $(this).autocomplete("widget")
                .appendTo("#searchResults")
                .css("position", "static");
      }
    });

    $("#streetSearch").on("autocompleteselect", function (event, ui) {
      var currentSiteNumber = streetAutocompleteDict[ui.item.label][1];
      var currentLayer = map._layers[currentSiteNumber];
      currentLayer.fire('click');
    });

  } else {
    $('#dataTable').innerHTML = "";
    $("#dataTable").hide();
  }
}
