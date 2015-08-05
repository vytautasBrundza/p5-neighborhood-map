// *** MAP ***

var mapElement;
var markers=[];
var bounds;

// set up the map
function InitializeMap() {

  var mapCanvas=document.getElementById('map-canvas');

  var mapOptions={
    disableDefaultUI: true
  };

  mapElement=new google.maps.Map(mapCanvas, mapOptions);

  // fill map with markers

  // Sets the boundaries of the map based on pin locations
  window.mapBounds=new google.maps.LatLngBounds();

  // look for locations
  LocationFinder();
}

/*
createMapMarker(placeData) reads Google Places search results to create map pins.
placeData is the object returned from search results containing information
about a single location.
*/
// fetch some pins
var regularPin=new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569",
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
var highlightedPin=new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FEE069",
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));

// marker constructor
function createMapMarker(placeData, mId) {

  // The next lines save location data from the search result object to local variables
  var lat=placeData.geometry.location.lat();  // latitude from the place service
  var lon=placeData.geometry.location.lng();  // longitude from the place service
  var name=placeData.formatted_address;   // name of the place from the place service
  bounds=window.mapBounds;            // current boundaries of the map window

  // marker is an object with additional data about the pin for a single location
  var marker=new google.maps.Marker({
    map: mapElement,
    position: placeData.geometry.location,
    title: name,
    icon: regularPin
  });
  marker.mId=mId;

  markers.push(marker);

  google.maps.event.addListener(marker, 'click', function() {
    // show info window
    ShowInfo(this.mId);
    // focus the marker in the map
    FocusMarker(mId);
  });

  // this is where the pin actually gets added to the map.
  // bounds.extend() takes in a map location object
  bounds.extend(new google.maps.LatLng(lat, lon));
  // fit the map to the new marker
  mapElement.fitBounds(bounds);
  // center the map
  mapElement.setCenter(bounds.getCenter());
}

// reset all the marker to have the regular pins
function ResetMarkers(){
  var len=markers.length;
  for (var i = 0; i < len; i++) {
    markers[i].setIcon(regularPin);
  }
}

// show info for location by id
function ShowInfo(id){
  // enable info window
  viewModel.infoText.enabled(true);
  // get the description text
  viewModel.infoText.contents(dataModel.locations[id].view.getDescription());
}

/*
pinPoster() fires off Google place searches for location
*/
function pinPoster(locs, id) {
  // creates a Google place search service object. PlacesService does the work of
  // actually searching for location data.
  var service=new google.maps.places.PlacesService(mapElement);
  // the search request object
  var request={
    query: locs
  };
  // Actually searches the Google Maps API for location data and runs the callback
  // function with the search results after each search.
  // Also binds markers in the map with markers in user panel
  service.textSearch(request, function(response, status) {
    // makes sure the search returned results for a location.
    // If so, it creates a new map marker for that location.
    if (status==google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(response[0], id);
    }
  });
}

function FocusMarker(mId){
  if(isNaN(mId)){
    // get id of marker
    mId=mId.getAttribute("data-loc-id");
  }
  // reset bounds
  bounds=new google.maps.LatLngBounds();
  // reset all the other markers pins
  ResetMarkers();
  // loop through markers and extend bounds if marker matches
  for (var i=0; i < markers.length; i++) {
    if(markers[i].mId==mId){
      bounds.extend(markers[i].getPosition());
        // set this marker pin
        markers[i].setIcon(highlightedPin);
    }
  }
  // fit the map to the new marker
  FocusBounds();
  // http://stackoverflow.com/a/4709017/1742303
  // set zoom for single marker
  google.maps.event.addListenerOnce(mapElement, 'bounds_changed', function(event) {
    if (this.getZoom()){
        this.setZoom(16);
    }
  });
}

// set map bounds to show al markers
function FocusAllMarkers(){
  bounds=new google.maps.LatLngBounds();
  for (var i=0; i < markers.length; i++) {
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
google.maps.event.addDomListener(window, 'load', InitializeMap);