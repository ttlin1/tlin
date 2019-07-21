
function addWorks(inType) {
  var workColumnString;
  if (inType == 'Portfolio') {
    var worksToAdd = ["pasadena", "jersey", "providence", "solano"];
    var mapDescriptions = [['Pasadena Complete Streets Blueprint', 
                            '<span class="font-italic">Problem</span> | Prioritize infrastructure improvements<br><span class="font-italic">Solution</span> | Webmap and custom ArcToolboxes',
                            '<span class="font-italic">Platform</span> | Leaflet, Bootstrap, JavaScript'], 
                            ['Jersey City Vision Zero', 
                            '<span class="font-italic">Problem</span> | View city-wide collision data<br><span class="font-italic">Solution</span> | Webmap with queries',
                            '<span class="font-italic">Platform</span> | ArcGIS API for JavaScript, JavaScript'], 
                            ['Providence Great Streets', 
                            '<span class="font-italic">Problem</span> | Provide info about the Great Streets program<br><span class="font-italic">Solution</span> | Public participation webmap',
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
                            <a href="/${worksToAdd[i]}/docs" target="_blank" class="halfOpacity">
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

      if ((i -1 ) % 2 == 0) {
        workColumnString += '</div>';
      }
    }
  } else if (inType == 'About') {
    workColumnString = `<div class="row">
                          <div class="col-8 offset-2">
                            <h1 id="titleText">About</h1>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-8 offset-2">
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
                          <div class="col-8 offset-2">
                            <h1 id="titleText">Contact</h1>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-8 offset-2">
                            <br>
                            <p><span style="color: #ff8800;">Phone</span> &nbsp;| &nbsp; (971) 533-0577
                              <br>
                              <span style="color: #ff8800;">E-Mail</span> &nbsp;| &nbsp; tom.tw.lin AT gmail.com
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