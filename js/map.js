/*
Start here! initializeMap() is called when page is loaded.
*/
// *** MAP ***
var mapElement;
var markers=[];
var bounds;

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

  // look for locations
  LocationFinder();
}

/*
createMapMarker(placeData) reads Google Places search results to create map pins.
placeData is the object returned from search results containing information
about a single location.
*/
function createMapMarker(placeData, mId) {
console.log("create marker "+mId);
  // The next lines save location data from the search result object to local variables
  var lat = placeData.geometry.location.lat();  // latitude from the place service
  var lon = placeData.geometry.location.lng();  // longitude from the place service
  var name = placeData.formatted_address;   // name of the place from the place service
  bounds = window.mapBounds;            // current boundaries of the map window

  // marker is an object with additional data about the pin for a single location
  var marker = new google.maps.Marker({
    map: mapElement,
    position: placeData.geometry.location,
    title: name
  });
  marker.mId=mId;

  markers.push(marker);

  google.maps.event.addListener(marker, 'click', function() {
    ShowInfo(this.mId);
  });

  // this is where the pin actually gets added to the map.
  // bounds.extend() takes in a map location object
  bounds.extend(new google.maps.LatLng(lat, lon));
  // fit the map to the new marker
  mapElement.fitBounds(bounds);
  // center the map
  mapElement.setCenter(bounds.getCenter());
}
function ShowInfo(id){
  console.log("show info for: "+id);
  viewModel.infoText=ko.observable(dataModel.locations[id].view.getDescription());
  //console.log(viewModel.infoText());
}

/*
pinPoster() fires off Google place searches for each location
*/
function pinPoster(locs, i) {
  // creates a Google place search service object. PlacesService does the work of
  // actually searching for location data.
  var service = new google.maps.places.PlacesService(mapElement);
  // the search request object
  var request = {
    query: locs
  };
  RequestCallback(service, request, i);
}

function RequestCallback(service, request, id){
  // Actually searches the Google Maps API for location data and runs the callback
  // function with the search results after each search.
  // Also binds markers in the map with markers in user panel
  console.log( "request callback "+id);
  service.textSearch(request, function(response, status) {
    // makes sure the search returned results for a location.
    // If so, it creates a new map marker for that location.
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(response[0], id);
    }
  });
}

function FocusMarker(marker){
  var mId = marker.getAttribute("data-loc-id");
  console.log("Focus marker "+mId);
  var mkr=markers.filter(function( m ) {
    return m.mId == mId;
  });
  bounds= new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
    if(markers[i].mId ==mId){
      bounds.extend(markers[i].getPosition());
    }
  }
  // fit the map to the new marker
  FocusBounds();
  // http://stackoverflow.com/a/4709017/1742303
  google.maps.event.addListenerOnce(mapElement, 'bounds_changed', function(event) {
    if (this.getZoom()){
        this.setZoom(16);
    }
  });
}

function FocusAllMarkers(){
  bounds= new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
    bounds.extend(markers[i].getPosition());
  }
  // fit the map to the new marker
  FocusBounds();
}

function FocusBounds(){
  // fit the map to the new marker
    mapElement.fitBounds(bounds);       // auto-zoom
    mapElement.panToBounds(bounds);     // auto-center
}

// Calls the initializeMap() function when the page loads
//window.addEventListener('load', initializeMap);
google.maps.event.addDomListener(window, 'load', InitializeMap);