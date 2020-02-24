function generateReport(selectedStationNumber) {
  var pdf = new jsPDF({orientation: 'landscape',
                      unit: 'pt',
                      format: [792, 612],
                      lineHeight: 1.0});

  specialElementHandlers = {
      '#bypassme': function (element, renderer) {
          return true
      }
  };
  margins = {
      top: 25,
      bottom: 25,
      left: 30,
      right: 30
  };

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd < 10) {
      dd = '0' + dd
  }

  if(mm < 10) {
      mm = '0' + mm
  }

  today = mm + '/' + dd + '/' + yyyy;

  pdf.setFontSize(12);
  var pdfTitle = `LA Metro Station Report - Station ${selectedStationNumber} - ${today}`;
  pdf.text(25, 25, pdfTitle);
  pdf.text(25, 35, "Source: https://tooledesign.github.io/LA_Metro_Archive/");

  leafletImage(map, function(err, canvas) {
    var imgData = canvas.toDataURL("image/PNG", 1.0);
    var width = 792 - 60;
    var height = 612 - 50;

    var dimensions = map.getSize();

    if (dimensions.x > width) {
        var newMapHeight = width / (dimensions.x / dimensions.y);
        var newMapWidth = width;
    } else if (dimensions.y > height) {
        var newMapHeight = height;
        var newMapWidth = (dimensions.x / dimensions.y) * height;
    }

    pdf.addImage(imgData, 'PNG', 35, 40, newMapWidth, newMapHeight);
    pdf.addPage();

    var sectionsToWrite = ['#Location_InformationCollapse', '#Planning_DetailsCollapse', '#Public_Input_InformationCollapse',
                          '#Submittal_TrackingCollapse'];

    var htmlToWrite = '';

    for (var i = 0; i < sectionsToWrite.length; i++) {
      var currentSection = $(`${sectionsToWrite[i]}`)[0];
      var sectionName = sectionsToWrite[i].replace("#", "").replace(/_/g, " ").replace("Collapse", "");
      htmlToWrite += `<p><strong>${sectionName}</strong></p><hr>`;

      htmlToWrite += currentSection.innerHTML;
    }

    htmlToWrite.replace(/<h6>/g, '<p>');
    htmlToWrite.replace(/<\/h6>/g, '</p>');

    var selectedOdDict = odLinesDict[selectedStationNumber];

    htmlToWrite += `<p><strong>Ridership Matrix</strong></p>`;

    htmlToWrite += `
                    <table id="originRidershipTable">
                      <thead>
                        <tr>
                          <th>Origin</th>
                          <th>Destination</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>`;

    for (var j = 0; j < selectedOdDict["Origin"].length; j++) {
      htmlToWrite += `<tr>
                        <td>${selectedStationNumber} - ${stationIDtoName[selectedStationNumber]}</td>
                        <td>${odIdToStations[selectedOdDict["Origin"][j]][1]} - ${returnInactive(stationIDtoName[odIdToStations[selectedOdDict["Origin"][j]][1]])}</td>
                        <td>${odIdToRidership[selectedOdDict["Origin"][j]]}</td>
                      </tr>`
    }

    htmlToWrite += '</tbody></table>';

        htmlToWrite += `
                    <table id="destRidershipTable">
                      <thead>
                        <tr>
                          <th>Origin</th>
                          <th>Destination</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>`;

    for (var j = 0; j < selectedOdDict["Destination"].length; j++) {
      htmlToWrite += `<tr>
                        <td>${odIdToStations[selectedOdDict["Destination"][j]][1]} - ${returnInactive(stationIDtoName[odIdToStations[selectedOdDict["Destination"][j]][0]])}</td>
                        <td>${selectedStationNumber} - ${stationIDtoName[selectedStationNumber]}</td>
                        <td>${odIdToRidership[selectedOdDict["Destination"][j]]}</td>
                      </tr>`
    }

    htmlToWrite += '</tbody></table>';

    pdf.setFontSize(12);
    pdf.fromHTML(htmlToWrite, 35, 40);

    var totalPages = pdf.internal.getNumberOfPages();
    for (var i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text(710, 580, "Page " + i.toString() + " of " + totalPages.toString());
    }

    pdf.save(pdfTitle.replace(",", "").replace(new RegExp("/", "g"), "-") + '.pdf');
    $("#reportButtonText").html("Generate Report");
    $("#reportLoader").css({'display':'none'});
  });
}