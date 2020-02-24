//////////////////////////////////////////////// LEGEND

function createLegendText() {
  var currentLegendText = '<div class="container p-2">';

  // bike
  currentLegendText += `
    <div class="tab-pane fade show active" id="bike" role="tabpanel" aria-labelledby="bike-tab">
      <div class="row">
        <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" id="ExistingDiv" onclick="toggleStatus('Existing')">
        <span style="background-color: #000; display: none; height: 5px; width: 10px;"></span>
        <span class="pl-2"><strong>Existing</strong></span>
        </div>
      </div>`;

  for (var i = 0; i < existingSymbologyDictKeys.length; i++) {

    currentLegendText += `    
      <div class="row">
        <div class="col d-inline-flex flex-row align-items-center legendItem ExistingLegendItems" id="${existingSymbologyDictKeys[i].replace(/ /g, "_").replace(".", "")}_0" style="cursor: pointer;" onclick="toggleLayer('${existingSymbologyDictKeys[i]}', 0)">
          <span style="background-color: ${existingSymbologyDict[existingSymbologyDictKeys[i]]}; display: block; height: 5px; width: 16px;"></span>
          <span class="pl-2">${existingSymbologyDictKeys[i]}</span>
        </div>
      </div>`;
  }

  currentLegendText += `
    <hr>
    <div class="row">
      <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" id="ProposedDiv" onclick="toggleStatus('Proposed')">
      <span style="background-color: #000; display: none; height: 5px; width: 10px;"></span>
      <span class="pl-2"><strong>Proposed</strong></span>
      </div>
    </div>`;

  for (var i = 0; i < symbologyDictKeys.length; i++) {

    currentLegendText += `    
      <div class="row">
        <div class="col d-inline-flex flex-row align-items-center legendItem ProposedLegendItems" id="${symbologyDictKeys[i].replace(/ /g, "_").replace(".", "")}_1" style="cursor: pointer;" onclick="toggleLayer('${symbologyDictKeys[i]}', 1)">
          <span style="background-color: ${symbologyDict[symbologyDictKeys[i]]}; display: block; height: 5px; width: 5px;"></span>
          <span style="background-color: #fff; display: block; height: 5px; width: 6px;"></span>
          <span style="background-color: ${symbologyDict[symbologyDictKeys[i]]}; display: block; height: 5px; width: 5px;"></span>
          <span class="pl-2">${symbologyDictKeys[i]}</span>
        </div>
      </div>`;
  }

  if ($('#viewComments').prop('checked')) {

    currentLegendText += `
      <hr>
      <div class="row">
        <div class="col d-inline-flex flex-row align-items-center" id="DrawingDiv"">
        <span style="background-color: #000; display: none; height: 5px; width: 10px;"></span>
        <span class="pl-2"><strong>User-Submitted Drawing Comments</strong></span>
        </div>
      </div>`;

    currentLegendText += `
      <div class="row">
        <div class="col d-inline-flex flex-row align-items-center DrawingLegendItems" id="Comments_6">
          <span style="background-color: #174759; display: block; height: 5px; width: 5px;"></span>
          <span style="background-color: #fff; display: block; height: 5px; width: 6px;"></span>
          <span style="background-color: #174759; display: block; height: 5px; width: 5px;"></span>
          <span class="pl-2">Route Comments (User-Submitted)</span>
        </div>
      </div>`;
  }

  // close container
  currentLegendText += '</div>';

  return currentLegendText
}

$('#myTabContent').html(createLegendText());


