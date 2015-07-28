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

  //locationFinder() returns an array of every location string from the JSON data
var groupedLocations={};

function LocationFinder() {
  var locSearchStr = [];
  var len=locations.locations.length;
  for (var i = 0; i < len; i++) {
    locations.locations[i].locId=i;
    //if(typeof(groupedLocations[locations.locations[i].type]) !== 'undefined'){
      if(groupedLocations[locations.locations[i].type] && groupedLocations[locations.locations[i].type].constructor === Array){
      groupedLocations[locations.locations[i].type].push(locations.locations[i]);
    }else{
      groupedLocations[locations.locations[i].type]=[];
      groupedLocations[locations.locations[i].type][0]=locations.locations[i];}
      var combinedStr="";
      if(locations.locations[i].address.name) combinedStr+=locations.locations[i].address.name+" ";
      if(locations.locations[i].address.street) combinedStr+=locations.locations[i].address.street+" ";
      if(locations.locations[i].address.city) combinedStr+=locations.locations[i].address.city+" ";
   locSearchStr.push(combinedStr);
   console.log(combinedStr);
  };
  console.log(groupedLocations);

  var panel=document.getElementById("user-panel");
  var ul;
  var keys = Object.keys(groupedLocations);
  var len = keys.length;
  var prop;
  for (i = 0; i < len; i++) {
    prop = keys[i];
    value = groupedLocations[prop];
    ul="<h3>"+prop.charAt(0).toUpperCase() + prop.slice(1)+"</h3><ul class='loc-group'>"
    for (var j = 0; j < value.length; j++) {
      ul+="<li data-loc-id="+value[j].locId+" onclick='FocusMarker(this);'>"+value[j].name+"</li>";
    };
    ul+="</ul>";
    panel.innerHTML+=ul;
  }
  return locSearchStr;
}

// Define data in a variable for developemnt purposes
var locationsFile='{"locations":[{"name": "Arthur\'s Seat", "type": "leisure", "description": "thats a tall hill in the middle of the town", "address":{"name": "Arthurs Seat", "city": "Edinburgh", "postalCode": "EH8"}},{"name": "Edinburgh Castle", "type": "leisure", "description": "A big castle on top of the hill", "address":{"name": "Edinburgh Castle", "city": "Edinburgh", "postalCode": "EH1 2NG"}},{"name": "The Meadows", "type": "leisure", "description": "thats a tall hill in the middle of the town", "address":{"name": "The Meadows", "city": "Edinburgh", "postalCode": "EH9 9EX"}},{"name": "Edinburgh home", "type": "accomodation", "description": "thats my current place", "address":{"street": "6 Glenfinlas St", "city": "Edinburgh", "postalCode": "EH3 6AQ"}},{"name": "Work", "type": "employment", "description": "thats my job", "address":{"street": "2 S Gyle Cres", "city": "Edinburgh", "postalCode": "EHQ12 9FQ"}}]}';

// Read locations data
//ReadLocations("data/locations.json", "file");
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
  document.getElementById("search-results").innerHTML=(results.length==0)?"<li>No results found</li>":results;
}

// Reset search box and results
function ClearSearch(){
  document.getElementById("search-field").value="";
  document.getElementById("search-results").innerHTML="";
}

// Wikipedia search
var wikiUrl="https://en.wikipedia.org/w/api.php";
var wikiSearchUrl="https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=";

// doesn't work because of cross origin requests are not allowed
function SearchWiki(keyword)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", wikiSearchUrl+encodeURIComponent(keyword), false );
  xmlHttp.send( null );
  var JSONresponse=JSON.parse(xmlHttp.responseText);
  console.log(JSONresponse.query.search[0].snippet);
  return JSONresponse.query.search[0].snippet;
}

// Version 2 using CORS (http://www.html5rocks.com/en/tutorials/cors/)

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  xhr.Headers.Add("origin", "kiaurutis.co.nf");
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}

var xhr = createCORSRequest('GET', url);
if (!xhr) {
  throw new Error('CORS not supported');
}

xhr.onload = function() {
 var responseText = xhr.responseText;
 console.log(responseText);
 // process the response.
};

xhr.onerror = function() {
  console.log('There was an error!');
};

function SearchWiki2(keyword) {

  var url = wikiUrl+encodeURIComponent(keyword);

  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
    var JSONresponse=JSON.parse(xhr.responseText);
    console.log(JSONresponse.query.search[0].snippet);
    return JSONresponse.query.search[0].snippet;
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  xhr.send();
}

{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", wikiSearchUrl+encodeURIComponent(keyword), false );
  xmlHttp.send( null );

}

// Wiki search 3 using JSONP handler (https://www.mediawiki.org/wiki/API:Search_and_discovery#JavaScript)

function SearchWiki3(keyword){

  mw.mwQuery("https://en.wikipedia.org/w/api.php",encodeURIComponent(keyword));
}

var mw;
(function (mw) {

  /**
   * Query a MediaWiki api.php instance with the given options
   */
  function mwQuery(endpoint, options) {

    /**
     * Create a uniquely-named callback that will process the JSONP results
     */
    var createCallback = function (k) {
      var i = 1;
      var callbackName;
      do {
        callbackName = 'callback' + i;
        i = i + 1;
      } while (window[callbackName])
      window[callbackName] = k;
      return callbackName;
    }

    /**
     * Flatten an object into a URL query string.
     * For example: { foo: 'bar', baz: 42 } becomes 'foo=bar&baz=42'
     */
    var queryStr = function (options) {
      var query = [];
      for (var i in options) {
        if (options.hasOwnProperty(i)) {
          query.push(encodeURIComponent(i) + '=' + encodeURIComponent(options[i]));
        }
      }
      return query.join('&');
    }

    /**
     * Build a function that can be applied to a callback.  The callback processes
     * the JSON results of the API call.
     */
    return function (k) {
      options.format = 'json';
      options.callback = createCallback(k);
      var script = document.createElement('script');
      script.src = endpoint + '?' + queryStr(options);
      var head = document.getElementsByTagName('head')[0];
      head.appendChild(script);
    };

  }

  mw.api = {
    query: mwQuery,
  };

})(mw || (mw = {}));
