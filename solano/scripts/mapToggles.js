//////////////////////////////////////////////// TOGGLE ON/OFF LAYERS

function toggleLayer(inLayerType, inLayerNum) {
  if (overlaysIDs[inLayerNum] != -1) {
    overlays.removeLayer(overlaysIDs[inLayerNum]);
    overlaysIDs[inLayerNum] = -1;
  }

  var current = '#' + inLayerType.replace(/ /g, "_") + '_' + inLayerNum.toString();

  switch (inLayerNum) {
    case 0:
      if ($.inArray(inLayerType, activeExisting) > -1) {
        activeExisting.splice(activeExisting.indexOf(inLayerType), 1);
        $(current).css('opacity', '0.5');
      } else {
        activeExisting.push(inLayerType);
        $(current).css('opacity', '1');
        $(`#ExistingDiv`).css('opacity', '1');
      }
  
      if (activeExisting.length == 0) {
        $(`#ExistingDiv`).css('opacity', '0.5');
      }
      break;
    
    case 1:
      if ($.inArray(inLayerType, activeProposed) > -1) {
        activeProposed.splice(activeProposed.indexOf(inLayerType), 1);
        $(current).css('opacity', '0.5');
      } else {
        activeProposed.push(inLayerType);
        $(current).css('opacity', '1');
        $(`#ProposedDiv`).css('opacity', '1');
      }
  
      if (activeProposed.length == 0) {
        $(`#ProposedDiv`).css('opacity', '0.5');
      }
      break;

    case 2:
      if ($.inArray(inLayerType, pedestrianActive) > -1) {
        pedestrianActive.splice(pedestrianActive.indexOf(inLayerType), 1);
        $(current).css('opacity', '0.5');
      } else {
        pedestrianActive.push(inLayerType);
        $(current).css('opacity', '1');
      }
      break;

    case 8:
      if ($.inArray(inLayerType, activeParking) > -1) {
        activeParking.splice(activeParking.indexOf(inLayerType), 1);
        $(current).css('opacity', '0.5');
      } else {
        activeParking.push(inLayerType);
        $(current).css('opacity', '1');
        $(`#ParkingDiv`).css('opacity', '1');
      }

      if (activeParking.length == 0) {
        $(`#ParkingDiv`).css('opacity', '0.5');
      }
      break;

    case 9:
      if ($.inArray(inLayerType, activeLane) > -1) {
        activeLane.splice(activeLane.indexOf(inLayerType), 1);
        $(current).css('opacity', '0.5');
      } else {
        activeLane.push(inLayerType);
        $(current).css('opacity', '1');
        $(`#LaneDiv`).css('opacity', '1');
      }

      if (activeLane.length == 0) {
        $(`#LaneDiv`).css('opacity', '0.5');
      }
      break;
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

//////////////////////////////////////////////// TOGGLE ON/OFF IMPLEMENTATION

function toggleImpl(inputStatus) {
  var statusToLayerNumber = {"Parking": 8, "Lane": 9};
  var inLayerNum = statusToLayerNumber[inputStatus];

  if (overlaysIDs[inLayerNum] != -1) {
    overlays.removeLayer(overlaysIDs[inLayerNum]);
    overlaysIDs[inLayerNum] = -1;

    if (inLayerNum == 8) {
      activeParking = [];
    } else {
      activeLane = [];
    }

    $(`.${inputStatus}LegendItems`).css('opacity', '0.5');
    $(`#${inputStatus}Div`).css('opacity', '0.5');
  } else {
    if (inLayerNum == 8) {
      activeParking = allImp.slice(0);
    } else {
      activeLane = allImp.slice(0);
    }

    createFeatures(statusToLayerNumber[inputStatus]);
    $(`.${inputStatus}LegendItems`).css('opacity', '1');
    $(`#${inputStatus}Div`).css('opacity', '1');
  }
}
