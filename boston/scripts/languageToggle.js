//////////////////////////////////////////////// LANGUAGE TOGGLE

$("input[name='language']").change(function() {
  var languageArray = ["english", "creole", "portuguese", "spanish", "vietnamese"];
  var selectedLanguage = $("input[name='language']:checked").val();
  var participateButtonText = ["View map!", "View kat la!", "Ver mapa!", "¡Ver el mapa!", "Xem bản đồ!"];

  selectedLanguageIndex = languageArray.indexOf(selectedLanguage);

  currentOverlayPaneFormText = createOverlayPaneFormText();
  $('#overlayPaneFormText').html(currentOverlayPaneFormText);

  introText = createIntroDivText();
  $('#introDivSpanId').html(introText);

  createSliders();
  createFeatures(0);
  // createHeatLayer();

  $('#participateButton').html(participateButtonText[selectedLanguageIndex]);
  $('#participateButton').click(function(){
    $('#overlayPane').remove();
  });

  $('#instructionsCloseButton').click(function(){
    $('#overlayPane').remove();
  });

});
