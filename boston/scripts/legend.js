//////////////////////////////////////////////// LEGEND

var legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
  this._div = L.DomUtil.create('div', 'legendDiv');
  this.initializeInfo();
  return this._div;
};

var currentLegendText = '<div class="container p-2 d-none d-sm-block">';

currentLegendText += `
  <div class="row">
    <div class="col d-inline-flex flex-row align-items-center legendItem" style="cursor: pointer;" id="ExistingDiv" onclick="toggleStatus('Existing')">
    <span style="background-color: #000; display: none; height: 5px; width: 10px;"></span>
    <span class="pl-2"><strong>Existing</strong></span>
    </div>
  </div>`;

for (var i = 0; i < symbologyDictKeys.length; i++) {

  currentLegendText += `    
    <div class="row">
      <div class="col d-inline-flex flex-row align-items-center legendItem ExistingLegendItems" id="${symbologyDictKeys[i].slice(0, 10).replace(/ /g, "_")}_0" style="cursor: pointer;" onclick="toggleLayer('${symbologyDictKeys[i]}', 0)">
        <span style="background-color: ${symbologyDict[symbologyDictKeys[i]]}; display: block; height: 5px; width: 16px;"></span>
        <span class="pl-2">${symbologyDictKeys[i]}</span>
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
      <div class="col d-inline-flex flex-row align-items-center legendItem ProposedLegendItems" id="${symbologyDictKeys[i].slice(0, 10).replace(/ /g, "_")}_1" style="cursor: pointer;" onclick="toggleLayer('${symbologyDictKeys[i]}', 1)">
        <span style="background-color: ${symbologyDict[symbologyDictKeys[i]]}; display: block; height: 5px; width: 5px;"></span>
        <span style="background-color: #fff; display: block; height: 5px; width: 6px;"></span>
        <span style="background-color: ${symbologyDict[symbologyDictKeys[i]]}; display: block; height: 5px; width: 5px;"></span>
        <span class="pl-2">${symbologyDictKeys[i]}</span>
      </div>
    </div>`;
}

currentLegendText += '</div>';

legend.initializeInfo = function () {
  this._div.innerHTML = currentLegendText;
}

legend.addTo(map);
