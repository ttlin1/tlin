//////////////////////////////////////////////// TOGGLE ON/OFF LAYERS

function toggleLayer(inputNumber, inLayerNum) {
  if (overlaysIDs[inLayerNum] != -1) {
    overlays.removeLayer(overlaysIDs[inLayerNum]);
    overlaysIDs[inLayerNum] = -1;
  }

  var current = '#' + inputNumber.slice(0, 10).replace(/ /g, "_") + '_' + inLayerNum.toString();

  if (inLayerNum == 0) {
    if ($.inArray(inputNumber, activeExisting) > -1) {
      activeExisting.splice(activeExisting.indexOf(inputNumber), 1);
      $(current).css('opacity', '0.5');
    } else {
      activeExisting.push(inputNumber);
      $(current).css('opacity', '1');
      $(`#ExistingDiv`).css('opacity', '1');
    }

    if (activeExisting.length == 0) {
      $(`#ExistingDiv`).css('opacity', '0.5');
    }

  } else {
    if ($.inArray(inputNumber, activeProposed) > -1) {
      activeProposed.splice(activeProposed.indexOf(inputNumber), 1);
      $(current).css('opacity', '0.5');
    } else {
      activeProposed.push(inputNumber);
      $(current).css('opacity', '1');
      $(`#ProposedDiv`).css('opacity', '1');
    }

    if (activeProposed.length == 0) {
      $(`#ProposedDiv`).css('opacity', '0.5');
    }
  }

  createFeatures(inLayerNum);
}

//////////////////////////////////////////////// TOGGLE ON/OFF EXISTING AND PROPOSED

function toggleStatus(inputStatus) {
  var statusToLayerNumber = {"Existing": 0, "Proposed": 1};
  var inLayerNum = statusToLayerNumber[inputStatus];

  if (overlaysIDs[inLayerNum] != -1) {
    overlays.removeLayer(overlaysIDs[inLayerNum]);
    overlaysIDs[inLayerNum] = -1;

    if (inLayerNum == 0) {
      activeExisting = [];
    } else {
      activeProposed = [];
    }

    $(`.${inputStatus}LegendItems`).css('opacity', '0.5');
    $(`#${inputStatus}Div`).css('opacity', '0.5');
  } else {
    if (inLayerNum == 0) {
      activeExisting = allExisting.slice(0);
    } else {
      activeProposed = allProposed.slice(0);
    }

    createFeatures(statusToLayerNumber[inputStatus]);
    $(`.${inputStatus}LegendItems`).css('opacity', '1');
    $(`#${inputStatus}Div`).css('opacity', '1');
  }
}
