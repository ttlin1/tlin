
function addWorks(inType) {
  var workColumnString;
  if (inType == 'Portfolio') {
    var worksToAdd = ["boston", "metro", "solano"];
    var mapDescriptions = [
                            ['Boston Microhubs', 
                            '<span class="font-italic">Problem</span> | Project Planning and Priortization <br><span class="font-italic">Solution</span> | Webmap with queries',
                            '<span class="font-italic">Platform</span> | Leaflet, Bootstrap, Google API'], 
                            ['LA Metro Bikeshare Crowdsourcing Archive', 
                            '<span class="font-italic">Problem</span> | Crowdsourcing archive for the LA Metro Bikeshare expansion<br><span class="font-italic">Solution</span> | Analysis and Planning',
                            '<span class="font-italic">Platform</span> | Leaflet, Bootstrap, JavaScript'], 
                            ['Solano County Active Transportation Plan', 
                            '<span class="font-italic">Problem</span> | Obtain feedback from local governments<br><span class="font-italic">Solution</span> | Webmap that allows interactive feedback',
                            '<span class="font-italic">Platform</span> | Leaflet, Bootstrap, JavaScript']];
    workColumnString = '<div class="row p-2">';

    for (var i = 0; i < worksToAdd.length; i++) {
      if ((i > 1)  && ((i % 2) == 0)) {
        workColumnString += '<div class="row p-2">';
      }

      workColumnString += `
                          <div class="col p-2">
                            <a href="/${worksToAdd[i]}" target="_blank" class="halfOpacity">
                              <img src="jpg/${worksToAdd[i]}.png" class="img-fluid" style="position: relative;">                        
                              </img>
                              <div class="overlay-box">
                                <div class="overlay-text text-center">
                                  <strong>${mapDescriptions[i][0]}</strong><br>
                                  ${mapDescriptions[i][1]}<br>
                                  ${mapDescriptions[i][2]}<br>
                                </div>
                              </div>
                            </a>

                          </div>`;

      if ((i - 1 ) % 2 == 0) {
        workColumnString += '</div>';
      }
    }
  } else if (inType == 'About') {
    workColumnString = `<div class="row">
                          <div class="col-10 offset-1">
                            <h1 id="titleText">About</h1>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-10 offset-1">
                            <br>
                            <p><span style="color: #ff8800;">Experience</span> &nbsp;| &nbsp; 8.5 years of GIS work experience (2.5 in the private sector; 6 in the public sector)
                              <br>
                              <span style="color: #ff8800;">Education</span> &nbsp;| &nbsp; Master&rsquo;s in Urban Planning, Harvard University; Bachelor&rsquo;s Degree, University of Michigan
                              <br>
                              <span style="color: #ff8800;">Skill</span> &nbsp;| &nbsp; Esri ArcGIS 10.6; Python 2.7; Leaflet; HTML 5/CSS 3; JavaScript; PostgreSQL/PostGIS; Oracle; GeoServer.
                            </p>
                          </div>
                        </div>`;
  } else if (inType == 'Contact') {
    workColumnString = `<div class="row">
                          <div class="col-10 offset-1">
                            <h1 id="titleText">Contact</h1>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-10 offset-1">
                            <br>
                            <p><span style="color: #ff8800;">Phone</span> &nbsp;| &nbsp; (971) 533-0577
                              <br>
                              <span style="color: #ff8800;">E-Mail</span> &nbsp;| &nbsp; tom.tw.lin AT gmail.com
                            </p>
                          </div>
                        </div>`;
  } else if (inType == 'Other Works') {
    workColumnString = `<div class="row">
                          <div class="col-10 offset-1">
                            <h1 id="titleText">Other Works</h1>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-10 offset-1">
                            <br>
                            <p><span style="color: #ff8800;">StanCOG</span> &nbsp;| &nbsp; 
                              <a href="https://tooledesign.github.io/stanislaus/" target="_blank">https://tooledesign.github.io/stanislaus</a>
                            </p>
                            <p><span style="color: #ff8800;">Jersey City Vision Zero</span> &nbsp;| &nbsp; 
                              <a href="https://tooledesign.github.io/jersey_city_vz/" target="_blank">https://tooledesign.github.io/jersey_city_vz</a>
                            </p>
                            <p><span style="color: #ff8800;">San Mateo</span> &nbsp;| &nbsp; 
                              <a href="https://tooledesign.github.io/f043_sanmateobikeplan/" target="_blank">https://tooledesign.github.io/f043_sanmateobikeplan</a>
                            </p>
                            <p><span style="color: #ff8800;">Pasadena Complete Streets</span> &nbsp;| &nbsp; 
                              <a href="https://tooledesign.github.io/G003_P_Pasadena/" target="_blank">https://tooledesign.github.io/G003_P_Pasadena</a>
                            </p>
                            <p><span style="color: #ff8800;">San Jose</span> &nbsp;| &nbsp; 
                              <a href="https://tooledesign.github.io/San_Jose_Bike_Plan/" target="_blank">https://tooledesign.github.io/San_Jose_Bike_Plan</a>
                            </p>
                            <p><span style="color: #ff8800;">Ann Arbor</span> &nbsp;| &nbsp; 
                              <a href="https://tooledesign.github.io/ann_arbor_mobility/" target="_blank">https://tooledesign.github.io/ann_arbor_mobility</a>
                            </p>
                            <p><span style="color: #ff8800;">Lowell Multimodal Plan - Survey Results</span> &nbsp;| &nbsp; 
                              <a href="https://tooledesign.github.io/60168_Lowell/results" target="_blank">https://tooledesign.github.io/60168_Lowell/results</a>
                            </p>
                          </div>
                        </div>`;
  }

  $('#workColumn').html(workColumnString);

  $('.halfOpacity').hover(function() {
    $(this).children('.overlay-box').css("cssText", "background-color: rgba(0, 0, 0, 0.75); opacity: 1; -webkit-transition: opacity 1s; transition: opacity 1s; ");
    // $('.overlay-text').css("cssText", "background-color: rgba(0, 0, 0, 0.25); opacity: 1; -webkit-transition: opacity 1s; transition: opacity 1s; ");
  });

  $('.halfOpacity').mouseout(function() {
    $(this).children('.halfOpacity').css("opacity", "0.25");
    $('.overlay-box').css("opacity", "0");
  });
}

addWorks('Portfolio');

$(".nav .nav-link").on("click", function(){
   $(".nav").find(".active").removeClass("active");
   $(this).addClass("active");
});