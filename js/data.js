// *** DATA MANIPULATION
var locations=[];
var locationServiceData=[];

// Reads locations from file/variable JSON
function ReadLocations(source, source_type)
{
  switch(source_type) {
    case "file":
        $.ajax({
          url: source,
          success: function (data) {
            console.log('successfully loaded '+source);
            locations=JSON.parse(data);
          },
          error: function (data) {
              console.log('could not load '+source);
          }
        });
        break;
    case "variable":
        locations=JSON.parse(source);
        break;
    default:
      console.log("source type not specified!");
      break;
  }
}

  // LocationFinder() returns an array of every location string from the JSON locations data
var groupedLocations={};

function LocationFinder() {
  console.log("Read locations and add to the user panel");
  var locSearchStr = [];
  var len=locations.locations.length;
  for (var i = 0; i < len; i++) {
    locations.locations[i].locId=i;
      // Check if object is array and push
    if(groupedLocations[locations.locations[i].type] && groupedLocations[locations.locations[i].type].constructor === Array){
      groupedLocations[locations.locations[i].type].push(locations.locations[i]);
    }else{
      // Force the object to be array! ;[
      groupedLocations[locations.locations[i].type]=[];
      groupedLocations[locations.locations[i].type][0]=locations.locations[i];
    }
    // add multiple values to the string, if they are defined
    var combinedStr="";
    if(locations.locations[i].address.name) combinedStr+=locations.locations[i].address.name+" ";
    if(locations.locations[i].address.street) combinedStr+=locations.locations[i].address.street+" ";
    if(locations.locations[i].address.city) combinedStr+=locations.locations[i].address.city+" ";
    locSearchStr.push(combinedStr);
    console.log(combinedStr);
  }

  // inject locations as buttons into the page
  var panel=document.getElementById("user-panel");
  var ul;
  var keys = Object.keys(groupedLocations);
  var len = keys.length;
  var prop;
  for (i = 0; i < len; i++) {
    prop = keys[i];
    value = groupedLocations[prop];
    ul="<h3>"+prop.charAt(0).toUpperCase() + prop.slice(1)+"</h3><ul class='loc-group'>";
    for (var j = 0; j < value.length; j++) {
      ul+="<li data-loc-id="+value[j].locId+" onclick='FocusMarker(this);'>"+value[j].name+"</li>";
    }
    ul+="</ul>";
    panel.innerHTML+=ul;
  }
  return locSearchStr;
}

// Define data in a variable for developemnt purposes
var locationsFile='{"locations":[{"name": "Arthur\'s Seat", "type": "leisure", "description": "thats a tall hill in the middle of the town", "address":{"name": "Arthurs Seat", "city": "Edinburgh", "postalCode": "EH8"}},{"name": "Edinburgh Castle", "type": "leisure", "description": "A big castle on top of the hill", "address":{"name": "Edinburgh Castle", "city": "Edinburgh", "postalCode": "EH1 2NG"}},{"name": "The Meadows", "type": "leisure", "description": "thats a tall hill in the middle of the town", "address":{"name": "The Meadows", "city": "Edinburgh", "postalCode": "EH9 9EX"}},{"name": "Glenfinlas street", "type": "accomodation", "description": "thats my current place", "address":{"street": "6 Glenfinlas St", "city": "Edinburgh", "postalCode": "EH3 6AQ"}},{"name": "Tesco Bank", "type": "employment", "description": "thats my job", "address":{"street": "2 S Gyle Cres", "city": "Edinburgh", "postalCode": "EHQ12 9FQ"}}]}';

// Read locations data
// ReadLocations("data/locations.json", "file"); // uncomment to use data file
ReadLocations(locationsFile, "variable");

// Run the search against data
function SearchLocations(){
  var keyword=document.getElementById("search-field").value.toLowerCase();
  // only search if keyword is 2 characters or more
  if(keyword.length<2){
    document.getElementById("search-results").innerHTML="";
    return;
  }
// reset results
  var results="";
  for (var j=0; j<locations.locations.length; j++) {
      if (locations.locations[j].name.toLowerCase().match(keyword)) results+="<li data-loc-id="+locations.locations[j].locId+" onclick='FocusMarker(this);' >"+locations.locations[j].name+"</li>";
      if (locations.locations[j].description.toLowerCase().match(keyword)) results+="<li data-loc-id="+locations.locations[j].locId+" onclick='FocusMarker(this);' >"+locations.locations[j].description+"</li>";
  }
  // add results to the page
  document.getElementById("search-results").innerHTML=(results.length===0)?"<li>No results found</li>":results;
}

// Reset search box and results
function ClearSearch(){
  document.getElementById("search-field").value="";
  document.getElementById("search-results").innerHTML="";
}

// Wikipedia search (http://stackoverflow.com/a/3873658/1742303)
// base search string
var wikiSearchUrl="https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=";

function SearchWiki(location, infowindow)
{
  var keyword=location.name;
  var description="no description found";
  $.getJSON("https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch="+keyword+"&format=json&callback=?", function(data) {
    var string= data.query.search[0].snippet;
    // discard first sentence?
    if(string.indexOf("For other uses")!=-1)
      string=string.slice(string.indexOf(".")+2,string.length);
    if(string.indexOf("redirects here")!=-1)
      string=string.slice(string.indexOf(".")+2,string.length);
    infowindow.content= string;
  });

  /* don't work because of wrong MIME type
  $.ajax({
      url: wikiSearchUrl+encodeURIComponent(keyword),
      dataType: 'jsonp',
      success: function(data){
          var dataWeGotViaJsonp=JSON.parse(data);
          var len = dataWeGotViaJsonp.length;
          for(var i=0;i<len;i++){
              console.log(data[i]);
          }
      }
  });
*/
/* don't work because of cross domain request
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", wikiSearchUrl+encodeURIComponent(keyword), false );
  xmlHttp.send( null );
  var JSONresponse=JSON.parse(xmlHttp.responseText);
  console.log(JSONresponse.query.search[0].snippet);
  return JSONresponse.query.search[0].snippet;*/
}
