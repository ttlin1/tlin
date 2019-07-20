//////////////////////////////////////////////// LEGEND

var legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
  this._div = L.DomUtil.create('div', 'legendDiv');
  this.initializeInfo();
  return this._div;
};

var currentLegendText = '<div class="container p-2 d-none d-sm-block">';

// tabs 
currentLegendText += `
  <ul class="nav nav-tabs" id="myTab" role="tablist">
    <li class="nav-item">
      <a class="nav-link active" id="bike-tab" data-toggle="tab" href="#bike" role="tab" aria-controls="bike" aria-selected="true" onclick="tabToggleLayer('Bike')">Bike</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" id="ped-tab" data-toggle="tab" href="#ped" role="tab" aria-controls="ped" aria-selected="false" onclick="tabToggleLayer('Ped')">Pedestrian</a>
    </li>
  </ul>
`;

currentLegendText += '<div class="tab-content" id="myTabContent">';

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
      <div class="col d-inline-flex flex-row align-items-center legendItem ExistingLegendItems" id="${existingSymbologyDictKeys[i].replace(/ /g, "_")}_0" style="cursor: pointer;" onclick="toggleLayer('${existingSymbologyDictKeys[i]}', 0)">
        <span style="background-color: ${existingSymbologyDict[existingSymbologyDictKeys[i]]}; display: block; height: 5px; width: 16px;"></span>
        <span class="pl-2">${capitalize(existingSymbologyDictKeys[i])}</span>
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
      <div class="col d-inline-flex flex-row align-items-center legendItem ProposedLegendItems" id="${symbologyDictKeys[i].replace(/ /g, "_")}_1" style="cursor: pointer;" onclick="toggleLayer('${symbologyDictKeys[i]}', 1)">
        <span style="background-color: ${symbologyDict[symbologyDictKeys[i]]}; display: block; height: 5px; width: 5px;"></span>
        <span style="background-color: #fff; display: block; height: 5px; width: 6px;"></span>
        <span style="background-color: ${symbologyDict[symbologyDictKeys[i]]}; display: block; height: 5px; width: 5px;"></span>
        <span class="pl-2">${symbologyDictKeys[i]}</span>
      </div>
    </div>`;
}

currentLegendText += '</div>';

// ped
currentLegendText += `
  <div class="tab-pane fade" id="ped" role="tabpanel" aria-labelledby="ped-tab">
`;

for (var i = 0; i < pedSymbologyDictKeys.length; i++) {

  currentLegendText += `    
    <div class="row">
      <div class="col d-inline-flex flex-row align-items-center legendItem" id="${pedSymbologyDictKeys[i].replace(/ /g, "_")}_2" style="cursor: pointer;" onclick="toggleLayer('${pedSymbologyDictKeys[i]}', 2)">
        <span style="background-color: ${pedSymbologyDict[pedSymbologyDictKeys[i]]}; display: block; height: 5px; width: 5px;"></span>
        <span class="pl-2">${pedSymbologyDictKeys[i]}</span>
      </div>
    </div>`;
}

currentLegendText += '</div>';

// close container
currentLegendText += '</div>';

legend.initializeInfo = function () {
  this._div.innerHTML = currentLegendText;
}

legend.addTo(map);

legend.getContainer().addEventListener('mouseover', function () {
  map.dragging.disable();
});

legend.getContainer().addEventListener('mouseout', function () {
  map.dragging.enable();
});

$( function() {
  $( ".legendDiv" ).draggable();
} );