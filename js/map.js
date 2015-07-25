/*
Start here! initializeMap() is called when page is loaded.
*/
// *** MAP ***
var mapElement;

function InitializeMap() {

// create map
  console.log("Initializing map");

  var mapCanvas=document.getElementById('map-canvas');

  var mapOptions = {
    disableDefaultUI: true
  };

  mapElement = new google.maps.Map(mapCanvas, mapOptions);

  // fill map with markers

// Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();

// pinPoster(locations) creates pins on the map for each location in
  // the locations array
  pinPoster(LocationFinder());
}

/*
createMapMarker(placeData) reads Google Places search results to create map pins.
placeData is the object returned from search results containing information
about a single location.
*/
function createMapMarker(placeData) {

  // The next lines save location data from the search result object to local variables
  var lat = placeData.geometry.location.lat();  // latitude from the place service
  var lon = placeData.geometry.location.lng();  // longitude from the place service
  var name = placeData.formatted_address;   // name of the place from the place service
  var bounds = window.mapBounds;            // current boundaries of the map window

  // marker is an object with additional data about the pin for a single location
  var marker = new google.maps.Marker({
    map: mapElement,
    position: placeData.geometry.location,
    title: name
  });

  // infoWindows are the little helper windows that open when you click
  // or hover over a pin on a map. They usually contain more information
  // about a location.
  var infoWindow = new google.maps.InfoWindow({
    content: name
  });

  // hmmmm, I wonder what this is about...
  google.maps.event.addListener(marker, 'click', function() {
    //infoWindow.open(mapElement,marker);
  });

  // this is where the pin actually gets added to the map.
  // bounds.extend() takes in a map location object
  bounds.extend(new google.maps.LatLng(lat, lon));
  // fit the map to the new marker
  mapElement.fitBounds(bounds);
  // center the map
  mapElement.setCenter(bounds.getCenter());
}

 /*
  pinPoster() fires off Google place searches for each location
  */
  function pinPoster(locs) {

    // creates a Google place search service object. PlacesService does the work of
    // actually searching for location data.
    var service = new google.maps.places.PlacesService(mapElement);

    // Iterates through the array of locations, creates a search object for each location
    var len=locs.length;
    for (var i = 0; i < len; i++) {
     // the search request object
      var request = {
        query: locs[i]
      };

      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
      service.textSearch(request, dataCallback);
    }
  }

   /*
  callback(results, status) makes sure the search returned results for a location.
  If so, it creates a new map marker for that location.
  */
  function dataCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(results[0]);
    }
  }

// Calls the initializeMap() function when the page loads
//window.addEventListener('load', initializeMap);
google.maps.event.addDomListener(window, 'load', InitializeMap);