function createExistingPopup(feature, layer) {

  var popupText = "";

  var streetName = capitalize(feature.properties.name);

  popupText = `<p><strong>Exising Location</strong>: ${streetName}`;

  var popup = L.popup({ closeButton: false }).setContent(popupText);

  layer.bindPopup(popup);

  layer.showDelay = 350; //use 0 for no delay behavior
  layer.hideDelay = 0; //use 0 for normal behavior

  layer.bindTooltipDelayed(popupText);

  layer.on('mouseover', function (e) {
    this.setStyle({ weight: 10, opacity: 0.5 });
  });

  layer.on('mouseout', function (e) {
    this.setStyle({ weight: 5, opacity: 0.8 });
  });

  layer.on('click', function (e) {
    map.closePopup();
    this.openPopup();
  });
}
